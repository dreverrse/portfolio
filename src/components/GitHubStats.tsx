"use client";

import { useEffect, useState } from "react";
import { FadeIn } from "@/components/FadeIn";
import { useI18n } from "@/lib/i18n";
import { FaGithub } from "react-icons/fa6";
import { Star, Users, FolderGit2, Code2 } from "lucide-react";

interface GitHubStatsData {
  followers: number;
  publicRepos: number;
  totalStars: number;
  topLanguages: string[];
}

export function GitHubStats() {
  const { t } = useI18n();
  const [stats, setStats] = useState<GitHubStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/github")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled && data?.stats) {
          setStats(data.stats);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6 rounded-2xl border border-border bg-card/50 animate-pulse">
        <div className="h-4 w-40 rounded bg-surface mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-surface" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const items = [
    { icon: FolderGit2, label: t("github.repos"), value: String(stats.publicRepos) },
    { icon: Star, label: t("github.stars"), value: String(stats.totalStars) },
    { icon: Users, label: t("github.followers"), value: String(stats.followers) },
    { icon: Code2, label: t("github.languages"), value: stats.topLanguages.length ? stats.topLanguages.join(", ") : "-" },
  ];

  return (
    <FadeIn>
      <section>
        <h2 className="text-2xl font-bold mb-8">
          <span className="text-foreground">{t("github.title")}</span>
        </h2>
        <div className="p-6 rounded-2xl border border-border bg-card/50">
          <div className="flex items-center gap-2 text-sm text-muted mb-6">
            <FaGithub className="h-5 w-5 text-highlight" />
            <span className="font-medium">github.com/dreverrse</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="p-4 rounded-xl bg-surface/40 border border-border/60">
                  <Icon className="h-5 w-5 text-highlight mb-2" />
                  <p className="text-2xl font-bold text-foreground truncate">{item.value}</p>
                  <p className="text-xs text-muted mt-1">{item.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </FadeIn>
  );
}
