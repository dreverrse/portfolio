import fs from "fs";
import path from "path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { getStoredPosts, type StoredPost } from "@/lib/posts-store";

const POSTS_DIR = path.join(process.cwd(), "content/blog");

export interface Post extends StoredPost {
  readingTime: string;
}

function toPost(data: StoredPost): Post {
  const stats = readingTime(data.content);
  return {
    ...data,
    readingTime: stats.text.replace("min read", " menit baca"),
  };
}

function getLocalPosts(): Post[] {
  if (!fs.existsSync(POSTS_DIR)) {
    fs.mkdirSync(POSTS_DIR, { recursive: true });
    return [];
  }

  return fs
    .readdirSync(POSTS_DIR)
    .filter((f) => f.endsWith(".mdx"))
    .map((filename) => {
      const slug = filename.replace(".mdx", "");
      const filePath = path.join(POSTS_DIR, filename);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      const { data, content } = matter(fileContent);

      return toPost({
        slug,
        title: data.title || slug,
        date: data.date || new Date().toISOString(),
        excerpt: data.excerpt || "",
        tags: data.tags || [],
        content,
      });
    });
}

export async function getAllPosts(): Promise<Post[]> {
  const stored = await getStoredPosts();
  const storedSlugs = new Set(stored.map((p) => p.slug));
  const local = getLocalPosts().filter((p) => !storedSlugs.has(p.slug));

  return [...stored.map(toPost), ...local].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const stored = await getStoredPosts();
  const found = stored.find((p) => p.slug === slug);
  if (found) return toPost(found);

  const filePath = path.join(POSTS_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) return null;

  const fileContent = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(fileContent);

  return toPost({
    slug,
    title: data.title || slug,
    date: data.date || new Date().toISOString(),
    excerpt: data.excerpt || "",
    tags: data.tags || [],
    content,
  });
}
