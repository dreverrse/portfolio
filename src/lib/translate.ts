import { kv } from "@vercel/kv";
import { chatOpenRouter } from "@/lib/openrouter";
import type { Post } from "@/lib/blog";

const KV_ENABLED = Boolean(
  process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
);

const CACHE_TTL_SECONDS = 60 * 60 * 24 * 30;

export type TranslationMode = "list" | "full";

export interface Translation {
  title: string;
  excerpt: string;
  content?: string;
}

const memoryCache = new Map<string, Translation>();

const SYSTEM_PROMPT = `Kamu adalah penerjemah profesional bahasa Indonesia ke bahasa Inggris. Terjemahan harus natural, akurat, dan enak dibaca.
Aturan:
- Pertahankan semua sintaks Markdown persis seperti aslinya (heading, bold, italic, daftar, tautan, kutipan, blok kode). Jangan ubah struktur, hanya terjemahkan teksnya.
- Jangan menerjemahkan nama produk, nama orang, URL, atau tag.
- Balas HANYA dengan JSON yang valid, tanpa teks atau penjelasan lain.`;

function hashSource(post: Post): string {
  const s = post.title + "|" + post.excerpt + "|" + post.content;
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h).toString(36);
}

function extractJson(raw: string): Record<string, unknown> | null {
  let text = raw.trim();
  const fence = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) text = fence[1].trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

async function getCache(key: string): Promise<Translation | null> {
  if (KV_ENABLED) {
    try {
      const value = await kv.get<Translation>(key);
      if (value) return value;
    } catch {
      // fall through ke memory
    }
  }
  return memoryCache.get(key) || null;
}

async function setCache(key: string, value: Translation): Promise<void> {
  if (KV_ENABLED) {
    try {
      await kv.set(key, value, { ex: CACHE_TTL_SECONDS });
      return;
    } catch {
      // fall through ke memory
    }
  }
  memoryCache.set(key, value);
}

function buildPrompt(post: Post, mode: TranslationMode): string {
  if (mode === "full") {
    return `Terjemahkan seluruh artikel berikut ke bahasa Inggris. Balas hanya JSON dengan kunci "title", "excerpt", dan "content".

Judul asli: ${post.title}

Ringkasan asli: ${post.excerpt}

Isi artikel (Markdown):
${post.content}`;
  }

  return `Terjemahkan judul dan ringkasan artikel berikut ke bahasa Inggris. Balas hanya JSON dengan kunci "title" dan "excerpt".

Judul asli: ${post.title}

Ringkasan asli: ${post.excerpt}`;
}

export async function translatePost(
  post: Post,
  mode: TranslationMode
): Promise<Translation> {
  const key = `blog:tr:${post.slug}:${hashSource(post)}:${mode}`;

  const cached = await getCache(key);
  if (cached) return cached;

  const reply = await chatOpenRouter(SYSTEM_PROMPT, [
    { role: "user", content: buildPrompt(post, mode) },
  ], { temperature: 0.2, maxTokens: mode === "full" ? 4000 : 1000 });

  const parsed = extractJson(reply);

  if (!parsed) {
    const fallback: Translation = { title: post.title, excerpt: post.excerpt };
    if (mode === "full") fallback.content = post.content;
    return fallback;
  }

  const translation: Translation = {
    title: typeof parsed.title === "string" ? parsed.title.trim() : post.title,
    excerpt:
      typeof parsed.excerpt === "string" ? parsed.excerpt.trim() : post.excerpt,
  };

  if (mode === "full") {
    translation.content =
      typeof parsed.content === "string" && parsed.content.trim()
        ? parsed.content.trim()
        : post.content;
  }

  await setCache(key, translation);
  return translation;
}
