import assert from "node:assert/strict";
import { createAIProvider } from "../src/ai/provider.js";

const calls = [];
const cloud = {
  async run(model, options) {
    calls.push({ type: "cloud", model, options });
    return { response: "cloud-ok" };
  }
};

let provider = createAIProvider({
  AI: cloud,
  AI_PROVIDER_MODE: "cloud"
});
const cloudResult = await provider.run("cloud-model", { messages: [] });
assert.equal(cloudResult.response, "cloud-ok");
assert.equal(cloudResult.provider, "cloud");
assert.equal(cloudResult.model, "cloud-model");
assert.equal(provider.info().cloud, true);
assert.equal(provider.info().local, false);

provider = createAIProvider({
  AI: cloud,
  AI_PROVIDER_MODE: "local",
  LOCAL_AI_BASE_URL: "http://127.0.0.1:1/v1"
});
assert.equal(provider.info().mode, "local");
assert.equal(provider.info().local, true);

provider = createAIProvider({
  AI: cloud,
  AI_PROVIDER_MODE: "auto"
});
assert.equal(provider.info().fallback, false);
assert.equal(provider.info().primary, "cloud");

assert.equal(calls.length, 1);
console.log("NEYQORA AI provider tests: PASS");

const fallbackProvider = createAIProvider({
  AI: {
    async run() { throw new Error("cloud-down"); }
  },
  AI_PROVIDER_MODE: "auto",
  LOCAL_AI_BASE_URL: "http://127.0.0.1:1/v1",
  LOCAL_AI_TIMEOUT_MS: 1000
});
assert.equal(fallbackProvider.info().fallback, true);
assert.equal(fallbackProvider.info().primary, "cloud");
console.log("NEYQORA AI provider metadata tests: PASS");
const originalFetch = globalThis.fetch;
try {
  globalThis.fetch = async (url, options) => {
    assert.ok(String(url).endsWith("127.0.0.1:1/v1/chat/completions"));
    assert.equal(options.method, "POST");
    return new Response(JSON.stringify({ choices: [{ message: { content: "local-fallback-ok" } }] }), {
      status: 200,
      headers: { "content-type": "application/json" }
    });
  };
  const fallbackResult = await fallbackProvider.run("cloud-model", { messages: [{ role: "user", content: "test" }] });
  assert.equal(fallbackResult.response, "local-fallback-ok");
  assert.equal(fallbackResult.provider, "local");
  assert.equal(fallbackResult.fallbackFrom, "cloud");

  let cloudAttempts = 0;
  const retryProvider = createAIProvider({
    AI: { async run() { cloudAttempts += 1; if (cloudAttempts === 1) throw new Error("503 temporary"); return { response: "retry-ok" }; } },
    AI_PROVIDER_MODE: "cloud"
  });
  const retryResult = await retryProvider.run("cloud-model", { messages: [] });
  assert.equal(retryResult.response, "retry-ok");
  assert.equal(cloudAttempts, 2);
} finally {
  globalThis.fetch = originalFetch;
}
console.log("NEYQORA AI provider fallback/retry tests: PASS");

