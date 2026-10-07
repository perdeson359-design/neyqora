import { withAIProvider } from "./ai/provider.js";

const MODEL = "@cf/meta/llama-3.2-3b-instruct";
const VERSION = "6.3";
const AUDIO_MODEL = "@cf/openai/whisper-large-v3-turbo";
const VISION_MODEL = "@cf/meta/llama-3.2-11b-vision-instruct";

const HTML = `<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<link rel="manifest" href="/manifest.webmanifest">
<title>NEYQORA</title>
<style>
*{box-sizing:border-box} :root{color-scheme:dark;--bg:#060a12;--panel:#0d1526;--line:#22314d;--muted:#8796b5;--text:#f2f5ff;--accent:#7f91ff;--accent2:#9b83ff;--shadow:0 18px 60px rgba(0,0,0,.28)}
html,body{margin:0;min-height:100%;background:var(--bg);color:var(--text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}body{overflow-x:hidden}body:before{content:"";position:fixed;inset:0;pointer-events:none;background:radial-gradient(circle at 50% -10%,rgba(104,122,255,.13),transparent 38%)}
.app{width:min(100%,1100px);margin:auto;min-height:100vh;padding-bottom:120px}
header{position:sticky;top:0;z-index:30;padding:14px 20px;padding-top:max(14px,env(safe-area-inset-top));background:rgba(6,10,18,.88);backdrop-filter:blur(22px);border-bottom:1px solid rgba(48,69,104,.55);display:flex;align-items:center;justify-content:space-between;gap:20px}.brand{display:flex;align-items:center;gap:12px;min-width:0}.brand-mark{width:44px;height:44px;flex:0 0 44px;border-radius:14px;background:linear-gradient(135deg,var(--accent),var(--accent2));display:grid;place-items:center;font-size:22px;font-weight:950;color:#080d1a;box-shadow:0 10px 32px rgba(127,145,255,.22)}.brand-copy h1{margin:0;font-size:19px;letter-spacing:.7px}.brand-copy p{margin:3px 0 0;color:var(--muted);font-size:12px}
.nav{display:flex;gap:7px;flex-wrap:wrap;justify-content:flex-end}.nav button{border:1px solid var(--line);background:#0b1323;color:var(--text);border-radius:12px;padding:9px 13px;font-weight:800;cursor:pointer}.nav button.active,.nav button:hover{background:#1a2945;border-color:#425a85}
main{padding:24px 20px}.view{display:none}.view.active{display:block}.hero{padding:28px;border:1px solid var(--line);border-radius:26px;background:linear-gradient(145deg,rgba(17,28,49,.96),rgba(9,15,27,.96));box-shadow:var(--shadow);margin-bottom:18px}.chat-hero{text-align:center;padding:42px 24px 30px}.hero-mark{width:58px;height:58px;margin:0 auto 18px;border-radius:19px;background:linear-gradient(135deg,var(--accent),var(--accent2));display:grid;place-items:center;color:#090e1a;font-size:27px;font-weight:950}.hero h2{margin:0 0 8px;font-size:clamp(25px,5vw,34px);letter-spacing:-.7px}.hero p{margin:0;color:var(--muted);line-height:1.55;font-size:15px}
.quick-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:18px 0 26px}.quick-card{border:1px solid var(--line);background:#0b1323;border-radius:18px;padding:16px;text-align:left;color:var(--text);cursor:pointer}.quick-card:hover{border-color:#40567e;background:#101b31}.quick-card b{display:block;font-size:14px;margin-bottom:4px}.quick-card span{display:block;color:var(--muted);font-size:12px;line-height:1.4}.section-label{margin:0 0 10px;color:#aab6d0;font-size:12px;font-weight:850;text-transform:uppercase;letter-spacing:1px}
#chat{padding:4px 0 120px;min-height:260px}.msg{max-width:82%;padding:13px 16px;margin:11px 0;border:1px solid var(--line);border-radius:18px;line-height:1.55;white-space:pre-wrap;box-shadow:0 8px 25px rgba(0,0,0,.1)}.user{margin-left:auto;background:#25385f;border-color:#40598d}.ai{background:#0e1729}
.tools-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.tool-card{border:1px solid var(--line);border-radius:20px;background:linear-gradient(145deg,#101a2d,#0b1220);padding:18px;cursor:pointer}.tool-card:hover{border-color:#405477}.tool-card strong{display:block;font-size:16px}.tool-card span{display:block;color:var(--muted);font-size:13px;margin-top:5px;line-height:1.45}.tool-icon{font-size:23px;margin-bottom:11px}
.view{display:none}.view.active{display:block}.view[hidden]{display:none}.panel{border:1px solid var(--line);border-radius:20px;background:#0d1628;padding:18px;margin-top:14px;box-shadow:var(--shadow)}.panel h3{margin:0 0 6px}.panel p{color:var(--muted);font-size:13px;margin:0 0 12px}.panel[hidden]{display:none}.field{width:100%;margin-top:8px;background:#080f1e;color:var(--text);border:1px solid var(--line);outline:0;padding:12px;border-radius:12px;font-size:15px}.field:focus{border-color:#526b9f}textarea.field{min-height:110px;resize:vertical}.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}.primary,.secondary,.danger{border:0;border-radius:12px;padding:11px 14px;font-weight:850;cursor:pointer}.primary{background:#eef3ff;color:#08101d}.secondary{background:#26385f;color:#fff}.danger{background:#4b2530;color:#fff}.result{margin-top:10px;padding:12px;border-radius:12px;background:#080f1e;border:1px solid var(--line);white-space:pre-wrap;color:#dbe5ff}.memory-row{display:flex;gap:8px;align-items:flex-start;padding:10px 0;border-bottom:1px solid var(--line)}.memory-row span{flex:1;line-height:1.45}
#form{position:fixed;left:50%;bottom:max(18px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:40;width:min(1040px,calc(100% - 32px));display:flex;gap:9px;padding:9px;background:rgba(9,15,27,.93);backdrop-filter:blur(22px);border:1px solid #314462;border-radius:20px;box-shadow:0 18px 50px rgba(0,0,0,.42)}#input{flex:1;min-width:0;background:#080f1e;color:#fff;border:1px solid var(--line);outline:0;padding:13px 15px;border-radius:14px;font-size:16px}#input:focus{border-color:#526b9f}#send{border:0;border-radius:14px;padding:0 22px;background:#eef3ff;color:#0a0e18;font-weight:900;cursor:pointer}pre{max-height:420px;overflow:auto}.project-actions{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.mobile-nav{display:none}
#form[hidden]{display:none}
button:focus-visible,input:focus-visible,textarea:focus-visible,.tool-card:focus-visible,.quick-card:focus-visible{outline:2px solid var(--accent);outline-offset:2px}
button:disabled{opacity:.55;cursor:not-allowed}
.chat-toolbar{display:flex;gap:8px;align-items:center;justify-content:space-between;margin:4px 0 10px}
.chat-composer-hint{margin:0 0 10px;color:#8fa1c2;font-size:11px;text-align:center}
.prompt-chips{display:flex;gap:8px;overflow:auto;padding:2px 1px 10px;scrollbar-width:none}
.prompt-chips::-webkit-scrollbar{display:none}
.prompt-chip{flex:0 0 auto;border:1px solid var(--line);background:#0b1323;color:#cbd7ed;border-radius:999px;padding:8px 11px;font-size:12px;font-weight:750;cursor:pointer}
.prompt-chip:hover{border-color:#526b9f;background:#111d33;color:#fff}
.chat-empty{padding:18px 4px 8px;color:var(--muted);font-size:12px;text-align:center}
.chat-empty strong{color:#dce5f7}
.chat-meta{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:12px;color:#7f8eaa;font-size:11px}
.chat-meta kbd{padding:3px 6px;border:1px solid var(--line);border-radius:6px;background:#0b1323;color:#aab6d0}

.chat-toolbar-actions{display:flex;gap:7px;flex-wrap:wrap}
.status-pill{display:inline-flex;align-items:center;gap:7px;padding:7px 10px;border:1px solid var(--line);border-radius:999px;background:#0b1323;color:#b9c6df;font-size:11px;font-weight:850}
.status-dot{width:7px;height:7px;border-radius:50%;background:#78e6a0;box-shadow:0 0 12px rgba(120,230,160,.55)}
.status-pill.busy .status-dot{background:#ffd166;box-shadow:0 0 12px rgba(255,209,102,.45)}
.history-panel{margin:8px 0 12px;padding:12px;border:1px solid var(--line);border-radius:16px;background:#0a1220}
.history-panel[hidden]{display:none}
.history-list{display:grid;gap:6px;max-height:220px;overflow:auto}
.history-item{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:9px 10px;border:1px solid transparent;border-radius:12px;background:#0d1729;color:#dce5f7;cursor:pointer;text-align:left}
.history-item:hover{border-color:var(--line)}
.message-actions{display:flex;gap:6px;margin-top:8px}
.message-actions button{border:1px solid var(--line);background:#101b2f;color:#b9c6df;border-radius:9px;padding:5px 8px;font-size:11px;font-weight:750;cursor:pointer}
.project-overview{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin:12px 0}
.project-stat{border:1px solid var(--line);border-radius:14px;background:#0a1323;padding:11px 13px}
.project-stat small{display:block;color:#8192b0;font-size:10px;font-weight:850;text-transform:uppercase;letter-spacing:.8px}
.project-stat strong{display:block;margin-top:3px;font-size:14px}
.project-workspace{display:grid;grid-template-columns:240px minmax(0,1fr);gap:12px}
.project-tree{border:1px solid var(--line);border-radius:16px;background:#09111f;padding:10px;min-height:300px}
.project-tree-head{display:flex;align-items:center;justify-content:space-between;padding:3px 4px 9px;color:#aab6d0;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:.8px}
.project-tree button{display:block;width:100%;text-align:left;border:0;background:transparent;color:#cbd7ed;padding:9px;border-radius:9px;cursor:pointer;font-family:inherit}
.project-tree button.active,.project-tree button:hover{background:#17243b;color:#fff}
.project-code{min-width:0}
.project-code-head{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}
.project-code-head span{color:#8fa1c2;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.project-code pre{margin:0;min-height:300px;border:1px solid var(--line);border-radius:16px;background:#070d18;padding:15px;line-height:1.6;font-size:12px}
.project-ci-bar{display:flex;align-items:center;justify-content:space-between;gap:14px;margin:12px 0;padding:12px 14px;border:1px solid var(--line);border-radius:14px;background:#0a1323}.project-ci-copy{display:grid;gap:4px;min-width:0}.project-ci-copy small{color:#8192b0;font-size:11px}.project-ci-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#7d8aa5;margin-right:7px}.project-ci-dot.ok{background:#45d483}.project-ci-dot.fail{background:#ff6578}.project-ci-dot.pending{background:#f2b84b}.project-ci-actions{display:flex;align-items:center;gap:7px;flex:0 0 auto}.project-ci-actions input{width:90px;border:1px solid var(--line);border-radius:10px;background:#070d18;color:#fff;padding:9px 10px;font:inherit;font-size:12px}.project-editor{display:block;width:100%;min-height:300px;box-sizing:border-box;resize:vertical;border:1px solid var(--line);border-radius:16px;background:#070d18;color:#dce6f8;padding:15px;line-height:1.6;font:12px/1.6 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;outline:none}.project-editor:focus{border-color:#49658f;box-shadow:0 0 0 3px rgba(73,101,143,.14)}.project-editor-actions{display:flex;justify-content:flex-end;gap:7px;margin-top:8px}.project-editor-actions button{font:inherit}.project-empty{display:grid;place-items:center;min-height:270px;color:#7486a7;text-align:center}
@media(max-width:700px){.project-overview{grid-template-columns:repeat(3,1fr)}.project-stat{padding:9px}.project-stat strong{font-size:12px}.project-tree{min-height:auto}}
.settings-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
.setting-card{border:1px solid var(--line);border-radius:16px;padding:15px;background:#0b1425}
.setting-card h3{margin:0 0 6px;font-size:15px}.setting-card p{margin:0;color:var(--muted);font-size:12px;line-height:1.45}
.memory-tools{display:flex;gap:8px;margin-bottom:12px}.memory-tools input{flex:1}
.tool-categories{display:grid;gap:22px}.category-label{display:flex;align-items:center;gap:8px;font-size:11px;text-transform:uppercase;letter-spacing:1.2px;color:#8fa1c2;font-weight:900;margin-top:2px}.category-label:after{content:"";height:1px;flex:1;background:var(--line)}
.tool-card{width:100%;text-align:left;position:relative;min-height:128px;transition:transform .16s ease,border-color .16s ease,background .16s ease}.tool-card:hover{transform:translateY(-2px)}.tool-card strong{font-size:16px}.tool-card span{max-width:520px}.tool-status{position:absolute;top:14px;right:14px;display:inline-flex;align-items:center;gap:5px;font-size:10px;font-weight:850;color:#8fa1c2}.tool-status-dot{width:6px;height:6px;border-radius:50%;background:#78e6a0;box-shadow:0 0 10px rgba(120,230,160,.4)}.tool-arrow{position:absolute;right:15px;bottom:13px;color:#7183a4;font-size:15px}
.tool-page{max-width:1100px;margin:0 auto}.page-head{display:flex;align-items:flex-start;gap:14px;margin-bottom:14px}.page-head h2{margin:0 0 5px}.page-head p{margin:0;color:var(--muted);font-size:13px}.back-button{border:1px solid var(--line);background:#0b1323;color:#dbe5ff;border-radius:12px;padding:9px 12px;font-weight:800;cursor:pointer;white-space:nowrap}.tool-workspace{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.tool-workspace .panel{margin-top:0}.tool-workspace .panel:last-child:nth-child(3){grid-column:1/-1}
@media(max-width:700px){.tool-workspace{grid-template-columns:1fr}.page-head{gap:9px}.page-head h2{font-size:22px}}
@media(max-width:700px){.project-workspace,.settings-grid{grid-template-columns:1fr}.project-tree{display:flex;gap:6px;overflow:auto}.project-tree button{min-width:max-content}.chat-toolbar{align-items:flex-start}.app{padding-bottom:calc(178px + env(safe-area-inset-bottom))}#form{bottom:calc(72px + env(safe-area-inset-bottom));}
@media(max-width:700px){.app{padding-bottom:178px}header{padding:12px 16px}.brand-mark{width:42px;height:42px;flex-basis:42px}.brand-copy h1{font-size:18px}.brand-copy p{font-size:11px}header>.nav{display:none}main{padding:12px 12px 0}.hero{border-radius:22px;padding:22px 18px;margin-bottom:12px}.chat-hero{padding:30px 16px 24px}.hero-mark{width:52px;height:52px;font-size:24px;margin-bottom:14px}.hero h2{font-size:25px}.hero p{font-size:14px}.quick-grid{grid-template-columns:repeat(2,1fr);gap:8px;margin:12px 0 22px}.quick-card{padding:14px;border-radius:16px}#chat{padding-bottom:110px}.msg{max-width:94%;font-size:15px}#form{bottom:72px;width:calc(100% - 24px);padding:8px;border-radius:18px}#input{font-size:16px;padding:12px}#send{padding:0 17px}.mobile-nav{position:fixed;display:grid;grid-template-columns:repeat(4,1fr);left:0;right:0;bottom:0;height:64px;z-index:100;pointer-events:auto;padding:7px 8px calc(7px + env(safe-area-inset-bottom));background:rgba(6,10,18,.96);backdrop-filter:blur(22px);border-top:1px solid rgba(48,69,104,.7)}.mobile-nav button{border:0;background:transparent;color:#7f8eaa;font-size:11px;font-weight:800;border-radius:12px;cursor:pointer}.mobile-nav button span{display:block;font-size:18px;margin-bottom:2px}.mobile-nav button.active{color:#eef3ff;background:#17243b}}
</style>
</head>
<body>
<div class="app">
<header><div class="brand"><div class="brand-mark">N</div><div class="brand-copy"><h1>NEYQORA</h1><p>Kişisel yapay zekâ asistanın · V6.3</p></div></div><nav class="nav" aria-label="Ana menü"><button class="active" data-view="chat-view" type="button" onclick="return window.neyqoraNavigate('chat-view')">Sohbet</button><button data-view="tools-view" type="button" onclick="return window.neyqoraNavigate('tools-view')">Araçlar</button><button data-view="project-view" type="button" onclick="return window.neyqoraNavigate('project-view')">Proje</button><button data-view="memory-view" type="button" onclick="return window.neyqoraNavigate('memory-view')">Hafıza</button><button data-view="settings-view" type="button" onclick="return window.neyqoraNavigate('settings-view')">Ayarlar</button></nav></header>
<main>
<section id="chat-view" class="view active">
<div class="hero chat-hero"><div class="hero-mark">N</div><h2>Nasıl yardımcı olabilirim?</h2><p>Sor, araştır, kod yazdır veya birlikte bir proje geliştirelim.</p><div class="chat-meta"><span>Hızlı, özel ve senin projelerine odaklı</span><kbd>Enter</kbd><span>gönder</span></div></div>
<div class="chat-toolbar"><div class="status-pill" id="ai-status"><span class="status-dot"></span><span id="ai-status-text">Hazır · Otomatik AI</span></div><div class="chat-toolbar-actions"><button class="secondary" id="new-chat" type="button">+ Yeni Sohbet</button><button class="secondary" id="toggle-history" type="button">Geçmiş</button></div></div>
<div id="history-panel" class="history-panel" hidden><div class="history-list" id="history-list"></div></div>
<div class="section-label">Sohbet</div>
<div class="prompt-chips" aria-label="Hızlı komutlar">
<button class="prompt-chip" type="button" data-prompt="Bana bugün yapmam gerekenleri planla.">📋 Günümü planla</button>
<button class="prompt-chip" type="button" data-prompt="Bir proje fikrimi birlikte geliştirelim.">💡 Proje geliştir</button>
<button class="prompt-chip" type="button" data-prompt="Bu kodu inceleyip hatalarını bul.">💻 Kodu incele</button>
<button class="prompt-chip" type="button" data-prompt="Bir konuyu araştırıp özetle.">🔎 Araştır</button>
</div>
<p class="chat-composer-hint">Bir komut seçebilir veya doğrudan mesajını yazabilirsin.</p>
<div id="chat"><div class="chat-empty"><strong>Yeni sohbet hazır.</strong><br>İlk mesajını göndererek başlayabilirsin.</div></div>
</section>

<section id="tools-view" class="view">
<div class="hero"><h2>Araç Merkezi</h2><p>NEYQORA'nın yeteneklerini tek yerden keşfet. Her araç kendi çalışma alanında açılır.</p></div>
<div class="tool-categories">
<div class="category-label">Yapay Zekâ</div>
<div class="tools-grid">
<button class="tool-card" data-view="local-ai-view" type="button" onclick="return window.neyqoraNavigate('local-ai-view')"><div class="tool-status"><i class="tool-status-dot"></i>Hazır</div><div class="tool-icon">🧠</div><strong>Yerel AI</strong><span>Kendi model sunucuna bağlan, internet olmadan veya özel modelinle çalış.</span><div class="tool-arrow">→</div></button>
</div>
<div class="category-label">Üretkenlik</div>
<div class="tools-grid">
<button class="tool-card" data-view="productivity-view" type="button" onclick="return window.neyqoraNavigate('productivity-view')"><div class="tool-status"><i class="tool-status-dot"></i>Hazır</div><div class="tool-icon">📅</div><strong>Takvim · E-posta · Otomasyon</strong><span>Etkinlik oluştur, e-posta gönder veya tekrar eden işleri otomatikleştir.</span><div class="tool-arrow">→</div></button>
</div>
<div class="category-label">Dosyalar</div>
<div class="tools-grid">
<button class="tool-card" data-view="files-view" type="button" onclick="return window.neyqoraNavigate('files-view')"><div class="tool-status"><i class="tool-status-dot"></i>Hazır</div><div class="tool-icon">📎</div><strong>Dosya Analizi</strong><span>Metin, kod, JSON, CSV ve Markdown dosyalarını NEYQORA ile incele.</span><div class="tool-arrow">→</div></button>
</div>
<div class="category-label">Medya</div>
<div class="tools-grid">
<button class="tool-card" data-view="media-view" type="button" onclick="return window.neyqoraNavigate('media-view')"><div class="tool-status"><i class="tool-status-dot"></i>Hazır</div><div class="tool-icon">🎙️</div><strong>Ses · Görüntü</strong><span>Ses dosyalarını yazıya çevir, görselleri analiz et ve sonuçları çalışma alanında gör.</span><div class="tool-arrow">→</div></button>
</div>
</section>

<section id="productivity-view" class="view tool-page">
<div class="page-head"><button class="back-button" data-view="tools-view" type="button" onclick="return window.neyqoraNavigate('tools-view')">← Araçlar</button><div><h2>Takvim · E-posta · Otomasyon</h2><p>Günlük işlerini tek çalışma alanından yönet.</p></div></div>
<div class="tool-workspace">
<div class="panel"><h3>📅 Takvim</h3><input id="event-title" class="field" placeholder="Takvim etkinliği"><input id="event-start" class="field" type="datetime-local"><input id="event-end" class="field" type="datetime-local"><div class="actions"><button id="create-event" class="secondary" type="button">Etkinlik Oluştur</button></div></div>
<div class="panel"><h3>✉️ E-posta</h3><input id="email-to" class="field" placeholder="E-posta alıcısı"><input id="email-subject" class="field" placeholder="Konu"><textarea id="email-body" class="field" placeholder="E-posta içeriği"></textarea><div class="actions"><button id="send-email" class="secondary" type="button">E-posta Gönder</button><button id="save-email" class="secondary" type="button">Taslağı Kaydet</button></div></div>
<div class="panel"><h3>⚡ Otomasyon</h3><input id="automation-title" class="field" placeholder="Otomasyon adı"><input id="automation-run" class="field" type="datetime-local"><input id="automation-prompt" class="field" placeholder="Görev"><div class="actions"><button id="create-automation" class="secondary" type="button">Otomasyon Oluştur</button></div></div>
</div><div id="productivity-result" class="result" hidden></div>
</section>

<section id="files-view" class="view tool-page">
<div class="page-head"><button class="back-button" data-view="tools-view" type="button">← Araçlar</button><div><h2>Dosya Analizi</h2><p>Dosya seç, NEYQORA içeriği analiz etsin.</p></div></div>
<div class="panel"><h3>📎 Dosyalar</h3><input id="file-input" class="field" type="file" multiple accept=".txt,.md,.csv,.json,.js,.mjs,.ts,.tsx,.jsx,.py,.java,.c,.cpp,.h,.hpp,.css,.html,.xml,.yaml,.yml,.sql,.sh,.log"><div class="actions"><button id="analyze-files" class="secondary" type="button">Dosyaları Analiz Et</button></div></div>
<div id="file-result" class="result" hidden></div>
</section>

<section id="media-view" class="view tool-page">
<div class="page-head"><button class="back-button" data-view="tools-view" type="button">← Araçlar</button><div><h2>Ses · Görüntü</h2><p>Medya dosyalarını ayrı çalışma alanında işle.</p></div></div>
<div class="tool-workspace">
<div class="panel"><h3>🎙️ Ses</h3><input id="audio-input" class="field" type="file" accept="audio/*,.wav,.mp3,.m4a,.ogg,.webm"><div class="actions"><button id="transcribe-audio" class="secondary" type="button">Sesi Yazıya Çevir</button></div></div>
<div class="panel"><h3>🖼️ Görüntü</h3><input id="image-input" class="field" type="file" accept="image/png,image/jpeg,image/webp,image/gif"><div class="actions"><button id="analyze-image" class="secondary" type="button">Görseli Analiz Et</button></div></div>
</div><div id="media-result" class="result" hidden></div>
</section>

<section id="local-ai-view" class="view tool-page">
<div class="page-head"><button class="back-button" data-view="tools-view" type="button">← Araçlar</button><div><h2>Yerel AI</h2><p>İnternet olmadan veya kendi model sunucunla çalış.</p></div></div>
<div class="panel"><h3>🧠 Yerel AI Bağlantısı</h3><p>OpenAI-compatible yerel model sunucunun adresini gir.</p><input id="local-ai-url" class="field" placeholder="http://127.0.0.1:11434/v1"><div class="actions"><button id="save-local-ai" class="secondary" type="button">Adresi Kaydet</button><button id="test-local-ai" class="secondary" type="button">Bağlantıyı Test Et</button></div><div id="local-ai-result" class="result" hidden></div></div>
</section>

<section id="memory-view" class="view">
<div class="hero"><h2>Kalıcı Hafıza</h2><p>Kayıtlı bilgilerini görüntüleyebilir veya silebilirsin.</p><div class="actions"><button id="clear-memories" class="danger" type="button">Tüm Hafızayı Sil</button></div></div>
<div id="memory-panel" class="panel"><div class="memory-tools"><input id="memory-search" class="field" placeholder="Hafızada ara..." aria-label="Hafızada ara"><button id="memory-refresh" class="secondary" type="button">Yenile</button></div><div id="memory-list">Hafıza yükleniyor...</div></div>
</section>

<section id="project-view" class="view">
<div class="hero"><h2>Proje Çalışma Alanı</h2><p>NEYQORA'nın oluşturduğu projeyi dosya ağacı, kod ve doğrulama alanlarıyla yönet.</p></div>
<div id="project-panel" class="panel"><div class="project-code-head"><div><h3 id="project-title">Henüz proje oluşturulmadı</h3><span id="project-subtitle">NEYQORA proje çıktısı burada görünecek.</span></div><span class="status-pill"><span class="status-dot"></span>Çalışma alanı hazır</span></div><div class="project-overview"><div class="project-stat"><small>Dosyalar</small><strong id="project-file-count">0</strong></div><div class="project-stat"><small>Durum</small><strong id="project-state">Bekliyor</strong></div><div class="project-stat"><small>CI</small><strong id="project-ci-state">Bekliyor</strong></div></div><div class="project-ci-bar"><div class="project-ci-copy"><div><span class="project-ci-dot" id="project-ci-dot"></span><strong id="project-ci-label">CI sonucu bekleniyor</strong></div><small id="project-ci-detail">GitHub görevini oluşturduktan sonra issue numarasını gir.</small></div><div class="project-ci-actions"><input id="project-issue-number" inputmode="numeric" pattern="[0-9]*" placeholder="Issue #"><button id="project-ci-refresh" class="secondary" type="button">CI'yı kontrol et</button></div></div><div class="project-actions"><button id="copy-project" class="primary" type="button">Kodu Kopyala</button><button id="send-project" class="secondary" type="button">GitHub Görevini Aç</button><button id="project-download" class="secondary" type="button">Dosyayı İndir</button></div><div class="project-workspace"><div class="project-tree" id="project-tree"><div class="project-tree-head"><span>Dosyalar</span><span id="project-tree-count">0</span></div><div class="project-empty">Henüz proje dosyası yok.<br>Bir proje oluşturduğunda burada görünecek.</div></div><div class="project-code"><div class="project-code-head"><span id="project-file-name">Dosya seçilmedi</span><span id="project-draft-state">Taslak hazır</span></div><textarea id="project-editor" spellcheck="false" placeholder="Proje dosyası burada düzenlenebilir..."></textarea><div class="project-editor-actions"><button id="project-save" class="primary" type="button">Taslağı Kaydet</button><button id="project-reset" class="secondary" type="button">Dosyayı Sıfırla</button></div><pre id="project-files" hidden></pre></div></div></div>
</section>

<section id="settings-view" class="view">
<div class="hero"><h2>Ayarlar</h2><p>NEYQORA'nın çalışma şeklini ve cihaz deneyimini yönet.</p></div>
<div class="settings-grid"><div class="setting-card"><h3>🤖 AI Sağlayıcı</h3><p>Bulut AI, yerel AI ve otomatik geçiş yapılandırmasını yönet.</p></div><div class="setting-card"><h3>🧠 Hafıza</h3><p>Kalıcı hafıza yönetimini Hafıza sayfasından yap.</p></div><div class="setting-card"><h3>📱 Mobil</h3><p>Güvenli alan, klavye ve dokunmatik kullanım optimize edildi.</p></div><div class="setting-card"><h3>🔐 Güvenlik</h3><p>Üretim doğrulaması ve güvenlik başlıkları aktif.</p></div></div>
</section>
</main>
<div id="form" role="form"><input id="input" name="message" placeholder="NEYQORA'ya bir şey sor..." autocomplete="off"><button id="send" type="button" onclick="return window.neyqoraSend()">Gönder</button></div><nav class="mobile-nav" aria-label="Mobil menü" style="touch-action:manipulation;"><button class="active" data-view="chat-view" type="button" onclick="return window.neyqoraNavigate('chat-view')"><span>💬</span>Sohbet</button><button data-view="tools-view" type="button" onclick="return window.neyqoraNavigate('tools-view')"><span>🧰</span>Araçlar</button><button data-view="project-view" type="button" onclick="return window.neyqoraNavigate('project-view')"><span>💻</span>Proje</button><button data-view="memory-view" type="button" onclick="return window.neyqoraNavigate('memory-view')"><span>🧠</span>Hafıza</button></nav>
</div>
<script>
if ("serviceWorker" in navigator) { window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js").catch(() => {})); }
</script>
<script>
window.neyqoraNavigate=function(view){
  if(!view)return false;
  document.querySelectorAll(".view").forEach(function(v){v.classList.toggle("active",v.id===view);});
  document.querySelectorAll("[data-view]").forEach(function(b){b.classList.toggle("active",b.dataset.view===view);});
  var form=document.getElementById("form");
  if(form)form.hidden=view!=="chat-view";
  if(view==="chat-view" && window.matchMedia && window.matchMedia("(min-width:701px)").matches){
    setTimeout(function(){document.getElementById("input")?.focus();},80);
  }
  window.scrollTo(0,0);
  return false;
};
window.neyqoraSend=async function(){
  const input=document.querySelector("#input");
  const chat=document.querySelector("#chat");
  const button=document.querySelector("#send");
  const message=(input?.value||"").trim();
  if(!message)return false;
  if(button)button.disabled=true;
  setAIStatus("Düşünüyor…",true);
  const user=document.createElement("div");
  user.className="msg user";
  user.textContent=message;
  chat.appendChild(user);
  user.dataset.raw=message;
  input.value="";
  saveHistory();
  const pending=document.createElement("div");
  pending.className="msg ai"; pending.dataset.raw="NEYQORA düşünüyor…";
  pending.textContent="NEYQORA düşünüyor…";
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
    setAIStatus("Hazır · Otomatik AI",false);
    saveHistory();
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
function add(text,cls){const el=document.createElement("div");el.className="msg "+cls;el.dataset.raw=String(text||"");el.textContent=text;chat.appendChild(el);el.scrollIntoView({behavior:"smooth",block:"end"});return el;}
function rememberTurn(role,content){conversation.push({role,content:String(content||"")});if(conversation.length>10)conversation=conversation.slice(-10);}
document.querySelector("#local-ai-url")?.setAttribute("value", (()=>{try{return localStorage.getItem("neyqora_local_ai_url")||"";}catch{return "";}})());
document.querySelector("#save-local-ai")?.addEventListener("click",()=>{
  const value=document.querySelector("#local-ai-url")?.value.trim().replace(/\/$/,"")||"";
  try{if(value)localStorage.setItem("neyqora_local_ai_url",value);else localStorage.removeItem("neyqora_local_ai_url");}catch{}
  const result=document.querySelector("#local-ai-result"); if(result){result.hidden=false;result.textContent=value?"Yerel AI adresi kaydedildi.":"Yerel AI adresi temizlendi.";}
});
document.querySelector("#test-local-ai")?.addEventListener("click",async()=>{
  const result=document.querySelector("#local-ai-result"); if(result){result.hidden=false;result.textContent="Bağlantı test ediliyor...";}
  try{const reply=await window.neyqoraLocalChat("Bağlantı testi. Sadece 'NEYQORA yerel AI hazır.' yaz."); if(result)result.textContent=reply||"Yerel AI yanıt verdi.";}catch(error){if(result)result.textContent="Hata: "+(error?.message||"Bağlantı kurulamadı.");}
});
function openView(view){ return window.neyqoraNavigate(view); }
document.querySelectorAll("[data-view]").forEach(button=>button.addEventListener("click",(event)=>{event.preventDefault();event.stopPropagation();openView(button.dataset.view);}));
document.addEventListener("pointerup",(event)=>{
  const button=event.target.closest(".mobile-nav [data-view]");
  if(!button)return;
  event.preventDefault();
  event.stopPropagation();
  openView(button.dataset.view);
},{passive:false});
document.querySelectorAll(".quick-card").forEach(card=>card.addEventListener("click",()=>openView(card.dataset.view)));
document.querySelectorAll(".prompt-chip").forEach(chip=>chip.addEventListener("click",()=>{
  const field=document.querySelector("#input");
  if(!field)return;
  field.value=chip.dataset.prompt||"";
  openView("chat-view");
  field.focus();
}));

const HISTORY_KEY="neyqora-chat-history-v1";
function setAIStatus(text,busy=false){const el=document.querySelector("#ai-status");const label=document.querySelector("#ai-status-text");if(label)label.textContent=text;if(el)el.classList.toggle("busy",busy);}
function saveHistory(){try{const messages=[...document.querySelectorAll("#chat .msg")].map(x=>({role:x.classList.contains("user")?"user":"ai",text:x.dataset.raw||x.textContent}));localStorage.setItem(HISTORY_KEY,JSON.stringify(messages.slice(-50)));}catch{}}
function loadHistory(){try{const data=JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]");if(!Array.isArray(data)||!data.length)return;const chat=document.querySelector("#chat");if(!chat)return;chat.innerHTML="";data.forEach(m=>appendMessage(m.role,m.text,false));}catch{}}
function appendMessage(role,text,save=true){const chat=document.querySelector("#chat");if(!chat)return;const el=document.createElement("div");el.className="msg "+(role==="user"?"user":"ai");el.dataset.raw=String(text);el.textContent=String(text);if(role!=="user"){const actions=document.createElement("div");actions.className="message-actions";actions.innerHTML='<button type="button" data-copy-message="1">Kopyala</button><button type="button" data-regenerate="1">Yeniden üret</button>';el.appendChild(actions);}chat.appendChild(el);chat.scrollIntoView({block:"end"});if(save)saveHistory();}
function renderHistory(){const list=document.querySelector("#history-list");if(!list)return;try{const data=JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]");list.innerHTML="";if(!data.length){list.innerHTML='<span style="color:var(--muted);font-size:12px">Henüz kayıtlı sohbet yok.</span>';return;}const preview=data.filter(x=>x.role==="user").slice(-8).reverse();preview.forEach((m,i)=>{const b=document.createElement("button");b.className="history-item";b.type="button";b.textContent=String(m.text).slice(0,80)||"Boş mesaj";b.addEventListener("click",()=>{document.querySelector("#input").value=m.text;openView("chat-view");document.querySelector("#input").focus();});list.appendChild(b);});}catch{}}
document.querySelector("#new-chat")?.addEventListener("click",()=>{document.querySelector("#chat").innerHTML='<div class="chat-empty"><strong>Yeni sohbet hazır.</strong><br>İlk mesajını göndererek başlayabilirsin.</div>';conversation=[];localStorage.removeItem(HISTORY_KEY);renderHistory();openView("chat-view");});
document.querySelector("#toggle-history")?.addEventListener("click",()=>{const p=document.querySelector("#history-panel");if(p){p.hidden=!p.hidden;if(!p.hidden)renderHistory();}});
document.addEventListener("click",async event=>{const copy=event.target.closest("[data-copy-message]");if(copy){const msg=copy.closest(".msg");try{await navigator.clipboard.writeText(msg?.dataset.raw||msg?.textContent||"");copy.textContent="Kopyalandı ✓";setTimeout(()=>copy.textContent="Kopyala",1200);}catch{}}const regen=event.target.closest("[data-regenerate]");if(regen){const msg=regen.closest(".msg");const raw=msg?.dataset.raw||"";if(raw){const input=document.querySelector("#input");if(input){input.value=raw;openView("chat-view");input.focus();}}}});
loadHistory();
openView("chat-view");
document.querySelectorAll(".tool-card").forEach(card=>card.addEventListener("click",()=>openView(card.dataset.view)));async function refreshProjectCi(){
  const input=document.querySelector("#project-issue-number");
  const label=document.querySelector("#project-ci-label");
  const detail=document.querySelector("#project-ci-detail");
  const dot=document.querySelector("#project-ci-dot");
  const ciState=document.querySelector("#project-ci-state");
  const state=document.querySelector("#project-state");
  const issue=Number(input?.value||0);
  if(!Number.isInteger(issue)||issue<1){label.textContent="Issue numarası gerekli";detail.textContent="GitHub'da oluşturduğun proje görevinin numarasını gir.";dot.className="project-ci-dot pending";ciState.textContent="Bekliyor";return;}
  label.textContent="CI kontrol ediliyor…";detail.textContent="GitHub Actions sonucu okunuyor.";dot.className="project-ci-dot pending";
  try{
    const response=await fetch("/api/project/ci?issue="+encodeURIComponent(issue),{cache:"no-store"});
    const result=await response.json();
    if(result.status==="passed"){label.textContent="CI başarılı";detail.textContent="Test: "+(result.firstTest||"success")+" · Run: "+(result.runId||"—");dot.className="project-ci-dot ok";ciState.textContent="Başarılı";state.textContent="Doğrulandı";}
    else if(result.status==="failed"){label.textContent="CI başarısız";detail.textContent="Testler veya güvenlik kapısı başarısız.";dot.className="project-ci-dot fail";ciState.textContent="Başarısız";state.textContent="Kontrol gerekli";}
    else{label.textContent="CI beklemede";detail.textContent="GitHub Actions henüz sonuç yayınlamadı.";dot.className="project-ci-dot pending";ciState.textContent="Bekliyor";}
  }catch(error){label.textContent="CI kontrol edilemedi";detail.textContent=error?.message||"Geçici bağlantı hatası.";dot.className="project-ci-dot fail";ciState.textContent="Bilinmiyor";}
}
document.querySelector("#project-ci-refresh")?.addEventListener("click",refreshProjectCi);
let projectFiles=[];
let projectSelectedIndex=-1;
let projectOriginalContent="";
function projectDraftKey(path){return "neyqora-project-draft:"+path;}
function selectProjectFile(index){
  const file=projectFiles[index]; if(!file)return;
  projectSelectedIndex=index;
  const tree=document.querySelector("#project-tree");
  tree.querySelectorAll("button").forEach(x=>x.classList.remove("active"));
  const buttons=tree.querySelectorAll("button"); if(buttons[index])buttons[index].classList.add("active");
  document.querySelector("#project-file-name").textContent=file.path;
  const editor=document.querySelector("#project-editor");
  let draft="";
  try{draft=localStorage.getItem(projectDraftKey(file.path))||"";}catch{}
  projectOriginalContent=String(file.content||"");
  editor.value=draft||projectOriginalContent;
  document.querySelector("#project-draft-state").textContent=draft?"Taslak yüklendi":"Kaydedilmemiş";
}
function saveProjectDraft(){
  if(projectSelectedIndex<0)return;
  const file=projectFiles[projectSelectedIndex]; const editor=document.querySelector("#project-editor");
  try{localStorage.setItem(projectDraftKey(file.path),editor.value);}catch{}
  document.querySelector("#project-draft-state").textContent="Taslak kaydedildi ✓";
}
document.querySelector("#project-save")?.addEventListener("click",saveProjectDraft);
document.querySelector("#project-reset")?.addEventListener("click",()=>{
  if(projectSelectedIndex<0)return;
  const file=projectFiles[projectSelectedIndex]; const editor=document.querySelector("#project-editor");
  try{localStorage.removeItem(projectDraftKey(file.path));}catch{}
  editor.value=projectOriginalContent;document.querySelector("#project-draft-state").textContent="Dosya sıfırlandı";
});
document.querySelector("#project-download")?.addEventListener("click",()=>{
  if(projectSelectedIndex<0)return;
  const file=projectFiles[projectSelectedIndex]; const content=document.querySelector("#project-editor").value;
  const blob=new Blob([content],{type:"text/plain;charset=utf-8"});const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);a.download=file.path.split("/").pop()||"project-file.txt";a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
});

document.querySelector("#send-project").addEventListener("click",()=>{
  const title=document.querySelector("#project-title").textContent;
  const bodyLines=projectFiles.map((file,index)=>"### "+file.path+"\n\n"+(index===projectSelectedIndex?document.querySelector("#project-editor").value:String(file.content||"")));
  const body="NEYQORA tarafından oluşturulan proje görevi.\n\n"+bodyLines.join("\n\n");
  const url="https://github.com/perdeson359-design/neyqora/issues/new?title="+encodeURIComponent(title)+"&body="+encodeURIComponent(body)+"&labels="+encodeURIComponent("neyqora-project");
  window.open(url,"_blank");
  document.querySelector("#project-ci-detail").textContent="Issue oluşturduktan sonra numarasını girip CI'yı kontrol et.";
});
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
      row.className="memory-row";
      const text=document.createElement("span"); text.textContent=memory.content; 
      const del=document.createElement("button"); del.type="button"; del.textContent="Sil"; del.className="secondary";
      del.onclick=async()=>{del.disabled=true;try{const rr=await fetch("/api/memory?userId="+encodeURIComponent(userId)+"&id="+encodeURIComponent(memory.id),{method:"DELETE"});if(!rr.ok)throw new Error();await loadMemories();}catch{del.disabled=false;}};
      row.append(text,del);list.appendChild(row);
    }
  }catch{list.textContent="Hafıza yüklenemedi.";}
}
document.querySelector("#memory-refresh")?.addEventListener("click",()=>loadMemories());
document.querySelector("#memory-search")?.addEventListener("input",()=>filterMemories());
function filterMemories(){
  const q=(document.querySelector("#memory-search")?.value||"").trim().toLowerCase();
  document.querySelectorAll("#memory-list .memory-row").forEach(row=>{row.hidden=!!q&&!row.textContent.toLowerCase().includes(q);});
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
document.querySelector("#send-email")?.addEventListener("click",async()=>{const o=document.querySelector("#productivity-result");const button=document.querySelector("#send-email");if(button)button.disabled=true;try{const d=await postProductivity("/api/email/send",{userId,to:document.querySelector("#email-to").value,subject:document.querySelector("#email-subject").value,body:document.querySelector("#email-body").value});o.hidden=false;o.textContent="E-posta gönderildi ("+d.email.id+").";}catch(e){o.hidden=false;o.textContent="Hata: "+e.message;}finally{if(button)button.disabled=false;}});document.querySelector("#save-email")?.addEventListener("click",async()=>{const o=document.querySelector("#productivity-result");try{const d=await postProductivity("/api/email/drafts",{userId,to:document.querySelector("#email-to").value,subject:document.querySelector("#email-subject").value,body:document.querySelector("#email-body").value});o.hidden=false;o.textContent="E-posta taslağı kaydedildi (#"+d.draft.id+").";}catch(e){o.hidden=false;o.textContent="Hata: "+e.message;}});
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
      const subtitle=document.querySelector("#project-subtitle");
      const tree=document.querySelector("#project-tree");
      const filesEl=document.querySelector("#project-files");
      const count=document.querySelector("#project-file-count");
      const treeCount=document.querySelector("#project-tree-count");
      const state=document.querySelector("#project-state");
      const fileName=document.querySelector("#project-file-name");
      const files=Array.isArray(data.files)?data.files:[];projectFiles=files;projectSelectedIndex=-1;
      title.textContent="Proje: "+(data.project||"NEYQORA projesi");document.querySelector("#project-issue-number").value="";document.querySelector("#project-ci-state").textContent="Bekliyor";document.querySelector("#project-ci-label").textContent="CI sonucu bekleniyor";document.querySelector("#project-ci-detail").textContent="GitHub görevini oluşturduktan sonra issue numarasını gir.";document.querySelector("#project-ci-dot").className="project-ci-dot";
      subtitle.textContent=files.length+" dosyalık proje çıktısı";
      count.textContent=String(files.length);
      treeCount.textContent=String(files.length);
      state.textContent=files.length?"Hazır":"Bekliyor";
      tree.querySelectorAll("button").forEach(x=>x.remove());
      tree.querySelector(".project-empty")?.remove();
      files.forEach((file,index)=>{
        const button=document.createElement("button");
        button.type="button";button.textContent="📄 "+file.path;
        button.addEventListener("click",()=>selectProjectFile(index));
        tree.appendChild(button);
        if(index===0)button.click();projectSelectedIndex=index;
      });
      panel.hidden=false;openView("project-view");
      panel.scrollIntoView({behavior:"smooth",block:"end"});
    }
  }catch(err){
    try{
      const localReply=await window.neyqoraLocalChat(message);
      pending.textContent="(Yerel AI) "+(localReply||"Yerel AI boş yanıt verdi.");
      if(localReply)rememberTurn("assistant",localReply);
    }catch(localError){
      pending.textContent=err?.name==="AbortError"?"NEYQORA yanıtı zaman aşımına uğradı.":"Bağlantı hatası: "+(err?.message||localError?.message||"Tekrar dene.");
    }
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

let productivityTablesPromise = null;

async function ensureProductivityTables(env){
  if (!env.DB) return;
  if (!productivityTablesPromise) {
    productivityTablesPromise = (async () => {
      await env.DB.prepare("CREATE TABLE IF NOT EXISTS calendar_events (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT NOT NULL,title TEXT NOT NULL,start_at TEXT NOT NULL,end_at TEXT NOT NULL,description TEXT NOT NULL DEFAULT '',location TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();
      await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_calendar_user_start ON calendar_events(user_id,start_at)").run();
      await env.DB.prepare("CREATE TABLE IF NOT EXISTS email_drafts (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT NOT NULL,to_address TEXT NOT NULL,subject TEXT NOT NULL,body TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'draft',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();
      await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_email_user_created ON email_drafts(user_id,created_at DESC)").run();
      await env.DB.prepare("CREATE TABLE IF NOT EXISTS automations (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id TEXT NOT NULL,title TEXT NOT NULL,prompt TEXT NOT NULL,run_at TEXT NOT NULL,status TEXT NOT NULL DEFAULT 'pending',last_error TEXT NOT NULL DEFAULT '',created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP)").run();
      await env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_automation_due ON automations(status,run_at)").run();
    })().catch(error => {
      productivityTablesPromise = null;
      throw error;
    });
  }
  await productivityTablesPromise;
}
function normalizeUserId(value){const text=String(value||"").trim();return /^[A-Za-z0-9._:-]{1,100}$/.test(text)?text:"";}
function mapCalendarEvent(row){return {id:row.id,title:row.title,startAt:row.start_at,endAt:row.end_at,description:row.description,location:row.location,createdAt:row.created_at};}
function parseEmailRecipients(value){
  const raw = Array.isArray(value) ? value : String(value || "").split(/[,;\n]+/);
  const recipients = raw.map(item => String(item || "").trim()).filter(Boolean);
  if (!recipients.length || recipients.length > 10) return null;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (recipients.some(item => item.length > 320 || !emailPattern.test(item))) return null;
  return [...new Set(recipients)];
}

async function sendResendEmail(env, { to, subject, body }){
  const recipients = parseEmailRecipients(to);
  const cleanSubject = String(subject || "").trim();
  const cleanBody = String(body || "").trim();
  if (!recipients) throw new Error("Geçerli en az bir e-posta alıcısı gerekli.");
  if (!cleanSubject || cleanSubject.length > 500) throw new Error("Konu boş olamaz ve 500 karakteri geçemez.");
  if (!cleanBody || cleanBody.length > 20000) throw new Error("E-posta içeriği boş olamaz ve 20.000 karakteri geçemez.");
  if (!env.RESEND_API_KEY) throw new Error("RESEND_API_KEY yapılandırılmamış.");
  const from = String(env.RESEND_FROM || "onboarding@resend.dev").trim();
  if (!from) throw new Error("RESEND_FROM yapılandırılmamış.");
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "authorization": "Bearer " + env.RESEND_API_KEY
      },
      body: JSON.stringify({
        from,
        to: recipients,
        subject: cleanSubject,
        text: cleanBody
      }),
      signal: controller.signal
    });
    const raw = await response.text();
    if (raw.length > 4096) throw new Error("Resend yanıtı çok büyük.");
    let data = {};
    try { data = raw ? JSON.parse(raw) : {}; } catch {}
    if (!response.ok) {
      const detail = String(data?.message || data?.error || raw || "").slice(0, 500);
      throw new Error("Resend API " + response.status + (detail ? ": " + detail : ""));
    }
    const id = String(data?.id || "").trim();
    if (!id) throw new Error("Resend geçerli bir mesaj kimliği döndürmedi.");
    return { id, from, to: recipients, subject: cleanSubject };
  } finally {
    clearTimeout(timer);
  }
}

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
  const allowedExtensions = new Set(["py","js","mjs","ts","tsx","jsx","html","css","json","md","txt","csv"]);
  const safe = [];
  const seen = new Set();
  for (const file of files) {
    const path = String(file?.path || "").trim();
    const content = String(file?.content || "");
    const extension = getFileExtension(path);
    if (!path || !content || path.length > 180 || content.length > 50000) return null;
    if (path.startsWith("/") || path.includes("..") || path.includes("\\") || path.startsWith(".github/") || !/^[A-Za-z0-9._/-]+$/.test(path)) return null;
    if (!allowedExtensions.has(extension) || seen.has(path)) return null;
    seen.add(path);
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
    if (/\b(?:os\.system|subprocess\.(?:run|Popen|call|check_output|check_call)|socket\.|ctypes\.|pickle\.loads|__import__)\s*\(/.test(code)) {
      errors.push(file.path + ": güvenli olmayan sistem/ağ işlemi yasak.");
    }
    if (/^\s*(?:import|from)\s+(?:subprocess|socket|ctypes|pickle)\b/m.test(code)) {
      errors.push(file.path + ": riskli Python modülü kullanımı yasak.");
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
    env = withAIProvider(env);
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/manifest.webmanifest") {
      return new Response(JSON.stringify({
        name: "NEYQORA",
        short_name: "NEYQORA",
        description: "Bulut ve yerel yapay zekâ destekli kişisel asistan.",
        lang: "tr",
        start_url: "/",
        display: "standalone",
        background_color: "#070b14",
        theme_color: "#070b14",
        orientation: "portrait-primary"
      }), { headers: { "content-type": "application/manifest+json; charset=UTF-8", "cache-control": "public, max-age=3600" } });
    }

    if (request.method === "GET" && url.pathname === "/sw.js") {
      return new Response(`const CACHE="neyqora-shell-v1";const SHELL=["/","/manifest.webmanifest"];self.addEventListener("install",e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));self.addEventListener("activate",e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim())));self.addEventListener("fetch",e=>{if(e.request.method!=="GET")return;const u=new URL(e.request.url);if(u.pathname.startsWith("/api/"))return;e.respondWith(fetch(e.request).then(r=>{if(u.origin===self.location.origin&&(u.pathname==="/"||u.pathname==="/manifest.webmanifest")){const x=r.clone();caches.open(CACHE).then(c=>c.put(e.request,x));}return r}).catch(()=>caches.match(e.request).then(x=>x||caches.match("/"))))});`, { headers: { "content-type": "application/javascript; charset=UTF-8", "cache-control": "no-cache" } });
    }

    if (request.method === "GET" && url.pathname === "/") {
      const headers = new Headers({
        "content-type": "text/html; charset=UTF-8",
        "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
        "x-content-type-options": "nosniff",
        "x-frame-options": "DENY",
        "referrer-policy": "no-referrer",
        "permissions-policy": "camera=(), microphone=(), geolocation=()"
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
    if (request.method === "POST" && url.pathname === "/api/email/send") {
      try {
        const isOwner = await verifyOwnerSession(request, env);
        const body = await request.json();
        const uid = isOwner ? "owner" : await getAuthenticatedUserId(request, env);
        if (!uid) return Response.json({ ok: false, error: "Kullanıcı oturumu gerekli." }, { status: 401 });
        if (!env.RESEND_API_KEY) return Response.json({ ok: false, error: "Resend bağlantısı yapılandırılmamış." }, { status: 503 });
        const recipients = parseEmailRecipients(body?.to);
        const subject = String(body?.subject || "").trim();
        const messageBody = String(body?.body || "").trim();
        if (!recipients || !subject || !messageBody) return Response.json({ ok: false, error: "Geçerli alıcı, konu ve e-posta içeriği gerekli." }, { status: 400 });
        if (subject.length > 500 || messageBody.length > 20000) return Response.json({ ok: false, error: "E-posta boyutu sınırı aşıldı." }, { status: 413 });
        const email = await sendResendEmail(env, { to: recipients, subject, body: messageBody });
        await ensureProductivityTables(env);
        const result = await env.DB.prepare("INSERT INTO email_drafts (user_id,to_address,subject,body,status) VALUES (?,?,?,?,?)").bind(uid, recipients.join(", "), subject, messageBody, "sent").run();
        return Response.json({
          ok: true,
          email: { id: email.id, from: email.from, to: email.to, subject: email.subject, status: "sent" },
          draft: { id: result.meta.last_row_id, status: "sent" }
        });
      } catch (error) {
        const message = String(error?.message || "E-posta gönderilemedi.");
        if (/AbortError|timeout/i.test(message)) return Response.json({ ok: false, error: "Resend isteği zaman aşımına uğradı." }, { status: 504 });
        return Response.json({ ok: false, error: message }, { status: 502 });
      }
    }

    if (request.method === "GET" && url.pathname === "/api/email/drafts") {
      const isOwner=await verifyOwnerSession(request,env),uid=isOwner?"owner":await getAuthenticatedUserId(request,env); if(!uid)return Response.json({ok:false,error:"Kullanıcı oturumu gerekli."},{status:401}); await ensureProductivityTables(env); const rows=await env.DB.prepare("SELECT id,to_address,subject,body,status,created_at FROM email_drafts WHERE user_id=? ORDER BY created_at DESC LIMIT 100").bind(uid).all(); return Response.json({ok:true,drafts:rows.results||[]});
    }
    if (request.method === "POST" && url.pathname === "/api/automations") {
      const isOwner=await verifyOwnerSession(request,env),body=await request.json(),uid=isOwner?"owner":await getAuthenticatedUserId(request,env),runAt=String(body.runAt||""); if(!uid||!body.title||!body.prompt||Number.isNaN(Date.parse(runAt)))return Response.json({ok:false,error:"title, prompt ve geçerli runAt gerekli; kullanıcı oturumu gerekli."},{status:400}); await ensureProductivityTables(env);
      const result=await env.DB.prepare("INSERT INTO automations (user_id,title,prompt,run_at,status) VALUES (?,?,?,?,?)").bind(uid,String(body.title).slice(0,300),String(body.prompt).slice(0,8000),new Date(runAt).toISOString(),"pending").run(); return Response.json({ok:true,automation:{id:result.meta.last_row_id,title:String(body.title).slice(0,300),runAt:new Date(runAt).toISOString(),status:"pending"}});
    }
    if (request.method === "GET" && url.pathname === "/api/automations") {
      const isOwner=await verifyOwnerSession(request,env),uid=isOwner?"owner":await getAuthenticatedUserId(request,env); if(!uid)return Response.json({ok:false,error:"Kullanıcı oturumu gerekli."},{status:401}); await ensureProductivityTables(env); const rows=await env.DB.prepare("SELECT id,title,prompt,run_at,status,last_error,created_at FROM automations WHERE user_id=? ORDER BY run_at ASC LIMIT 100").bind(uid).all(); return Response.json({ok:true,automations:rows.results||[]});
    }
    if (request.method === "DELETE" && url.pathname === "/api/automations") {
      const isOwner=await verifyOwnerSession(request,env),uid=isOwner?"owner":await getAuthenticatedUserId(request,env),id=Number(url.searchParams.get("id")); if(!uid||!Number.isInteger(id))return Response.json({ok:false,error:"id ve kullanıcı oturumu gerekli."},{status:400}); await ensureProductivityTables(env); await env.DB.prepare("DELETE FROM automations WHERE id=? AND user_id=?").bind(id,uid).run(); return Response.json({ok:true});
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
        ownerAuth: !!env.OWNER_AUTH_TOKEN,
        aiProvider: env.AI?.info ? env.AI.info() : { mode: "cloud", cloud: !!env.AI, local: false, fallback: false }
      });
    }

    if (request.method === "POST" && url.pathname === "/api/audio/transcribe") {
      try {
        const isOwner = await verifyOwnerSession(request, env);
        const authenticatedUserId = isOwner ? "owner" : await getAuthenticatedUserId(request, env);
        if (!authenticatedUserId) return Response.json({ error: "Kullanıcı oturumu gerekli." }, { status: 401 });
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
        const authenticatedUserId = isOwner ? "owner" : await getAuthenticatedUserId(request, env);
        if (!authenticatedUserId) return Response.json({ ok: false, error: "Kullanıcı oturumu gerekli." }, { status: 401 });
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
        const authenticatedUserId = isOwner ? "owner" : await getAuthenticatedUserId(request, env);
        if (!authenticatedUserId) return Response.json({ ok: false, error: "Kullanıcı oturumu gerekli." }, { status: 401 });
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
        const userId = isOwner ? "owner" : await getAuthenticatedUserId(request, env);
        if (!userId) return Response.json({ ok: false, error: "Kullanıcı oturumu gerekli." }, { status: 401 });
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
      const isOwner = await verifyOwnerSession(request, env);
      const authenticatedUserId = isOwner ? "owner" : await getAuthenticatedUserId(request, env);
      if (!authenticatedUserId) return Response.json({ ok: false, error: "Kullanıcı oturumu gerekli." }, { status: 401 });
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
        const authenticatedUserId = isOwner ? "owner" : await getAuthenticatedUserId(request, env);
        if (!authenticatedUserId) return Response.json({ error: "Kullanıcı oturumu gerekli." }, { status: 401 });
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
      const authenticatedUserId = isOwner ? "owner" : await getAuthenticatedUserId(request, env);
      if (!authenticatedUserId) return Response.json({ ok: false, error: "Kullanıcı oturumu gerekli." }, { status: 401 });
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
    env = withAIProvider(env);
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
