const MODEL = "@cf/meta/llama-3.2-3b-instruct";
const VERSION = "6.0";
const AUDIO_MODEL = "@cf/openai/whisper-large-v3-turbo";
const VISION_MODEL = "@cf/meta/llama-3.2-11b-vision-instruct";

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
<header><h1>NEYQORA</h1><p>Kişisel yapay zekâ asistanın · V6.0</p></header>
<div id="chat"><div class="msg ai">Merhaba. Ben NEYQORA. Nasıl yardımcı olabilirim?</div></div><div id="memory-panel" style="padding:0 16px 12px">
<div class="msg ai" style="margin-bottom:8px"><strong>Kalıcı Hafıza</strong><div style="margin-top:6px;color:#8d98b3;font-size:13px">Kayıtlı bilgilerini görüntüleyebilir, tek tek veya tamamını silebilirsin.</div><button id="clear-memories" type="button" style="margin-top:9px;padding:8px 11px;border-radius:9px;border:0;background:#27385f;color:#fff">Tüm Hafızayı Sil</button></div>
<div id="memory-list" class="msg ai">Hafıza yükleniyor...</div>
</div>
<div id="project-panel" hidden style="padding:0 16px 110px"><div class="msg ai" id="project-title">Proje sonucu</div><button id="copy-project" type="button" style="width:100%;height:44px;margin:6px 0 10px;border-radius:12px;border:0;background:#fff;color:#0a0e18;font-weight:700">Kodu Kopyala</button><button id="send-project" type="button" style="width:100%;height:44px;margin:0 0 10px;border-radius:12px;border:0;background:#27385f;color:#fff;font-weight:700">GitHub'da Proje Görevi Oluştur</button><pre id="project-files" style="white-space:pre-wrap;overflow:auto;background:#0b1020;padding:12px;border-radius:12px;color:#dbe4ff"></pre></div>
<div id="productivity-panel" style="padding:0 16px 12px"><div class="msg ai"><strong>Takvim · E-posta · Otomasyon</strong><div style="margin-top:6px;color:#8d98b3;font-size:13px">Etkinlik oluştur, e-posta taslağı hazırla ve zamanlanmış görev oluştur.</div><input id="event-title" placeholder="Takvim etkinliği" style="width:100%;margin-top:10px"><input id="event-start" type="datetime-local" style="width:100%;margin-top:8px"><input id="event-end" type="datetime-local" style="width:100%;margin-top:8px"><button id="create-event" type="button" style="width:100%;height:42px;margin-top:8px;background:#27385f;color:#fff">Etkinlik Oluştur</button><input id="email-to" placeholder="E-posta alıcısı" style="width:100%;margin-top:12px"><input id="email-subject" placeholder="Konu" style="width:100%;margin-top:8px"><textarea id="email-body" placeholder="E-posta içeriği" style="width:100%;min-height:90px;margin-top:8px;background:#0b1020;color:#fff;border:0;border-radius:12px;padding:12px"></textarea><button id="save-email" type="button" style="width:100%;height:42px;margin-top:8px;background:#27385f;color:#fff">E-posta Taslağını Kaydet</button><input id="automation-title" placeholder="Otomasyon adı" style="width:100%;margin-top:12px"><input id="automation-run" type="datetime-local" style="width:100%;margin-top:8px"><input id="automation-prompt" placeholder="Görev" style="width:100%;margin-top:8px"><button id="create-automation" type="button" style="width:100%;height:42px;margin-top:8px;background:#27385f;color:#fff">Otomasyon Oluştur</button></div><div id="productivity-result" class="msg ai" hidden></div></div><div id="file-panel" style="padding:0 16px 12px"><div class="msg ai"><strong>Dosya Analizi</strong><div style="margin-top:6px;color:#8d98b3;font-size:13px">Metin, kod, JSON, CSV ve Markdown dosyalarını yükleyip analiz ettirebilirsin.</div><input id="file-input" type="file" multiple accept=".txt,.md,.csv,.json,.js,.mjs,.ts,.tsx,.jsx,.py,.java,.c,.cpp,.h,.hpp,.css,.html,.xml,.yaml,.yml,.sql,.sh,.log" style="width:100%;margin-top:10px;color:#dbe4ff"><button id="analyze-files" type="button" style="width:100%;height:42px;margin-top:9px;border-radius:12px;border:0;background:#27385f;color:#fff;font-weight:700">Dosyaları Analiz Et</button></div><div id="file-result" class="msg ai" hidden></div></div><div id="media-panel" style="padding:0 16px 12px"><div class="msg ai"><strong>Ses ve Görüntü</strong><div style="margin-top:6px;color:#8d98b3;font-size:13px">Ses kaydı yükleyerek yazıya dönüştür, görsel yükleyerek analiz ettir.</div><input id="audio-input" type="file" accept="audio/*,.wav,.mp3,.m4a,.ogg,.webm" style="width:100%;margin-top:10px;color:#dbe4ff"><button id="transcribe-audio" type="button" style="width:100%;height:42px;margin-top:9px;border-radius:12px;border:0;background:#27385f;color:#fff;font-weight:700">Sesi Yazıya Çevir</button><input id="image-input" type="file" accept="image/png,image/jpeg,image/webp,image/gif" style="width:100%;margin-top:14px;color:#dbe4ff"><button id="analyze-image" type="button" style="width:100%;height:42px;margin-top:9px;border-radius:12px;border:0;background:#27385f;color:#fff;font-weight:700">Görseli Analiz Et</button></div><div id="media-result" class="msg ai" hidden></div></div><div id="form" role="form"><input id="input" name="message" placeholder="NEYQORA'ya bir şey sor..." autocomplete="off"><button id="send" type="button" onclick="return window.neyqoraSend()">Gönder</button></div>
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
async function loadMemories(){
  const list=document.querySelector("#memory-list");
  if(!list)return;
  try{
    const r=await fetch("/api/memory?userId="+encodeURIComponent(userId));
    const data=await r.json();
    if(!r.ok)throw new Error(data.error||"Hafıza yüklenemedi.");
    list.innerHTML="";
    if(!data.memories?.length){list.textContent="Henüz kayıtlı hafıza yok.";return;}
    for(const memory of data.memories){
      const row=document.createElement("div");
      row.style.cssText="display:flex;gap:8px;align-items:flex-start;padding:8px 0;border-bottom:1px solid #27314a";
      const text=document.createElement("span"); text.textContent=memory.content; text.style.flex="1";
      const del=document.createElement("button"); del.type="button"; del.textContent="Sil"; del.style.cssText="padding:7px 10px;border-radius:9px;border:0;background:#27385f;color:#fff";
      del.onclick=async()=>{del.disabled=true;try{const rr=await fetch("/api/memory?userId="+encodeURIComponent(userId)+"&id="+encodeURIComponent(memory.id),{method:"DELETE"});if(!rr.ok)throw new Error();await loadMemories();}catch{del.disabled=false;}};
      row.append(text,del);list.appendChild(row);
    }
  }catch{list.textContent="Hafıza yüklenemedi.";}
}
document.querySelector("#clear-memories")?.addEventListener("click",async()=>{
  if(!confirm("Kayıtlı tüm hafıza silinsin mi?"))return;
  const button=document.querySelector("#clear-memories");
  if(button)button.disabled=true;
  try{
    const r=await fetch("/api/memory?userId="+encodeURIComponent(userId)+"&all=1",{method:"DELETE"});
    if(!r.ok)throw new Error();
    await loadMemories();
  }catch{alert("Hafıza silinemedi.");}
  finally{if(button)button.disabled=false;}
});
loadMemories();
document.querySelector("#analyze-files")?.addEventListener("click",async()=>{
  const input=document.querySelector("#file-input");
  const result=document.querySelector("#file-result");
  const button=document.querySelector("#analyze-files");
  const files=[...(input?.files||[])];
  if(!files.length){if(result){result.hidden=false;result.textContent="Önce dosya seç.";};return;}
  const formData=new FormData();
  for(const file of files)formData.append("files",file,file.name);
  if(button)button.disabled=true;
  if(result){result.hidden=false;result.textContent="Dosyalar analiz ediliyor...";}
  try{const r=await fetch("/api/files/analyze",{method:"POST",body:formData});const data=await r.json();if(!r.ok)throw new Error(data.error||"Analiz başarısız.");result.textContent=data.analysis||"Analiz sonucu yok.";}catch(error){if(result)result.textContent="Hata: "+(error?.message||"Dosya analizi başarısız.");}finally{if(button)button.disabled=false;}
});
async function postProductivity(url,payload){const r=await fetch(url,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload)});const d=await r.json();if(!r.ok)throw new Error(d.error||"İşlem başarısız.");return d;}
document.querySelector("#create-event")?.addEventListener("click",async()=>{const o=document.querySelector("#productivity-result");try{const d=await postProductivity("/api/calendar/events",{userId,title:document.querySelector("#event-title").value,startAt:document.querySelector("#event-start").value,endAt:document.querySelector("#event-end").value});o.hidden=false;o.textContent="Etkinlik oluşturuldu: "+d.event.title;}catch(e){o.hidden=false;o.textContent="Hata: "+e.message;}});
document.querySelector("#save-email")?.addEventListener("click",async()=>{const o=document.querySelector("#productivity-result");try{const d=await postProductivity("/api/email/drafts",{userId,to:document.querySelector("#email-to").value,subject:document.querySelector("#email-subject").value,body:document.querySelector("#email-body").value});o.hidden=false;o.textContent="E-posta taslağı kaydedildi (#"+d.draft.id+").";}catch(e){o.hidden=false;o.textContent="Hata: "+e.message;}});
document.querySelector("#create-automation")?.addEventListener("click",async()=>{const o=document.querySelector("#productivity-result");try{const d=await postProductivity("/api/automations",{userId,title:document.querySelector("#automation-title").value,runAt:new Date(document.querySelector("#automation-run").value).toISOString(),prompt:document.querySelector("#automation-prompt").value});o.hidden=false;o.textContent="Otomasyon oluşturuldu (#"+d.automation.id+").";}catch(e){o.hidden=false;o.textContent="Hata: "+e.message;}});
document.querySelector("#transcribe-audio")?.addEventListener("click",async()=>{
  const file=document.querySelector("#audio-input")?.files?.[0]; const result=document.querySelector("#media-result"); const button=document.querySelector("#transcribe-audio");
  if(!file){if(result){result.hidden=false;result.textContent="Önce ses dosyası seç.";}return;}
  const formData=new FormData(); formData.append("file",file,file.name); if(button)button.disabled=true; if(result){result.hidden=false;result.textContent="Ses çözümleniyor...";}
  try{const r=await fetch("/api/audio/transcribe",{method:"POST",body:formData});const data=await r.json();if(!r.ok)throw new Error(data.error||"Ses analizi başarısız.");result.textContent=data.text||"Metin bulunamadı.";}catch(error){result.textContent="Hata: "+(error?.message||"Ses analizi başarısız.");}finally{if(button)button.disabled=false;}
});
document.querySelector("#analyze-image")?.addEventListener("click",async()=>{
  const file=document.querySelector("#image-input")?.files?.[0]; const result=document.querySelector("#media-result"); const button=document.querySelector("#analyze-image");
  if(!file){if(result){result.hidden=false;result.textContent="Önce görsel seç.";}return;}
  const formData=new FormData(); formData.append("file",file,file.name); if(button)button.disabled=true; if(result){result.hidden=false;result.textContent="Görsel analiz ediliyor...";}
  try{const r=await fetch("/api/image/analyze",{method:"POST",body:formData});const data=await r.json();if(!r.ok)throw new Error(data.error||"Görsel analizi başarısız.");result.textContent=data.analysis||"Analiz sonucu yok.";}catch(error){result.textContent="Hata: "+(error?.message||"Görsel analizi başarısız.");}finally{if(button)button.disabled=false;}
});
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
    loadMemories();
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

