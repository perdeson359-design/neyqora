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
<header><h1>NEYQORA</h1><p>Kişisel yapay zekâ asistanın</p></header>
<div id="chat"><div class="msg ai">Merhaba. Ben NEYQORA. Nasıl yardımcı olabilirim?</div></div>
<form id="form"><input id="input" placeholder="NEYQORA'ya bir şey sor..." autocomplete="off"><button>Gönder</button></form>
</div>
<script>
const chat=document.querySelector("#chat"),form=document.querySelector("#form"),input=document.querySelector("#input");
let userId=localStorage.getItem("neyqora_user_id");
if(!userId){userId=crypto.randomUUID();localStorage.setItem("neyqora_user_id",userId);}
function add(text,cls){const el=document.createElement("div");el.className="msg "+cls;el.textContent=text;chat.appendChild(el);el.scrollIntoView({behavior:"smooth",block:"end"});return el}
form.addEventListener("submit",async e=>{
 e.preventDefault();const message=input.value.trim();if(!message)return;
 add(message,"user");input.value="";const pending=add("NEYQORA düşünüyor...","ai");
 try{
  const r=await fetch("/api/chat",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({message,userId})});
  const data=await r.json();pending.textContent=data.reply||data.error||"Yanıt alınamadı.";
 }catch(err){pending.textContent="Bağlantı hatası. Lütfen tekrar dene."}
});
</script>
</body>
</html>`;

function shouldRemember(message) {
  const text = message.toLocaleLowerCase("tr-TR");
  return [
    "hatırla", "unutma", "aklında tut", "benim adım", "ben ",
    "seviyorum", "sevmiyorum", "tercihim", "tercih ederim",
    "favorim", "bana ... de", "bana şöyle"
  ].some(key => text.includes(key.replace("...", "")));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/") {
      return new Response(HTML, {headers: {"content-type": "text/html; charset=UTF-8"}});
    }

    if (request.method === "GET" && url.pathname === "/api/health") {
      return Response.json({ ok: true, name: "NEYQORA", model: MODEL, memory: !!env.DB });
    }

    if (request.method === "POST" && url.pathname === "/api/chat") {
      try {
        const body = await request.json();
        const message = String(body?.message || "").trim();
        const userId = String(body?.userId || "").trim();
        if (!message) return Response.json({ error: "Mesaj boş." }, { status: 400 });
        if (!userId || userId.length > 100) return Response.json({ error: "Kullanıcı kimliği eksik." }, { status: 400 });

        let memories = [];
        if (env.DB) {
          const result = await env.DB.prepare(
            "SELECT content, created_at FROM memories WHERE user_id = ? ORDER BY created_at DESC LIMIT 12"
          ).bind(userId).all();
          memories = result.results || [];
        }

        const memoryText = memories.length
          ? "\n\nKullanıcı hakkında daha önce kaydedilmiş bilgiler:\n" +
            memories.reverse().map(m => "- " + m.content).join("\n")
          : "";

        const result = await env.AI.run(MODEL, {
          messages: [
            { role: "system", content: "Sen NEYQORA'sın. Türkçe konuşan, güvenilir ve yardımcı bir yapay zekâ asistanısın. Bilmediğin şeyi uydurma. Kod istenirse temiz ve çalışabilir kod üret. Aşağıdaki hafıza bilgilerini yalnızca uygun olduğunda kullan." + memoryText },
            { role: "user", content: message }
          ]
        });

        const reply = result?.response || result?.choices?.[0]?.message?.content || "Yanıt üretilemedi.";

        if (env.DB && shouldRemember(message)) {
          await env.DB.prepare(
            "INSERT INTO memories (user_id, content) VALUES (?, ?)"
          ).bind(userId, message).run();
        }

        return Response.json({ reply, memorySaved: !!(env.DB && shouldRemember(message)) });
      } catch (error) {
        return Response.json({ error: "NEYQORA AI hatası: " + (error?.message || "Bilinmeyen hata") }, { status: 500 });
      }
    }

    return new Response("NEYQORA", { status: 404 });
  }
};