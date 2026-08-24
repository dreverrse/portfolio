"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FadeIn } from "@/components/FadeIn";
import { PostContent } from "@/components/PostContent";
import { BlogReactions } from "@/components/BlogReactions";
import { BlogComments } from "@/components/BlogComments";
import { useI18n, formatDate } from "@/lib/i18n";
import type { Post } from "@/lib/blog";
import { PiArrowLeftBold as ArrowLeft, PiCalendarBold as Calendar, PiClockBold as Clock, PiTagBold as Tag } from "react-icons/pi";

interface PostTranslation {
  title?: string;
  excerpt?: string;
  content?: string;
}

export function BlogPostView({ post }: { post: Post }) {
  const { lang, t } = useI18n();
  const [translation, setTranslation] = useState<PostTranslation | null>(null);

  useEffect(() => {
    let cancelled = false;
    if (lang === "en") {
      fetch("/api/blog/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugs: [post.slug], mode: "full" }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (!cancelled && data?.translations?.[post.slug]) {
            setTranslation(data.translations[post.slug]);
          }
        })
        .catch(() => {});
    }
    return () => {
      cancelled = true;
    };
  }, [lang, post.slug]);

  const title =
    lang === "en" ? translation?.title || post.title : post.title;
  const content =
    lang === "en" ? translation?.content || post.content : post.content;

  return (
    <article className="mx-auto max-w-3xl px-4 sm:px-6 py-16 sm:py-24">
      <FadeIn>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-muted hover:text-highlight transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("blog.back")}
        </Link>

        {post.image && (
          <div className="relative h-56 sm:h-72 w-full overflow-hidden rounded-xl border border-border mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image}
              alt={title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <header>
          <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
            {title}
          </h1>
          <div className="flex items-center gap-4 mt-4 text-sm text-muted">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(post.date, lang)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.readingTime} {t("blog.readingTime")}
            </span>
          </div>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2.5 py-0.5 text-xs rounded-full bg-accent/20 text-highlight border border-accent/30"
                >
                  <Tag className="h-2.5 w-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="mt-10">
          <PostContent content={content} />
        </div>
      </FadeIn>

      <BlogReactions slug={post.slug} />
      <BlogComments slug={post.slug} />
    </article>
  );
}
