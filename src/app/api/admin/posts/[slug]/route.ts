import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { deleteStoredPost, updateStoredPost } from "@/lib/posts-store";

const MAX_TITLE_LENGTH = 160;
const MAX_EXCERPT_LENGTH = 500;

export async function PATCH(
  request: Request,
  ctx: RouteContext<"/api/admin/posts/[slug]">
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await ctx.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }
  const b = body as Record<string, unknown>;

  const input: Record<string, unknown> = {};

  if (typeof b.title === "string") {
    const title = b.title.trim();
    if (!title || title.length > MAX_TITLE_LENGTH) {
      return NextResponse.json(
        { error: `Judul harus 1-${MAX_TITLE_LENGTH} karakter` },
        { status: 400 }
      );
    }
    input.title = title;
  }

  if (typeof b.date === "string") {
    if (Number.isNaN(new Date(b.date).getTime())) {
      return NextResponse.json({ error: "Tanggal tidak valid" }, { status: 400 });
    }
    input.date = b.date;
  }

  if (typeof b.excerpt === "string") {
    const excerpt = b.excerpt.trim();
    if (excerpt.length > MAX_EXCERPT_LENGTH) {
      return NextResponse.json(
        { error: `Ringkasan maksimal ${MAX_EXCERPT_LENGTH} karakter` },
        { status: 400 }
      );
    }
    input.excerpt = excerpt;
  }

  if (Array.isArray(b.tags)) {
    input.tags = b.tags
      .map((t) => (typeof t === "string" ? t.trim() : ""))
      .filter(Boolean)
      .slice(0, 10);
  }

  if (typeof b.content === "string") {
    if (b.content.trim().length < 10) {
      return NextResponse.json(
        { error: "Isi artikel minimal 10 karakter" },
        { status: 400 }
      );
    }
    input.content = b.content;
  }

  const updated = await updateStoredPost(slug, input);
  if (!updated) {
    return NextResponse.json(
      { error: "Artikel tidak ditemukan" },
      { status: 404 }
    );
  }

  return NextResponse.json({ post: updated });
}

export async function DELETE(
  _request: Request,
  ctx: RouteContext<"/api/admin/posts/[slug]">
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await ctx.params;
  const deleted = await deleteStoredPost(slug);

  if (!deleted) {
    return NextResponse.json(
      { error: "Artikel tidak ditemukan" },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true });
}
