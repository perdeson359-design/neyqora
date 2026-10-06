import fs from "node:fs";
import assert from "node:assert/strict";

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

console.log("NEYQORA self-host contract tests: PASS");
