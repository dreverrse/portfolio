"use client";

import { useState, useEffect } from "react";
import { FadeIn } from "@/components/FadeIn";
import { Stagger, StaggerItem } from "@/components/Stagger";
import { useI18n } from "@/lib/i18n";
import type { PublicApi } from "@/lib/public-apis";
import { PiArrowSquareOutBold as ExternalLink, PiGlobeBold as Globe, PiLockKeyBold as Lock, PiShieldCheckBold as Shield, PiSpinnerBallBold as Loader2 } from "react-icons/pi";

interface ApiDirectoryProps {
  apis?: PublicApi[];
}

export function ApiDirectory({ apis: initialApis }: ApiDirectoryProps) {
  const { t } = useI18n();
  const [apis, setApis] = useState<PublicApi[]>(initialApis ?? []);
  const [loading, setLoading] = useState(initialApis === undefined);

  useEffect(() => {
    if (initialApis !== undefined) return;
    let cancelled = false;
    fetch("/api/public-apis")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.ok) {
          setApis(data.data.apis);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, [initialApis]);

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

      {apis.length > 0 && (
        <FadeIn delay={0.1}>
          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {apis.map((api) => (
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
