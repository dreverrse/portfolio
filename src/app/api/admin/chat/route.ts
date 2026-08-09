import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { getClientIp, rateLimit } from "@/lib/ratelimit";
import { zenChat, type ZenMessage } from "@/lib/zen";

export const maxDuration = 60;

const MAX_MESSAGES = 20;
const MAX_MESSAGE_LENGTH = 4000;
const WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS = 20;

function isZenRole(role: unknown): role is "user" | "assistant" {
  return role === "user" || role === "assistant";
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const blocked = await rateLimit(getClientIp(request), {
    limit: MAX_REQUESTS,
    windowMs: WINDOW_MS,
    prefix: "rl:admin-chat",
  });
  if (!blocked.success) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi nanti." },
      { status: 429 }
    );
  }

  let body: { messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const raw = Array.isArray(body.messages) ? body.messages : [];
  const messages: ZenMessage[] = raw
    .filter(
      (m): m is Record<string, unknown> =>
        typeof m === "object" && m !== null
    )
    .filter(
      (m) =>
        isZenRole(m.role) && typeof m.content === "string" && m.content.trim().length > 0
    )
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content as string,
    }))
    .slice(-MAX_MESSAGES);

  if (messages.length === 0) {
    return NextResponse.json({ error: "Tidak ada pesan" }, { status: 400 });
  }

  if (messages.some((m) => m.content.length > MAX_MESSAGE_LENGTH)) {
    return NextResponse.json(
      { error: `Pesan terlalu panjang (maks ${MAX_MESSAGE_LENGTH} karakter)` },
      { status: 400 }
    );
  }

  try {
    const reply = await zenChat(messages);
    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Gagal memproses" },
      { status: 502 }
    );
  }
}
