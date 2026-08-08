import { SUPABASE_ENABLED, getSupabase } from "@/lib/supabase";
import { getCachedGitHubStats, type GitHubStats } from "@/lib/github-stats";
import { getLastTrack } from "@/lib/lastfm";

export interface TopPost {
  slug: string;
  title: string;
  date: string;
  comments: number;
  reactions: number;
}

export interface AdminStats {
  totals: {
    posts: number;
    reactions: number;
    comments: number;
    translations: number;
  };
  topPosts: TopPost[];
  github: GitHubStats | null;
  lastfm: { name: string; artist: string; isPlaying: boolean } | null;
}

async function countFrom(table: string): Promise<number> {
  if (!SUPABASE_ENABLED) return 0;
  try {
    const { count, error } = await getSupabase()
      .from(table)
      .select("*", { count: "exact", head: true });
    if (error) throw error;
    return count ?? 0;
  } catch {
    return 0;
  }
}

async function topPosts(): Promise<TopPost[]> {
  if (!SUPABASE_ENABLED) return [];
  try {
    const db = getSupabase();
    const [comments, reactions, posts] = await Promise.all([
      db.from("post_comments").select("post_slug"),
      db.from("post_reactions").select("post_slug"),
      db.from("admin_posts").select("slug, title, date"),
    ]);
    if (comments.error || reactions.error || posts.error) return [];

    const commentCount: Record<string, number> = {};
    for (const row of comments.data || []) {
      commentCount[row.post_slug] = (commentCount[row.post_slug] || 0) + 1;
    }
    const reactionCount: Record<string, number> = {};
    for (const row of reactions.data || []) {
      reactionCount[row.post_slug] = (reactionCount[row.post_slug] || 0) + 1;
    }

    return (posts.data || [])
      .map((p) => ({
        slug: p.slug,
        title: p.title,
        date: p.date,
        comments: commentCount[p.slug] || 0,
        reactions: reactionCount[p.slug] || 0,
      }))
      .sort((a, b) => b.comments + b.reactions - (a.comments + a.reactions))
      .slice(0, 5);
  } catch {
    return [];
  }
}

export async function getAdminStats(): Promise<AdminStats> {
  const [posts, reactions, comments, translations, top, github, lastfm] =
    await Promise.all([
      countFrom("admin_posts"),
      countFrom("post_reactions"),
      countFrom("post_comments"),
      countFrom("translation_cache"),
      topPosts(),
      getCachedGitHubStats(),
      getLastTrack().then((track) =>
        track
          ? { name: track.name, artist: track.artist, isPlaying: track.is_playing }
          : null
      ),
    ]);

  return {
    totals: { posts, reactions, comments, translations },
    topPosts: top,
    github,
    lastfm,
  };
}
