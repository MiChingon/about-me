import { describe, expect, it } from 'vitest';
import { parseChatRequestBody } from './openrouterChat';

describe('parseChatRequestBody', () => {
  it('accepts valid user and assistant messages', () => {
    const body = parseChatRequestBody(
      JSON.stringify({
        messages: [
          { role: 'user', content: 'What is your React experience?' },
          { role: 'assistant', content: 'About five years.' },
        ],
      }),
    );
    expect(body?.messages).toHaveLength(2);
  });

  it('rejects empty message lists', () => {
    expect(parseChatRequestBody(JSON.stringify({ messages: [] }))).toBeNull();
  });

  it('rejects invalid roles or blank content', () => {
    expect(
      parseChatRequestBody(JSON.stringify({ messages: [{ role: 'system', content: 'nope' }] })),
    ).toBeNull();
    expect(
      parseChatRequestBody(JSON.stringify({ messages: [{ role: 'user', content: '   ' }] })),
    ).toBeNull();
    expect(parseChatRequestBody('not json')).toBeNull();
  });
});
