import { loadEnv } from 'vite';
import { describe, expect, it } from 'vitest';
import { completeDigitalTwinChat } from './openrouterChat';

function isFreeProviderOutage(error: string): boolean {
  return error.includes('503') && error.toLowerCase().includes('no healthy upstream');
}

describe('completeDigitalTwinChat (integration)', () => {
  it('returns a career-grounded reply from OpenRouter', async () => {
    const env = loadEnv('test', process.cwd(), '');
    const apiKey = env.OPENROUTER_API_KEY;
    expect(apiKey, 'OPENROUTER_API_KEY must be set in .env for integration tests').toBeTruthy();

    const result = await completeDigitalTwinChat(apiKey!, [
      { role: 'user', content: 'How many years of React experience do you have? One short sentence.' },
    ]);

    if ('error' in result) {
      if (isFreeProviderOutage(result.error)) {
        console.warn(
          'Skipping live assertion: openai/gpt-oss-120b:free provider is temporarily unavailable on OpenRouter.',
        );
        return;
      }
      expect.fail(result.error);
    }

    expect(result.message.length).toBeGreaterThan(10);
    expect(result.message.toLowerCase()).toMatch(/react|year|front/);
  }, 90_000);
});
