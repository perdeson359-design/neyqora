import fs from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import assert from "node:assert/strict";
import Database from "better-sqlite3";
import worker from "../src/index.js";
import { validateSelfHostedSecrets } from "../src/security/secrets.js";

const server = fs.readFileSync("server.mjs", "utf8");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));

assert.equal(pkg.type, "module");
assert.match(server, /node:http/);
assert.match(server, /better-sqlite3/);
assert.match(server, /OWNER_AUTH_TOKEN/);
assert.match(server, /NEYQORA_SELF_HOSTED/);
assert.match(server, /NEYQORA_AI_BASE_URL/);
assert.match(server, /NEYQORA_AI_API_KEY/);
assert.match(server, /NEYQORA_AI_MODEL/);
assert.match(server, /NEYQORA_DB_PATH/);
assert.match(server, /worker\.fetch\(webRequest, env\)/);
assert.match(server, /CREATE TABLE IF NOT EXISTS memories/);
assert.match(server, /MAX_REQUEST_BYTES/);
assert.match(server, /mkdirSync\(dirname\(resolve\(dbPath\)\)/);
assert.match(server, /Sunucu hatası/);
assert.equal(validateSelfHostedSecrets({ OWNER_AUTH_TOKEN: "owner-test-secret-value-32-characters-min", USER_SESSION_SECRET: "user-test-secret-value-32-characters-min" }), true);

const sqlite = new Database(":memory:");
sqlite.exec("CREATE TABLE memories (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)");
const DB = {
  prepare(sql) {
    const statement = sqlite.prepare(sql);
    const execute = (params = []) => ({
      async run() {
        const info = statement.run(...params);
        return { success: true, meta: { changes: info.changes, last_row_id: info.lastInsertRowid } };
      },
      async all() {
        return { success: true, results: statement.all(...params) };
      },
      async first() {
        return statement.get(...params) || null;
      }
    });
    return {
      ...execute(),
      bind(...params) {
        return execute(params);
      }
    };
  }
};

const env = {
  DB,
  OWNER_AUTH_TOKEN: "owner-auth-e2e-test-secret-value-long-enough",
  USER_SESSION_SECRET: "user-session-e2e-test-secret-value-long-enough",
  NEYQORA_SELF_HOSTED: "1"
};

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  if (options.cookie) headers.set("cookie", options.cookie);
  const body = options.body === undefined ? undefined : JSON.stringify(options.body);
  if (body !== undefined) headers.set("content-type", "application/json");
  return worker.fetch(new Request("http://neyqora.test" + path, {
    method: options.method || "GET",
    headers,
    body
  }), env);
}

function cookieFrom(response) {
  const value = response.headers.get("set-cookie");
  assert.ok(value, "Beklenen Set-Cookie başlığı yok");
  return value.split(";", 1)[0];
}

const register = await request("/api/auth/register", {
  method: "POST",
  body: { name: "Auth Test", email: "auth-e2e@example.com", password: "Testpass123" }
});
assert.equal(register.status, 201, "Kayıt HTTP 201 olmalı: " + await register.clone().text());
const registerBody = await register.json();
assert.equal(registerBody.ok, true);
assert.equal(registerBody.user.email, "auth-e2e@example.com");
const sessionCookie = cookieFrom(register);
assert.ok(!register.headers.get("set-cookie").includes("; Secure"), "Self-host HTTP cookie Secure olmamalı");

const meAfterRegister = await request("/api/auth/me", { cookie: sessionCookie });
assert.equal(meAfterRegister.status, 200);
const meBody = await meAfterRegister.json();
assert.equal(meBody.ok, true);
assert.equal(meBody.user.email, "auth-e2e@example.com");
assert.equal(meBody.user.name, "Auth Test");

const profile = await request("/api/auth/profile", {
  method: "POST",
  cookie: sessionCookie,
  body: { name: "Auth Updated" }
});
assert.equal(profile.status, 200);
assert.equal((await profile.json()).user.name, "Auth Updated");

const duplicate = await request("/api/auth/register", {
  method: "POST",
  body: { name: "Duplicate", email: "auth-e2e@example.com", password: "Testpass123" }
});
assert.equal(duplicate.status, 409);

const logout = await request("/api/auth/logout", {
  method: "POST",
  cookie: sessionCookie
});
assert.equal(logout.status, 200);

const meAfterLogout = await request("/api/auth/me");
assert.equal(meAfterLogout.status, 200);
assert.equal((await meAfterLogout.json()).ok, false);

