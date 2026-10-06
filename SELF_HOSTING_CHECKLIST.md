# NEYQORA Self-Host Checklist

## Preparation

- [x] OWNER_AUTH_TOKEN secret-store contract defined
- [x] NEYQORA_SELF_HOSTED=1 contract defined
- [x] AI adapter implemented
- [x] Database adapter implemented
- [x] Node HTTP adapter implemented
- [x] Docker runtime prepared
- [x] Self-host contract tests added

## Cutover verification — do not mark before the real server

- [ ] Server secret configured
- [ ] /api/health is OK
- [ ] Owner login is OK
- [ ] Owner is not subject to normal user message/history limits
- [ ] Project generation is OK
- [ ] Generated Python safety and tests are OK
- [ ] SSRF protection remains enabled
- [ ] eval/exec protection remains enabled
- [ ] CPU/RAM/disk/network resources are monitored by the server
- [ ] Production cutover approved

**Status:** Preparation complete; production/self-host cutover has not been performed.
