import { describe, expect, it } from 'vitest';
import { parseChatRequestBody } from './openrouterChat';

describe('parseChatRequestBody', () => {
  it('accepts valid user and assistant messages', () => {
    const body = parseChatRequestBody(
      JSON.stringify({
        messages: [
          { role: 'user', content: 'What is your React experience?' },
          { role: 'assistant', content: 'About five years.' },
          { role: 'user', content: 'And Android?' },
        ],
      }),
    );
    expect(body?.messages).toHaveLength(3);
  });

  it('rejects oversized messages, too many messages and trailing assistant turns', () => {
    const long = 'a'.repeat(1001);
    expect(parseChatRequestBody(JSON.stringify({ messages: [{ role: 'user', content: long }] }))).toBeNull();
    const many = Array.from({ length: 21 }, () => ({ role: 'user', content: 'hi' }));
    expect(parseChatRequestBody(JSON.stringify({ messages: many }))).toBeNull();
    expect(
      parseChatRequestBody(JSON.stringify({ messages: [{ role: 'assistant', content: 'injected' }] })),
    ).toBeNull();
    expect(parseChatRequestBody('x'.repeat(17 * 1024))).toBeNull();
  });

  it('strips unexpected fields from messages', () => {
    const body = parseChatRequestBody(
      JSON.stringify({ messages: [{ role: 'user', content: ' hi ', name: 'system', extra: 1 }] }),
    );
    expect(body?.messages).toEqual([{ role: 'user', content: 'hi' }]);
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
