"use client";

import { useEffect, useState, useCallback } from "react";
import { BookOpenText, Send } from "lucide-react";

interface GuestEntry {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function Guestbook() {
  const [entries, setEntries] = useState<GuestEntry[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch("/api/guestbook");
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) setEntries(data.entries || []);
        }
      } catch {
        // silently fail
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError("");

      const cleanName = name.trim();
      const cleanMessage = message.trim();

      if (!cleanName || cleanName.length > 30) {
        setError("Nama wajib diisi (maks 30 karakter).");
        return;
      }
      if (!cleanMessage || cleanMessage.length > 500) {
        setError("Pesan wajib diisi (maks 500 karakter).");
        return;
      }

      setSubmitting(true);
      try {
        const res = await fetch("/api/guestbook", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: cleanName, message: cleanMessage }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Gagal mengirim pesan.");

        setEntries((prev) => [data.entry, ...prev]);
        setMessage("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal mengirim pesan.");
      } finally {
        setSubmitting(false);
      }
    },
    [name, message]
  );

  return (
    <div>
      <form
        onSubmit={submit}
        className="p-5 rounded-xl border border-border bg-card/50"
      >
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              placeholder="Nama kamu"
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors"
            />
          </div>
          <div className="flex-1">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-accent text-white text-sm font-medium hover:bg-highlight/80 disabled:opacity-60 transition-all duration-200 glow-hover"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Mengirim…" : "Kirim"}
            </button>
          </div>
        </div>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={500}
          rows={4}
          placeholder="Tinggalkan pesan atau kesan buat website ini…"
          className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors resize-none"
        />
        {error && (
          <p className="mt-3 text-sm text-red-400">{error}</p>
        )}
      </form>

      <div className="mt-8 space-y-4">
        {loading &&
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-xl border border-border bg-card/50 animate-pulse"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="h-9 w-9 rounded-full bg-surface" />
                <div className="h-3 w-32 rounded bg-surface" />
              </div>
              <div className="h-3 w-full rounded bg-surface mb-1" />
              <div className="h-3 w-2/3 rounded bg-surface" />
            </div>
          ))}

        {!loading && entries.length === 0 && (
          <div className="text-center py-16 rounded-xl border border-border bg-card/30">
            <BookOpenText className="h-8 w-8 text-muted mx-auto mb-3" />
            <p className="text-muted text-lg">Belum ada pesan.</p>
            <p className="text-sm text-muted/60 mt-2">
              Jadilah orang pertama yang menulis.
            </p>
          </div>
        )}

        {entries.map((entry) => (
          <div
            key={entry.id}
            className="p-4 rounded-xl border border-border bg-card/50"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="h-9 w-9 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-highlight text-sm font-bold uppercase flex-shrink-0">
                {entry.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  {entry.name}
                </p>
                <p className="text-xs text-muted">{formatDate(entry.createdAt)}</p>
              </div>
            </div>
            <p className="text-sm text-muted leading-relaxed break-words">
              {entry.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
