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
