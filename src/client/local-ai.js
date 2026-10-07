const KEY = "neyqora_local_ai_url";

export function getLocalAIUrl() {
  try {
    return String(localStorage.getItem(KEY) || "").trim().replace(/\/$/, "");
  } catch {
    return "";
  }
}

export function setLocalAIUrl(url) {
  const value = String(url || "").trim().replace(/\/$/, "");
  if (!value) {
    try { localStorage.removeItem(KEY); } catch {}
    return "";
  }
  try { localStorage.setItem(KEY, value); } catch {}
  return value;
}

export async function localChat(message, history = []) {
  const baseUrl = getLocalAIUrl();
  if (!baseUrl) throw new Error("Yerel AI adresi ayarlanmamış.");
  const response = await fetch(baseUrl + "/chat/completions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      model: "local",
      messages: [
        { role: "system", content: "Sen NEYQORA'nın cihaz üzerindeki yerel yapay zekâsısın. İnternet yokken yardımcı ol. Bilmediğin bilgiyi uydurma." },
        ...history.slice(-10),
        { role: "user", content: String(message || "") }
      ],
      stream: false
    })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Yerel AI yanıt vermedi.");
  return data?.choices?.[0]?.message?.content || data?.response || "";
}

export const __test = { getLocalAIUrl, setLocalAIUrl };
