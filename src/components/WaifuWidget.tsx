"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const greetingKey: Record<string, string> = {
  pagi: "waifu.greeting.morning",
  siang: "waifu.greeting.noon",
  sore: "waifu.greeting.afternoon",
  malam: "waifu.greeting.night",
};

function getTimePart(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) return "pagi";
  if (hour >= 11 && hour < 15) return "siang";
  if (hour >= 15 && hour < 18) return "sore";
  return "malam";
}

const STORAGE_KEY = "waifu-chat";

export function WaifuWidget() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        if (Array.isArray(saved) && saved.length > 0) return saved;
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function generateGreeting() {
    setLoading(true);
    try {
      const res = await fetch(`/api/waifu?part=${getTimePart()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || t("waifu.errApi"));
      setMessages([{ role: "assistant", content: data.reply }]);
    } catch {
      setMessages([
        {
          role: "assistant",
          content: t("waifu.greeting.text", {
            part: t(greetingKey[getTimePart()]),
          }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function toggleOpen() {
    if (!open && messages.length === 0) generateGreeting();
    setOpen(!open);
  }

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    const next: Message[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/waifu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || t("waifu.errApi"));
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("waifu.errGeneric"));
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    localStorage.removeItem(STORAGE_KEY);
    setMessages([]);
    generateGreeting();
  }

  return (
    <>
      <button
        onClick={toggleOpen}
        aria-label={t("waifu.aria")}
        className="fixed bottom-5 right-5 z-[90] flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-accent/30 hover:bg-highlight/80 transition-colors"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-5 z-[90] flex w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl shadow-accent/10 backdrop-blur-xl">
          <header className="flex items-center gap-3 border-b border-border bg-surface/50 px-4 py-3">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/avatars/megumi-icon.jpg"
                alt="Katou Megumi"
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-accent border-2 border-background" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">Katou Megumi</p>
              <p className="text-xs text-muted">{t("waifu.online")}</p>
            </div>
            <button
              onClick={clearChat}
              aria-label={t("waifu.delete")}
              className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </header>

          <div className="flex h-80 flex-col gap-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={cn(
                    "max-w-[80%] px-3.5 py-2 text-sm leading-relaxed",
                    m.role === "user"
                      ? "rounded-2xl rounded-br-sm bg-accent text-white"
                      : "rounded-2xl rounded-bl-sm border border-border bg-surface text-foreground"
                  )}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm border border-border bg-surface px-3.5 py-2 text-sm text-muted">
                  {t("waifu.typing")}
                  <span className="animate-pulse">…</span>
                </div>
              </div>
            )}
            {error && <p className="text-center text-xs text-red-400">{error}</p>}
            <div ref={endRef} />
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="flex items-center gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t("waifu.placeholder")}
              className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label={t("waifu.send")}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-accent text-white hover:bg-highlight/80 transition-colors disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
