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
assert.equal((await provider.run("cloud-model", { messages: [] })).response, "cloud-ok");
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

assert.equal(calls.length, 1);
console.log("NEYQORA AI provider tests: PASS");
