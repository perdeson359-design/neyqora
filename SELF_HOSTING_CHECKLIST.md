# NEYQORA Self-Host Checklist

- [ ] OWNER_AUTH_TOKEN is configured only in the server secret store
- [ ] NEYQORA_SELF_HOSTED=1
- [ ] AI adapter is ready
- [ ] Database adapter is ready
- [ ] /api/health is OK
- [ ] Owner login is OK
- [ ] Owner is not subject to normal user message/history limits
- [ ] Project generation is OK
- [ ] Generated Python safety and tests are OK
- [ ] SSRF protection remains enabled
- [ ] eval/exec protection remains enabled
- [ ] CPU/RAM/disk/network resources are monitored by the server
