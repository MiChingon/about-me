/**
 * Integration test: POST /api/chat against the Vite dev server.
 * Start the server first: npm run dev
 */
const BASE = process.env.CHAT_API_BASE ?? 'http://localhost:5173';

const payload = {
  messages: [
    {
      role: 'user',
      content: 'How many years of React experience do you have? Reply in one sentence.',
    },
  ],
};

const res = await fetch(`${BASE}/api/chat`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});

const data = await res.json();

if (!res.ok) {
  const detail = data.error ?? '';
  if (res.status === 502 && detail.includes('no healthy upstream')) {
    console.warn(
      'Chat API wiring OK, but openai/gpt-oss-120b:free provider is temporarily down on OpenRouter. Retry later.',
    );
    process.exit(0);
  }
  console.error('Chat API failed:', res.status, data);
  process.exit(1);
}

if (!data.message || typeof data.message !== 'string') {
  console.error('Unexpected response shape:', data);
  process.exit(1);
}

console.log('Chat API OK');
console.log('Reply:', data.message.slice(0, 280) + (data.message.length > 280 ? '…' : ''));
