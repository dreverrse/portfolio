import { SUPABASE_ENABLED, getSupabase } from "@/lib/supabase";

export interface StoredPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  content: string;
}

interface PostRow {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[] | null;
  content: string;
}

const memoryStore: Record<string, StoredPost> = {};

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function rowToPost(row: PostRow): StoredPost {
  return {
    slug: row.slug,
    title: row.title,
    date: row.date,
    excerpt: row.excerpt,
    tags: row.tags || [],
    content: row.content,
  };
}

function postToRow(post: StoredPost): PostRow {
  return {
    slug: post.slug,
    title: post.title,
    date: post.date,
    excerpt: post.excerpt,
    tags: post.tags,
    content: post.content,
  };
}

function isConflict(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "23505"
  );
}

function isNoRow(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === "PGRST116"
  );
}

export async function getStoredPosts(): Promise<StoredPost[]> {
  if (SUPABASE_ENABLED) {
    try {
      const { data, error } = await getSupabase()
        .from("admin_posts")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return (data || []).map(rowToPost);
    } catch {
      return Object.values(memoryStore);
    }
  }
  return Object.values(memoryStore);
}

export async function createStoredPost(
  input: StoredPost
): Promise<StoredPost | null> {
  if (SUPABASE_ENABLED) {
    try {
      const { data, error } = await getSupabase()
        .from("admin_posts")
        .insert(postToRow(input))
        .select()
        .single();
      if (error) throw error;
      return rowToPost(data);
    } catch (err) {
      if (isConflict(err)) return null;
      // fall through ke memory
    }
  }
  if (memoryStore[input.slug]) return null;
  memoryStore[input.slug] = input;
  return input;
}

export async function updateStoredPost(
  slug: string,
  input: Partial<StoredPost>
): Promise<StoredPost | null> {
  if (SUPABASE_ENABLED) {
    try {
      const { data, error } = await getSupabase()
        .from("admin_posts")
        .update(input)
        .eq("slug", slug)
        .select()
        .single();
      if (error) throw error;
      return rowToPost(data);
    } catch (err) {
      if (isNoRow(err)) return null;
      // fall through ke memory
    }
  }
  if (!memoryStore[slug]) return null;
  const updated: StoredPost = { ...memoryStore[slug], ...input, slug };
  memoryStore[slug] = updated;
  return updated;
}

export async function deleteStoredPost(slug: string): Promise<boolean> {
  if (SUPABASE_ENABLED) {
    try {
      const { data, error } = await getSupabase()
        .from("admin_posts")
        .delete()
        .eq("slug", slug)
        .select();
      if (error) throw error;
      if ((data || []).length === 0) return false;
      return true;
    } catch {
      // fall through ke memory
    }
  }
  if (!memoryStore[slug]) return false;
  delete memoryStore[slug];
  return true;
}
