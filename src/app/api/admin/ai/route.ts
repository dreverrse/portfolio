import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { getClientIp, rateLimit } from "@/lib/ratelimit";
import {
  generateDraft,
  generateExcerptTags,
  rewriteContent,
  translateStoredPost,
} from "@/lib/ai-assistant";

const AI_WINDOW_MS = 5 * 60 * 1000;
const AI_MAX = 20;

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blocked = await rateLimit(getClientIp(request), {
    limit: AI_MAX,
    windowMs: AI_WINDOW_MS,
    prefix: "rl:admin-ai",
  });
  if (!blocked.success) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan AI. Coba lagi nanti." },
      { status: 429 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const action = typeof body.action === "string" ? body.action : "";
  const topic = typeof body.topic === "string" ? body.topic.trim() : "";
  const content = typeof body.content === "string" ? body.content : "";
  const instruction =
    typeof body.instruction === "string" ? body.instruction.trim() : "";
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";

  try {
    if (action === "draft") {
      if (!topic) {
        return NextResponse.json({ error: "Topik tidak boleh kosong" }, { status: 400 });
      }
      return NextResponse.json({ result: await generateDraft(topic) });
    }

    if (action === "excerptTags") {
      if (!content.trim()) {
        return NextResponse.json({ error: "Konten tidak boleh kosong" }, { status: 400 });
      }
      return NextResponse.json({ result: await generateExcerptTags(content) });
    }

    if (action === "rewrite") {
      if (!content.trim()) {
        return NextResponse.json({ error: "Konten tidak boleh kosong" }, { status: 400 });
      }
      return NextResponse.json({ result: await rewriteContent(content, instruction) });
    }

    if (action === "translate") {
      if (!slug) {
        return NextResponse.json({ error: "Slug tidak boleh kosong" }, { status: 400 });
      }
      const result = await translateStoredPost(slug);
      if (!result) {
        return NextResponse.json({ error: "Artikel tidak ditemukan" }, { status: 404 });
      }
      return NextResponse.json({ result });
    }

    return NextResponse.json({ error: "Action tidak dikenal" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memproses permintaan" },
      { status: 500 }
    );
  }
}
