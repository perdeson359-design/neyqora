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
<header><h1>NEYQORA</h1><p>Kişisel yapay zekâ asistanın · V4</p></header>
<div id="chat"><div class="msg ai">Merhaba. Ben NEYQORA. Nasıl yardımcı olabilirim?</div></div><div id="project-panel" hidden style="padding:0 16px 110px"><div class="msg ai" id="project-title">Proje sonucu</div><button id="copy-project" type="button" style="width:100%;height:44px;margin:6px 0 10px;border-radius:12px;border:0;background:#fff;color:#0a0e18;font-weight:700">Kodu Kopyala</button><button id="send-project" type="button" style="width:100%;height:44px;margin:0 0 10px;border-radius:12px;border:0;background:#27385f;color:#fff;font-weight:700">GitHub'da Proje Görevi Oluştur</button><pre id="project-files" style="white-space:pre-wrap;overflow:auto;background:#0b1020;padding:12px;border-radius:12px;color:#dbe4ff"></pre></div>
<form id="form"><input id="input" placeholder="NEYQORA'ya bir şey sor..." autocomplete="off"><button>Gönder</button></form>
</div>
<script>
const chat=document.querySelector("#chat"),form=document.querySelector("#form"),input=document.querySelector("#input");
let userId=localStorage.getItem("neyqora_user_id");
if(!userId){userId=crypto.randomUUID();localStorage.setItem("neyqora_user_id",userId);}
let conversation=[];
function add(text,cls){const el=document.createElement("div");el.className="msg "+cls;el.textContent=text;chat.appendChild(el);el.scrollIntoView({behavior:"smooth",block:"end"});return el}
function rememberTurn(role,content){conversation.push({role,content:String(content||"")});if(conversation.length>10)conversation=conversation.slice(-10);}
document.querySelector("#send-project").addEventListener("click",()=>{const title=document.querySelector("#project-title").textContent;const body="NEYQORA tarafından oluşturulan proje görevi.\n\n"+document.querySelector("#project-files").textContent;const url="https://github.com/perdeson359-design/neyqora/issues/new?title="+encodeURIComponent(title)+"&body="+encodeURIComponent(body)+"&labels="+encodeURIComponent("neyqora-project");window.open(url,"_blank");});document.querySelector("#copy-project").addEventListener("click",async()=>{const text=document.querySelector("#project-files").textContent;if(!text)return;try{await navigator.clipboard.writeText(text);document.querySelector("#copy-project").textContent="Kopyalandı ✓";setTimeout(()=>document.querySelector("#copy-project").textContent="Kodu Kopyala",1500);}catch{document.querySelector("#copy-project").textContent="Kopyalanamadı";}});form.addEventListener("submit",async e=>{
 e.preventDefault();const message=input.value.trim();if(!message)return;
 add(message,"user");rememberTurn("user",message);input.value="";const pending=add("NEYQORA düşünüyor...","ai");
 try{
  const r=await fetch("/api/chat",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({message,userId,history:conversation.slice(-10)})});
  const data=await r.json();pending.textContent=data.reply||data.error||"Yanıt alınamadı.";if(data.reply)rememberTurn("assistant",data.reply); if(data.intent==="project" && data.files){const panel=document.querySelector("#project-panel");const title=document.querySelector("#project-title");const files=document.querySelector("#project-files");title.textContent="Proje: "+(data.project||"NEYQORA projesi")+" · "+data.files.length+" dosya";files.textContent=data.files.map(f=>"--- "+f.path+" ---\n"+f.content).join("\n\n");panel.hidden=false;panel.scrollIntoView({behavior:"smooth",block:"end"});}
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
      return new Response(HTML, {headers: {"content-type": "text/html; charset=UTF-8"}});
    }

    if (request.method === "GET" && url.pathname === "/api/health") {
      return Response.json({ ok: true, name: "NEYQORA", version: "4.0", model: MODEL, memory: !!env.DB, router: true, web: true });
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

        const intent = routeMessage(message);

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

        const memoryText = (intent === "coding" || intent === "project") ? "" : (memories.length
          ? "\n\nKullanıcı hakkında daha önce kaydedilmiş bilgiler:\n" +
            memories.slice(0, 8).map(m => "- " + m.content).join("\n")
          : "");

        const contextText = history.length
          ? "\n\nBu konuşmadaki son mesajlar:\n" +
            history.map(item => (item.role === "user" ? "Kullanıcı: " : "NEYQORA: ") + item.content).join("\n")
          : "";

        if (intent === "project") {
          try {
            const files = await generateProjectFiles(env, message);
            if (!files) {
              return Response.json({
                reply: "Projeyi güvenli biçimde üretemedim. İsteği biraz daha açık tarif et.",
                intent,
                project: null
              });
            }
            const project = sanitizeProjectName(message);
            return Response.json({
              reply: "Proje taslağını oluşturdum: " + project + ". " + files.length + " dosya hazır. GitHub'a kaydetmek için GitHub Actions proje workflow'u kullanılabilir.",
              intent,
              project,
              files,
              testable: files.some(file => /^test_.*\\.py$/i.test(file.path))
            });
          } catch (error) {
            return Response.json({
              reply: "Proje oluşturulurken hata oluştu: " + (error?.message || "Bilinmeyen hata"),
              intent,
              project: null
            });
          }
        }

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
          const weatherMatch =
            message.match(/\b([A-Za-zÇĞİÖŞÜçğıöşü]+)\s+(?:hava(?: durumu)?|sıcaklık|yağmur)\b/i) ||
            message.match(/\b(?:hava(?: durumu)?|sıcaklık|yağmur)\s+(?:nasıl|kaç|durumu)?\s*([A-Za-zÇĞİÖŞÜçğıöşü]+)\b/i);
          const city = weatherMatch?.[1] || "Ankara";
          try {
            const weather = await getWeather(city);
            if (!weather.ok) {
              return Response.json({ reply: weather.error, intent: "weather" });
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
          } catch (error) {
            return Response.json({
              reply: "Güncel hava verisi alınamadı: " + (error?.message || "Bilinmeyen hata"),
              intent: "weather"
            }, { status: 502 });
          }
        }

        const codingInstructions = intent === "coding" ? " KODLAMA GÖREVİ. Sadece kullanıcının istediği programı üret. Hesap makinesi istenirse yalnızca toplama, çıkarma, çarpma ve bölme özelliklerini ekle; başka özellik ekleme. Geçerli Python 3.10+ sözdizimi kullan. eval kullanma. Fonksiyon ve değişken adlarında Türkçe karakter kullanma; yalnızca ASCII İngilizce adlar kullan. Python kodunu göndermeden önce zihinsel bir derleme kontrolü yap: tüm çağrılan metotlar tanımlı mı, parantez ve girintiler doğru mu, menü seçenekleri ile dallar eşleşiyor mu, değişkenler tanımlı mı, program akışı tamam mı. Özellikle çıkarma için subtraction, çarpma için multiplication, bölme için division gibi tutarlı adlar kullan; outirma gibi uydurma isimler ASLA kullanma. Tanımsız fonksiyon, yanlış menü seçeneği, alakasız işlem, sahte test veya uydurma özellik bırakma. Kod bloğunu eksiksiz kapat. Cevap formatı: 1) kısa açıklama, 2) tek bir eksiksiz kod bloğu, 3) 4 temel işlem için kısa testler. Kod çalıştırmadıysan çalıştırmış gibi davranma." : "";
        const system = "Sen NEYQORA'sın. Türkçe konuşan, güvenilir ve yardımcı bir yapay zekâ asistanısın. Bilmediğin şeyi uydurma. Kullanıcının açık isteğine sadık kal; istenmeyen kişisel bilgi, özellik veya konu ekleme. Güncel veri gerektiren sorularda veri yoksa açıkça söyle. İstek türü: " + intent + "." + codingInstructions + memoryText + contextText + researchText;

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

        return Response.json({ reply, intent, memorySaved: !!(env.DB && shouldRemember(message)) });
      } catch (error) {
        return Response.json({ error: "NEYQORA hatası: " + (error?.message || "Bilinmeyen hata") }, { status: 500 });
      }
    }

    return new Response("NEYQORA", { status: 404 });
  }
};