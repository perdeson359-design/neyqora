const MODEL = "@cf/meta/llama-3.2-3b-instruct";

const HTML = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>NEYQORA</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#090d18;color:#eef2ff;font-family:system-ui,-apple-system,sans-serif}
.app{max-width:760px;margin:auto;min-height:100vh;display:flex;flex-direction:column}
header{padding:28px 20px 14px;text-align:center}h1{margin:0;font-size:34px;letter-spacing:.5px}header p{margin:7px 0;color:#8d98b3}
#chat{flex:1;padding:12px 16px 100px}.msg{max-width:88%;padding:13px 15px;margin:10px 0;border-radius:16px;line-height:1.5;white-space:pre-wrap}.user{margin-left:auto;background:#27385f}.ai{background:#151c2e}
form{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);width:min(728px,calc(100% - 24px));display:flex;gap:8px;padding:8px;background:#111827;border:1px solid #27314a;border-radius:18px}
input{flex:1;min-width:0;background:#0b1020;color:white;border:0;outline:0;padding:13px;border-radius:12px;font-size:16px}button{border:0;border-radius:12px;padding:0 18px;background:#fff;color:#0a0e18;font-weight:700}
</style>
</head>
<body>
<div class="app">
<header><h1>NEYQORA</h1><p>Kişisel yapay zekâ asistanın · V4.3</p></header>
<div id="chat"><div class="msg ai">Merhaba. Ben NEYQORA. Nasıl yardımcı olabilirim?</div></div><div id="project-panel" hidden style="padding:0 16px 110px"><div class="msg ai" id="project-title">Proje sonucu</div><button id="copy-project" type="button" style="width:100%;height:44px;margin:6px 0 10px;border-radius:12px;border:0;background:#fff;color:#0a0e18;font-weight:700">Kodu Kopyala</button><button id="send-project" type="button" style="width:100%;height:44px;margin:0 0 10px;border-radius:12px;border:0;background:#27385f;color:#fff;font-weight:700">GitHub'da Proje Görevi Oluştur</button><pre id="project-files" style="white-space:pre-wrap;overflow:auto;background:#0b1020;padding:12px;border-radius:12px;color:#dbe4ff"></pre></div>
<div id="form" role="form"><input id="input" name="message" placeholder="NEYQORA'ya bir şey sor..." autocomplete="off"><button id="send" type="button" onclick="return window.neyqoraSend()">Gönder</button></div>
</div>
<script>
window.neyqoraSend=async function(){
  const input=document.querySelector("#input");
  const chat=document.querySelector("#chat");
  const button=document.querySelector("#send");
  const message=(input?.value||"").trim();
  if(!message)return false;
  if(button)button.disabled=true;
  const user=document.createElement("div");
  user.className="msg user";
  user.textContent=message;
  chat.appendChild(user);
  input.value="";
  const pending=document.createElement("div");
  pending.className="msg ai";
  pending.textContent="NEYQORA düşünüyor...";
  chat.appendChild(pending);
  try{
    let userId="";
    try{userId=localStorage.getItem("neyqora_user_id")||"";}catch{}
    if(!userId){
      try{userId=crypto.randomUUID();}catch{userId="user-"+Date.now();}
      try{localStorage.setItem("neyqora_user_id",userId);}catch{}
    }
    const response=await fetch("/api/chat",{
      method:"POST",
      headers:{"content-type":"application/json","accept":"application/json"},
      body:JSON.stringify({message,userId,history:[]})
    });
    const raw=await response.text();
    let data={};
    try{data=JSON.parse(raw);}catch{data={error:raw};}
    if(!response.ok)throw new Error(data.error||("Sunucu hatası: "+response.status));
    pending.textContent=data.reply||data.error||"Yanıt alınamadı.";
  }catch(error){
    pending.textContent="Hata: "+(error?.message||"Bağlantı kurulamadı.");
  }finally{
    if(button)button.disabled=false;
  }
  return false;
};
</script>
<script>
const chat=document.querySelector("#chat"),form=document.querySelector("#form"),input=document.querySelector("#input");
let userId="";
try{userId=localStorage.getItem("neyqora_user_id")||"";}catch{}
if(!userId){
  try{userId=crypto.randomUUID();}catch{userId="user-"+Date.now()+"-"+Math.random().toString(36).slice(2);}
  try{localStorage.setItem("neyqora_user_id",userId);}catch{}
}
let conversation=[];
function add(text,cls){const el=document.createElement("div");el.className="msg "+cls;el.textContent=text;chat.appendChild(el);el.scrollIntoView({behavior:"smooth",block:"end"});return el;}
function rememberTurn(role,content){conversation.push({role,content:String(content||"")});if(conversation.length>10)conversation=conversation.slice(-10);}
document.querySelector("#send-project").addEventListener("click",()=>{const title=document.querySelector("#project-title").textContent;const body="NEYQORA tarafından oluşturulan proje görevi.\n\n"+document.querySelector("#project-files").textContent;const url="https://github.com/perdeson359-design/neyqora/issues/new?title="+encodeURIComponent(title)+"&body="+encodeURIComponent(body)+"&labels="+encodeURIComponent("neyqora-project");window.open(url,"_blank");});
document.querySelector("#copy-project").addEventListener("click",async()=>{const text=document.querySelector("#project-files").textContent;if(!text)return;try{await navigator.clipboard.writeText(text);document.querySelector("#copy-project").textContent="Kopyalandı ✓";setTimeout(()=>document.querySelector("#copy-project").textContent="Kodu Kopyala",1500);}catch{document.querySelector("#copy-project").textContent="Kopyalanamadı";}});
const sendButton=document.querySelector("#send");
let sending=false;
async function sendMessage(){
  if(sending)return;
  const message=input.value.trim();
  if(!message)return;
  sending=true;
  sendButton.disabled=true;
  sendButton.textContent="Gönderiliyor...";
  add(message,"user");
  rememberTurn("user",message);
  input.value="";
  const pending=add("NEYQORA düşünüyor...","ai");
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),45000);
  try{
    const r=await fetch("/api/chat",{
      method:"POST",
      headers:{"content-type":"application/json","accept":"application/json"},
      body:JSON.stringify({message,userId,history:conversation.slice(-10)}),
      signal:controller.signal
    });
    const raw=await r.text();
    let data={};
    try{data=raw?JSON.parse(raw):{};}catch{data={error:raw||"Geçersiz sunucu yanıtı."};}
    if(!r.ok){pending.textContent=data.error||("Sunucu hatası: "+r.status);return;}
    pending.textContent=data.reply||data.error||"Yanıt alınamadı.";
    if(data.reply)rememberTurn("assistant",data.reply);
    if(data.intent==="project"&&data.files){
      const panel=document.querySelector("#project-panel");
      const title=document.querySelector("#project-title");
      const files=document.querySelector("#project-files");
      title.textContent="Proje: "+(data.project||"NEYQORA projesi")+" · "+data.files.length+" dosya";
      files.textContent=data.files.map(f=>"--- "+f.path+" ---\n"+f.content).join("\n\n");
      panel.hidden=false;
      panel.scrollIntoView({behavior:"smooth",block:"end"});
    }
  }catch(err){
    pending.textContent=err?.name==="AbortError"?"NEYQORA yanıtı zaman aşımına uğradı.":"Bağlantı hatası: "+(err?.message||"Tekrar dene.");
  }finally{
    clearTimeout(timer);
    sending=false;
    sendButton.disabled=false;
    sendButton.textContent="Gönder";
  }
}
window.neyqoraSend=function(){
  sendMessage();
  return false;
};
input.addEventListener("keydown",function(e){
  if(e.key==="Enter"){
    e.preventDefault();
    e.stopPropagation();
    sendMessage();
  }
});
</script>
</body>
</html>`;

function shouldRemember(message) {
  const text = message.toLocaleLowerCase("tr-TR");
  return [
    "hatırla", "unutma", "aklında tut", "benim adım", "ben ",
    "seviyorum", "sevmiyorum", "tercihim", "tercih ederim",
    "favorim", "bana şöyle"
  ].some(key => text.includes(key));
}

function extractMemory(message) {
  const name = message.match(/\bbenim adım\s+([A-Za-zÇĞİÖŞÜçğıöşü]+)\b/i)?.[1];
  if (name) return "Kullanıcının adı: " + name;
  return message;
}

function isNameQuestion(message) {
  return /\b(adım ne|benim adım ne|ismim ne|ben kimim)\b/i.test(message);
}

function forgetRequest(message) {
  const t = String(message || "").toLocaleLowerCase("tr-TR").trim();
  if (/\b(adımı|ismimi)\s+unut\b/.test(t)) return { type: "name" };
  if (/\b(bunu|şunu)\s+unut\b/.test(t)) {
    const detail = t.replace(/^.*?\b(bunu|şunu)\s+unut\b[\s:,-]*/i, "").trim();
    return { type: detail ? "text" : "latest", detail };
  }
  return null;
}

function isProjectRequest(message) {
  const t = String(message || "").toLocaleLowerCase("tr-TR");
  return /\b(proje yap|proje oluştur|uygulama yap|uygulama oluştur|program yap|program oluştur|bir app yap|bir uygulama yap|kodla|inşa et)\b/.test(t);
}

function formatToolResult(result) {
  if (!result) return "";
  if (result.tool === "calculator") return result.ok && result.value !== null ? "Hesap sonucu: " + result.value : "Hesaplama yapılamadı.";
  if (result.tool === "weather") return result.ok
    ? result.city + " için hava: " + result.description + ", " + result.temperature + "°C, hissedilen " + result.apparentTemperature + "°C."
    : "Hava verisi alınamadı.";
  if (result.tool === "web") return result.ok
    ? "Web araması " + result.results.length + " sonuç döndürdü."
    : "Web araması başarısız.";
  if (result.tool === "project") return result.ok
    ? "Proje üretildi: " + result.files.length + " dosya."
    : "Proje üretilemedi.";
  return "";
}

function buildAgentTrace(plan, results) {
  const retries = results.filter(result => result?.retry).length;
  return {
    version: "1",
    createdAt: new Date().toISOString(),
    intent: plan.intent,
    stepCount: plan.steps.length,
    resultCount: results.length,
    completedSteps: results.filter(result => result && result.ok).length,
    failedSteps: results.filter(result => result && !result.ok).length,
    retries,
    success: results.length > 0 && results.some(result => result.ok),
    steps: results.map((result, index) => ({
      index: index + 1,
      tool: result.tool,
      ok: !!result.ok,
      retry: !!result.retry,
      durationMs: result.durationMs ?? null,
      error: result.ok ? null : (result.error || "Bilinmeyen araç hatası")
    }))
  };
}

function buildAgentAudit(plan, results) {
  return {
    intent: plan.intent,
    steps: plan.steps.map((step, index) => ({
      index: index + 1,
      tool: step.tool,
      action: step.action,
      ok: results[index]?.ok ?? false,
      durationMs: results[index]?.durationMs ?? null
    })),
    success: results.length > 0 && results.some(result => result.ok)
  };
}

function isRetryableTool(tool, result) {
  if (result?.ok) return false;
  return tool === "web" || tool === "weather";
}

async function generateCodingResponse(env, message) {
  const prompt = "Kullanıcının istediği Python programını üret. Yalnızca istenen özellikleri ekle. Python 3.10+ kullan. Kod eksiksiz ve çalıştırılabilir olmalı. Python tanımlayıcılarında yalnızca ASCII kullan. eval ve exec kullanma. Cevap formatı: 1) kısa açıklama, 2) tek bir eksiksiz Python kod bloğu, 3) 4 temel test. Kodu çalıştırmadıysan çalıştırmış gibi davranma.";
  const result = await env.AI.run(MODEL, {
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: String(message || "").trim() }
    ],
    max_tokens: 3072,
    temperature: 0.2
  });
  let reply = result?.response || result?.choices?.[0]?.message?.content || "";
  let code = extractPythonCode(reply);
  let validation = basicPythonValidation(code);

  if (!validation.ok) {
    const repair = await env.AI.run(MODEL, {
      messages: [
        { role: "system", content: "Sen bir Python kod düzelticisisin. Yalnızca verilen Python kodundaki sözdizimi, tanımlayıcı ve bariz isim/çağrı hatalarını düzelt. Yeni özellik ekleme. Python tanımlayıcılarında yalnızca ASCII kullan. Kod eksiksiz ve Python 3.10+ uyumlu olsun. Yalnızca düzeltilmiş tek Python kod bloğu döndür." },
        { role: "user", content: "Kod:\n" + code + "\n\nHatalar:\n" + validation.errors.join("\n") }
      ],
      max_tokens: 3072,
      temperature: 0.1
    });
    const repaired = repair?.response || repair?.choices?.[0]?.message?.content || "";
    const repairedCode = extractPythonCode(repaired);
    const second = basicPythonValidation(repairedCode);
    if (second.ok) {
      reply = repaired;
      code = repairedCode;
      validation = second;
    }
  }

  return {
    tool: "coding",
    ok: !!reply && validation.ok,
    reply,
    code,
    validation
  };
}

async function executeToolStep(env, step, message) {
  if (step.tool === "calculator") {
    const value = safeCalculate(message);
    return { tool: "calculator", ok: value !== null, value };
  }
  if (step.tool === "weather") {
    const match =
      message.match(/\b([A-Za-zÇĞİÖŞÜçğıöşü]+)\s+(?:hava(?: durumu)?|sıcaklık|yağmur)\b/i) ||
      message.match(/\b(?:hava(?: durumu)?|sıcaklık|yağmur)\s+(?:nasıl|kaç|durumu)?\s*([A-Za-zÇĞİÖŞÜçğıöşü]+)\b/i);
    const city = match?.[1] || "Ankara";
    try {
      return { tool: "weather", ...(await getWeather(city)) };
    } catch (error) {
      return { tool: "weather", ok: false, error: error?.message || "Hava verisi alınamadı." };
    }
  }
  if (step.tool === "web") {
    try {
      return { tool: "web", ok: true, results: await webSearch(message) };
    } catch (error) {
      return { tool: "web", ok: false, error: error?.message || "Web araması başarısız." };
    }
  }
  if (step.tool === "project") {
    try {
      const files = await generateProjectFiles(env, message);
      return { tool: "project", ok: !!files, files: files || [] };
    } catch (error) {
      return { tool: "project", ok: false, error: error?.message || "Proje üretilemedi." };
    }
  }
  if (step.tool === "coding") {
    try {
      return await generateCodingResponse(env, message);
    } catch (error) {
      return { tool: "coding", ok: false, error: error?.message || "Kod üretimi başarısız." };
    }
  }
  return { tool: step.tool, ok: true, action: step.action };
}

async function executeAgentPlan(env, plan, message) {
  const results = [];
  const startedAt = Date.now();

  for (const step of plan.steps) {
    if (Date.now() - startedAt > 120000) {
      results.push({ tool: "agent", ok: false, error: "Agent çalışma süresi sınırına ulaşıldı." });
      break;
    }

    const toolStartedAt = Date.now();
    let result;
    if (step.tool === "project" && step.action === "package_generated_project") {
      const codingResult = results.find(result => result?.tool === "coding");
      const files = codingResult?.code ? sanitizeProjectFiles([
        { path: "main.py", content: codingResult.code },
        { path: "README.md", content: "# NEYQORA generated project\n\nKod NEYQORA Coding Agent tarafından üretildi ve güvenlik doğrulamasından geçirildi.\n" }
      ]) : null;
      const validation = files ? validateGeneratedProject(files) : { ok: false, errors: ["Kod sonucu paketlenemedi."] };
      result = { tool: "project", ok: validation.ok, files: files || [], validation, action: step.action };
    } else {
      result = await executeToolStep(env, step, message);
    }
    result.durationMs = Date.now() - toolStartedAt;
    results.push(result);

    if (!result.ok && step.action !== "answer") {
      break;
    }

    if (isRetryableTool(step.tool, result)) {
      const retryStartedAt = Date.now();
      const retry = await executeToolStep(env, step, message);
      retry.durationMs = Date.now() - retryStartedAt;
      retry.retry = true;
      results.push(retry);
    }
  }

  return results;
}

function buildAgentPlan(message) {
  const text = String(message || "").toLocaleLowerCase("tr-TR");
  const intent = routeMessage(message);
  const steps = [];

  const wantsProject = isProjectRequest(message);
  const wantsCodeAndProject = wantsProject && /kod|python|javascript|uygulama|program/.test(text);
  const wantsCodeTests = /test(lerini|leri)?|doğrula|kontrol et/.test(text);

  if (wantsCodeAndProject) {
    steps.push({ tool: "coding", action: "generate_or_repair_code" });
    if (wantsCodeTests) steps.push({ tool: "project", action: "package_generated_project" });
    else steps.push({ tool: "project", action: "generate_project" });
  } else if (intent === "project") {
    steps.push({ tool: "project", action: "generate_project" });
  } else if (intent === "web_search") {
    steps.push({ tool: "web", action: "search_web" });
  } else if (intent === "weather") {
    steps.push({ tool: "weather", action: "get_current_weather" });
  } else if (intent === "calculator") {
    steps.push({ tool: "calculator", action: "calculate" });
  } else if (intent === "coding") {
    steps.push({ tool: "coding", action: "generate_or_repair_code" });
  } else {
    steps.push({ tool: "chat", action: "answer" });
  }

  return {
    intent,
    steps: steps.slice(0, 3),
    maxSteps: Math.min(3, Math.max(1, steps.length)),
    requiresTool: intent !== "chat"
  };
}

function shouldFallbackToChat(intent, results) {
  if (intent === "chat") return false;
  return !results.some(result => result && result.ok);
}

function getFailureMessage(intent, results) {
  const failed = results.find(result => result && !result.ok);
  if (!failed) return null;
  const labels = {
    web: "Web araması",
    weather: "Hava durumu",
    project: "Proje üretimi",
    calculator: "Hesaplama",
    coding: "Kodlama"
  };
  const label = labels[failed.tool] || "Araç";
  return label + " şu anda başarısız oldu: " + (failed.error || "Bilinmeyen hata") + ".";
}

function summarizeAgentStatus(plan, results) {
  const successful = results.filter(result => result?.ok).length;
  const failed = results.filter(result => result && !result.ok).length;
  const retries = results.filter(result => result?.retry).length;
  return {
    intent: plan.intent,
    status: successful > 0 ? (failed > 0 ? "partial" : "success") : "failed",
    successful,
    failed,
    retries
  };
}

function validateAgentPlan(plan) {
  const allowed = new Set(["project", "web", "weather", "calculator", "coding", "chat"]);
  const limits = { project: 1, web: 1, weather: 1, calculator: 1, coding: 1, chat: 1 };
  const allowedActions = {
    project: new Set(["generate_project", "package_generated_project"]),
    web: new Set(["search_web"]),
    weather: new Set(["get_current_weather"]),
    calculator: new Set(["calculate"]),
    coding: new Set(["generate_or_repair_code"]),
    chat: new Set(["answer"])
  };
  if (!plan || !Array.isArray(plan.steps) || plan.steps.length === 0) {
    return { ok: false, error: "Agent planı boş." };
  }
  if (plan.steps.length > 3) {
    return { ok: false, error: "Agent planı çok uzun." };
  }
  const counts = {};
  for (const step of plan.steps) {
    if (!step || !allowed.has(step.tool) || typeof step.action !== "string") {
      return { ok: false, error: "Geçersiz agent aracı." };
    }
    if (!allowedActions[step.tool]?.has(step.action)) {
      return { ok: false, error: "Geçersiz agent işlemi." };
    }
    counts[step.tool] = (counts[step.tool] || 0) + 1;
    if (counts[step.tool] > limits[step.tool]) {
      return { ok: false, error: "Aynı araç gereğinden fazla çağrılmış." };
    }
  }
  return { ok: true };
}

function routeMessage(message) {
  const t = String(message || "").toLocaleLowerCase("tr-TR").trim();

  if (isProjectRequest(message)) return "project";

  const webSignals = [
    /^https?:\/\//i.test(t),
    t.includes("internetten"),
    t.includes("web'den"),
    t.includes("webden"),
    t.includes("araştır"),
    t.includes("güncel"),
    t.includes("son durum"),
    t.includes("haber"),
    t.includes("kaynak bul"),
    t.includes("link bul")
  ];
  if (webSignals.some(Boolean)) return "web_search";

  const calculatorSignals = [
    /\d/.test(t),
    /kaç eder|hesapla|hesap|topla|çıkar|çarp|böl|\b\d+\s*[+\-*/^%]\s*\d+\b/.test(t)
  ];
  if (calculatorSignals.every(Boolean)) return "calculator";

  if (t.includes("hava") || t.includes("sıcaklık") || t.includes("yağmur") || t.includes("hava durumu") || t.includes("meteoroloji")) {
    return "weather";
  }

  if (
    t.includes("kod") ||
    t.includes("javascript") ||
    t.includes("python") ||
    t.includes("typescript") ||
    t.includes("bug") ||
    t.includes("hata veriyor") ||
    t.includes("hata ayıkla") ||
    t.includes("debug")
  ) return "coding";

  return "chat";
}

function safeCalculate(message) {
  const match = String(message || "").replace(/,/g, ".").match(/[0-9()+\-*/.^%\s]+/);
  if (!match) return null;
  const expr = match[0].trim();
  if (!expr || !/^[0-9()+\-*/.^%\s]+$/.test(expr) || expr.length > 100) return null;

  const tokens = expr.match(/\d+(?:\.\d+)?|[()+\-*/^%]/g);
  if (!tokens || tokens.join("") !== expr.replace(/\s+/g, "")) return null;

  const precedence = { "+": 1, "-": 1, "*": 2, "/": 2, "%": 2, "^": 3 };
  const rightAssociative = new Set(["^"]);
  const values = [];
  const operators = [];

  const apply = () => {
    const op = operators.pop();
    if (!op || op === "(") return false;
    const b = values.pop();
    const a = values.pop();
    if (a === undefined || b === undefined) return false;
    let value;
    if (op === "+") value = a + b;
    else if (op === "-") value = a - b;
    else if (op === "*") value = a * b;
    else if (op === "/") {
      if (b === 0) return false;
      value = a / b;
    } else if (op === "%") {
      if (b === 0) return false;
      value = a % b;
    } else if (op === "^") value = a ** b;
    else return false;
    if (!Number.isFinite(value)) return false;
    values.push(value);
    return true;
  };

  let expectValue = true;
  for (const token of tokens) {
    if (/^\d/.test(token)) {
      if (!expectValue) return null;
      values.push(Number(token));
      expectValue = false;
      continue;
    }
    if (token === "(") {
      if (!expectValue) return null;
      operators.push(token);
      continue;
    }
    if (token === ")") {
      if (expectValue) return null;
      while (operators.length && operators.at(-1) !== "(") {
        if (!apply()) return null;
      }
      if (operators.pop() !== "(") return null;
      expectValue = false;
      continue;
    }
    if (expectValue && token === "-") {
      values.push(0);
    } else if (expectValue) {
      return null;
    }
    while (operators.length && operators.at(-1) !== "(") {
      const top = operators.at(-1);
      const leftPrecedence = precedence[token];
      const rightPrecedence = precedence[top];
      if (rightPrecedence > leftPrecedence || (rightPrecedence === leftPrecedence && !rightAssociative.has(token))) {
        if (!apply()) return null;
      } else break;
    }
    operators.push(token);
    expectValue = true;
  }

  if (expectValue) return null;
  while (operators.length) {
    if (operators.at(-1) === "(" || !apply()) return null;
  }
  return values.length === 1 && Number.isFinite(values[0]) ? String(values[0]) : null;
}

function buildProjectFiles(request) {
  const text = String(request || "").toLocaleLowerCase("tr-TR");
  if (text.includes("hesap makinesi")) {
    return [
      { path: "hesap_makinesi.py", content: `def calculate(num1, operator, num2):
    if operator == "+":
        return num1 + num2
    if operator == "-":
        return num1 - num2
    if operator == "*":
        return num1 * num2
    if operator == "/":
        if num2 == 0:
            raise ValueError("Sıfıra bölme yapılamaz.")
        return num1 / num2
    raise ValueError("Geçersiz işlem.")

