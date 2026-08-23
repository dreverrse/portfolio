"use client";

import { useEffect, useRef, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { ExternalLink, Mail, Send, X, Trash2 } from "lucide-react";
import { FaGithub, FaInstagram, FaWhatsapp, FaXTwitter } from "react-icons/fa6";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { springTransition } from "@/lib/motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

type Icon = ComponentType<{ className?: string }>;

const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
const URL_RE =
  /(https?:\/\/[^\s<>"']+)|(mailto:[^\s<>"']+)|([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})|((?<![\w@.])(?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<>"']*)?)/gi;
const BARE_DOMAIN_RE = /(?<![\w@.])((?:[a-z0-9-]+\.)+[a-z]{2,}(?:\/[^\s<>"']*)?)/i;

function normalizeHref(raw: string): string {
  if (/^https?:\/\//i.test(raw)) return raw;
  if (/^mailto:/i.test(raw)) return raw;
  if (EMAIL_RE.test(raw)) return `mailto:${raw}`;
  return `https://${raw}`;
}

function hostOf(raw: string): string {
  try {
    return new URL(normalizeHref(raw)).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function linkInfo(
  raw: string
): { href: string; label: string; Icon: Icon } {
  const href = normalizeHref(raw);
  const host = hostOf(raw);
  const lower = raw.toLowerCase();
  if (/^mailto:/i.test(lower) || EMAIL_RE.test(lower)) {
    return { href, label: "Email", Icon: Mail };
  }
  if (/whatsapp|wa\.me/.test(host)) {
    return { href, label: "WhatsApp", Icon: FaWhatsapp };
  }
  if (/github/.test(host)) {
    return { href, label: "GitHub", Icon: FaGithub };
  }
  if (/instagram/.test(host)) {
    return { href, label: "Instagram", Icon: FaInstagram };
  }
  if (/twitter|x\.com/.test(host)) {
    return { href, label: "Twitter/X", Icon: FaXTwitter };
  }
  if (/finora/.test(host)) {
    return { href, label: "Finora Demo", Icon: ExternalLink };
  }
  return { href, label: host || raw, Icon: ExternalLink };
}

function LinkChip({ raw }: { raw: string }) {
  const { href, label, Icon } = linkInfo(raw);
  return (
    <a
      href={href}
      title={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-current/25 bg-current/10 px-2.5 py-1.5 text-xs font-medium hover:bg-current/20 transition-colors"
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span>{label}</span>
      <ExternalLink className="h-3.5 w-3.5 shrink-0 opacity-70" />
    </a>
  );
}

function linkify(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const parts = text.split(URL_RE);
  parts.forEach((part, i) => {
    if (!part) return;
    const isToken =
      /^https?:\/\//i.test(part) ||
      /^mailto:/i.test(part) ||
      EMAIL_RE.test(part) ||
      BARE_DOMAIN_RE.test(part);
    if (isToken) {
      nodes.push(<LinkChip key={i} raw={part} />);
    } else {
      nodes.push(part);
    }
  });
  return nodes;
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

const STORAGE_KEY = "kylebot-chat";
const IDLE_HIDE_MS = 5000;
const DOCK_OFFSET = 42;

export function WaifuWidget() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [docked, setDocked] = useState(false);
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

  // Sembunyikan tombol ke pinggir saat idle; muncul lagi saat ada aktivitas.
  useEffect(() => {
    if (open) return;
    let timer: ReturnType<typeof setTimeout>;
    const arm = () => {
      clearTimeout(timer);
      timer = setTimeout(() => setDocked(true), IDLE_HIDE_MS);
    };
    const wake = () => {
      setDocked(false);
      arm();
    };
    const events = ["pointermove", "pointerdown", "keydown", "scroll"] as const;
    events.forEach((e) => window.addEventListener(e, wake, { passive: true }));
    arm();
    return () => {
      clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, wake));
    };
  }, [open]);

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
    setDocked(false);
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
      <motion.button
        onClick={toggleOpen}
        onMouseEnter={() => setDocked(false)}
        onFocus={() => setDocked(false)}
        aria-label={t("waifu.aria")}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1, x: docked ? DOCK_OFFSET : 0 }}
        transition={springTransition}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="fixed bottom-5 right-5 z-[90] h-14 w-14 overflow-hidden rounded-full shadow-lg shadow-accent/30"
      >
        {open ? (
          <span className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
            <X className="h-6 w-6" />
          </span>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/avatars/kylebot.jpg" alt="" className="h-full w-full object-cover" />
        )}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={springTransition}
            className="fixed bottom-24 right-5 z-[90] flex w-[calc(100vw-2.5rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card/95 shadow-2xl shadow-accent/10 backdrop-blur-xl"
          >
          <header className="flex items-center gap-3 border-b border-border bg-surface/50 px-4 py-3">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/avatars/kylebot.jpg"
                alt="KyleBot"
                className="h-10 w-10 rounded-full object-cover"
              />
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-primary border-2 border-background" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">KyleBot</p>
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
                      ? "rounded-2xl rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-2xl rounded-bl-sm border border-border bg-surface text-foreground"
                  )}
                >
                  {linkify(m.content)}
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
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
