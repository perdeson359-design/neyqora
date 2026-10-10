import http from "node:http";
import { chmodSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import Database from "better-sqlite3";
import worker from "./src/index.js";
import { validateSelfHostedSecrets } from "./src/security/secrets.js";

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "0.0.0.0";
const dbPath = process.env.NEYQORA_DB_PATH || "./data/neyqora.db";
const aiBaseUrl = String(process.env.NEYQORA_AI_BASE_URL || "").replace(/\/$/, "");
const aiModel = process.env.NEYQORA_AI_MODEL || "@cf/meta/llama-3.2-3b-instruct";
const aiApiKey = process.env.NEYQORA_AI_API_KEY || "";
const aiProviderMode = String(process.env.AI_PROVIDER_MODE || "auto").toLowerCase();

validateSelfHostedSecrets(process.env);
if (aiProviderMode === "cloud" && (!aiBaseUrl || !aiApiKey)) {
  throw new Error("AI_PROVIDER_MODE=cloud için NEYQORA_AI_BASE_URL ve NEYQORA_AI_API_KEY gerekli");
}
if (aiProviderMode === "local" && !process.env.LOCAL_AI_BASE_URL) {
  throw new Error("AI_PROVIDER_MODE=local için LOCAL_AI_BASE_URL gerekli");
}
if (aiProviderMode === "auto" && (!aiBaseUrl || !aiApiKey) && !process.env.LOCAL_AI_BASE_URL) {
  throw new Error("AI_PROVIDER_MODE=auto için Cloud AI veya LOCAL_AI_BASE_URL yapılandırılmalı");
}

if (dbPath !== ":memory:") mkdirSync(dirname(resolve(dbPath)), { recursive: true, mode: 0o700 });
const db = new Database(dbPath);
if (dbPath !== ":memory:") { try { chmodSync(dbPath, 0o600); } catch {} }
db.pragma("journal_mode = WAL");
db.exec("CREATE TABLE IF NOT EXISTS memories (id INTEGER PRIMARY KEY AUTOINCREMENT, user_id TEXT NOT NULL, content TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)");
db.exec("CREATE INDEX IF NOT EXISTS idx_memories_user_created ON memories(user_id, created_at DESC)");

const DB = {
  prepare(sql) {
    return {
      bind(...params) {
        const statement = db.prepare(sql);
        return {
          async run() {
            const info = statement.run(...params);
            return { success: true, meta: { changes: info.changes, last_row_id: info.lastInsertRowid } };
          },
          async all() {
            return { success: true, results: statement.all(...params) };
          },
          async first() {
            const row = statement.get(...params);
            return row || null;
          }
        };
      }
    };
  }
};

const AI = (aiBaseUrl && aiApiKey) ? {
  async run(_model, options) {
    const response = await fetch(aiBaseUrl + "/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": "Bearer " + aiApiKey
      },
      body: JSON.stringify({
        model: aiModel,
        messages: options?.messages || [],
        max_tokens: options?.max_tokens,
        temperature: options?.temperature
      })
    });
    const text = await response.text();
    if (!response.ok) throw new Error("AI provider error " + response.status + ": " + text.slice(0, 500));
    const data = JSON.parse(text);
    return { response: data?.choices?.[0]?.message?.content || "" };
  }
} : null;

const env = {
  AI,
  DB,
  OWNER_AUTH_TOKEN: process.env.OWNER_AUTH_TOKEN,
  USER_SESSION_SECRET: process.env.USER_SESSION_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  RESEND_FROM: process.env.RESEND_FROM || "onboarding@resend.dev",
  AI_PROVIDER_MODE: aiProviderMode,
  LOCAL_AI_BASE_URL: process.env.LOCAL_AI_BASE_URL || "",
  LOCAL_AI_API_KEY: process.env.LOCAL_AI_API_KEY || "",
  LOCAL_AI_MODEL: process.env.LOCAL_AI_MODEL || "",
  LOCAL_AI_TIMEOUT_MS: process.env.LOCAL_AI_TIMEOUT_MS || "30000",
  NEYQORA_SELF_HOSTED: "1"
};

const MAX_REQUEST_BYTES = 16 * 1024 * 1024;
const server = http.createServer(async (request, response) => {
  try {
    const declaredLength = Number(request.headers["content-length"] || "0");
    const chunks = [];
    let totalBytes = 0;
    let tooLarge = Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BYTES;
    for await (const chunk of request) {
      totalBytes += chunk.length;
      if (totalBytes > MAX_REQUEST_BYTES) {
        tooLarge = true;
        chunks.length = 0;
        continue;
      }
      if (!tooLarge) chunks.push(chunk);
    }
    if (tooLarge) {
      response.writeHead(413, { "content-type": "application/json; charset=utf-8" });
      response.end(JSON.stringify({ ok: false, error: "İstek gövdesi çok büyük." }));
      return;
    }

    const url = new URL(request.url || "/", "http://" + (request.headers.host || "localhost"));
    const body = Buffer.concat(chunks, totalBytes);
    const headers = new Headers();
    for (const [key, value] of Object.entries(request.headers)) {
      if (Array.isArray(value)) headers.set(key, value.join(", "));
      else if (value !== undefined) headers.set(key, value);
    }

    const webRequest = new Request(url, {
      method: request.method,
      headers,
      body: body.length && request.method !== "GET" && request.method !== "HEAD" ? body : undefined
    });

    const result = await worker.fetch(webRequest, env);
    response.statusCode = result.status;
    result.headers.forEach((value, key) => response.setHeader(key, value));
    const resultBody = Buffer.from(await result.arrayBuffer());
    response.end(resultBody);
  } catch (error) {
    console.error("NEYQORA request failed:", error);
    if (response.headersSent) {
      response.destroy();
      return;
    }
    response.statusCode = 500;
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ ok: false, error: "Sunucu hatası." }));
  }
});

server.requestTimeout = 30_000;
server.headersTimeout = 15_000;
server.keepAliveTimeout = 5_000;
server.listen(port, host, () => {
  console.log("NEYQORA self-host listening on http://" + host + ":" + port);
});
