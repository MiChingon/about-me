import { useCallback, useRef, useState } from 'react';
import type { ChatMessage } from '../lib/digitalTwinContext';

const GREETING: ChatMessage = {
  role: 'assistant',
  content:
    "Hi! I'm Fabian's Digital Twin. Ask me about my career, skills, experience at 3Pillar, or what I'm looking for next.",
};

type ChatState = {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
};

/** Skip the local-only greeting; the server injects the system prompt. */
function messagesForApi(messages: ChatMessage[]): ChatMessage[] {
  return messages.slice(1);
}

export function useDigitalTwinChat() {
  const [state, setState] = useState<ChatState>({
    messages: [GREETING],
    isLoading: false,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    const apiMessages = [...messagesForApi(state.messages), userMessage];

    setState((prev) => ({
      messages: [...prev.messages, userMessage],
      isLoading: true,
      error: null,
    }));

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
        signal: controller.signal,
      });

      const data = (await response.json()) as { message?: string; error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? `Request failed (${response.status})`);
      }

      if (!data.message) {
        throw new Error('Empty response from Digital Twin.');
      }

      setState((prev) => ({
        messages: [...prev.messages, { role: 'assistant', content: data.message! }],
        isLoading: false,
        error: null,
      }));
    } catch (err) {
      if (controller.signal.aborted) return;
      const message = err instanceof Error ? err.message : 'Something went wrong.';
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
    }
  }, [state.messages]);

  const clearChat = useCallback(() => {
    abortRef.current?.abort();
    setState({ messages: [GREETING], isLoading: false, error: null });
  }, []);

  return {
    messages: state.messages,
    isLoading: state.isLoading,
    error: state.error,
    sendMessage,
    clearChat,
  };
}
