import { SUPABASE_ENABLED, getSupabase } from "@/lib/supabase";

export interface BlogComment {
  id: string;
  name: string;
  message: string;
  createdAt: string;
}

export const REACTION_OPTIONS = ["👍", "❤️", "🔥", "😮", "🎉"] as const;

export type Reaction = (typeof REACTION_OPTIONS)[number];

export interface ReactionsResult {
  counts: Record<string, number>;
  mine: string[];
}

const memoryCounts = new Map<string, Record<string, number>>();
const memoryMine = new Map<string, string[]>();
const memoryComments = new Map<string, BlogComment[]>();

export async function getReactions(
  postSlug: string,
  userId: string
): Promise<ReactionsResult> {
  if (SUPABASE_ENABLED) {
    try {
      const { data, error } = await getSupabase()
        .from("post_reactions")
        .select("reaction, user_id")
        .eq("post_slug", postSlug);
      if (error) throw error;
      const counts: Record<string, number> = {};
      const mine: string[] = [];
      for (const row of data || []) {
        counts[row.reaction] = (counts[row.reaction] || 0) + 1;
        if (row.user_id === userId) mine.push(row.reaction);
      }
      return { counts, mine };
    } catch {
      // fall through ke memory
    }
  }
  return {
    counts: memoryCounts.get(postSlug) || {},
    mine: memoryMine.get(postSlug) || [],
  };
}

export async function toggleReaction(
  postSlug: string,
  reaction: string,
  userId: string
): Promise<{ active: boolean } | null> {
  if (!REACTION_OPTIONS.includes(reaction as Reaction)) return null;
  if (SUPABASE_ENABLED) {
    try {
      const { data: existing, error: getError } = await getSupabase()
        .from("post_reactions")
        .select("id")
        .eq("post_slug", postSlug)
        .eq("reaction", reaction)
        .eq("user_id", userId)
        .maybeSingle();
      if (getError) throw getError;
      if (existing) {
        const { error: delError } = await getSupabase()
          .from("post_reactions")
          .delete()
          .eq("id", existing.id);
        if (delError) throw delError;
        return { active: false };
      }
      const { error: insError } = await getSupabase()
        .from("post_reactions")
        .insert({ post_slug: postSlug, reaction, user_id: userId });
      if (insError) throw insError;
      return { active: true };
    } catch {
      // fall through ke memory
    }
  }
  const counts = memoryCounts.get(postSlug) || {};
  let mine = memoryMine.get(postSlug) || [];
  if (mine.includes(reaction)) {
    mine = mine.filter((r) => r !== reaction);
    counts[reaction] = Math.max(0, (counts[reaction] || 0) - 1);
    memoryMine.set(postSlug, mine);
    memoryCounts.set(postSlug, counts);
    return { active: false };
  }
  mine = [...mine, reaction];
  counts[reaction] = (counts[reaction] || 0) + 1;
  memoryMine.set(postSlug, mine);
  memoryCounts.set(postSlug, counts);
  return { active: true };
}

export async function getComments(postSlug: string): Promise<BlogComment[]> {
  if (SUPABASE_ENABLED) {
    try {
      const { data, error } = await getSupabase()
        .from("post_comments")
        .select("id, name, message, created_at")
        .eq("post_slug", postSlug)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data || []).map((row) => ({
        id: row.id,
        name: row.name,
        message: row.message,
        createdAt: row.created_at,
      }));
    } catch {
      // fall through ke memory
    }
  }
  return memoryComments.get(postSlug) || [];
}

export async function addComment(
  postSlug: string,
  name: string,
  message: string
): Promise<BlogComment | null> {
  const trimmedName = name.trim();
  const trimmedMessage = message.trim();
  if (!trimmedName || trimmedName.length > 30) return null;
  if (!trimmedMessage || trimmedMessage.length > 500) return null;

  const comment: BlogComment = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: trimmedName,
    message: trimmedMessage,
    createdAt: new Date().toISOString(),
  };

  if (SUPABASE_ENABLED) {
    try {
      const { error } = await getSupabase().from("post_comments").insert({
        id: comment.id,
        post_slug: postSlug,
        name: comment.name,
        message: comment.message,
        created_at: comment.createdAt,
      });
      if (error) throw error;
      return comment;
    } catch {
      // fall through ke memory
    }
  }
  const list = memoryComments.get(postSlug) || [];
  memoryComments.set(postSlug, [comment, ...list]);
  return comment;
}
