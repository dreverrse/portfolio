import { NextResponse } from "next/server";
import { getClientIp, rateLimit } from "@/lib/ratelimit";
import { chatOpenCodeZen } from "@/lib/opencode-zen";

const MAX_MESSAGE_LENGTH = 4000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 10;

const SYSTEM_PROMPT = `Kamu adalah KyleBot, asisten AI di website portfolio Andre Kusuma Firmansah (dreverrse.my.id), seorang desainer & developer.
Bicaralah dengan ramah, santai, dan singkat (maksimal 3-4 kalimat). Jawab dalam bahasa yang dipakai pengguna.
Fokus membantu pertanyaan seputar Andre, portofolio, blog, proyek, dan pertanyaan umum ringan.
Kontak resmi jika diminta: email work.andrefirmansah@gmail.com, GitHub https://github.com/dreverrse, Instagram https://instagram.com/dreverrse, X/Twitter https://twitter.com/dreverrse, WhatsApp https://wa.me/6285158599235.
Jangan mengarang data pribadi yang tidak kamu ketahui; arahkan ke halaman About, Portfolio, atau kontak di atas.`;

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

function errorResponse(err: unknown): NextResponse {
  return NextResponse.json(
    { error: err instanceof Error ? err.message : "Gagal memanggil AI. Coba lagi nanti." },
    { status: 502 }
  );
}

export async function GET(request: Request) {
  const blocked = await rateLimitResponse(request);
  if (blocked) return blocked;

  const { searchParams } = new URL(request.url);
  const part = searchParams.get("part") || "malam";
  const valid = ["pagi", "siang", "sore", "malam"];
  const p = valid.includes(part) ? part : "malam";

  try {
    const reply = await chatOpenCodeZen(
      SYSTEM_PROMPT,
      [
        {
          role: "user",
          content:
            `Sapa pengunjung dengan ucapan selamat ${p}, perkenalkan dirimu sebagai KyleBot, lalu tawarkan bantuan singkat.`,
        },
      ],
      { maxTokens: 150 }
    );
    return NextResponse.json({ reply });
  } catch (err) {
    return errorResponse(err);
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
    const reply = await chatOpenCodeZen(SYSTEM_PROMPT, chatMessages);
    return NextResponse.json({ reply });
  } catch (err) {
    return errorResponse(err);
  }
}