const login = await request("/api/auth/login", {
  method: "POST",
  body: { email: "auth-e2e@example.com", password: "Testpass123" }
});
assert.equal(login.status, 200);
const loginBody = await login.json();
assert.equal(loginBody.ok, true);
const loginCookie = cookieFrom(login);

const meAfterLogin = await request("/api/auth/me", { cookie: loginCookie });
assert.equal(meAfterLogin.status, 200);
assert.equal((await meAfterLogin.json()).user.name, "Auth Updated");

const badLogin = await request("/api/auth/login", {
  method: "POST",
  body: { email: "auth-e2e@example.com", password: "wrong-password" }
});
assert.equal(badLogin.status, 401);

const deleteAccount = await request("/api/auth/account", {
  method: "DELETE",
  cookie: loginCookie
});
assert.equal(deleteAccount.status, 200);

sqlite.close();
console.log("NEYQORA self-host auth E2E: PASS"); // protocol-aware auth cookie regression covered
const missingSecretEnv = { ...process.env };
delete missingSecretEnv.OWNER_AUTH_TOKEN;
delete missingSecretEnv.USER_SESSION_SECRET;
const missingSecrets = spawnSync(process.execPath, ["server.mjs"], { cwd: process.cwd(), env: missingSecretEnv, encoding: "utf8", timeout: 5000 });
assert.notEqual(missingSecrets.status, 0, "Self-host must refuse to start without security secrets");
assert.match(missingSecrets.stderr, /OWNER_AUTH_TOKEN/);

const portProbe = createServer();
await new Promise((resolve, reject) => {
  portProbe.once("error", reject);
  portProbe.listen(0, "127.0.0.1", resolve);
});
const port = portProbe.address().port;
await new Promise((resolve, reject) => portProbe.close(error => error ? reject(error) : resolve()));

const runtimeDir = mkdtempSync(join(tmpdir(), "neyqora-self-host-"));
const runtimeDb = join(runtimeDir, "data", "neyqora.db");
const runtimeEnv = {
  ...process.env,
  PORT: String(port),
  HOST: "127.0.0.1",
  NEYQORA_DB_PATH: runtimeDb,
  OWNER_AUTH_TOKEN: "owner-runtime-test-secret-value-long-enough",
  USER_SESSION_SECRET: "user-runtime-test-secret-value-long-enough",
  AI_PROVIDER_MODE: "local",
  LOCAL_AI_BASE_URL: "http://127.0.0.1:11434/v1",
  NEYQORA_SELF_HOSTED: "1"
};
const runtime = spawn(process.execPath, ["server.mjs"], {
  cwd: process.cwd(),
  env: runtimeEnv,
  stdio: ["ignore", "pipe", "pipe"]
});
let runtimeOutput = "";
runtime.stdout.on("data", chunk => { runtimeOutput += chunk.toString(); });
runtime.stderr.on("data", chunk => { runtimeOutput += chunk.toString(); });
try {
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error("Self-host runtime startup timed out: " + runtimeOutput)), 10000);
    runtime.stdout.on("data", chunk => {
      if (chunk.toString().includes("listening on")) {
        clearTimeout(timeout);
        resolve();
      }
    });
    runtime.once("error", error => { clearTimeout(timeout); reject(error); });
    runtime.once("exit", code => {
      clearTimeout(timeout);
      reject(new Error("Self-host runtime exited before listening (" + code + "): " + runtimeOutput));
    });
  });
  const health = await fetch("http://127.0.0.1:" + port + "/api/health");
  assert.equal(health.status, 200, "Self-host health endpoint must respond");
  const healthBody = await health.json();
  assert.equal(healthBody.ok, true);
  assert.equal(healthBody.name, "NEYQORA");
  assert.equal(healthBody.userSessionSecret, true);
  assert.ok(fs.existsSync(runtimeDb), "Self-host must create nested database directory and file");

  const tooLarge = await fetch("http://127.0.0.1:" + port + "/api/chat", {
    method: "POST",
    headers: { "content-type": "application/octet-stream" },
    body: Buffer.alloc(16 * 1024 * 1024 + 1)
  });
  assert.equal(tooLarge.status, 413, "Self-host must reject oversized requests before forwarding to Worker");
  assert.equal((await tooLarge.json()).ok, false);
} finally {
  runtime.kill("SIGTERM");
  await new Promise(resolve => {
    if (runtime.exitCode !== null) return resolve();
    runtime.once("exit", resolve);
    setTimeout(() => { runtime.kill("SIGKILL"); resolve(); }, 3000);
  });
  rmSync(runtimeDir, { recursive: true, force: true });
}
console.log("NEYQORA self-host real HTTP runtime + request-limit E2E: PASS");

