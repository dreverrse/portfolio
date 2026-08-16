import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/ratelimit";

const MAX_MESSAGE_LENGTH = 4000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 10;

const WORKER_URL = process.env.KYLEBOT_WORKER_URL ?? "https://kylebot.andrekusuma388.workers.dev";

async function rateLimitResponse(request: Request): Promise<NextResponse | null> {
  const result = await rateLimit(getClientIp(request), {
    limit: RATE_LIMIT_MAX,
    windowMs: RATE_LIMIT_WINDOW_MS,
    prefix: "rl:waifu",
  });
  if (!result.success) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi nanti." },
      {
        status: 429,
        headers: { "Retry-After": `${Math.ceil((result.reset - Date.now()) / 1000)}` },
      }
    );
  }
  return null;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function GET(request: Request) {
  const blocked = await rateLimitResponse(request);
  if (blocked) return blocked;

  const { searchParams } = new URL(request.url);
  const part = searchParams.get("part") || "malam";
  const valid = ["pagi", "siang", "sore", "malam"];
  const p = valid.includes(part) ? part : "malam";

  try {
    const res = await fetch(`${WORKER_URL}/api/webchat?part=${p}`, {
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || typeof data.reply !== "string") {
      return NextResponse.json(
        { error: data.error ?? "Gagal terhubung ke layanan AI. Coba lagi nanti." },
        { status: res.status >= 500 ? 502 : res.status }
      );
    }
    return NextResponse.json({ reply: data.reply });
  } catch {
    return NextResponse.json(
      { error: "Gagal terhubung ke layanan AI. Coba lagi nanti." },
      { status: 502 }
    );
  }
}

export async function POST(request: Request) {
  const blocked = await rateLimitResponse(request);
  if (blocked) return blocked;

  let body: { messages?: ChatMessage[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const messages = Array.isArray(body.messages) ? body.messages.slice(-20) : [];

  const chatMessages: ChatMessage[] = messages
    .filter((m) => m && typeof m.content === "string")
    .map((m) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: m.content,
    }));

  if (chatMessages.length === 0) {
    return NextResponse.json({ error: "Tidak ada pesan" }, { status: 400 });
  }

  if (chatMessages.some((m) => m.content.length > MAX_MESSAGE_LENGTH)) {
    return NextResponse.json(
      { error: `Pesan terlalu panjang (maks ${MAX_MESSAGE_LENGTH} karakter)` },
      { status: 400 }
    );
  }

  try {
    const res = await fetch(`${WORKER_URL}/api/webchat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: chatMessages }),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || typeof data.reply !== "string") {
      return NextResponse.json(
        { error: data.error ?? "Gagal terhubung ke layanan AI. Coba lagi nanti." },
        { status: res.status >= 500 ? 502 : res.status }
      );
    }
    return NextResponse.json({ reply: data.reply });
  } catch {
    return NextResponse.json(
      { error: "Gagal terhubung ke layanan AI. Coba lagi nanti." },
      { status: 502 }
    );
  }
}
