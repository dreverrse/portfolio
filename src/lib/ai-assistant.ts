import { chatOpenRouter } from "@/lib/openrouter";
import { translatePost } from "@/lib/translate";
import { getPostBySlug } from "@/lib/blog";

export interface AiDraftResult {
  title: string;
  excerpt: string;
  content: string;
}

export interface AiExcerptTagsResult {
  excerpt: string;
  tags: string[];
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

function requireKeys(
  reply: string,
  keys: string[]
): Record<string, unknown> | null {
  const parsed = extractJson(reply);
  if (!parsed) return null;
  for (const key of keys) {
    const value = parsed[key];
    if (typeof value !== "string" || !(value as string).trim()) return null;
  }
  return parsed;
}

const DRAFT_SYSTEM = `Kamu adalah penulis artikel blog teknis berbahasa Indonesia. Buat draft artikel dari topik yang diberikan.
Balas HANYA dengan JSON valid, tanpa teks lain, dengan kunci:
- "title": judul yang menarik dan jelas (maks 100 karakter)
- "excerpt": ringkasan 1-2 kalimat
- "content": isi artikel lengkap dalam Markdown (minimal 3 heading, paragraf padat dan informatif)`;

export async function generateDraft(topic: string): Promise<AiDraftResult> {
  const reply = await chatOpenRouter(DRAFT_SYSTEM, [
    { role: "user", content: topic },
  ], {
    temperature: 0.8,
    maxTokens: 2500,
    validate: (raw) => requireKeys(raw, ["title", "excerpt", "content"]) !== null,
  });
  const parsed = requireKeys(reply, ["title", "excerpt", "content"])!;
  return {
    title: parsed.title as string,
    excerpt: parsed.excerpt as string,
    content: parsed.content as string,
  };
}

const EXCERPT_TAGS_SYSTEM = `Kamu adalah editor blog. Dari isi artikel yang diberikan, buat ringkasan dan tag.
Balas HANYA dengan JSON valid, tanpa teks lain, dengan kunci:
- "excerpt": ringkasan 1-2 kalimat dalam bahasa yang sama dengan artikel
- "tags": array string, maksimal 10 tag, tanpa spasi (boleh tanda # di awal)`;

export async function generateExcerptTags(
  content: string
): Promise<AiExcerptTagsResult> {
  const reply = await chatOpenRouter(EXCERPT_TAGS_SYSTEM, [
    { role: "user", content: content.slice(0, 12000) },
  ], {
    temperature: 0.3,
    maxTokens: 600,
    validate: (raw) => {
      const parsed = extractJson(raw);
      if (!parsed) return false;
      if (typeof parsed.excerpt !== "string" || !(parsed.excerpt as string).trim()) return false;
      return Array.isArray(parsed.tags);
    },
  });
  const parsed = extractJson(reply)!;
  return {
    excerpt: parsed.excerpt as string,
    tags: (parsed.tags as unknown[]).slice(0, 10).map((t) => String(t).trim()).filter(Boolean),
  };
}

const REWRITE_SYSTEM = `Kamu adalah editor blog berpengalaman. Perbaiki konten artikel sesuai instruksi pengguna: rapikan struktur, perbaiki tata bahasa, pertahankan makna dan gaya penulisan.
Balas HANYA dengan konten Markdown yang sudah diperbaiki, tanpa teks lain dan tanpa pembungkus kode.`;

export async function rewriteContent(
  content: string,
  instruction: string
): Promise<{ content: string }> {
  const prompt = `Instruksi perbaikan: ${instruction || "Perbaiki struktur, tata bahasa, dan kerapian konten."}

Konten:
${content.slice(0, 12000)}`;
  const reply = await chatOpenRouter(REWRITE_SYSTEM, [
    { role: "user", content: prompt },
  ], {
    temperature: 0.4,
    maxTokens: 4000,
  });
  return { content: reply };
}

export async function translateStoredPost(
  slug: string
): Promise<{ title: string; excerpt: string; content: string } | null> {
  const post = await getPostBySlug(slug);
  if (!post) return null;
  const result = await translatePost(post, "full");
  return {
    title: result.title,
    excerpt: result.excerpt,
    content: result.content || post.content,
  };
}
