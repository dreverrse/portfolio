import { NextResponse } from "next/server";
import { getPostBySlug } from "@/lib/blog";
import { translatePost, type Translation, type TranslationMode } from "@/lib/translate";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MAX_SLUGS = 20;

export async function POST(request: Request) {
  let body: { slugs?: unknown; mode?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const slugs = Array.isArray(body.slugs)
    ? body.slugs
        .filter((s): s is string => typeof s === "string")
        .slice(0, MAX_SLUGS)
    : [];

  const mode: TranslationMode = body.mode === "full" ? "full" : "list";

  if (slugs.length === 0) {
    return NextResponse.json({ error: "Tidak ada slug" }, { status: 400 });
  }

  const translations: Record<string, Translation> = {};

  for (const slug of slugs) {
    const post = await getPostBySlug(slug);
    if (!post) continue;
    try {
      translations[slug] = await translatePost(post, mode);
    } catch {
      const fallback: Translation = {
        title: post.title,
        excerpt: post.excerpt,
        ...(mode === "full" ? { content: post.content } : {}),
      };
      translations[slug] = fallback;
    }
  }

  return NextResponse.json({ translations }, {
    headers: { "cache-control": "no-store" },
  });
}
