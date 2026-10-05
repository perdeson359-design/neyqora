import fs from "node:fs";
import assert from "node:assert/strict";

const source = fs.readFileSync("src/index.js", "utf8");

assert.match(source, /basicPythonValidation/);
assert.match(source, /Kodu çalıştırmadıysan çalıştırmış gibi davranma/);
assert.match(source, /eval ve exec kullanma/);
assert.match(source, /validation/);
assert.match(source, /ok: !!reply && validation\.ok/);

console.log("NEYQORA execution safety contract: PASS");
