"use client";

import { useState, useMemo, useEffect } from "react";
import { FadeIn } from "@/components/FadeIn";
import { Stagger, StaggerItem } from "@/components/Stagger";
import { useI18n } from "@/lib/i18n";
import type { PublicApi } from "@/lib/public-apis";
import { Search, ExternalLink, Shield, Globe, Lock, Loader2 } from "lucide-react";

interface ApiDirectoryProps {
  apis?: PublicApi[];
  categories?: string[];
}

export function ApiDirectory({ apis: initialApis, categories: initialCategories }: ApiDirectoryProps) {
  const { t } = useI18n();
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const [apis, setApis] = useState<PublicApi[]>(initialApis ?? []);
  const [categories, setCategories] = useState<string[]>(initialCategories ?? []);
  const [loading, setLoading] = useState(initialApis === undefined);

  useEffect(() => {
    if (initialApis !== undefined) return;
    let cancelled = false;
    fetch("/api/public-apis")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.ok) {
          setApis(data.data.apis);
          setCategories(data.data.categories);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [initialApis]);

  const filtered = useMemo(() => {
    let list = apis;
    if (activeCategory) {
      list = list.filter((a) => a.category === activeCategory);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [apis, query, activeCategory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <FadeIn>
        <div className="mb-8">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-highlight">
            APIs
          </span>
          <h1 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            {t("apis.title")}
          </h1>
          <p className="mt-3 text-base text-muted max-w-2xl leading-relaxed">
            {t("apis.description")}
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("apis.searchPlaceholder")}
              className="w-full rounded-xl border border-border bg-card/50 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent transition-colors"
            />
          </div>
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveCategory(null)}
                className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                  activeCategory === null
                    ? "bg-accent text-white border-accent"
                    : "bg-card/50 border-border text-muted hover:text-highlight hover:border-accent"
                }`}
              >
                {t("apis.allCategories")}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() =>
                    setActiveCategory(activeCategory === cat ? null : cat)
                  }
                  className={`px-3 py-1 rounded-full text-xs border transition-colors ${
                    activeCategory === cat
                      ? "bg-accent text-white border-accent"
                      : "bg-card/50 border-border text-muted hover:text-highlight hover:border-accent"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </FadeIn>

      {filtered.length === 0 && (
        <FadeIn delay={0.15}>
          <div className="text-center py-16 rounded-xl border border-border bg-card/30">
            <p className="text-muted text-lg">{t("apis.searchEmpty")}</p>
          </div>
        </FadeIn>
      )}

      {filtered.length > 0 && (
        <FadeIn delay={0.15}>
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((api) => (
              <StaggerItem
                key={`${api.category}-${api.name}`}
                className="group p-5 rounded-xl border border-border bg-card/50 hover:bg-surface/50 hover:border-accent transition-all duration-300 glow-hover"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground group-hover:text-highlight transition-colors truncate">
                      {api.name}
                    </h3>
                    <span className="text-xs text-highlight/70 font-medium">
                      {api.category}
                    </span>
                  </div>
                  {api.url && (
                    <a
                      href={api.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 p-1.5 rounded-lg text-muted hover:text-highlight hover:bg-surface transition-all"
                      aria-label={api.name}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted line-clamp-2 leading-relaxed">
                  {api.description}
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted">
                  {api.auth === "No" ? (
                    <span className="inline-flex items-center gap-1 text-green-500">
                      <Shield className="h-3 w-3" />
                      {t("apis.noAuth")}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-amber-500">
                      <Lock className="h-3 w-3" />
                      {t("apis.requiresAuth")}
                    </span>
                  )}
                  {api.https === "Yes" && (
                    <span className="inline-flex items-center gap-1">
                      <Globe className="h-3 w-3" />
                      HTTPS
                    </span>
                  )}
                </div>
              </StaggerItem>
            ))}
          </Stagger>
        </FadeIn>
      )}
    </div>
  );
}
