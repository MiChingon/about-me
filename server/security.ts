/**
 * Security controls for the public /api/chat endpoint.
 * Everything is in-memory and per-process: good enough for a single-instance
 * personal site; use a shared store (Redis/KV) if you scale horizontally.
 */

export const LIMITS = {
  /** Max raw request body size in bytes. */
  maxBodyBytes: 16 * 1024,
  /** Max messages in a conversation sent to the API. */
  maxMessages: 20,
  /** Max characters per single message. */
  maxMessageChars: 1000,
  /** Max characters across the whole conversation. */
  maxTotalChars: 8000,
  /** Requests per IP per minute. */
  perIpPerMinute: Number(process.env.CHAT_RATE_PER_MINUTE ?? 6),
  /** Requests per IP per day. */
  perIpPerDay: Number(process.env.CHAT_RATE_PER_DAY ?? 60),
  /** Global requests per day (protects the OpenRouter key quota). */
  globalPerDay: Number(process.env.CHAT_GLOBAL_PER_DAY ?? 500),
  /** Max concurrent upstream requests. */
  maxConcurrent: Number(process.env.CHAT_MAX_CONCURRENT ?? 4),
  /** Upstream timeout in ms. */
  upstreamTimeoutMs: 20_000,
  /** Max tokens the model may generate per reply. */
  maxOutputTokens: 600,
} as const;

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

type Window = { count: number; resetAt: number };

class FixedWindowLimiter {
  private buckets = new Map<string, Window>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
  ) {}

  /** Returns true if allowed (and consumes one unit). */
  take(key: string, now = Date.now()): boolean {
    const w = this.buckets.get(key);
    if (!w || w.resetAt <= now) {
      this.buckets.set(key, { count: 1, resetAt: now + this.windowMs });
      this.gc(now);
      return true;
    }
    if (w.count >= this.limit) return false;
    w.count += 1;
    return true;
  }

  private gc(now: number) {
    if (this.buckets.size < 10_000) return;
    for (const [k, w] of this.buckets) if (w.resetAt <= now) this.buckets.delete(k);
  }
}

const perMinute = new FixedWindowLimiter(LIMITS.perIpPerMinute, MINUTE);
const perDay = new FixedWindowLimiter(LIMITS.perIpPerDay, DAY);
const global = new FixedWindowLimiter(LIMITS.globalPerDay, DAY);
let inFlight = 0;

export type RateDecision = { ok: true } | { ok: false; reason: string };

export function checkRateLimit(ip: string): RateDecision {
  if (!perMinute.take(ip)) return { ok: false, reason: 'Too many requests. Please wait a minute.' };
  if (!perDay.take(ip)) return { ok: false, reason: 'Daily chat limit reached. Try again tomorrow.' };
  if (!global.take('global')) return { ok: false, reason: 'The chat is temporarily unavailable.' };
  return { ok: true };
}

export function acquireSlot(): boolean {
  if (inFlight >= LIMITS.maxConcurrent) return false;
  inFlight += 1;
  return true;
}

export function releaseSlot() {
  inFlight = Math.max(0, inFlight - 1);
}

type HeaderBag = Record<string, string | string[] | undefined>;

/** Client IP. Only trusts X-Forwarded-For when TRUST_PROXY=1 (i.e. behind your own proxy/CDN). */
export function clientIp(headers: HeaderBag, remoteAddress: string | undefined): string {
  if (process.env.TRUST_PROXY === '1') {
    const xff = headers['x-forwarded-for'];
    const first = (Array.isArray(xff) ? xff[0] : xff)?.split(',')[0]?.trim();
    if (first) return first;
  }
  return remoteAddress ?? 'unknown';
}

/**
 * Same-origin check. Browsers always send Origin on cross-origin POSTs, so a
 * foreign site cannot drive the endpoint from a visitor's browser.
 * Extra origins can be allowed with ALLOWED_ORIGINS="https://a.com,https://b.com".
 */
export function isOriginAllowed(headers: HeaderBag): boolean {
  const origin = headers.origin;
  if (!origin || Array.isArray(origin)) return true; // non-browser clients; rate limits still apply
  const allowed = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  if (allowed.includes(origin)) return true;
  try {
    const host = headers['x-forwarded-host'] ?? headers.host;
    return typeof host === 'string' && new URL(origin).host === host;
  } catch {
    return false;
  }
}

/** Headers applied to every response from the preview/production server. */
export const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': [
    "default-src 'self'",
    // Production (Caddyfile) also allows Cloudflare's injected scripts via a per-request nonce.
    "script-src 'self' https://static.cloudflareinsights.com",
    "style-src 'self' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data:",
    "connect-src 'self' https://cloudflareinsights.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    'upgrade-insecure-requests',
  ].join('; '),
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

/** Same as SECURITY_HEADERS minus CSP (Vite dev injects inline scripts). */
export const DEV_SECURITY_HEADERS: Record<string, string> = Object.fromEntries(
  Object.entries(SECURITY_HEADERS).filter(
    ([k]) => k !== 'Content-Security-Policy' && k !== 'Strict-Transport-Security',
  ),
);
