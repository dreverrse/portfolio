import { SUPABASE_ENABLED, getSupabase } from "@/lib/supabase";
import { chatOpenRouter } from "@/lib/openrouter";
import type { Post } from "@/lib/blog";

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
- Gunakan baris baru (newline) yang sama persis dengan sumber: setiap heading dan item daftar harus dimulai pada baris baru. JANGAN pernah menulis karakter backslash-n; gunakan baris baru asli.
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
  if (SUPABASE_ENABLED) {
    try {
      const { data, error } = await getSupabase()
        .from("translation_cache")
        .select("value")
        .eq("key", key)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();
      if (error) throw error;
      if (data) return data.value as Translation;
    } catch {
      // fall through ke memory
    }
  }
  return memoryCache.get(key) || null;
}

async function setCache(key: string, value: Translation): Promise<void> {
  if (SUPABASE_ENABLED) {
    try {
      const expiresAt = new Date(
        Date.now() + CACHE_TTL_SECONDS * 1000
      ).toISOString();
      const { error } = await getSupabase()
        .from("translation_cache")
        .upsert({ key, value, expires_at: expiresAt }, { onConflict: "key" });
      if (error) throw error;
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

function normalizeMarkdown(text: string): string {
  let out = text.replace(/\\r/g, "").replace(/\\n/g, "\n");
  out = out.replace(/\s+(#{1,6}\s)/g, "\n$1");
  out = out.replace(/\s+(\d+[.)]\s)/g, "\n$1");
  out = out.replace(/\s+([-*]\s+(?:\*\*)?[A-Z*])/g, "\n$1");
  out = out.replace(/\n{3,}/g, "\n\n");
  return out.trim();
}

function normalizeInline(text: string): string {
  return text.replace(/\\r/g, "").replace(/\\n/g, "\n").trim();
}

const IDN_WORDS = [
  "yang", "dan", "dari", "untuk", "dengan", "adalah", "tidak", "ini",
  "itu", "saya", "juga", "sudah", "masih", "pada", "akan", "oleh",
  "bahwa", "dalam", "ketika", "karena", "agar", "supaya", "lalu",
  "setelah", "serta", "seperti", "merupakan",
];

function looksIndonesian(text: string): boolean {
  let count = 0;
  for (const word of IDN_WORDS) {
    const re = new RegExp(`\\b${word}\\b`, "gi");
    while (re.exec(text) !== null) count++;
  }  return count >= 5;
}

function validateTranslation(reply: string, mode: TranslationMode): boolean {
  const parsed = extractJson(reply);
  if (!parsed) return false;
  const title = parsed.title;
  const excerpt = parsed.excerpt;
  if (typeof title !== "string" || !title.trim()) return false;
  if (typeof excerpt !== "string" || !excerpt.trim()) return false;
  if (looksIndonesian(title)) return false;
  if (mode === "full") {
    const content = parsed.content;
    if (typeof content !== "string" || !content.trim()) return false;
    if (looksIndonesian(content)) return false;
  }
  return true;
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
  ], {
    temperature: 0.2,
    maxTokens: mode === "full" ? 4000 : 1000,
    validate: (raw) => validateTranslation(raw, mode),
  });

  const parsed = extractJson(reply);

  if (!parsed) {
    const fallback: Translation = { title: post.title, excerpt: post.excerpt };
    if (mode === "full") fallback.content = post.content;
    return fallback;
  }

  const translation: Translation = {
    title:
      typeof parsed.title === "string" && parsed.title.trim()
        ? normalizeInline(parsed.title)
        : post.title,
    excerpt:
      typeof parsed.excerpt === "string" && parsed.excerpt.trim()
        ? normalizeInline(parsed.excerpt)
        : post.excerpt,
  };

  if (mode === "full") {
    translation.content =
      typeof parsed.content === "string" && parsed.content.trim()
        ? normalizeMarkdown(parsed.content)
        : post.content;
  }

  await setCache(key, translation);
  return translation;
}
