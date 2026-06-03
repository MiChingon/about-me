import {
  buildDigitalTwinSystemPrompt,
  DIGITAL_TWIN_MODEL,
  type ChatMessage,
} from '../src/lib/digitalTwinContext';

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
  try {
    const parsed = JSON.parse(raw) as ChatRequestBody;
    if (!Array.isArray(parsed.messages)) return null;
    const valid = parsed.messages.every(
      (m) =>
        m &&
        typeof m === 'object' &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string' &&
        m.content.trim().length > 0,
    );
    if (!valid || parsed.messages.length === 0) return null;
    return parsed;
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
    messages: [{ role: 'system', content: systemPrompt }, ...userMessages],
  });

  let lastError = 'OpenRouter request failed.';

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'Fabian Almaraz Digital Twin',
      },
      body: requestBody,
    });

    if (!response.ok) {
      const detail = await response.text();
      lastError = `OpenRouter request failed (${response.status}): ${detail.slice(0, 280)}`;
      if (isRetryableStatus(response.status) && attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }
      return { error: lastError };
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
      error?: { message?: string };
    };

    if (data.error?.message) {
      lastError = data.error.message;
      if (attempt < MAX_ATTEMPTS) {
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }
      return { error: lastError };
    }

    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return { error: 'No response content from the model.' };
    }

    return { message: content };
  }

  return { error: lastError };
}
