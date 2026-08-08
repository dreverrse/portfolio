import { NextResponse } from "next/server";
import { getCachedGitHubStats } from "@/lib/github-stats";

export async function GET() {
  return NextResponse.json({ stats: await getCachedGitHubStats() });
}
