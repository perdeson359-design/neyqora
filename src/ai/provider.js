const DEFAULT_TIMEOUT_MS = 30000;

function normalizeBaseUrl(value) {
  return String(value || "").trim().replace(/\/$/, "");
}

async function fetchWithTimeout(url, options, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const signal = AbortSignal.timeout(Math.max(1000, Number(timeoutMs) || DEFAULT_TIMEOUT_MS));
  return fetch(url, { ...options, signal });
}

async function runOpenAICompatible(baseUrl, apiKey, model, options = {}) {
  const response = await fetchWithTimeout(baseUrl + "/chat/completions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(apiKey ? { authorization: "Bearer " + apiKey } : {})
    },
    body: JSON.stringify({
      model,
      messages: options.messages || [],
      max_tokens: options.max_tokens,
      temperature: options.temperature,
      stream: false
    })
  }, options.timeoutMs);

  const text = await response.text();
  if (!response.ok) {
    throw new Error("Local AI provider error " + response.status + ": " + text.slice(0, 500));
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("Local AI provider JSON yanıtı geçersiz.");
  }

  return {
    response: data?.choices?.[0]?.message?.content || data?.response || "",
    raw: data
  };
}

export function createAIProvider(env) {
  const cloud = env?.AI;
  const localBaseUrl = normalizeBaseUrl(env?.LOCAL_AI_BASE_URL);
  const localApiKey = String(env?.LOCAL_AI_API_KEY || "");
  const localModel = String(env?.LOCAL_AI_MODEL || "");
  const mode = String(env?.AI_PROVIDER_MODE || "auto").toLowerCase();
  const timeoutMs = Number(env?.LOCAL_AI_TIMEOUT_MS || DEFAULT_TIMEOUT_MS);

  async function run(model, options = {}) {
    const requestedModel = String(model || localModel || "@cf/meta/llama-3.2-3b-instruct");
    const localModelName = localModel || requestedModel;

    if (mode === "local") {
      if (!localBaseUrl) throw new Error("AI_PROVIDER_MODE=local fakat LOCAL_AI_BASE_URL yapılandırılmamış.");
      return { ...(await runOpenAICompatible(localBaseUrl, localApiKey, localModelName, { ...options, timeoutMs })), provider: "local", model: localModelName };
    }

    if (mode === "cloud") {
      if (!cloud?.run) throw new Error("Cloud AI binding (env.AI) yapılandırılmamış.");
      return { ...(await cloud.run(requestedModel, options)), provider: "cloud", model: requestedModel };
    }

    if (cloud?.run) {
      try {
        return { ...(await cloud.run(requestedModel, options)), provider: "cloud", model: requestedModel };
      } catch (cloudError) {
        if (!localBaseUrl) throw cloudError;
        try {
          return { ...(await runOpenAICompatible(localBaseUrl, localApiKey, localModelName, { ...options, timeoutMs })), provider: "local", model: localModelName, fallbackFrom: "cloud" };
        } catch (localError) {
          throw new Error("Cloud AI başarısız: " + (cloudError?.message || "bilinmeyen hata") + " | Local AI fallback başarısız: " + (localError?.message || "bilinmeyen hata"));
        }
      }
    }

    if (localBaseUrl) {
      return { ...(await runOpenAICompatible(localBaseUrl, localApiKey, localModelName, { ...options, timeoutMs })), provider: "local", model: localModelName };
    }

    throw new Error("Hiçbir AI provider yapılandırılmamış.");
  }

  function info() {
    const cloudAvailable = !!cloud?.run;
    const localAvailable = !!localBaseUrl;
    return {
      mode,
      cloud: cloudAvailable,
      local: localAvailable,
      fallback: mode === "auto" && cloudAvailable && localAvailable,
      primary: mode === "local" ? (localAvailable ? "local" : "unavailable") : "cloud",
      localModel: localAvailable ? localModelNameOrDefault(localModel) : null
    };
  }

  return { run, info };
}

function localModelNameOrDefault(model) {
  return String(model || "openai-compatible-local");
}

export function withAIProvider(env) {
  return { ...env, AI: createAIProvider(env) };
}
