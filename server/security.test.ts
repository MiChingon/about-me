import { describe, expect, it } from 'vitest';
import { checkRateLimit, isOriginAllowed, LIMITS } from './security';

describe('checkRateLimit', () => {
  it('blocks an IP after the per-minute limit', () => {
    const ip = `test-${Math.random()}`;
    for (let i = 0; i < LIMITS.perIpPerMinute; i++) expect(checkRateLimit(ip).ok).toBe(true);
    expect(checkRateLimit(ip).ok).toBe(false);
  });
});

describe('isOriginAllowed', () => {
  it('allows same-origin and missing Origin, rejects foreign origins', () => {
    expect(isOriginAllowed({ origin: 'https://me.dev', host: 'me.dev' })).toBe(true);
    expect(isOriginAllowed({ host: 'me.dev' })).toBe(true);
    expect(isOriginAllowed({ origin: 'https://evil.com', host: 'me.dev' })).toBe(false);
    expect(isOriginAllowed({ origin: 'not a url', host: 'me.dev' })).toBe(false);
  });
});
