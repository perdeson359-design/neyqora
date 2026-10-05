import fs from "node:fs";
import assert from "node:assert/strict";

const source = fs.readFileSync("src/index.js", "utf8");
for (const name of ["routeMessage","isProjectRequest","sanitizeProjectName","validateAgentPlan","buildAgentPlan","shouldFallbackToChat","summarizeAgentStatus","safeCalculate","basicPythonValidation","executeAgentPlan"]) {
  assert.match(source, new RegExp("function " + name + "\\s*\\("), "missing function: " + name);
}
assert.match(source, /export const __test = \{/);
assert.match(source, /generate_project/);
assert.match(source, /search_web/);
assert.match(source, /get_current_weather/);
assert.match(source, /generate_or_repair_code/);
assert.match(source, /120000/);
assert.match(source, /retry/);
console.log("NEYQORA core contract tests: PASS");
