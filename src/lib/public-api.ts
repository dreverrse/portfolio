import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/ratelimit";

const WINDOW_MS = 60 * 1000;
const MAX = 60;

export async function publicRateLimit(
  request: Request
): Promise<NextResponse | null> {
  const result = await rateLimit(getClientIp(request), {
    limit: MAX,
    windowMs: WINDOW_MS,
    prefix: "rl:public-api",
  });
  if (!result.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Terlalu banyak permintaan. Coba lagi nanti.",
        status: 429,
      },
      {
        status: 429,
        headers: {
          "Retry-After": `${Math.ceil((result.reset - Date.now()) / 1000)}`,
        },
      }
    );
  }
  return null;
}
