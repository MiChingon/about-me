import {
  buildDigitalTwinSystemPrompt,
  DIGITAL_TWIN_MODEL,
  type ChatMessage,
} from '../src/lib/digitalTwinContext';
import { LIMITS } from './security';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export type ChatRequestBody = {
  messages: ChatMessage[];
};

export type ChatSuccessResponse = {
  message: string;
};

export type ChatErrorResponse = {
  error: string;
};

export function parseChatRequestBody(raw: string): ChatRequestBody | null {
  if (raw.length > LIMITS.maxBodyBytes) return null;
  try {
    const parsed = JSON.parse(raw) as { messages?: unknown };
    if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.messages)) return null;
    const list = parsed.messages as unknown[];
    if (list.length === 0 || list.length > LIMITS.maxMessages) return null;

    let total = 0;
    const messages: ChatMessage[] = [];
    for (const m of list) {
      if (!m || typeof m !== 'object') return null;
      const { role, content } = m as { role?: unknown; content?: unknown };
      if (role !== 'user' && role !== 'assistant') return null;
      if (typeof content !== 'string') return null;
      const trimmed = content.trim();
      if (trimmed.length === 0 || trimmed.length > LIMITS.maxMessageChars) return null;
      total += trimmed.length;
      // Rebuild the object so no extra fields (e.g. "name", "tool_calls") reach the model.
      messages.push({ role, content: trimmed });
    }
    if (total > LIMITS.maxTotalChars) return null;
    // Conversation must end with the visitor's turn.
    if (messages[messages.length - 1].role !== 'user') return null;
    return { messages };
  } catch {
    return null;
  }
}

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 800;

function isRetryableStatus(status: number): boolean {
  return status === 429 || status === 502 || status === 503;
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function completeDigitalTwinChat(
  apiKey: string,
  userMessages: ChatMessage[],
): Promise<ChatSuccessResponse | ChatErrorResponse> {
  const systemPrompt = buildDigitalTwinSystemPrompt();
  const requestBody = JSON.stringify({
    model: DIGITAL_TWIN_MODEL,
    max_tokens: LIMITS.maxOutputTokens,
    messages: [{ role: 'system', content: systemPrompt }, ...userMessages],
  });

  // Details are logged server-side only; the client gets a generic message.
  const PUBLIC_ERROR = 'The Digital Twin is unavailable right now. Please try again later.';

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    let response: Response;
    try {
      response = await fetch(OPENROUTER_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.SITE_URL ?? 'http://localhost:5173',
          'X-Title': 'Fabian Almaraz Digital Twin',
        },
        body: requestBody,
        signal: AbortSignal.timeout(LIMITS.upstreamTimeoutMs),
      });
    } catch (err) {
      console.error('[digital-twin] upstream fetch failed:', (err as Error).name);
      return { error: PUBLIC_ERROR };
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error(`[digital-twin] upstream ${response.status}: ${detail.slice(0, 280)}`);
      if (isRetryableStatus(response.status) && attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }
      return { error: PUBLIC_ERROR };
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
      error?: { message?: string };
    };

    if (data.error?.message) {
      console.error('[digital-twin] upstream error:', data.error.message.slice(0, 280));
      if (attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }
      return { error: PUBLIC_ERROR };
    }

    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return { error: PUBLIC_ERROR };
    }

    return { message: content.slice(0, 4000) };
  }

  return { error: PUBLIC_ERROR };
}
