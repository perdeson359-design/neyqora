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
<header><h1>NEYQORA</h1><p>Kişisel yapay zekâ asistanın · V3.1</p></header>
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
    "favorim", "bana şöyle"
  ].some(key => text.includes(key));
}

function extractMemory(message) {
  const name = message.match(/\\bbenim adım\\s+([A-Za-zÇĞİÖŞÜçğıöşü]+)\\b/i)?.[1];
  if (name) return "Kullanıcının adı: " + name;
  return message;
}

function isNameQuestion(message) {
  return /\\b(adım ne|benim adım ne|ismim ne|ben kimim)\\b/i.test(message);
}

function routeMessage(message) {
  const t = message.toLocaleLowerCase("tr-TR");
  if (/^https?:\/\//i.test(t) || t.includes("internetten") || t.includes("web'den") || t.includes("araştır") || t.includes("güncel") || t.includes("son durum") || t.includes("haberler")) return "web_search";
  if (/\\d/.test(t) && /kaç|hesapla|hesap|topla|çıkar|çarp|böl/.test(t)) return "calculator";
  if (t.includes("hava") || t.includes("sıcaklık") || t.includes("yağmur") || t.includes("hava durumu")) return "weather";
  if (t.includes("kod") || t.includes("javascript") || t.includes("python") || t.includes("bug") || t.includes("hata veriyor") || t.includes("program")) return "coding";
  return "chat";
}

function safeCalculate(message) {
  const match = message.replace(/,/g, ".").match(/[0-9()+\-*/.^%\s]+/);
  if (!match) return null;
  const expr = match[0].trim();
  if (!expr || !/^[0-9()+\-*/.^%\s]+$/.test(expr) || expr.length > 100) return null;
  try {
    const jsExpr = expr.replace(/\^/g, "**");
    const value = Function('"use strict"; return (' + jsExpr + ')')();
    return Number.isFinite(value) ? String(value) : null;
  } catch { return null; }
}

function decodeHtml(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)));
}

async function webSearch(query) {
  const clean = query.trim();
  const searchQuery = clean
    .replace(/\\b(bugün|güncel|son durum|haberleri|haberler|araştır|araştırır mısın|araştırabilir misin)\\b/gi, " ")
    .replace(/\\s+/g, " ")
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
      return new Response(HTML, {headers: {"content-type": "text/html; charset=UTF-8"}});
    }

    if (request.method === "GET" && url.pathname === "/api/health") {
      return Response.json({ ok: true, name: "NEYQORA", version: "3.1", model: MODEL, memory: !!env.DB, router: true, web: true });
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
        if (!message) return Response.json({ error: "Mesaj boş." }, { status: 400 });
        if (!userId || userId.length > 100) return Response.json({ error: "Kullanıcı kimliği eksik." }, { status: 400 });

        const intent = routeMessage(message);

        if (intent === "calculator") {
          const value = safeCalculate(message);
          if (value !== null) return Response.json({ reply: "Sonuç: " + value, intent });
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

        const memoryText = memories.length
          ? "\n\nKullanıcı hakkında daha önce kaydedilmiş bilgiler:\n" +
            memories.reverse().map(m => "- " + m.content).join("\n")
          : "";

        if (intent === "web_search") {
          try {
            const results = await webSearch(message);
            if (!results.length) {
              return Response.json({
                reply: "Güncel web aramasında sonuç bulunamadı.",
                intent,
                sources: []
              });
            }

            const reply = "Güncel web araştırması sonuçları:\n\n" +
              results.map((r, i) =>
                (i + 1) + ". " + r.title +
                (r.pubDate ? "\n   Tarih: " + r.pubDate : "") +
                "\n   Kaynak: " + r.link
              ).join("\n\n") +
              "\n\nNot: Bu sonuçlar doğrudan web aramasından alındı; NEYQORA bunları haber diye uydurmadı.";

            return Response.json({ reply, intent, sources: results });
          } catch (error) {
            return Response.json({
              reply: "Web araştırması şu anda kullanılamadı: " + (error?.message || "Bilinmeyen hata"),
              intent,
              sources: []
            });
          }
        }

        let researchText = "";
        if (intent === "weather") {
          researchText = "\n\nKullanıcı hava durumu soruyor. Güncel veri sağlayan bir hava aracı henüz bağlı değil; güncel sıcaklık veya tahmin uydurma.";
        }

        const system = "Sen NEYQORA'sın. Türkçe konuşan, güvenilir ve yardımcı bir yapay zekâ asistanısın. Bilmediğin şeyi uydurma. Kod istenirse temiz ve çalışabilir kod üret. Güncel veri gerektiren sorularda veri yoksa açıkça söyle. İstek türü: " + intent + "." + memoryText + researchText;

        const result = await env.AI.run(MODEL, {
          messages: [
            { role: "system", content: system },
            { role: "user", content: message }
          ]
        });

        const reply = result?.response || result?.choices?.[0]?.message?.content || "Yanıt üretilemedi.";

        if (env.DB && shouldRemember(message)) {
          const memory = extractMemory(message);
          await env.DB.prepare(
            "INSERT INTO memories (user_id, content) VALUES (?, ?)"
          ).bind(userId, memory).run();
        }

        return Response.json({ reply, intent, memorySaved: !!(env.DB && shouldRemember(message)) });
      } catch (error) {
        return Response.json({ error: "NEYQORA hatası: " + (error?.message || "Bilinmeyen hata") }, { status: 500 });
      }
    }

    return new Response("NEYQORA", { status: 404 });
  }
};