import { NextResponse } from "next/server";
import { getAllPosts } from "@/lib/blog";
import { publicRateLimit } from "@/lib/public-api";

export async function GET(request: Request) {
  const limited = await publicRateLimit(request);
  if (limited) return limited;

  const posts = await getAllPosts();
  const data = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    tags: p.tags,
    date: p.date,
    readingTime: p.readingTime,
  }));

  return NextResponse.json({ ok: true, data }, {
    headers: { "Cache-Control": "public, s-maxage=300" },
  });
}
