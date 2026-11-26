# Security audit — about-me (2026-11-26)

## Current attack surface

Static React SPA on Railway (Railpack → Caddy, `Caddyfile` at the repo root), behind Cloudflare.
There is **no server-side code and no API**. The Digital Twin chat (OpenRouter) was removed, and
`/api/*` returns 404.

## Findings and status

| # | Risk | Severity | Status |
|---|------|----------|--------|
| 1 | Digital Twin endpoint `/api/chat`. Problems found: no rate limit, unbounded body, no message limits, no upstream timeout, upstream errors leaked to visitors, no Origin check, open to prompt injection. | High | **Removed.** These were hardened first (PR #1), then the chat was removed entirely. It never worked in production because the site is served statically. The code is in git history (`cd456f3`) if it is ever revived. |
| 2 | Production (Caddy) only sent `nosniff`: no CSP, so clickjacking was possible. | Medium | **Fixed**: CSP with no inline scripts except Cloudflare's (per-request nonce), `frame-ancestors 'none'`, HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy, COOP. The `Server` header is removed. Verified live on https://fabianalmaraz.dev with a clean console. |
| 3 | Inline theme script would require `'unsafe-inline'`. | Low | **Fixed**: moved to `public/theme-init.js`. |
| 4 | Dependency advisories (13). | Mixed | `npm audit fix` applied and `vitest` removed → 2 left (vite/esbuild). Both affect only the local dev server, which never runs in production. Fixing them requires the vite 6+ major. |
| 5 | Was production running `vite preview`/`vite dev`? | — | **No**: Railpack serves `dist/` statically. |

Verified OK:
- No `.env` was ever committed (checked the tree and the full history).
- `.gitignore` covers `.env*`.
- Sensitive paths (`/.env`, `/.git/config`, `/package.json`) only return `index.html`.
- `../` traversal is blocked.
- HTTP redirects to HTTPS.
- Runtime dependencies (react, lucide-react) have no advisories.

## Pending / recommended

1. **OpenRouter**: revoke the key used by the old chat (it is no longer needed), and delete
   `OPENROUTER_API_KEY` from Railway Variables and from any local `.env`.
2. **Cloudflare**: make sure the WAF managed rules and Bot Fight Mode are on. Consider a rate-limiting
   rule. Cloudflare is the real protection against volumetric DDoS.
3. Upgrade vite → 6/7 in a separate PR (breaking change, dev-only benefit).
4. Optional: self-host Google Fonts to drop the last third-party origin in the CSP besides Cloudflare's.