def main():
    print("Hesap Makinesi")
    choice = input("Seçiminiz: ").strip()
    operators = {"1": "+", "2": "-", "3": "*", "4": "/"}
    if choice not in operators:
        print("Geçersiz seçim.")
        return
    try:
        num1 = float(input("İlk sayı: "))
        num2 = float(input("İkinci sayı: "))
        print("Sonuç:", calculate(num1, operators[choice], num2))
    except ValueError as error:
        print("Hata:", error)

if __name__ == "__main__":
    main()
` },
      { path: "test_hesap_makinesi.py", content: `from hesap_makinesi import calculate

def test_operations():
    assert calculate(10, "+", 5) == 15
    assert calculate(10, "-", 5) == 5
    assert calculate(10, "*", 5) == 50
    assert calculate(10, "/", 5) == 2

def test_zero_division():
    try:
        calculate(10, "/", 0)
    except ValueError:
        return
    raise AssertionError("Sıfıra bölme ValueError vermeli.")

if __name__ == "__main__":
    test_operations()
    test_zero_division()
    print("Tüm testler başarılı.")
` },
      { path: "README.md", content: "# Hesap Makinesi\n\nPython 3.10+ için basit hesap makinesi.\n\n## Test\n`python test_hesap_makinesi.py`\n" }
    ];
  }
  return null;
}

function sanitizeProjectName(request) {
  const words = String(request || "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFKD")
    .replace(/[\\u0300-\\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return words || "neyqora-proje";
}

function sanitizeProjectFiles(files) {
  if (!Array.isArray(files) || files.length < 1 || files.length > 12) return null;
  const safe = [];
  for (const file of files) {
    const path = String(file?.path || "").trim();
    const content = String(file?.content || "");
    if (!path || !content || path.length > 180 || content.length > 50000) return null;
    if (path.startsWith("/") || path.includes("..") || path.includes("\\") || !/^[A-Za-z0-9._/-]+$/.test(path)) return null;
    safe.push({ path, content });
  }
  const hasMain = safe.some(f => /^(main|app|index)\.(py|js|ts|html)$/.test(f.path.split("/").pop() || ""));
  if (!hasMain) return null;
  return safe;
}

function validateGeneratedProject(files) {
  const errors = [];
  if (!Array.isArray(files) || files.length === 0) return { ok: false, errors: ["Dosya listesi boş."] };

  const names = new Set(files.map(file => file.path));
  const pythonFiles = files.filter(file => /\.py$/i.test(file.path));

  for (const file of pythonFiles) {
    const code = file.content;
    if (/\beval\s*\(/.test(code) || /\bexec\s*\(/.test(code)) {
      errors.push(file.path + ": eval/exec kullanımı yasak.");
    }
    if (/[A-Za-z_][A-Za-z0-9_]*[ÇĞİÖŞÜçğıöşü]/.test(code)) {
      errors.push(file.path + ": Python tanımlayıcılarında Türkçe karakter var.");
    }
    const opens = (code.match(/[([{]/g) || []).length;
    const closes = (code.match(/[)\\]}]/g) || []).length;
    if (opens !== closes) errors.push(file.path + ": parantez/braket dengesi hatalı.");
  }

  const hasMain = files.some(file => /^(main|app|index)\.(py|js|ts|html)$/i.test(file.path.split("/").pop() || ""));
  if (!hasMain) errors.push("Ana giriş dosyası bulunamadı.");

  const hasTest = files.some(file => /^test_.*\.py$/i.test(file.path.split("/").pop() || ""));
  return { ok: errors.length === 0, errors, hasTest, fileCount: files.length, names: [...names] };
}

async function generateProjectFiles(env, request) {
  const result = await env.AI.run(MODEL, {
    messages: [
      { role: "system", content: "Sen NEYQORA proje üreticisisin. Kullanıcının istediği programı üret. Yalnızca istenen özellikleri ekle. Varsayılan olarak Python 3.10+ kullan. Çıktıyı SADECE geçerli JSON ver: {\"files\":[{\"path\":\"main.py\",\"content\":\"...\"}]}. En fazla 8 dosya. En az bir ana dosya ve mümkünse test_*.py dosyası üret. Python tanımlayıcılarında yalnızca ASCII kullan. eval ve exec kullanma. Testler gerçek kodu çağırmalı. Açıklama ekleme." },
      { role: "user", content: String(request || "").trim() }
    ],
    max_tokens: 5000,
    temperature: 0.2
  });
  const raw = result?.response || result?.choices?.[0]?.message?.content || "";
  const match = raw.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    const files = sanitizeProjectFiles(JSON.parse(match[0]).files);
    if (!files) return null;
    const validation = validateGeneratedProject(files);
    if (!validation.ok) return null;
    return files;
  } catch {
    return null;
  }
}
function extractPythonCode(text) {
  const match = text.match(/\`\`\`python\s*([\\s\\S]*?)\`\`\`/i) || text.match(/\`\`\`\s*([\\s\\S]*?)\`\`\`/);
  return match ? match[1].trim() : "";
}

function basicPythonValidation(code) {
  if (!code) return { ok: false, errors: ["Python kod bloğu bulunamadı."] };
  const errors = [];
  if (/\bself\.[A-Za-z_][A-Za-z0-9_]*\s+[A-Za-z_]/.test(code)) {
    errors.push("Olası geçersiz Python ifade kullanımı.");
  }
  if (/[A-Za-z_][A-Za-z0-9_]*[ÇĞİÖŞÜçğıöşü]/.test(code)) {
    errors.push("Python tanımlayıcılarında Türkçe karakter kullanılmış.");
  }
  if (/\b(seçenik|seçenek|sayi|sayı)\b/.test(code)) {
    errors.push("Kodda tutarsız veya hatalı değişken adı kullanılmış.");
  }
  const definedMethods = [...code.matchAll(/^\s*def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/gm)].map(m => m[1]);
  const calledMethods = [...code.matchAll(/\b(?:self|hesap)\.([A-Za-z_][A-Za-z0-9_]*)\s*\(/g)].map(m => m[1]);
  for (const name of calledMethods) {
    if (name !== "__init__" && !definedMethods.includes(name)) {
      errors.push("Tanımsız metot çağrısı: " + name);
    }
  }
  if (/\b(if|elif|else|for|while|def|class|try|except|with)\b[^\n:]*\n/.test(code)) {
    const lines = code.split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (/^(if|elif|else|for|while|def|class|try|except|with)\b/.test(line) && !line.endsWith(":")) {
        errors.push("Satır " + (i + 1) + ": Python blok satırı ':' ile bitmiyor.");
      }
    }
  }
  const opens = (code.match(/[([{]/g) || []).length;
  const closes = (code.match(/[)\\]}]/g) || []).length;
  if (opens !== closes) errors.push("Parantez/braket dengesi hatalı.");
  return { ok: errors.length === 0, errors };
}

function decodeHtml(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

async function getWeather(city) {
  const place = String(city || "").trim();
  if (!place) return { ok: false, error: "Hava durumu için şehir adı gerekli." };

  const geoUrl = "https://geocoding-api.open-meteo.com/v1/search?name=" +
    encodeURIComponent(place) + "&count=1&language=tr&format=json";
  const geoResponse = await fetch(geoUrl, { headers: { "user-agent": "NEYQORA/1.0" } });
  if (!geoResponse.ok) throw new Error("Şehir aranamadı.");
  const geo = await geoResponse.json();
  const location = geo?.results?.[0];
  if (!location) return { ok: false, error: "Şehir bulunamadı." };

  const weatherUrl = "https://api.open-meteo.com/v1/forecast?latitude=" +
    encodeURIComponent(location.latitude) +
    "&longitude=" + encodeURIComponent(location.longitude) +
    "&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m" +
    "&timezone=auto";
  const weatherResponse = await fetch(weatherUrl, { headers: { "user-agent": "NEYQORA/1.0" } });
  if (!weatherResponse.ok) throw new Error("Hava verisi alınamadı.");
  const weather = await weatherResponse.json();
  const current = weather?.current;
  if (!current) return { ok: false, error: "Hava verisi bulunamadı." };

  const descriptions = {
    0: "Açık",
    1: "Çoğunlukla açık",
    2: "Parçalı bulutlu",
    3: "Kapalı",
    45: "Sisli",
    48: "Kırağılı sis",
    51: "Hafif çiseleme",
    53: "Çiseleme",
    55: "Yoğun çiseleme",
    61: "Hafif yağmur",
    63: "Yağmur",
    65: "Kuvvetli yağmur",
    71: "Hafif kar",
    73: "Kar",
    75: "Yoğun kar",
    80: "Hafif sağanak",
    81: "Sağanak",
    82: "Kuvvetli sağanak",
    95: "Gök gürültülü fırtına",
    96: "Dolu ihtimalli fırtına",
    99: "Kuvvetli dolu ihtimalli fırtına"
  };

  return {
    ok: true,
    city: location.name,
    country: location.country,
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    humidity: current.relative_humidity_2m,
    precipitation: current.precipitation,
    windSpeed: current.wind_speed_10m,
    description: descriptions[current.weather_code] || "Bilinmeyen hava durumu",
    time: current.time,
    timezone: weather.timezone
  };
}

async function webSearch(query) {
  const clean = query.trim();
  const searchQuery = clean
    .replace(/\b(bugün|güncel|son durum|haberleri|haberler|araştır|araştırır mısın|araştırabilir misin)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim() || clean;
  const isUrl = /^https?:\/\//i.test(clean);

  if (isUrl) {
    const response = await fetch(clean, { headers: { "user-agent": "NEYQORA/1.0" } });
    if (!response.ok) throw new Error("Sayfa açılamadı.");
    const html = await response.text();
    const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || clean)
      .replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    return [{ title, link: clean }];
  }

  const sources = [
    "https://news.google.com/rss/search?q=" + encodeURIComponent(searchQuery) + "&hl=tr&gl=TR&ceid=TR:tr",
    "https://www.bing.com/news/search?q=" + encodeURIComponent(searchQuery) + "&format=rss"
  ];

  for (const url of sources) {
    try {
      const response = await fetch(url, {
        headers: { "user-agent": "Mozilla/5.0 NEYQORA/1.0", "accept": "application/rss+xml, application/xml, text/xml" }
      });
      if (!response.ok) continue;

      const xml = await response.text();
      const results = [];
      const itemRe = /<item>([\s\S]*?)<\/item>/gi;
      let item;

      while ((item = itemRe.exec(xml)) && results.length < 6) {
        const block = item[1];
        const title = decodeHtml((block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || "")
          .replace(/<!\[CDATA\[|\]\]>/g, "").trim());
        const link = decodeHtml((block.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || "").trim());
        const pubDate = decodeHtml((block.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || "").trim());

        if (title && link) results.push({ title, link, pubDate });
      }

      if (results.length) return results;
    } catch {}
  }

  throw new Error("Güncel haber araması kullanılamıyor.");
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return new Response(HTML, {headers: {"content-type": "text/html; charset=UTF-8", "cache-control": "no-store, no-cache, must-revalidate, max-age=0"}});
    }

    if (request.method === "GET" && url.pathname === "/api/health") {
      return Response.json({
        ok: true,
        name: "NEYQORA",
        version: "4.3",
        model: MODEL,
        memory: !!env.DB,
        router: true,
        agent: true,
        tools: ["calculator", "weather", "web", "coding", "project"],
        web: true
      });
    }

    if (request.method === "POST" && url.pathname === "/api/project") {
      try {
        const body = await request.json();
        const requestText = String(body?.request || "").trim();
        if (!requestText) return Response.json({ error: "request gerekli." }, { status: 400 });
        let files = buildProjectFiles(requestText);
        let generator = "template";
        if (!files) {
          files = await generateProjectFiles(env, requestText);
          generator = "ai";
        }
        if (!files) return Response.json({ ok: false, error: "Proje üretilemedi. İsteği biraz daha açık tarif et." }, { status: 502 });
        return Response.json({
          ok: true,
          project: sanitizeProjectName(requestText),
          generator,
          files,
          testable: files.some(file => /^test_.*\.py$/i.test(file.path)),
          fileCount: files.length,
          note: "NEYQORA proje dosyalarını üretti. GitHub'a yazma işlemi GitHub Actions workflow'u üzerinden yapılır."
        });
      } catch (error) {
        return Response.json({ ok: false, error: error?.message || "Proje oluşturulamadı." }, { status: 500 });
      }
    }

    if (request.method === "GET" && url.pathname === "/api/search") {
      const q = (url.searchParams.get("q") || "").trim();
      if (!q) return Response.json({ error: "q parametresi gerekli." }, { status: 400 });
      try {
        const results = await webSearch(q);
        return Response.json({ ok: true, query: q, results });
      } catch (error) {
        return Response.json({ ok: false, error: error?.message || "Arama başarısız." }, { status: 502 });
      }
    }

    if (request.method === "POST" && url.pathname === "/api/chat") {
      try {
        const body = await request.json();
        const message = String(body?.message || "").trim();
        const userId = String(body?.userId || "").trim();
        const rawHistory = Array.isArray(body?.history) ? body.history : [];
        const history = rawHistory
          .filter(item => item && (item.role === "user" || item.role === "assistant"))
          .map(item => ({ role: item.role, content: String(item.content || "").slice(0, 4000) }))
          .slice(-10);
        if (!message) return Response.json({ error: "Mesaj boş." }, { status: 400 });
        if (!userId || userId.length > 100) return Response.json({ error: "Kullanıcı kimliği eksik." }, { status: 400 });

        const agentPlan = buildAgentPlan(message);
        const planValidation = validateAgentPlan(agentPlan);
        if (!planValidation.ok) {
          return Response.json({ error: "NEYQORA agent planı doğrulanamadı." }, { status: 500 });
        }
        const intent = agentPlan.intent;
        const agentResults = await executeAgentPlan(env, agentPlan, message);
        const successfulToolResults = agentResults.filter(item => item && item.ok);
        const agentAudit = buildAgentAudit(agentPlan, agentResults);
        const needsChatFallback = shouldFallbackToChat(intent, agentResults);
        const agentTrace = buildAgentTrace(agentPlan, agentResults);
        const agentStatus = summarizeAgentStatus(agentPlan, agentResults);
        const toolFailureMessage = getFailureMessage(intent, agentResults);

        if (env.DB) {
          const forget = forgetRequest(message);
          if (forget) {
            if (forget.type === "name") {
              await env.DB.prepare("DELETE FROM memories WHERE user_id = ? AND content LIKE 'Kullanıcının adı:%'").bind(userId).run();
              return Response.json({ reply: "Adınla ilgili kayıtlı bilgiyi unuttum.", intent: "memory" });
            }
            if (forget.type === "text") {
              await env.DB.prepare("DELETE FROM memories WHERE user_id = ? AND content LIKE ?").bind(userId, "%" + forget.detail + "%").run();
              return Response.json({ reply: "İstediğin bilgiyle eşleşen kayıtları unuttum.", intent: "memory" });
            }
            await env.DB.prepare("DELETE FROM memories WHERE id = (SELECT id FROM memories WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT 1)").bind(userId).run();
            return Response.json({ reply: "Son kaydettiğim bilgiyi unuttum.", intent: "memory" });
          }
        }

        if (intent === "calculator") {
          const result = agentResults.find(item => item.tool === "calculator");
          const value = result?.value;
          if (result?.ok && value !== null) {
            return Response.json({ reply: "Sonuç: " + value, intent, plan: agentPlan, toolResults: agentResults, audit: agentAudit, trace: agentTrace, agentStatus });
          }
        }

        let memories = [];
        if (env.DB) {
          const result = await env.DB.prepare(
            "SELECT content, created_at FROM memories WHERE user_id = ? ORDER BY created_at DESC LIMIT 12"
          ).bind(userId).all();
          memories = result.results || [];
        }

        const nameMemory = memories.find(m => String(m.content || "").startsWith("Kullanıcının adı:"));
        if (isNameQuestion(message) && nameMemory) {
          return Response.json({ reply: String(nameMemory.content).replace("Kullanıcının adı: ", "") + ".", intent: "memory" });
        }

        const memoryText = (intent === "coding" || intent === "project") ? "" : (memories.length
          ? "\n\nKullanıcı hakkında daha önce kaydedilmiş bilgiler:\n" +
            memories.slice(0, 8).map(m => "- " + m.content).join("\n")
          : "");

        const contextText = history.length
          ? "\n\nBu konuşmadaki son mesajlar:\n" +
            history.map(item => (item.role === "user" ? "Kullanıcı: " : "NEYQORA: ") + item.content).join("\n")
          : "";

        if (intent === "coding") {
          const result = agentResults.find(item => item.tool === "coding");
          let codingReply = result?.reply || "";
          let codingCode = result?.code || "";
          let codingValidation = result?.validation || null;

          if (!codingReply) {
            const fallback = await env.AI.run(MODEL, {
              messages: [
                { role: "system", content: "Python 3.10+ ile istenen programı üret. Yalnızca kısa açıklama ve tek eksiksiz Python kod bloğu ver. eval veya exec kullanma. Tanımlayıcılarda ASCII kullan." },
                { role: "user", content: message }
              ],
              max_tokens: 2048,
              temperature: 0.2
            });
            codingReply = fallback?.response || fallback?.choices?.[0]?.message?.content || "";
            codingCode = extractPythonCode(codingReply);
            codingValidation = basicPythonValidation(codingCode);
          }

          if (!codingReply) {
            return Response.json({
              reply: "Kod üretilemedi. Lütfen tekrar dene.",
              intent,
              plan: agentPlan,
              toolResults: agentResults,
              audit: agentAudit,
              trace: agentTrace,
              agentStatus
            }, { status: 500 });
          }

          const finalReply = codingValidation?.ok
            ? codingReply
            : codingReply + "\n\n[NEYQORA notu: Kod otomatik doğrulamadan tam geçmedi; çalıştırmadan önce kontrol et.]";

          return Response.json({
            reply: finalReply,
            intent,
            code: codingCode,
            validation: codingValidation,
            plan: agentPlan,
            toolResults: agentResults,
            audit: agentAudit,
            trace: agentTrace,
            agentStatus
          });
        }

        if (intent === "project") {
          const result = agentResults.find(item => item.tool === "project");
          const files = result?.files || [];
          if (!result?.ok || !files.length) {
            return Response.json({
              reply: "Projeyi güvenli biçimde üretemedim. İsteği biraz daha açık tarif et.",
              intent,
              project: null,
              plan: agentPlan,
              toolResults: agentResults
            });
          }
          const project = sanitizeProjectName(message);
          return Response.json({
            reply: "Proje taslağını oluşturdum: " + project + ". " + files.length + " dosya hazır. GitHub'a kaydetmek için GitHub Actions proje workflow'u kullanılabilir.",
            intent,
            project,
            files,
            testable: files.some(file => /^test_.*\\.py$/i.test(file.path)),
            plan: agentPlan,
            toolResults: agentResults
          });
        }

        if (intent === "web_search") {
          const result = agentResults.find(item => item.tool === "web");
          const results = result?.results || [];
          if (!result?.ok || !results.length) {
            return Response.json({
              reply: "Güncel web araştırması şu anda kullanılamadı.",
              intent,
              sources: [],
              plan: agentPlan,
              toolResults: agentResults
            });
          }

          const reply = "Güncel web araştırması sonuçları:\n\n" +
            results.map((r, i) =>
              (i + 1) + ". " + r.title +
              (r.pubDate ? "\n   Tarih: " + r.pubDate : "") +
              "\n   Kaynak: " + r.link
            ).join("\n\n") +
            "\n\nNot: Bu sonuçlar doğrudan web aramasından alındı; NEYQORA bunları haber diye uydurmadı.";

          return Response.json({ reply, intent, sources: results, plan: agentPlan, toolResults: agentResults });
        }

        let researchText = "";
        if (intent === "weather") {
          const weather = agentResults.find(item => item.tool === "weather");
          if (!weather?.ok) {
            return Response.json({
              reply: "Güncel hava verisi alınamadı: " + (weather?.error || "Bilinmeyen hata"),
              intent: "weather",
              plan: agentPlan,
              toolResults: agentResults
            }, { status: 502 });
          }
          researchText = "\n\nGüncel hava verisi: " +
            weather.city + ", " + weather.country +
            " | " + weather.description +
            " | sıcaklık " + weather.temperature + "°C" +
            " | hissedilen " + weather.apparentTemperature + "°C" +
            " | nem " + weather.humidity + "%" +
            " | rüzgar " + weather.windSpeed + " km/sa" +
            " | yağış " + weather.precipitation + " mm" +
            " | veri zamanı " + weather.time + " (" + weather.timezone + ").";
        }

        const codingInstructions = intent === "coding" ? " KODLAMA GÖREVİ. Sadece kullanıcının istediği programı üret. Hesap makinesi istenirse yalnızca toplama, çıkarma, çarpma ve bölme özelliklerini ekle; başka özellik ekleme. Geçerli Python 3.10+ sözdizimi kullan. eval kullanma. Fonksiyon ve değişken adlarında Türkçe karakter kullanma; yalnızca ASCII İngilizce adlar kullan. Python kodunu göndermeden önce zihinsel bir derleme kontrolü yap: tüm çağrılan metotlar tanımlı mı, parantez ve girintiler doğru mu, menü seçenekleri ile dallar eşleşiyor mu, değişkenler tanımlı mı, program akışı tamam mı. Özellikle çıkarma için subtraction, çarpma için multiplication, bölme için division gibi tutarlı adlar kullan; outirma gibi uydurma isimler ASLA kullanma. Tanımsız fonksiyon, yanlış menü seçeneği, alakasız işlem, sahte test veya uydurma özellik bırakma. Kod bloğunu eksiksiz kapat. Cevap formatı: 1) kısa açıklama, 2) tek bir eksiksiz kod bloğu, 3) 4 temel işlem için kısa testler. Kod çalıştırmadıysan çalıştırmış gibi davranma." : "";
        const toolContext = successfulToolResults.length
          ? "\n\nKullanılan araçların doğrulanmış sonuçları:\n" +
            successfulToolResults.map(formatToolResult).filter(Boolean).join("\n")
          : "";
        const fallbackContext = needsChatFallback
          ? "\n\nAraç sonucu alınamadı. Araçtan gelmeyen güncel veya doğrulanmamış bilgi uydurma; kullanıcıya aracın başarısız olduğunu açıkça söyle."
          : "";
        const failureContext = toolFailureMessage
          ? "\n\nAraç hata özeti: " + toolFailureMessage
          : "";
        const system = "Sen NEYQORA'sın. Türkçe konuşan, güvenilir ve yardımcı bir yapay zekâ asistanısın. Bilmediğin şeyi uydurma. Kullanıcının açık isteğine sadık kal; istenmeyen kişisel bilgi, özellik veya konu ekleme. Güncel veri gerektiren sorularda veri yoksa açıkça söyle. İstek türü: " + intent + "." + codingInstructions + memoryText + contextText + researchText + toolContext + fallbackContext + failureContext;

        const modelMessages = [{ role: "system", content: system }];
        for (const item of history) {
          if (item.content && item.content !== message) modelMessages.push(item);
        }
        modelMessages.push({ role: "user", content: message });

        const result = await env.AI.run(MODEL, {
          messages: modelMessages,
          max_tokens: intent === "coding" ? 3072 : 1024,
          temperature: intent === "coding" ? 0.2 : 0.7
        });

        let reply = result?.response || result?.choices?.[0]?.message?.content || "Yanıt üretilemedi.";

        if (intent === "coding") {
          const code = extractPythonCode(reply);
          const validation = basicPythonValidation(code);
          if (!validation.ok) {
            const repair = await env.AI.run(MODEL, {
              messages: [
                { role: "system", content: "Sen bir Python kod düzelticisisin. Yalnızca verilen Python kodundaki sözdizimi, tanımlayıcı ve bariz isim/çağrı hatalarını düzelt. Yeni özellik ekleme. Python tanımlayıcılarında yalnızca ASCII harfleri, rakamları ve alt çizgiyi kullan. Örneğin secim, sayi1, sayi2 kullan; seçenik gibi isimleri kullanma. Kod eksiksiz ve Python 3.10+ uyumlu olsun. Yalnızca düzeltilmiş tek Python kod bloğu döndür." },
                { role: "user", content: "Kod:\n" + code + "\n\nHatalar:\n" + validation.errors.join("\n") }
              ],
              max_tokens: 3072,
              temperature: 0.1
            });
            const repaired = repair?.response || repair?.choices?.[0]?.message?.content || "";
            const repairedCode = extractPythonCode(repaired);
            const second = basicPythonValidation(repairedCode);
            if (second.ok) {
              reply = repaired;
            } else {
              reply += "\n\n[NEYQORA doğrulama uyarısı: Kod ilk otomatik kontrolden geçmedi.]";
            }
          }
        }

        if (env.DB && shouldRemember(message)) {
          const memory = extractMemory(message);
          await env.DB.prepare(
            "INSERT INTO memories (user_id, content) VALUES (?, ?)"
          ).bind(userId, memory).run();
        }

        return Response.json({
          reply,
          intent,
          plan: agentPlan,
          toolResults: agentResults,
          audit: agentAudit,
          trace: agentTrace,
          agentStatus,
          memorySaved: !!(env.DB && shouldRemember(message))
        });
      } catch (error) {
        return Response.json({ error: "NEYQORA hatası: " + (error?.message || "Bilinmeyen hata") }, { status: 500 });
      }
    }

    return new Response("NEYQORA", { status: 404 });
  }
};

// Testable pure-core helpers are kept independent from Cloudflare runtime APIs.
export const __test = {
  routeMessage,
  isProjectRequest,
  sanitizeProjectName,
  validateAgentPlan,
  buildAgentPlan,
  shouldFallbackToChat,
  summarizeAgentStatus,
  safeCalculate,
  basicPythonValidation,
  executeToolStep
};
