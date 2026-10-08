# Changelog

**Author:** Abi Manyu (BlueBarry)

## v1.0.0
- Public release catalog.
- Release detail page with ABI + changelog + download CTA.
- Admin auth (HMAC session cookie).
- Admin CRUD: create, edit, delete releases.
- SQLite persistence (Railway volume).
- Zero build step — plain Node HTTP server.
- GitHub Actions: install + smoke test on push/PR, deploy to Railway on `v*` tag.
