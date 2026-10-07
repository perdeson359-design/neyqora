# NEYQORA Self-Hosting

This file defines the self-host transition contract.

- Keep OWNER_AUTH_TOKEN only in the server secret store.
- Set NEYQORA_SELF_HOSTED=1 on the private deployment.
- Owner mode bypasses normal application message/history limits.
- Keep SSRF, eval/exec, safe-path, test and infrastructure safety controls.
- Preserve /api/health, /api/chat, /api/project, /api/search and /api/auth/owner.
- The current application is a Cloudflare Worker and needs an adapter for AI/D1 before running as a normal Node server.

## AI provider seçenekleri

Self-host çalışma katmanı şu değişkenleri destekler:

- `AI_PROVIDER_MODE=auto`: Cloud AI varsa onu kullanır; hata olursa yerel AI'ya düşer. Cloud yoksa doğrudan local kullanır.
- `AI_PROVIDER_MODE=cloud`: yalnızca cloud provider.
- `AI_PROVIDER_MODE=local`: yalnızca OpenAI-compatible local provider.
- `LOCAL_AI_BASE_URL`: ör. `http://127.0.0.1:11434/v1`
- `LOCAL_AI_API_KEY`: gerekiyorsa yerel provider anahtarı.
- `LOCAL_AI_MODEL`: yerel model adı.
- `LOCAL_AI_TIMEOUT_MS`: yerel provider zaman aşımı.

Cloudflare Worker ortamında `env.AI` Workers AI binding'dir. Self-host ortamında yerel provider, aynı `/api/chat` sözleşmesi üzerinden kullanılabilir.

## Mobil / PWA

Ana Worker `/manifest.webmanifest` ve `/sw.js` sunar. PWA kabuğu çevrimdışı açılabilir; API istekleri cache'lenmez. İnternet yokken sohbet için istemciye bir OpenAI-compatible local AI URL'si kaydedilebilir.
