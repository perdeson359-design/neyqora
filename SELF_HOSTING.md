# NEYQORA Self-Hosting

This document describes the supported Node.js self-host runtime.

## Required security configuration

- Keep `OWNER_AUTH_TOKEN` and `USER_SESSION_SECRET` in the server's secret store, never in Git or client-side configuration.
- Both secrets must be random, at least 32 characters, and different from each other. The server refuses to start if either is missing or weak.
- Set `NEYQORA_SELF_HOSTED=1` and use a persistent volume for `NEYQORA_DB_PATH`.
- The HTTP adapter caps request bodies at 16 MiB while streaming and creates the database directory with restrictive permissions.
- Forwarded client headers are not trusted for rate limiting. The adapter uses the socket peer address. Behind a reverse proxy, configure network-level rate limiting at the trusted proxy because all requests may otherwise share the proxy address.
- Keep Owner endpoints private where possible. Owner mode intentionally bypasses some normal message/history limits.

## Outbound request safety

Direct URL fetches reject local/private/reserved IP literals, non-standard ports and redirects, and cap response bytes. Hostname checks alone cannot completely prevent DNS rebinding. For strict SSRF protection, route outbound web fetches through an egress proxy that resolves and validates DNS/IP destinations and blocks private networks; enforce matching outbound firewall rules.

Generated project code is tested in a separate job without repository-write credentials. Repository writes occur only in a later job after test success and artifact path validation. Keep these jobs separate and do not pass secrets into generated-code execution.

## AI provider options

- `AI_PROVIDER_MODE=auto`: use cloud AI when configured and fall back to local AI on cloud failure.
- `AI_PROVIDER_MODE=cloud`: cloud provider only; requires `NEYQORA_AI_BASE_URL` and `NEYQORA_AI_API_KEY`.
- `AI_PROVIDER_MODE=local`: OpenAI-compatible local provider only; requires `LOCAL_AI_BASE_URL`.
- `LOCAL_AI_BASE_URL`: for example, `http://127.0.0.1:11434/v1`.
- `LOCAL_AI_API_KEY`: optional local provider key.
- `LOCAL_AI_MODEL`: optional local model name.
- `LOCAL_AI_TIMEOUT_MS`: local provider timeout, default 30000 ms.

In Cloudflare Workers, `env.AI` is the Workers AI binding. The Node runtime uses the configured OpenAI-compatible endpoint for cloud/local provider calls.

## Mobile / PWA

The Worker serves `/manifest.webmanifest` and `/sw.js`. The PWA shell can open offline; API responses are not cached. For offline chat, the client can be configured with an OpenAI-compatible local AI URL.
