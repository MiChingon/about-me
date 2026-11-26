# Security audit — about-me (2026-11-26)

Attack surface: static React SPA + one server endpoint, `POST /api/chat`. That endpoint holds the
OpenRouter key and is served by the Vite **dev/preview server** through `plugins/digitalTwinApiPlugin.ts`.

## Findings and status

| # | Risk | Severity | Status |
|---|------|----------|--------|
| 1 | `/api/chat` had no rate limit. Anyone could script it to burn the OpenRouter quota or credits, or keep the chat down for everyone. | High | **Fixed**: 6 req/min and 60/day per IP, 500/day globally, at most 4 concurrent upstream calls (env-tunable). |
| 2 | Unbounded request body (`readBody` buffered everything), so a single huge POST could exhaust memory. | High | **Fixed**: 16 KB cap, enforced on both `Content-Length` and the actual stream. |
| 3 | No limits on number or length of messages (token-cost amplification). Extra fields were passed through to the model. | High | **Fixed**: ≤20 messages, ≤1000 chars each, ≤8000 total; objects rebuilt to `{role, content}` only; last turn must be `user`. |
| 4 | No upstream timeout, and retries ×3 could hang connections. | Medium | **Fixed**: 20 s `AbortSignal.timeout`, `max_tokens: 600`, reply capped at 4000 chars. |
| 5 | Upstream error bodies (≤280 chars) and "OPENROUTER_API_KEY is not configured" were returned to the visitor (information disclosure). | Medium | **Fixed**: generic public errors; details only in server logs. |
| 6 | Prompt injection / jailbreak: a visitor could make the twin say offensive things or promises "as Fabian" and screenshot it (reputational). | Medium | **Mitigated**: safety rules in the system prompt. Not bulletproof: LLMs can always be coaxed. |
| 7 | No security headers, so clickjacking, MIME sniffing and no CSP. | Medium | **Fixed on preview server**: CSP (no inline scripts), `frame-ancestors 'none'`, XFO, nosniff, Referrer/Permissions-Policy, COOP, HSTS. The inline theme script was moved to `/theme-init.js` so CSP can forbid inline JS. |
| 8 | No Origin check: other sites could drive the endpoint. | Low | **Fixed**: cross-origin POSTs → 403 (`ALLOWED_ORIGINS` to add more). Non-browser clients are still covered by the rate limits. |
| 9 | Dependency CVEs (13). | Mixed | `npm audit fix` applied → 6 left: vite/esbuild/vitest/tinypool, **dev-only tooling**. Fixing needs majors (vite 6+, vitest 4+). |
| 10 | Production served by `vite preview`/`vite dev`? | — | **Not the case**: Railway/Railpack with no start command serves `dist/` statically with Caddy, so Vite never runs in production. As a consequence, **`/api/chat` does not exist in production** (the chat is broken there, but the OpenRouter key is also not reachable from the internet). |
| 11 | Production (Caddy) sent only `nosniff`: no CSP, clickjacking possible. | Medium | **Fixed**: root `Caddyfile` (Railpack uses it instead of its default) with the same headers as the preview server, `/api/*` → 404, cache headers. Validated with Caddy v2.11.9 (`caddy validate`) and run locally against `dist/`: all headers present, `/health` 200, `/api/chat` 404, SPA fallback OK, `.env*` 404, `../` traversal blocked, page renders with no CSP errors. |

Verified OK: no `.env` committed (current tree and full git history), `.gitignore` covers `.env*`,
React renders chat output as text (no `dangerouslySetInnerHTML`, so no XSS from model output), and
runtime deps (react, lucide-react) have no advisories.

## Pending / recommended

1. **Deploy check**: after pushing, the Railway build log should say "Using custom Caddyfile".
   Then check `curl -I https://<your-domain>/` shows the `Content-Security-Policy` header and
   `/health` returns 200. If the deploy fails, delete `Caddyfile` to fall back to Railpack's default.
2. **Chat in production**: to enable it, add a small Node server (static `dist/` + `/api/chat` reusing
   `server/openrouterChat.ts` and `server/security.ts`) with a `start` script, and set
   `TRUST_PROXY=1` (Railway's proxy) and `OPENROUTER_API_KEY` in Railway Variables. Never use
   `vite`/`vite preview` as the production start command.
   If `OPENROUTER_API_KEY` is set in Railway Variables today, it is unused and can be removed.
3. **OpenRouter dashboard**: set a hard credit limit on the key. If you suspect the key leaked,
   rotate it now.
4. **Cloudflare (or similar)** in front: WAF, bot fight mode and DDoS protection. In-process rate
   limits do not stop volumetric DDoS.
5. Upgrade vite → 6/7 and vitest → 4+ in a separate PR (breaking changes).
6. Optional: self-host Google Fonts (removes a third-party dependency from CSP).

## Env vars added

`CHAT_RATE_PER_MINUTE`, `CHAT_RATE_PER_DAY`, `CHAT_GLOBAL_PER_DAY`, `CHAT_MAX_CONCURRENT`,
`TRUST_PROXY`, `ALLOWED_ORIGINS`, `SITE_URL`.
