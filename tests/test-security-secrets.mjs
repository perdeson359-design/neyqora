import assert from "node:assert/strict";
import { getUserSessionSecret, validateSelfHostedSecrets } from "../src/security/secrets.js";

assert.equal(getUserSessionSecret({ OWNER_AUTH_TOKEN: "owner-secret-value-that-is-long-enough" }), "", "user session secret must not fall back to owner token");
assert.equal(getUserSessionSecret({ USER_SESSION_SECRET: "user-secret-value-that-is-long-enough" }), "user-secret-value-that-is-long-enough");
assert.equal(validateSelfHostedSecrets({ OWNER_AUTH_TOKEN: "owner-secret-value-that-is-long-enough", USER_SESSION_SECRET: "user-secret-value-that-is-long-enough" }), true);
assert.throws(() => validateSelfHostedSecrets({ OWNER_AUTH_TOKEN: "short", USER_SESSION_SECRET: "user-secret-value-that-is-long-enough" }), /OWNER_AUTH_TOKEN/);
assert.throws(() => validateSelfHostedSecrets({ OWNER_AUTH_TOKEN: "owner-secret-value-that-is-long-enough" }), /USER_SESSION_SECRET/);
assert.throws(() => validateSelfHostedSecrets({ OWNER_AUTH_TOKEN: "same-secret-value-that-is-long-enough", USER_SESSION_SECRET: "same-secret-value-that-is-long-enough" }), /different values/);
console.log("NEYQORA security secret tests: PASS");
