import { NextResponse } from "next/server";
import { checkSiteStatus } from "@/lib/site-status";
import { publicRateLimit } from "@/lib/public-api";

export async function GET(request: Request) {
  const limited = await publicRateLimit(request);
  if (limited) return limited;

  return NextResponse.json(
    { ok: true, data: { integrations: await checkSiteStatus() } },
    { headers: { "Cache-Control": "no-store" } }
  );
}
