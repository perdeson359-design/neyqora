import http from "node:http";
import Database from "better-sqlite3";
import worker from "./src/index.js";

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "0.0.0.0";
const dbPath = process.env.NEYQORA_DB_PATH || "./data/neyqora.db";
const aiBaseUrl = String(process.env.NEYQORA_AI_BASE_URL || "").replace(/\/$/, "");
const aiModel = process.env.NEYQORA_AI_MODEL || "@cf/meta/llama-3.2-3b-instruct";
const aiApiKey = process.env.NEYQORA_AI_API_KEY || "";

if (!process.env.OWNER_AUTH_TOKEN) {
  throw new Error("OWNER_AUTH_TOKEN is required");
}
if (!aiBaseUrl || !aiApiKey) {
  throw new Error("NEYQORA_AI_BASE_URL and NEYQORA_AI_API_KEY are required");
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
          }
        };
      }
    };
  }
};

const AI = {
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
};

const env = {
  AI,
  DB,
  OWNER_AUTH_TOKEN: process.env.OWNER_AUTH_TOKEN,
  USER_SESSION_SECRET: process.env.USER_SESSION_SECRET || process.env.OWNER_AUTH_TOKEN,
  RESEND_API_KEY: process.env.RESEND_API_KEY || "",
  RESEND_FROM: process.env.RESEND_FROM || "onboarding@resend.dev",
  AI_PROVIDER_MODE: process.env.AI_PROVIDER_MODE || "auto",
  LOCAL_AI_BASE_URL: process.env.LOCAL_AI_BASE_URL || "",
  LOCAL_AI_API_KEY: process.env.LOCAL_AI_API_KEY || "",
  LOCAL_AI_MODEL: process.env.LOCAL_AI_MODEL || "",
  LOCAL_AI_TIMEOUT_MS: process.env.LOCAL_AI_TIMEOUT_MS || "30000",
  NEYQORA_SELF_HOSTED: "1"
};

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", "http://" + (request.headers.host || "localhost"));
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    const body = Buffer.concat(chunks);

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
    response.statusCode = 500;
    response.setHeader("content-type", "application/json; charset=utf-8");
    response.end(JSON.stringify({ error: "NEYQORA self-host runtime error: " + (error?.message || "unknown") }));
  }
});

server.listen(port, host, () => {
  console.log("NEYQORA self-host listening on http://" + host + ":" + port);
});
