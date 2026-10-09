import http from "node:http";
import Database from "better-sqlite3";
import worker from "./src/index.js";

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "0.0.0.0";
const dbPath = process.env.NEYQORA_DB_PATH || "./data/neyqora.db";
const aiBaseUrl = String(process.env.NEYQORA_AI_BASE_URL || "").replace(/\/$/, "");
const aiModel = process.env.NEYQORA_AI_MODEL || "@cf/meta/llama-3.2-3b-instruct";
const aiApiKey = process.env.NEYQORA_AI_API_KEY || "";
const aiProviderMode = String(process.env.AI_PROVIDER_MODE || "auto").toLowerCase();
const MAX_REQUEST_BODY_BYTES = 1024 * 1024;

if (!process.env.OWNER_AUTH_TOKEN) {
  throw new Error("OWNER_AUTH_TOKEN is required");
}
if (aiProviderMode === "cloud" && (!aiBaseUrl || !aiApiKey)) {
  throw new Error("AI_PROVIDER_MODE=cloud için NEYQORA_AI_BASE_URL ve NEYQORA_AI_API_KEY gerekli");
}
if (aiProviderMode === "local" && !process.env.LOCAL_AI_BASE_URL) {
  throw new Error("AI_PROVIDER_MODE=local için LOCAL_AI_BASE_URL gerekli");
}
if (aiProviderMode === "auto" && (!aiBaseUrl || !aiApiKey) && !process.env.LOCAL_AI_BASE_URL) {
  throw new Error("AI_PROVIDER_MODE=auto için Cloud AI veya LOCAL_AI_BASE_URL yapılandırılmalı");
}

const db = new Database(dbPath);
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
      }),
      signal: AbortSignal.timeout(30000)
    });
    if (!response.ok) {
      await response.body?.cancel().catch(() => {});
      throw new Error("AI provider request failed with status " + response.status);
    }
    let data;
    try {
      data = await response.json();
    } catch {
      throw new Error("AI provider returned invalid JSON");
    }
    return { response: data?.choices?.[0]?.message?.content || "" };
  }
} : null;

const env = {
  AI,
  DB,
  OWNER_AUTH_TOKEN: process.env.OWNER_AUTH_TOKEN,
  USER_SESSION_SECRET: process.env.USER_SESSION_SECRET || process.env.OWNER_AUTH_TOKEN,
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  RESEND_FROM: process.env.RESEND_FROM || "onboarding@resend.dev",
  AI_PROVIDER_MODE: aiProviderMode,
  LOCAL_AI_BASE_URL: process.env.LOCAL_AI_BASE_URL || "",
  LOCAL_AI_API_KEY: process.env.LOCAL_AI_API_KEY || "",
  LOCAL_AI_MODEL: process.env.LOCAL_AI_MODEL || "",
  LOCAL_AI_TIMEOUT_MS: process.env.LOCAL_AI_TIMEOUT_MS || "30000",
  NEYQORA_SELF_HOSTED: "1"
};

const server = http.createServer(async (request, response) => {
  try {
    const declaredLength = Number(request.headers["content-length"] || 0);
    if (Number.isFinite(declaredLength) && declaredLength > MAX_REQUEST_BODY_BYTES) {
      response.writeHead(413, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", connection: "close" });
      response.end(JSON.stringify({ ok: false, error: "Request body too large." }));
      request.resume();
      return;
    }

    const chunks = [];
    let bodyBytes = 0;
    for await (const chunk of request) {
      bodyBytes += chunk.length;
      if (bodyBytes > MAX_REQUEST_BODY_BYTES) {
        response.writeHead(413, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", connection: "close" });
        response.end(JSON.stringify({ ok: false, error: "Request body too large." }));
        request.resume();
        return;
      }
      chunks.push(chunk);
    }

    const url = new URL(request.url || "/", "http://localhost");
    const headers = new Headers();
    for (const [key, value] of Object.entries(request.headers)) {
      if (Array.isArray(value)) headers.set(key, value.join(", "));
      else if (value !== undefined) headers.set(key, value);
    }

    const webRequest = new Request(url, {
      method: request.method,
      headers,
      body: bodyBytes && request.method !== "GET" && request.method !== "HEAD" ? Buffer.concat(chunks) : undefined
    });

    const result = await worker.fetch(webRequest, env);
    response.statusCode = result.status;
    result.headers.forEach((value, key) => response.setHeader(key, value));
    const resultBody = Buffer.from(await result.arrayBuffer());
    response.end(resultBody);
  } catch {
    if (response.headersSent) {
      response.destroy();
      return;
    }
    response.statusCode = 500;
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.setHeader("cache-control", "no-store");
    response.end(JSON.stringify({ ok: false, error: "Internal server error." }));
  }
});

server.requestTimeout = 30000;
server.headersTimeout = 10000;
server.keepAliveTimeout = 5000;

server.listen(port, host, () => {
  console.log("NEYQORA self-host listening on http://" + host + ":" + port);
});
