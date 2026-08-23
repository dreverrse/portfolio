"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FadeIn } from "@/components/FadeIn";
import { Stagger, StaggerItem } from "@/components/Stagger";
import { useI18n, formatDate } from "@/lib/i18n";
import type { Post } from "@/lib/blog";
import { ArrowRight, Calendar, Clock, Search, Tag } from "lucide-react";

interface PostTranslation {
  title?: string;
  excerpt?: string;
}

function localized(
  post: Post,
  translations: Record<string, PostTranslation>,
  lang: string
): { title: string; excerpt: string } {
  const tr = lang === "en" ? translations[post.slug] : undefined;
  return {
    title: tr?.title || post.title,
    excerpt: tr?.excerpt || post.excerpt,
  };
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

  const allTags = Array.from(
    new Set(posts.flatMap((p) => p.tags))
  ).sort();

  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const filtered = posts.filter((post) => {
    const { title, excerpt } = localized(post, translations, lang);
    const haystack = `${title} ${excerpt} ${post.tags.join(" ")}`.toLowerCase();
    const q = query.trim().toLowerCase();
    const matchesQuery = q === "" || haystack.includes(q);
    const matchesTag = activeTag === null || post.tags.includes(activeTag);
    return matchesQuery && matchesTag;
  });

  const [featured, ...rest] = filtered;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 py-16 sm:py-24">
      <FadeIn>
        <div className="mb-12">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-highlight">
            Blog
          </span>
          <h1 className="mt-3 text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            {t("nav.blog")}
          </h1>
          <p className="mt-4 text-lg text-muted max-w-2xl leading-relaxed">
            {t("blog.description")}
          </p>
        </div>
      </FadeIn>

      {posts.length > 0 && (
        <FadeIn delay={0.1}>
          <div className="mb-8 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("blog.searchPlaceholder")}
                className="w-full rounded-xl border border-border bg-card/50 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveTag(null)}
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    activeTag === null
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card/50 border-border text-muted hover:text-highlight hover:border-accent"
                  }`}
                >
                  {t("blog.allTags")}
                </button>
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                      activeTag === tag
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-card/50 border-border text-muted hover:text-highlight hover:border-accent"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
          </div>
        </FadeIn>
      )}

      {posts.length > 0 && filtered.length === 0 && (
        <FadeIn delay={0.15}>
          <div className="text-center py-16 rounded-xl border border-border bg-card/30">
            <p className="text-muted text-lg">{t("blog.searchEmpty")}</p>
          </div>
        </FadeIn>
      )}

      {posts.length === 0 && (
        <FadeIn delay={0.1}>
          <div className="text-center py-16 rounded-xl border border-border bg-card/30">
            <p className="text-muted text-lg">{t("blog.empty")}</p>
            <p className="text-sm text-muted/60 mt-2">
              {t("blog.emptySub")}{" "}
              <code className="px-1.5 py-0.5 rounded bg-surface text-highlight text-xs">
                content/blog/
              </code>
            </p>
          </div>
        </FadeIn>
      )}

      {featured && (
        <FadeIn delay={0.1}>
          <Link
            href={`/blog/${featured.slug}`}
            className="group grid md:grid-cols-[1.1fr_1fr] overflow-hidden rounded-2xl border border-border bg-card/50 hover:border-accent transition-all duration-300 glow-hover"
          >
            {featured.image && (
              <div className="relative aspect-[16/10] md:aspect-auto md:h-full overflow-hidden border-b md:border-b-0 md:border-r border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={featured.image}
                  alt={localized(featured, translations, lang).title}
                  className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
            <div className="flex flex-col justify-center p-6 sm:p-8">
              {featured.tags[0] && (
                <span className="text-xs font-semibold uppercase tracking-widest text-highlight">
                  {featured.tags[0]}
                </span>
              )}
              <h2 className="mt-3 text-2xl sm:text-3xl font-bold text-foreground group-hover:text-highlight transition-colors leading-snug">
                {localized(featured, translations, lang).title}
              </h2>
              <p className="mt-3 text-muted leading-relaxed line-clamp-3">
                {localized(featured, translations, lang).excerpt}
              </p>
              <div className="mt-6 flex items-center gap-4 text-xs text-muted">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(featured.date, lang)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" />
                  {featured.readingTime} {t("blog.readingTime")}
                </span>
              </div>
              <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-highlight">
                {t("blog.readMore")}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </Link>
        </FadeIn>
      )}

      {rest.length > 0 && (
        <FadeIn delay={0.15}>
          <Stagger className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => {
              const { title, excerpt } = localized(post, translations, lang);
              return (
                <StaggerItem
                  key={post.slug}
                  className="overflow-hidden rounded-xl border border-border bg-card/50 hover:bg-surface/50 hover:border-accent transition-all duration-300 glow-hover"
                >
                  <Link href={`/blog/${post.slug}`} className="group flex h-full flex-col">
                    {post.image && (
                      <div className="relative aspect-video w-full overflow-hidden border-b border-border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.image}
                          alt={title}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-center justify-between gap-2">
                        {post.tags[0] ? (
                          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-highlight">
                            <Tag className="h-3 w-3" />
                            {post.tags[0]}
                          </span>
                        ) : (
                          <span />
                        )}
                        <span className="text-xs text-muted">
                          {formatDate(post.date, lang)}
                        </span>
                      </div>
                      <h3 className="mt-3 font-semibold text-lg text-foreground group-hover:text-highlight transition-colors leading-snug">
                        {title}
                      </h3>
                      <p className="mt-2 text-sm text-muted line-clamp-2">
                        {excerpt}
                      </p>
                      <div className="mt-auto pt-4 flex items-center gap-1.5 text-xs text-muted">
                        <Clock className="h-3 w-3" />
                        {post.readingTime} {t("blog.readingTime")}
                      </div>
                    </div>
                  </Link>
                </StaggerItem>
              );
            })}
          </Stagger>
        </FadeIn>
      )}
    </div>
  );
}