async function ensureProductivityTables(env){
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS calendar_events (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT NOT NULL,title TEXT NOT NULL,start_at TEXT NOT NULL,end_at TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',location TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_calendar_user_start ON calendar_events(user_id,start_at)").run();
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS email_drafts (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT NOT NULL,to_address TEXT NOT NULL,subject TEXT NOT NULL,body TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'draft',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_email_user_created ON email_drafts(user_id,created_at DESC)").run();
  await env.DB.prepare("CREATE TABLE IF NOT EXISTS automations (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT NOT NULL,title TEXT NOT NULL,prompt TEXT NOT NULL,run_at TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending',last_error TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();
  await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_automation_due ON automations(status,run_at)").run();
}
function normalizeUserId(value){const text=String(value||"").trim();return /^[A-Za-z0-9._:-]{1,100}$/.test(text)?text:"";}
function mapCalendarEvent(row){return {id:row.id,title:row.title,startAt:row.start_at,endAt:row.end_at,description:row.description,location:row.location,createdAt:row.created_at};}
function getUserSessionSecret(env) {
  return String(env.USER_SESSION_SECRET || env.OWNER_AUTH_TOKEN || "");
}

async function createUserSession(secret, userId) {
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
  const payload = "user." + userId + "." + expiresAt;
  return payload + "." + await hmacHex(secret, payload);
}

async function getAuthenticatedUserId(request, env) {
  const secret = getUserSessionSecret(env);
  if (!secret) return "";
  const session = getCookie(request, "neyqora_user");
  const parts = session.split(".");
  if (parts.length !== 4 || parts[0] !== "user") return "";
  const userId = parts[1];
  const expiresAt = Number(parts[2]);
  if (!/^[A-Za-z0-9._:-]{1,100}$/.test(userId) || !Number.isInteger(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) return "";
  const expected = await hmacHex(secret, parts[0] + "." + parts[1] + "." + parts[2]);
  return parts[3] === expected ? userId : "";
}

async function issueUserSession(env) {
  const secret = getUserSessionSecret(env);
  if (!secret) return null;
  const userId = crypto.randomUUID();
  const session = await createUserSession(secret, userId);
  return { userId, cookie: "neyqora_user=" + encodeURIComponent(session) + "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=2592000" };
}

function getBearerToken(request) {
  const value = request.headers.get("authorization") || "";
  return value.toLowerCase().startsWith("bearer ") ? value.slice(7).trim() : "";
}

function getCookie(request, name) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.split(";").map(part => part.trim()).find(part => part.startsWith(name + "="));
  return match ? decodeURIComponent(match.slice(name.length + 1)) : "";
}

async function hmacHex(secret, value) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(signature)).map(byte => byte.toString(16).padStart(2, "0")).join("");
}

async function createOwnerSession(secret) {
  const expiresAt = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30;
  const payload = "owner." + expiresAt;
  return payload + "." + await hmacHex(secret, payload);
}

async function verifyOwnerSession(request, env) {
  const secret = String(env.OWNER_AUTH_TOKEN || "");
  if (!secret) return false;
  const bearer = getBearerToken(request);
  if (bearer && bearer === secret) return true;
  const session = getCookie(request, "neyqora_owner");
  const parts = session.split(".");
  if (parts.length !== 3 || parts[0] !== "owner") return false;
  const expiresAt = Number(parts[1]);
  if (!Number.isInteger(expiresAt) || expiresAt < Math.floor(Date.now() / 1000)) return false;
  const expected = await hmacHex(secret, parts[0] + "." + parts[1]);
  return parts[2] === expected;
}

function getFileExtension(name) {
  const value = String(name || "").toLowerCase();
  const index = value.lastIndexOf(".");
  return index > -1 ? value.slice(index + 1) : "";
}

function isAnalyzableFile(file) {
  const allowed = new Set(["txt","md","csv","json","js","mjs","ts","tsx","jsx","py","java","c","cpp","h","hpp","css","html","xml","yaml","yml","sql","sh","log"]);
  return allowed.has(getFileExtension(file?.name));
}

function normalizeFileText(content, maxChars = 60000) {
  return String(content || "").replace(/\u0000/g, "").replace(/\r\n/g, "\n").slice(0, maxChars);
}

function shouldRemember(message) {
  const text = String(message || "").toLocaleLowerCase("tr-TR").trim();
  return [
    "hatırla", "unutma", "aklında tut", "benim adım",
    "seviyorum", "sevmiyorum", "tercihim", "tercih ederim",
    "favorim", "bana şöyle"
  ].some(key => text.includes(key));
}

function extractMemory(message) {
  const text = String(message || "").trim();
  const name = text.match(/\bbenim adım\s+([A-Za-zÇĞİÖŞÜçğıöşü]+)\b/i)?.[1];
  if (name) return "Kullanıcının adı: " + name;
  return text;
}

function normalizeMemory(content) {
  return String(content || "").replace(/\s+/g, " ").trim().slice(0, 4000);
}

function memoryCategory(content) {
  const text = String(content || "").toLocaleLowerCase("tr-TR");
  if (text.startsWith("kullanıcının adı:")) return "identity";
  if (/tercih|favori|seviyorum|sevmiyorum/.test(text)) return "preference";
  return "general";
}

function isNameQuestion(message) {
  return /\b(adım ne|benim adım ne|ismim ne|ben kimim)\b/i.test(message);
}

function forgetRequest(message) {
  const t = String(message || "").toLocaleLowerCase("tr-TR").trim();
  if (/\b(tümünü|hepsini|bütününü)\s+(unut|sil)\b/.test(t) || /\b(hafızayı|hafizayi|hafızamdaki|hafizamdaki)\s+(temizle|sil|unut)\b/.test(t)) {
    return { type: "all" };
  }
  if (/\b(adımı|ismimi|ismimle ilgili|adımla ilgili)\s+(unut|sil|temizle)\b/.test(t)) return { type: "name" };
  const direct = t.match(/\b(?:şunu|bunu|şu bilgiyi|bu bilgiyi)\s+(?:unut|sil|temizle)\b[\s:,-]*(.*)$/);
  if (direct) {
    const detail = direct[1].trim();
    return { type: detail ? "text" : "latest", detail };
  }
  const quoted = t.match(/["“”']([^"“”']+)["“”']\s+(?:unut|sil|temizle)\b/);
  if (quoted) return { type: "text", detail: quoted[1].trim() };
  return null;
}

function isProjectRequest(message) {
  const t = String(message || "").toLocaleLowerCase("tr-TR").trim();
  return /\b(proje yap|proje oluştur|proje üret|projesi yap|projesi oluştur|projesi üret|uygulama yap|uygulama oluştur|uygulama üret|program yap|program oluştur|program üret|bir app yap|bir uygulama yap|kodla|inşa et)\b/.test(t)
    || /\b(hesap makinesi|todo|not uygulaması|hava durumu uygulaması)\b.*\b(yap|oluştur|üret|geliştir)\b/.test(t)
    || /\b(yap|oluştur|üret|geliştir)\b.*\b(hesap makinesi|todo|not uygulaması|hava durumu uygulaması)\b/.test(t);
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
      const templateFiles = buildProjectFiles(message);
      const files = templateFiles || await generateProjectFiles(env, message);
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

    if (!result.ok && isRetryableTool(step.tool, result)) {
      const retryStartedAt = Date.now();
      const retry = await executeToolStep(env, step, message);
      retry.durationMs = Date.now() - retryStartedAt;
      retry.retry = true;
      results.push(retry);
      if (!retry.ok && step.action !== "answer") break;
      continue;
    }

    if (!result.ok && step.action !== "answer") {
      break;
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
      { path: "main.py", content: `def calculate(num1, operator, num2):
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
      { path: "test_hesap_makinesi.py", content: `from main import calculate

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
  if (!Array.isArray(files) || files.length < 1 || files.length > 8) return null;
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
    const codeForStaticChecks = code
      .replace(/("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')/g, "")
      .replace(/#[^\n]*/g, "");
    if (/[A-Za-z_][A-Za-z0-9_]*[ÇĞİÖŞÜçğıöşü]/.test(codeForStaticChecks)) {
      errors.push(file.path + ": Python tanımlayıcılarında Türkçe karakter var.");
    }
    const opens = (codeForStaticChecks.match(/[([{]/g) || []).length;
    const closes = (codeForStaticChecks.match(/[)\]}]/g) || []).length;
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

function isBlockedFetchUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl);
    if (!["http:", "https:"].includes(parsed.protocol)) return true;
    const host = parsed.hostname.toLowerCase();
    return host === "localhost" ||
      host === "localhost.localdomain" ||
      host === "metadata.google.internal" ||
      host === "instance-data.ec2.internal" ||
      host === "host.docker.internal" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host === "[::1]" ||
      host === "169.254.169.254" ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);
  } catch {
    return true;
  }
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
    if (isBlockedFetchUrl(clean)) throw new Error("Bu URL güvenlik politikası nedeniyle açılamıyor.");
    const response = await fetch(clean, { headers: { "user-agent": "NEYQORA/1.0" }, signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error("Sayfa açılamadı.");
    const html = await response.text();
    if (html.length > 1_000_000) throw new Error("Sayfa yanıtı çok büyük.");
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
        headers: { "user-agent": "Mozilla/5.0 NEYQORA/1.0", "accept": "application/rss+xml, application/xml, text/xml" },
        signal: AbortSignal.timeout(10000)
      });
      if (!response.ok) continue;

      const xml = await response.text();
      if (xml.length > 1_000_000) continue;
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
      const headers = new Headers({
        "content-type": "text/html; charset=UTF-8",
        "cache-control": "no-store, no-cache, must-revalidate, max-age=0"
      });
      const currentUserId = await getAuthenticatedUserId(request, env);
      if (!currentUserId) {
        const issued = await issueUserSession(env);
        if (issued) headers.set("set-cookie", issued.cookie);
      }
      return new Response(HTML, { headers });
    }

    if (request.method === "GET" && url.pathname === "/api/session") {
      const isOwner = await verifyOwnerSession(request, env);
      if (isOwner) return Response.json({ ok: true, userId: "owner", role: "owner" });
      const userId = await getAuthenticatedUserId(request, env);
      if (!userId) {
        const issued = await issueUserSession(env);
        if (!issued) return Response.json({ ok: false, error: "Kullanıcı oturumu için gizli anahtar yapılandırılmamış." }, { status: 503 });
        return new Response(JSON.stringify({ ok: true, userId: issued.userId, role: "user" }), {
          status: 200,
          headers: {
            "content-type": "application/json; charset=UTF-8",
            "cache-control": "no-store",
            "set-cookie": issued.cookie
          }
        });
      }
      return Response.json({ ok: true, userId, role: "user" });
    }

    if (request.method === "POST" && url.pathname === "/api/auth/owner") {
      try {
        const body = await request.json();
        const token = String(body?.token || "");
        const secret = String(env.OWNER_AUTH_TOKEN || "");
        if (!secret || !token || token !== secret) return Response.json({ ok: false, error: "Owner kimliği doğrulanamadı." }, { status: 401 });
        const session = await createOwnerSession(secret);
        return new Response(JSON.stringify({ ok: true, role: "owner", unlimited: true }), {
          status: 200,
          headers: {
            "content-type": "application/json; charset=UTF-8",
            "cache-control": "no-store",
            "set-cookie": "neyqora_owner=" + encodeURIComponent(session) + "; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000"
          }
        });
      } catch {
        return Response.json({ ok: false, error: "Owner girişi işlenemedi." }, { status: 400 });
      }
    }

    if (request.method === "GET" && url.pathname === "/api/calendar/events") {
      const isOwner=await verifyOwnerSession(request,env); const uid=isOwner?"owner":await getAuthenticatedUserId(request,env); if(!uid)return Response.json({ok:false,error:"Kullanıcı oturumu gerekli."},{status:400}); await ensureProductivityTables(env);
      const rows=await env.DB.prepare("SELECT id,title,start_at,end_at,description,location,created_at FROM calendar_events WHERE user_id=? ORDER BY start_at ASC LIMIT 100").bind(uid).all();
      return Response.json({ok:true,events:(rows.results||[]).map(mapCalendarEvent)});
    }
    if (request.method === "POST" && url.pathname === "/api/calendar/events") {
      const isOwner=await verifyOwnerSession(request,env); const body=await request.json(); const uid=isOwner?"owner":await getAuthenticatedUserId(request,env);
      if(!uid||!body.title||!body.startAt)return Response.json({ok:false,error:"title ve startAt gerekli; kullanıcı oturumu gerekli."},{status:400}); await ensureProductivityTables(env);
      const startAt=String(body.startAt),endAt=String(body.endAt||body.startAt); if(Number.isNaN(Date.parse(startAt))||Number.isNaN(Date.parse(endAt)))return Response.json({ok:false,error:"Geçersiz tarih."},{status:400});
      const result=await env.DB.prepare("INSERT INTO calendar_events (user_id,title,start_at,end_at,description,location) VALUES (?,?,?,?,?,?)").bind(uid,String(body.title).slice(0,300),startAt,endAt,String(body.description||"").slice(0,4000),String(body.location||"").slice(0,500)).run();
      return Response.json({ok:true,event:{id:result.meta.last_row_id,title:String(body.title).slice(0,300),startAt,endAt}});
    }
    if (request.method === "DELETE" && url.pathname === "/api/calendar/events") {
      const isOwner=await verifyOwnerSession(request,env),uid=isOwner?"owner":await getAuthenticatedUserId(request,env),id=Number(url.searchParams.get("id")); if(!uid||!Number.isInteger(id))return Response.json({ok:false,error:"id ve kullanıcı oturumu gerekli."},{status:400}); await ensureProductivityTables(env); await env.DB.prepare("DELETE FROM calendar_events WHERE id=? AND user_id=?").bind(id,uid).run(); return Response.json({ok:true});
    }
    if (request.method === "POST" && url.pathname === "/api/email/drafts") {
      const isOwner=await verifyOwnerSession(request,env),body=await request.json(),uid=isOwner?"owner":await getAuthenticatedUserId(request,env); if(!uid||!body.to||!body.subject||!body.body)return Response.json({ok:false,error:"to, subject ve body gerekli; kullanıcı oturumu gerekli."},{status:400}); await ensureProductivityTables(env);
      const result=await env.DB.prepare("INSERT INTO email_drafts (user_id,to_address,subject,body,status) VALUES (?,?,?,?,?)").bind(uid,String(body.to).slice(0,500),String(body.subject).slice(0,500),String(body.body).slice(0,20000),"draft").run(); return Response.json({ok:true,draft:{id:result.meta.last_row_id,to:String(body.to),subject:String(body.subject),status:"draft"}});
    }
    if (request.method === "GET" && url.pathname === "/api/email/drafts") {
      const isOwner=await verifyOwnerSession(request,env),uid=isOwner?"owner":normalizeUserId(url.searchParams.get("userId")); if(!uid)return Response.json({ok:false,error:"userId gerekli."},{status:400}); await ensureProductivityTables(env); const rows=await env.DB.prepare("SELECT id,to_address,subject,body,status,created_at FROM email_drafts WHERE user_id=? ORDER BY created_at DESC LIMIT 100").bind(uid).all(); return Response.json({ok:true,drafts:rows.results||[]});
    }
    if (request.method === "POST" && url.pathname === "/api/automations") {
      const isOwner=await verifyOwnerSession(request,env),body=await request.json(),uid=isOwner?"owner":normalizeUserId(body.userId),runAt=String(body.runAt||""); if(!uid||!body.title||!body.prompt||Number.isNaN(Date.parse(runAt)))return Response.json({ok:false,error:"title, prompt ve geçerli runAt gerekli; kullanıcı oturumu gerekli."},{status:400}); await ensureProductivityTables(env);
      const result=await env.DB.prepare("INSERT INTO automations (user_id,title,prompt,run_at,status) VALUES (?,?,?,?,?)").bind(uid,String(body.title).slice(0,300),String(body.prompt).slice(0,8000),new Date(runAt).toISOString(),"pending").run(); return Response.json({ok:true,automation:{id:result.meta.last_row_id,title:String(body.title).slice(0,300),runAt:new Date(runAt).toISOString(),status:"pending"}});
    }
    if (request.method === "GET" && url.pathname === "/api/automations") {
      const isOwner=await verifyOwnerSession(request,env),uid=isOwner?"owner":normalizeUserId(url.searchParams.get("userId")); if(!uid)return Response.json({ok:false,error:"userId gerekli."},{status:400}); await ensureProductivityTables(env); const rows=await env.DB.prepare("SELECT id,title,prompt,run_at,status,last_error,created_at FROM automations WHERE user_id=? ORDER BY run_at ASC LIMIT 100").bind(uid).all(); return Response.json({ok:true,automations:rows.results||[]});
    }
    if (request.method === "DELETE" && url.pathname === "/api/automations") {
      const isOwner=await verifyOwnerSession(request,env),uid=isOwner?"owner":normalizeUserId(url.searchParams.get("userId")),id=Number(url.searchParams.get("id")); if(!uid||!Number.isInteger(id))return Response.json({ok:false,error:"userId ve id gerekli."},{status:400}); await ensureProductivityTables(env); await env.DB.prepare("DELETE FROM automations WHERE id=? AND user_id=?").bind(id,uid).run(); return Response.json({ok:true});
    }
    if (request.method === "GET" && url.pathname === "/api/health") {
      return Response.json({
        ok: true,
        name: "NEYQORA",
        version: VERSION,
        model: MODEL,
        memory: !!env.DB,
        router: true,
        agent: true,
        tools: ["calculator", "weather", "web", "coding", "project", "calendar", "email", "automation"],
        web: true,
        ownerAuth: !!env.OWNER_AUTH_TOKEN
      });
    }

    if (request.method === "POST" && url.pathname === "/api/audio/transcribe") {
      try {
        const isOwner = await verifyOwnerSession(request, env);
        const contentLength = Number(request.headers.get("content-length") || "0");
        const maxBytes = isOwner ? 15_000_000 : 10_000_000;
        if (!contentLength || contentLength > maxBytes) return Response.json({ ok: false, error: "Ses dosyası 10 MB ile sınırlıdır." }, { status: 413 });
        const form = await request.formData();
        const file = form.get("file");
        if (!(file instanceof File)) return Response.json({ ok: false, error: "Ses dosyası gerekli." }, { status: 400 });
        if (file.size > maxBytes) return Response.json({ ok: false, error: "Ses dosyası çok büyük." }, { status: 413 });
        const allowed = new Set(["audio/wav","audio/x-wav","audio/mpeg","audio/mp3","audio/mp4","audio/x-m4a","audio/ogg","audio/webm"]);
        if (file.type && !allowed.has(file.type.toLowerCase())) return Response.json({ ok: false, error: "Desteklenmeyen ses formatı." }, { status: 415 });
        const audio = Array.from(new Uint8Array(await file.arrayBuffer()));
        const result = await env.AI.run(AUDIO_MODEL, { audio });
        const text = String(result?.text || result?.response || "").trim();
        if (!text) return Response.json({ ok: false, error: "Ses çözümlenemedi." }, { status: 422 });
        return Response.json({ ok: true, model: AUDIO_MODEL, file: file.name, text });
      } catch (error) {
        return Response.json({ ok: false, error: error?.message || "Ses analizi başarısız." }, { status: 500 });
      }
    }

    if (request.method === "POST" && url.pathname === "/api/image/analyze") {
      try {
        const isOwner = await verifyOwnerSession(request, env);
        const contentLength = Number(request.headers.get("content-length") || "0");
        const maxBytes = isOwner ? 12_000_000 : 8_000_000;
        if (!contentLength || contentLength > maxBytes) return Response.json({ ok: false, error: "Görsel 8 MB ile sınırlıdır." }, { status: 413 });
        const form = await request.formData();
        const file = form.get("file");
        if (!(file instanceof File)) return Response.json({ ok: false, error: "Görsel dosyası gerekli." }, { status: 400 });
        if (file.size > maxBytes) return Response.json({ ok: false, error: "Görsel çok büyük." }, { status: 413 });
        const allowed = new Set(["image/png","image/jpeg","image/webp","image/gif"]);
        if (!allowed.has(String(file.type || "").toLowerCase())) return Response.json({ ok: false, error: "Desteklenmeyen görsel formatı." }, { status: 415 });
        const bytes = new Uint8Array(await file.arrayBuffer());
        let binary = "";
        const chunk = 0x8000;
        for (let i = 0; i < bytes.length; i += chunk) binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
        const dataUrl = "data:" + file.type + ";base64," + btoa(binary);
        const result = await env.AI.run(VISION_MODEL, {
          messages: [{
            role: "user",
            content: [
              { type: "text", text: "Bu görseli Türkçe analiz et. Önce kısa bir betimleme, sonra görülen önemli unsurlar, okunabilen metinler ve dikkat çeken noktaları belirt. Görselde olmayan bilgiyi uydurma." },
              { type: "image_url", image_url: { url: dataUrl } }
            ]
          }],
          max_tokens: 1024,
          temperature: 0.2
        });
        const analysis = result?.response || result?.choices?.[0]?.message?.content || "";
        if (!analysis) return Response.json({ ok: false, error: "Görsel analiz edilemedi." }, { status: 422 });
        return Response.json({ ok: true, model: VISION_MODEL, file: file.name, analysis });
      } catch (error) {
        return Response.json({ ok: false, error: error?.message || "Görsel analizi başarısız." }, { status: 500 });
      }
    }

    if (request.method === "POST" && url.pathname === "/api/files/analyze") {
      try {
        const isOwner = await verifyOwnerSession(request, env);
        const contentLength = Number(request.headers.get("content-length") || "0");
        if (!isOwner && contentLength > 4_000_000) return Response.json({ ok: false, error: "Dosya yükleme toplamı 4 MB ile sınırlıdır." }, { status: 413 });
        const form = await request.formData();
        const files = form.getAll("files").filter(value => value instanceof File);
        if (!files.length) return Response.json({ ok: false, error: "En az bir dosya yükleyin." }, { status: 400 });
        if (files.length > 5) return Response.json({ ok: false, error: "En fazla 5 dosya analiz edilebilir." }, { status: 400 });
        const maxFileBytes = isOwner ? 2_000_000 : 1_000_000;
        let totalBytes = 0;
        const documents = [];
        for (const file of files) {
          if (!isAnalyzableFile(file)) return Response.json({ ok: false, error: "Desteklenmeyen dosya türü: " + file.name }, { status: 415 });
          if (file.size > maxFileBytes) return Response.json({ ok: false, error: file.name + " dosyası çok büyük." }, { status: 413 });
          totalBytes += file.size;
          if (!isOwner && totalBytes > 4_000_000) return Response.json({ ok: false, error: "Toplam dosya boyutu 4 MB'ı aşamaz." }, { status: 413 });
          documents.push({ name: String(file.name || "dosya"), type: file.type || "text/plain", size: file.size, content: normalizeFileText(await file.text()) });
        }
        const source = documents.map((file, index) => "DOSYA " + (index + 1) + ": " + file.name + "\nBoyut: " + file.size + " byte\nİçerik:\n" + file.content).join("\n\n---\n\n");
        const prompt = "Aşağıdaki kullanıcı dosyalarını analiz et. Türkçe yanıt ver. Her dosya için kısa özet, önemli bulgular, varsa hata/güvenlik riski ve uygulanabilir önerileri belirt. Kod dosyalarında sözdizimi veya bariz mantık sorunlarını yalnızca metinden doğrulanabildiği ölçüde belirt; çalıştırmadığın kodu çalıştırmış gibi gösterme. Dosyada olmayan bilgiyi uydurma.\n\n" + source;
        const result = await env.AI.run(MODEL, { messages: [{ role: "system", content: "Sen güvenilir bir dosya analiz asistanısın. Yalnızca verilen dosya içeriğine dayan." }, { role: "user", content: prompt }], max_tokens: 2048, temperature: 0.2 });
        const analysis = result?.response || result?.choices?.[0]?.message?.content || "Dosya analizi üretilemedi.";
        return Response.json({ ok: true, files: documents.map(file => ({ name: file.name, type: file.type, size: file.size, characters: file.content.length })), analysis });
      } catch (error) {
        return Response.json({ ok: false, error: error?.message || "Dosya analizi başarısız." }, { status: 500 });
      }
    }

    if (request.method === "GET" && url.pathname === "/api/memory") {
      try {
        const isOwner = await verifyOwnerSession(request, env);
        if (!env.DB) return Response.json({ ok: false, error: "Hafıza veritabanı bağlı değil." }, { status: 503 });
        const userId = isOwner ? "owner" : await getAuthenticatedUserId(request, env);
        if (!userId || userId.length > 100 || !/^[A-Za-z0-9._:-]+$/.test(userId)) {
          return Response.json({ ok: false, error: "Geçerli kullanıcı oturumu gerekli." }, { status: 400 });
        }
        const limit = Math.min(Math.max(Number(url.searchParams.get("limit") || "20"), 1), 50);
        const result = await env.DB.prepare(
          "SELECT id, content, created_at FROM memories WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT ?"
        ).bind(userId, limit).all();
        return Response.json({ ok: true, userId, memories: result.results || [] });
      } catch (error) {
        return Response.json({ ok: false, error: error?.message || "Hafıza okunamadı." }, { status: 500 });
      }
    }

    if (request.method === "DELETE" && url.pathname === "/api/memory") {
      try {
        const isOwner = await verifyOwnerSession(request, env);
        if (!env.DB) return Response.json({ ok: false, error: "Hafıza veritabanı bağlı değil." }, { status: 503 });
        const requestedUserId = String(url.searchParams.get("userId") || "").trim();
        const userId = isOwner ? "owner" : requestedUserId;
        if (!userId || userId.length > 100 || !/^[A-Za-z0-9._:-]+$/.test(userId)) {
          return Response.json({ ok: false, error: "Geçerli userId gerekli." }, { status: 400 });
        }
        if (url.searchParams.get("all") === "1") {
          const result = await env.DB.prepare("DELETE FROM memories WHERE user_id = ?").bind(userId).run();
          return Response.json({ ok: true, deletedCount: Number(result.meta?.changes || 0) });
        }
        const id = Number(url.searchParams.get("id") || "0");
        if (!Number.isInteger(id) || id < 1) {
          return Response.json({ ok: false, error: "Geçerli memory id gerekli." }, { status: 400 });
        }
        const result = await env.DB.prepare(
          "DELETE FROM memories WHERE user_id = ? AND id = ?"
        ).bind(userId, id).run();
        return Response.json({ ok: true, deleted: Number(result.meta?.changes || 0) > 0 });
      } catch (error) {
        return Response.json({ ok: false, error: error?.message || "Hafıza silinemedi." }, { status: 500 });
      }
    }

    if (request.method === "GET" && url.pathname === "/api/project/ci") {
      const issueNumber = Number(url.searchParams.get("issue") || "0");
      if (!Number.isInteger(issueNumber) || issueNumber < 1) {
        return Response.json({ ok: false, error: "issue parametresi gerekli." }, { status: 400 });
      }
      try {
        const response = await fetch(
          "https://api.github.com/repos/perdeson359-design/neyqora/issues/" + issueNumber + "/comments",
          { headers: { "accept": "application/vnd.github+json", "user-agent": "NEYQORA" } }
        );
        if (!response.ok) {
          return Response.json({ ok: false, status: "pending", tested: false, error: "GitHub CI sonucu henüz okunamadı." }, { status: 502 });
        }
        const comments = await response.json();
        const marker = comments
          .slice()
          .reverse()
          .map(item => String(item?.body || ""))
          .find(body => body.includes("NEYQORA_CI_RESULT"));
        if (!marker) {
          return Response.json({ ok: true, status: "pending", tested: false, issue: issueNumber });
        }
        const match = marker.match(/NEYQORA_CI_RESULT\s+({[^\n]+\})/);
        if (!match) {
          return Response.json({ ok: true, status: "pending", tested: false, issue: issueNumber });
        }
        const result = JSON.parse(match[1]);
        return Response.json({
          ok: true,
          status: result.status === "passed" ? "passed" : "failed",
          tested: true,
          issue: issueNumber,
          runId: result.run_id || null,
          sha: result.sha || null,
          firstTest: result.first_test || null,
          finalGate: result.final_gate || null
        });
      } catch (error) {
        return Response.json({ ok: false, status: "pending", tested: false, error: error?.message || "CI sonucu okunamadı." }, { status: 502 });
      }
    }

    if (request.method === "POST" && url.pathname === "/api/project") {
      try {
        const isOwner = await verifyOwnerSession(request, env);
        const contentLength = Number(request.headers.get("content-length") || "0");
        if (!isOwner && contentLength > 256000) return Response.json({ error: "İstek gövdesi çok büyük." }, { status: 413 });
        const body = await request.json();
        const requestText = String(body?.request || "").trim();
        if (!requestText) return Response.json({ error: "request gerekli." }, { status: 400 });
        if (!isOwner && requestText.length > 12000) return Response.json({ error: "request çok uzun." }, { status: 413 });
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
          ci: {
            status: "pending",
            tested: false,
            reason: "Gerçek proje testi GitHub Actions workflow'u tarafından yapılır."
          },
          note: "NEYQORA proje dosyalarını üretti. GitHub'a yazma işlemi GitHub Actions workflow'u üzerinden yapılır."
        });
      } catch (error) {
        return Response.json({ ok: false, error: error?.message || "Proje oluşturulamadı." }, { status: 500 });
      }
    }

    if (request.method === "GET" && url.pathname === "/api/search") {
      const q = (url.searchParams.get("q") || "").trim();
      const isOwner = await verifyOwnerSession(request, env);
      if (!q) return Response.json({ error: "q parametresi gerekli." }, { status: 400 });
      if (!isOwner && q.length > 1000) return Response.json({ error: "Arama sorgusu çok uzun." }, { status: 413 });
      try {
        const results = await webSearch(q);
        return Response.json({ ok: true, query: q, results });
      } catch (error) {
        return Response.json({ ok: false, error: error?.message || "Arama başarısız." }, { status: 502 });
      }
    }

    if (request.method === "POST" && url.pathname === "/api/chat") {
      try {
        const isOwner = await verifyOwnerSession(request, env);
        const contentLength = Number(request.headers.get("content-length") || "0");
        if (!isOwner && contentLength > 256000) return Response.json({ error: "İstek gövdesi çok büyük." }, { status: 413 });
        const body = await request.json();
        const message = String(body?.message || "").trim();
        const userId = isOwner ? "owner" : await getAuthenticatedUserId(request, env);
        const rawHistory = Array.isArray(body?.history) ? body.history : [];
        const history = rawHistory
          .filter(item => item && (item.role === "user" || item.role === "assistant"))
          .map(item => ({ role: item.role, content: String(item.content || "").slice(0, isOwner ? 20000 : 4000) }))
          .slice(isOwner ? -100 : -10);
        const historyChars = history.reduce((sum, item) => sum + item.content.length, 0);
        if (!message) return Response.json({ error: "Mesaj boş." }, { status: 400 });
        if (!isOwner && message.length > 8000) return Response.json({ error: "Mesaj çok uzun." }, { status: 413 });
        if (!isOwner && (!userId || userId.length > 100 || !/^[A-Za-z0-9._:-]+$/.test(userId))) {
          return Response.json({ error: "Kullanıcı kimliği geçersiz." }, { status: 400 });
        }
        if (!isOwner && historyChars > 20000) return Response.json({ error: "Konuşma geçmişi çok uzun." }, { status: 413 });

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
            if (forget.type === "all") {
              await env.DB.prepare("DELETE FROM memories WHERE user_id = ?").bind(userId).run();
              return Response.json({ reply: "Kayıtlı hafızadaki bilgileri temizledim.", intent: "memory", memoryCleared: true });
            }
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
            testable: files.some(file => /^test_.*\.py$/i.test(file.path)),
            agentStatus,
            audit: agentAudit,
            trace: agentTrace,
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

        let memorySaved = false;
        if (env.DB && shouldRemember(message)) {
          const memory = normalizeMemory(extractMemory(message));
          if (memory) {
            const category = memoryCategory(memory);
            if (category === "identity") {
              await env.DB.prepare("DELETE FROM memories WHERE user_id = ? AND content LIKE 'Kullanıcının adı:%'").bind(userId).run();
            } else {
              await env.DB.prepare("DELETE FROM memories WHERE user_id = ? AND content = ?").bind(userId, memory).run();
            }
            await env.DB.prepare(
              "INSERT INTO memories (user_id, content) VALUES (?, ?)"
            ).bind(userId, memory).run();
            await env.DB.prepare(
              "DELETE FROM memories WHERE user_id = ? AND id IN (SELECT id FROM memories WHERE user_id = ? ORDER BY created_at DESC, id DESC LIMIT -1 OFFSET 50)"
            ).bind(userId, userId).run();
            memorySaved = true;
          }
        }

        return Response.json({
          reply,
          intent,
          plan: agentPlan,
          toolResults: agentResults,
          audit: agentAudit,
          trace: agentTrace,
          agentStatus,
          memorySaved
        });
      } catch (error) {
        return Response.json({ error: "NEYQORA hatası: " + (error?.message || "Bilinmeyen hata") }, { status: 500 });
      }
    }

    return new Response("NEYQORA", { status: 404 });
  },
  async scheduled(controller, env) {
    try {
      await runDueAutomations(env);
    } catch (error) {
      console.error("NEYQORA automation scheduler error:", error?.message || error);
    }
  }
};

async function runDueAutomations(env){
  if(!env.DB)return; await ensureProductivityTables(env); const now=new Date().toISOString();
  const rows=await env.DB.prepare("SELECT id,user_id,title,prompt FROM automations WHERE status='pending' AND run_at<=? ORDER BY run_at ASC LIMIT 20").bind(now).all();
  for(const row of rows.results||[]){try{if(!env.AUTOMATION_WEBHOOK_URL)throw new Error("AUTOMATION_WEBHOOK_URL yapılandırılmamış."); const r=await fetch(env.AUTOMATION_WEBHOOK_URL,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({id:row.id,userId:row.user_id,title:row.title,prompt:row.prompt}),signal:AbortSignal.timeout(10000)});if(!r.ok)throw new Error("Automation webhook "+r.status);await env.DB.prepare("UPDATE automations SET status='completed',last_error='' WHERE id=?").bind(row.id).run();}catch(error){await env.DB.prepare("UPDATE automations SET status='failed',last_error=? WHERE id=?").bind(String(error?.message||"unknown").slice(0,1000),row.id).run();}}
}
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
  validateGeneratedProject,
  executeToolStep,
  getBearerToken,
  getCookie,
  getFileExtension,
  isAnalyzableFile,
  normalizeFileText
};
