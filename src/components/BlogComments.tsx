"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useI18n, formatDate } from "@/lib/i18n";
import { MessageSquare, Send } from "lucide-react";
import type { BlogComment } from "@/lib/blog-engagement";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

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

      <Card className="border-border bg-card/50">
        <CardContent className="space-y-3">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="comment-name">{t("blog.commentNamePlaceholder")}</Label>
              <Input
                id="comment-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={MAX_NAME_LENGTH}
                placeholder={t("blog.commentNamePlaceholder")}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="comment-message">{t("blog.commentMessagePlaceholder")}</Label>
              <Textarea
                id="comment-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={MAX_MESSAGE_LENGTH}
                rows={3}
                placeholder={t("blog.commentMessagePlaceholder")}
                className="resize-none"
              />
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={submitting}
                variant="outline"
              >
                <Send className="h-3.5 w-3.5" />
                {submitting ? t("blog.commentSending") : t("blog.commentSend")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 space-y-4">
        {comments.length === 0 && (
          <p className="text-sm text-muted">{t("blog.commentsEmpty")}</p>
        )}
        {comments.map((comment) => (
          <Card key={comment.id} className="border-border bg-card/30">
            <CardContent className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-semibold text-foreground">
                  {comment.name}
                </p>
                <p className="text-xs text-muted">
                  {formatDate(comment.createdAt, lang)}
                </p>
              </div>
              <p className="text-sm text-muted whitespace-pre-wrap break-words">
                {comment.message}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
