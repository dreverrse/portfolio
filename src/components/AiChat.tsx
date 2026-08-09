"use client";

import { useEffect, useRef, useState } from "react";
import { Send, Trash2, Loader2, MessageSquare } from "lucide-react";
import { PostContent } from "@/components/PostContent";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const inputClass =
  "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted/60 focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none";
const btnPrimary =
  "inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50";
const btnGhost =
  "inline-flex items-center gap-2 rounded-xl border border-border px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:border-accent hover:text-foreground";

export function AiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!content || loading) return;

    const history = messages.slice(-20);
    setMessages((prev) => [...prev, { role: "user", content }]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...history, { role: "user", content }],
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          (data as { error?: string }).error || "Gagal memproses"
        );
      }
      const reply = (data as { reply?: string }).reply || "";
      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }

  function clearChat() {
    setMessages([]);
    setError("");
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/20 text-accent">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">AI Chat</h1>
            <p className="text-sm text-muted">
              Canvas admin — model <code className="text-highlight">big-pickle</code> (OpenCode Zen)
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button onClick={clearChat} className={btnGhost}>
            <Trash2 className="h-4 w-4" />
            Bersihkan
          </button>
        )}
      </div>

      <div className="space-y-4 rounded-2xl border border-border bg-card/50 p-4 max-h-[60vh] overflow-y-auto">
        {messages.length === 0 && !loading && (
          <p className="py-12 text-center text-sm text-muted">
            Mulai percakapan dengan Big Pickle.
          </p>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <div
              className={
                m.role === "user"
                  ? "max-w-[85%] rounded-2xl bg-accent px-4 py-2.5 text-sm text-white whitespace-pre-wrap"
                  : "max-w-[85%] rounded-2xl border border-border bg-background px-4 py-3"
              }
            >
              {m.role === "user" ? m.content : <PostContent content={m.content} />}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Big Pickle sedang mengetik…
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="mt-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-500">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className={`${inputClass} resize-none flex-1`}
          rows={2}
          placeholder="Tulis pesan untuk Big Pickle..."
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} className={btnPrimary}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          <span className="hidden sm:inline">Kirim</span>
        </button>
      </form>
    </div>
  );
}
