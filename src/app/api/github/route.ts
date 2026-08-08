import { NextResponse } from "next/server";

const USERNAME = "dreverrse";
const CACHE_TTL_MS = 10 * 60 * 1000;

interface GitHubStats {
  followers: number;
  publicRepos: number;
  totalStars: number;
  topLanguages: string[];
}

let cache: { stats: GitHubStats; fetchedAt: number } | null = null;

async function fetchStats(): Promise<GitHubStats | null> {
  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${USERNAME}`, {
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      }),
      fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100`, {
        cache: "no-store",
        signal: AbortSignal.timeout(8000),
      }),
    ]);
    if (!userRes.ok || !reposRes.ok) return null;

    const user = await userRes.json();
    const repos = await reposRes.json();
    if (!Array.isArray(repos)) return null;

    const langCount: Record<string, number> = {};
    let totalStars = 0;
    for (const repo of repos) {
      totalStars += repo.stargazers_count || 0;
      if (typeof repo.language === "string" && repo.language) {
        langCount[repo.language] = (langCount[repo.language] || 0) + 1;
      }
    }

    const topLanguages = Object.entries(langCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([lang]) => lang);

    return {
      followers: user.followers || 0,
      publicRepos: user.public_repos || 0,
      totalStars,
      topLanguages,
    };
  } catch {
    return null;
  }
}

export async function GET() {
  const now = Date.now();
  if (!cache || now - cache.fetchedAt > CACHE_TTL_MS) {
    const stats = await fetchStats();
    if (!stats) return NextResponse.json({ stats: null });
    cache = { stats, fetchedAt: now };
  }
  return NextResponse.json({ stats: cache.stats });
}
