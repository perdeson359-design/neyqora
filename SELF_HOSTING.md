# NEYQORA Self-Hosting

This file defines the self-host transition contract.

- Keep OWNER_AUTH_TOKEN only in the server secret store.
- Set NEYQORA_SELF_HOSTED=1 on the private deployment.
- Owner mode bypasses normal application message/history limits.
- Keep SSRF, eval/exec, safe-path, test and infrastructure safety controls.
- Preserve /api/health, /api/chat, /api/project, /api/search and /api/auth/owner.
- The current application is a Cloudflare Worker and needs an adapter for AI/D1 before running as a normal Node server.
