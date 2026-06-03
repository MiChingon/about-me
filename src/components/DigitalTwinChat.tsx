import { FormEvent, useEffect, useRef, useState } from 'react';
import { Bot, Loader2, MessageCircle, RotateCcw, Send, X } from 'lucide-react';
import { profile } from '../data/profile';
import { useDigitalTwinChat } from '../hooks/useDigitalTwinChat';

const SUGGESTIONS = [
  'What is your React experience?',
  'Tell me about your role at 3Pillar Global.',
  'What technologies do you use day to day?',
];

export function DigitalTwinChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const { messages, isLoading, error, sendMessage, clearChat } = useDigitalTwinChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [open, messages, isLoading]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput('');
    await sendMessage(text);
  };

  return (
    <>
      <section id="digital-twin" className="section pb-8 pt-0 sm:pb-12">
        <div className="card flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="section-eyebrow mb-2">
              <Bot size={14} />
              Digital Twin
            </p>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl">
              Chat with {profile.shortName}&apos;s AI career assistant
            </h2>
            <p className="mt-2 max-w-xl text-sm text-slate-600 dark:text-slate-400">
              Powered by OpenRouter. Answers are grounded in this site&apos;s career profile — experience,
              skills, and background.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-ink-950 transition hover:bg-accent-soft"
          >
            <MessageCircle size={16} />
            Open chat
          </button>
        </div>
      </section>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center">
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm dark:bg-black/60"
            aria-label="Close chat"
            onClick={() => setOpen(false)}
          />

          <div
            role="dialog"
            aria-labelledby="digital-twin-title"
            className="relative flex h-[min(640px,90vh)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-ink-900"
          >
            <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-white/10">
              <div className="flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/10 text-cyan-700 ring-1 ring-accent/30 dark:text-accent">
                  <Bot size={20} />
                </span>
                <div>
                  <h3 id="digital-twin-title" className="text-sm font-semibold text-slate-900 dark:text-white">
                    Digital Twin
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{profile.shortName} · career Q&amp;A</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={clearChat}
                  className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label="Reset conversation"
                  title="Reset conversation"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label="Close chat"
                >
                  <X size={18} />
                </button>
              </div>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
              {messages.map((msg, i) => (
                <div
                  key={`${msg.role}-${i}`}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-accent text-ink-950'
                        : 'border border-slate-200 bg-slate-50 text-slate-700 dark:border-white/10 dark:bg-ink-800 dark:text-slate-200'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 dark:border-white/10 dark:bg-ink-800 dark:text-slate-400">
                    <Loader2 size={16} className="animate-spin" />
                    Thinking…
                  </div>
                </div>
              )}

              {error && (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-950/40 dark:text-red-300">
                  {error}
                </p>
              )}

              <div ref={bottomRef} />
            </div>

            {messages.length <= 1 && !isLoading && (
              <div className="flex flex-wrap gap-2 border-t border-slate-100 px-4 py-3 dark:border-white/5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => sendMessage(s)}
                    className="chip text-left transition hover:border-accent/40 hover:text-cyan-700 dark:hover:text-accent"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={onSubmit}
              className="flex items-end gap-2 border-t border-slate-200 p-4 dark:border-white/10"
            >
              <textarea
                ref={inputRef}
                rows={2}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void onSubmit(e);
                  }
                }}
                placeholder="Ask about my career…"
                disabled={isLoading}
                className="min-h-[44px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none ring-accent/0 transition focus:border-accent/50 focus:ring-2 focus:ring-accent/20 disabled:opacity-60 dark:border-white/10 dark:bg-ink-800 dark:text-white"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-ink-950 transition hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-3 text-sm font-semibold text-ink-950 shadow-lg transition hover:bg-accent-soft sm:bottom-8 sm:right-8"
          aria-label="Open Digital Twin chat"
        >
          <MessageCircle size={18} />
          <span className="hidden sm:inline">Digital Twin</span>
        </button>
      )}
    </>
  );
}
