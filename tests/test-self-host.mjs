import fs from "node:fs";
import assert from "node:assert/strict";
import Database from "better-sqlite3";
import worker from "../src/index.js";

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

const sqlite = new Database(":memory:");
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
  OWNER_AUTH_TOKEN: "auth-e2e-test-secret",
  USER_SESSION_SECRET: "auth-e2e-test-secret",
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

const meAfterLogout = await request("/api/auth/me", { cookie: sessionCookie });
assert.equal(meAfterLogout.status, 401);

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

const meAfterDelete = await request("/api/auth/me", { cookie: loginCookie });
assert.equal(meAfterDelete.status, 401);

sqlite.close();
console.log("NEYQORA self-host auth E2E: PASS");
