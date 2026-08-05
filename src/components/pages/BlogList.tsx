"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FadeIn } from "@/components/FadeIn";
import { useI18n, formatDate } from "@/lib/i18n";
import type { Post } from "@/lib/blog";
import { Calendar, Clock, Tag } from "lucide-react";

interface PostTranslation {
  title?: string;
  excerpt?: string;
}

export function BlogList({ posts }: { posts: Post[] }) {
  const { lang, t } = useI18n();
  const [translations, setTranslations] = useState<
    Record<string, PostTranslation>
  >({});

  useEffect(() => {
    let cancelled = false;
    if (lang === "en" && posts.length > 0) {
      fetch("/api/blog/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slugs: posts.map((p) => p.slug),
          mode: "list",
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled && data?.translations) {
            setTranslations(data.translations);
          }
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [lang, posts]);

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 py-16 sm:py-24">
      <FadeIn>
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">
          <span className="text-foreground">{t("nav.blog")}</span>
        </h1>
        <p className="text-muted text-lg max-w-2xl leading-relaxed">
          {t("blog.description")}
        </p>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="mt-12 space-y-4">
          {posts.length === 0 && (
            <div className="text-center py-16 rounded-xl border border-border bg-card/30">
              <p className="text-muted text-lg">{t("blog.empty")}</p>
              <p className="text-sm text-muted/60 mt-2">
                {t("blog.emptySub")}{" "}
                <code className="px-1.5 py-0.5 rounded bg-surface text-highlight text-xs">
                  content/blog/
                </code>
              </p>
            </div>
          )}
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block p-5 rounded-xl border border-border bg-card/50 hover:bg-surface/50 hover:border-accent transition-all duration-300 glow-hover group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="font-semibold text-lg text-foreground group-hover:text-highlight transition-colors">
                  {translations[post.slug]?.title || post.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {formatDate(post.date, lang)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {post.readingTime} {t("blog.readingTime")}
                  </span>
                </div>
              </div>
              <p className="text-sm text-muted mt-2 line-clamp-2">
                {translations[post.slug]?.excerpt || post.excerpt}
              </p>
              {post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-accent/20 text-highlight border border-accent/30"
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}
