import { NextResponse } from "next/server";
import { getPostBySlug } from "@/lib/blog";
import { publicRateLimit } from "@/lib/public-api";

export async function GET(
  request: Request,
  ctx: RouteContext<"/api/v1/posts/[slug]">
) {
  const limited = await publicRateLimit(request);
  if (limited) return limited;

  const { slug } = await ctx.params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return NextResponse.json(
      { ok: false, error: "Artikel tidak ditemukan", status: 404 },
      { status: 404 }
    );
  }

  return NextResponse.json({ ok: true, data: post }, {
    headers: { "Cache-Control": "public, s-maxage=300" },
  });
}
