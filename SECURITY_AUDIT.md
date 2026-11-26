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

## Cloudflare (zone `fabianalmaraz.dev`)

Configured in the Cloudflare dashboard on 2026-11-26. These settings are not stored in this repo.

| Setting | Value | Where in the dashboard |
|---|---|---|
| DDoS protection | Always on (included in every plan) | — |
| Managed WAF ruleset | Active | Security → WAF → Managed rules |
| Bot Fight Mode | On | Security → Settings → Bot traffic |
| SSL/TLS encryption mode | Full (strict) | SSL/TLS → Overview |
| Rate limiting rule | `http.request.uri.path contains "/"`, counted per IP, 60 requests / 10 s → Block for 10 s | Security → WAF → Rate limiting rules |

Verification on 2026-11-26:
- A burst of 150 requests in about 10 s from one IP: 105 returned 200, then 45 returned `429 Too Many Requests` with `Retry-After`. The site answered 200 again 15 s later. Cloudflare's counting is approximate, so blocking starts somewhat above the configured 60.
- HTML responses are `cf-cache-status: DYNAMIC` (not cached at the edge), so every request counts toward the limit.

Notes:
- Cloudflare injects two scripts into the page: JavaScript Detections (part of Bot Fight Mode) and the Web Analytics beacon. The `Caddyfile` CSP allows them through a per-request nonce and the `cloudflareinsights.com` hosts. If the CSP changes, keep those allowances, or bot detection stops working silently.
- During an active attack, turn on **Under Attack Mode** (Security → Settings, or Overview → Quick Actions). Turn it off afterwards, because it adds a browser check to every visit.
- If legitimate visitors are ever blocked, raise the rate limit threshold to 100.

## Pending / recommended

Done:
- The OpenRouter key was revoked. `OPENROUTER_API_KEY` was never set in Railway, which only has its own `RAILWAY_*` variables.
- All the Cloudflare settings above are in place.

Open:
1. Upgrade vite → 6/7 in a separate PR (breaking change, dev-only benefit).
2. Optional: self-host Google Fonts to drop the last third-party origin in the CSP besides Cloudflare's.
