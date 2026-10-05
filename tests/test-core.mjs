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
assert.match(source, /async function generateCodingResponse/);
assert.match(source, /if \(step\.tool === "coding"\)/);
assert.match(source, /basicPythonValidation\(code\)/);
assert.match(source, /temperature: 0\.1/);
assert.match(source, /120000/);
assert.match(source, /retry/);

assert.match(source, /\/api\/health/);\nassert.match(source, /version:\s*"4\\.3"/);
assert.match(source, /\/api\/chat/);
assert.match(source, /\/api\/project/);
assert.match(source, /\/api\/search/);
assert.match(source, /Response\.json\(\{ ok: true/);
assert.match(source, /memory:\s*!!env\.DB/);
assert.match(source, /toolResults: agentResults/);
assert.match(source, /agentStatus/);
assert.match(source, /executeToolStep/);
assert.match(source, /async function generateCodingResponse/);
assert.match(source, /tool: "coding"/);
assert.match(source, /ok: !!reply && validation.ok/);
assert.match(source, /function shouldRemember/);
assert.match(source, /function extractMemory/);
assert.match(source, /function isNameQuestion/);
assert.match(source, /function forgetRequest/);
assert.match(source, /adımı\\|ismimi/);
assert.match(source, /Kullanıcının adı/);
assert.match(source, /type: detail \? "text" : "latest"/);
assert.match(source, /function sanitizeProjectFiles/);
assert.match(source, /function validateGeneratedProject/);
assert.match(source, /path\.includes\(".."\)/);
assert.match(source, /eval|exec/);
assert.match(source, /max 8 files|En fazla 8 dosya/);
assert.match(source, /path\.startsWith\("\/"\)|path\.includes\("\\\\"\)|unsafe/i);

assert.match(source, /if \(intent === "coding"\) \{/);
assert.match(source, /codingReply = result\?\.reply/);
assert.match(source, /codingValidation = result\?\.validation/);
assert.match(source, /validation: codingValidation/);

console.log("NEYQORA core contract tests: PASS");
