"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  FolderOpen,
  Heart,
  MessageSquare,
  Languages,
  Users,
  Music,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface TopPost {
  slug: string;
  title: string;
  date: string;
  comments: number;
  reactions: number;
}

interface AdminStats {
  totals: {
    posts: number;
    reactions: number;
    comments: number;
    translations: number;
  };
  topPosts: TopPost[];
  github: { followers: number; publicRepos: number; totalStars: number; topLanguages: string[] } | null;
  lastfm: { name: string; artist: string; isPlaying: boolean } | null;
}

const kpiClass =
  "flex items-center gap-3 rounded-xl border border-border bg-card/50 p-4";

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error || "Gagal memuat statistik");
      }
      setStats((data as { stats: AdminStats }).stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return <p className="text-sm text-red-500">{error || "Tidak ada data."}</p>;
  }

  const maxScore = Math.max(
    1,
    ...stats.topPosts.map((p) => p.comments + p.reactions)
  );

  const kpis = [
    { icon: FolderOpen, label: "Artikel", value: stats.totals.posts },
    { icon: Heart, label: "Reaksi", value: stats.totals.reactions },
    { icon: MessageSquare, label: "Komentar", value: stats.totals.comments },
    { icon: Languages, label: "Terjemahan", value: stats.totals.translations },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-highlight" />
          <h2 className="text-lg font-semibold">Dashboard</h2>
        </div>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-accent hover:text-foreground"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {kpis.map(({ icon: Icon, label, value }) => (
          <div key={label} className={kpiClass}>
            <Icon className="h-5 w-5 text-highlight shrink-0" />
            <div className="min-w-0">
              <p className="text-xs text-muted">{label}</p>
              <p className="text-xl font-bold">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card/50 p-6">
        <h3 className="mb-4 font-semibold">Artikel Teratas</h3>
        {stats.topPosts.length === 0 ? (
          <p className="text-sm text-muted">Belum ada data komentar/reaksi.</p>
        ) : (
          <div className="space-y-3">
            {stats.topPosts.map((post) => {
              const score = post.comments + post.reactions;
              return (
                <div key={post.slug}>
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">{post.title}</span>
                    <span className="shrink-0 text-xs text-muted">
                      💬 {post.comments} · ❤️ {post.reactions}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-border/60">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.round((score / maxScore) * 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {stats.github && (
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <Users className="h-4 w-4 text-highlight" />
              GitHub
            </h3>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold">{stats.github.followers}</p>
                <p className="text-xs text-muted">Followers</p>
              </div>
              <div>
                <p className="text-lg font-bold">{stats.github.publicRepos}</p>
                <p className="text-xs text-muted">Repos</p>
              </div>
              <div>
                <p className="text-lg font-bold">{stats.github.totalStars}</p>
                <p className="text-xs text-muted">Stars</p>
              </div>
            </div>
            {stats.github.topLanguages.length > 0 && (
              <p className="mt-3 text-xs text-muted">
                Bahasa: {stats.github.topLanguages.join(", ")}
              </p>
            )}
          </div>
        )}

        <div className="rounded-2xl border border-border bg-card/50 p-6">
          <h3 className="mb-4 flex items-center gap-2 font-semibold">
            <Music className="h-4 w-4 text-highlight" />
            Last.fm
          </h3>
          {stats.lastfm ? (
            <p className="text-sm">
              {stats.lastfm.name} — {stats.lastfm.artist}
              {stats.lastfm.isPlaying && <span className="ml-2 text-xs text-highlight">▶ Sedang diputar</span>}
            </p>
          ) : (
            <p className="text-sm text-muted">Tidak ada data.</p>
          )}
        </div>
      </div>
    </div>
  );
}
