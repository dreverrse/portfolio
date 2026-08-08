import { NextResponse } from "next/server";
import { getAdminStats } from "@/lib/admin-stats";
import { publicRateLimit } from "@/lib/public-api";

export async function GET(request: Request) {
  const limited = await publicRateLimit(request);
  if (limited) return limited;

  const stats = await getAdminStats();
  const data = {
    posts: stats.totals.posts,
    reactions: stats.totals.reactions,
    comments: stats.totals.comments,
    github: stats.github,
  };

  return NextResponse.json({ ok: true, data }, {
    headers: { "Cache-Control": "no-store" },
  });
}
