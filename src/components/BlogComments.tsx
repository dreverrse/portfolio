"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useI18n, formatDate } from "@/lib/i18n";
import { PiChatTextBold as MessageSquare, PiPaperPlaneRightBold as Send } from "react-icons/pi";
import type { BlogComment } from "@/lib/blog-engagement";

const MAX_NAME_LENGTH = 30;
const MAX_MESSAGE_LENGTH = 500;

export function BlogComments({ slug }: { slug: string }) {
  const { lang, t } = useI18n();
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/blog/${slug}/comments`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setComments(data.comments || []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedMessage = message.trim();

    if (!trimmedName || trimmedName.length > MAX_NAME_LENGTH) {
      setError(t("blog.commentErrName"));
      return;
    }
    if (!trimmedMessage || trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      setError(t("blog.commentErrMessage"));
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`/api/blog/${slug}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, message: trimmedMessage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || t("blog.commentErrSend"));
      setComments((prev) => [data.comment, ...prev]);
      setName("");
      setMessage("");
    } catch (err) {
      setError(err instanceof Error ? err.message : t("blog.commentErrSend"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 text-sm text-muted mb-4">
        <MessageSquare className="h-4 w-4" />
        {t("blog.comments")}
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-xl border border-border bg-card/50 p-4 space-y-3"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={MAX_NAME_LENGTH}
          placeholder={t("blog.commentNamePlaceholder")}
          className="w-full px-3 py-2 rounded-lg bg-surface text-foreground border border-border text-sm outline-none focus:border-accent transition-colors"
        />
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={MAX_MESSAGE_LENGTH}
          rows={3}
          placeholder={t("blog.commentMessagePlaceholder")}
          className="w-full px-3 py-2 rounded-lg bg-surface text-foreground border border-border text-sm outline-none focus:border-accent transition-colors resize-none"
        />
        {error && <p className="text-xs text-red-400">{error}</p>}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-accent/30 text-highlight border border-accent/30 hover:bg-accent/40 transition-colors disabled:opacity-60"
          >
            <Send className="h-3.5 w-3.5" />
            {submitting ? t("blog.commentSending") : t("blog.commentSend")}
          </button>
        </div>
      </form>

      <div className="mt-6 space-y-4">
        {comments.length === 0 && (
          <p className="text-sm text-muted">{t("blog.commentsEmpty")}</p>
        )}
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="rounded-xl border border-border bg-card/30 p-4"
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground">
                {comment.name}
              </p>
              <p className="text-xs text-muted">
                {formatDate(comment.createdAt, lang)}
              </p>
            </div>
            <p className="text-sm text-muted mt-1.5 whitespace-pre-wrap break-words">
              {comment.message}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
