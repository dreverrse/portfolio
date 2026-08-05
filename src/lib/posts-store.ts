import { kv } from "@vercel/kv";

const KV_ENABLED = Boolean(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);

const STORAGE_KEY = "blog:posts";

export interface StoredPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
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

export async function getStoredPosts(): Promise<StoredPost[]> {
  if (KV_ENABLED) {
    try {
      const data = await kv.get<StoredPost[]>(STORAGE_KEY);
      return Array.isArray(data) ? data : [];
    } catch {
      return Object.values(memoryStore);
    }
  }
  return Object.values(memoryStore);
}

export async function saveStoredPosts(posts: StoredPost[]): Promise<void> {
  if (KV_ENABLED) {
    try {
      await kv.set(STORAGE_KEY, posts);
      return;
    } catch {
      // fall through ke memory
    }
  }
  for (const key of Object.keys(memoryStore)) {
    if (!posts.some((p) => p.slug === key)) delete memoryStore[key];
  }
  for (const post of posts) memoryStore[post.slug] = post;
}

export async function createStoredPost(
  input: StoredPost
): Promise<StoredPost | null> {
  const posts = await getStoredPosts();
  if (posts.some((p) => p.slug === input.slug)) return null;
  await saveStoredPosts([...posts, input]);
  return input;
}

export async function updateStoredPost(
  slug: string,
  input: Partial<StoredPost>
): Promise<StoredPost | null> {
  const posts = await getStoredPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  if (index === -1) return null;
  const updated: StoredPost = { ...posts[index], ...input, slug };
  const next = [...posts];
  next[index] = updated;
  await saveStoredPosts(next);
  return updated;
}

export async function deleteStoredPost(slug: string): Promise<boolean> {
  const posts = await getStoredPosts();
  const next = posts.filter((p) => p.slug !== slug);
  if (next.length === posts.length) return false;
  await saveStoredPosts(next);
  return true;
}
