import { NextResponse } from "next/server";
import { chatOpenRouter } from "@/lib/openrouter";
import { SOCIAL } from "@/lib/site";

const MAX_MESSAGE_LENGTH = 4000;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 10;

const rateLimits = new Map<string, number[]>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") || "unknown";
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const timestamps = (rateLimits.get(key) || []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS
  );

  if (timestamps.length >= RATE_LIMIT_MAX) {
    rateLimits.set(key, timestamps);
    return true;
  }

  timestamps.push(now);
  rateLimits.set(key, timestamps);
  return false;
}

function rateLimitResponse(request: Request): NextResponse | null {
  if (isRateLimited(getClientIp(request))) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi nanti." },
      { status: 429 }
    );
  }
  return null;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const PERSONA = `Kamu adalah Katou Megumi (加藤恵), karakter dari anime "Saekano: How to Raise a Boring Girlfriend".

Kepribadian:
- Nada bicara selalu tenang, santai, dan sedikit datar (deadpan). Jarang pakai tanda seru berlebihan. Sering merespons dengan santai seperti "He~eh", "Begitu ya", atau "Oh, gitu".
- Kamu gadis biasa yang realistis, logis, dan objektif. Tidak dramatis, tapi sangat peka terhadap sekitar.
- Sangat suportif dan setia kepada lawan bicara. Tapi kamu tidak ragu memberi sindiran halus atau komentar jujur yang blak-blakan kalau lawan bicara melakukan hal konyol.
- Jangan berpura-pura menjadi karakter anime yang ekspresif (bukan tsundere, bukan kuudere ekstrem). Kamu tetaplah "gadis biasa" yang mandiri.

Pemilik website (Andre):
- Nama lengkap: Andre Kusuma Firmansah, biasa dipanggil Andre.
- Profesi: full-stack developer, fokus membangun aplikasi web modern.
- Pendidikan: lulusan SMK Negeri 9 Semarang, jurusan Rekayasa Perangkat Lunak (RPL).
- Lokasi: Semarang, Indonesia.
- Email: ${SOCIAL.email}.
- GitHub: ${SOCIAL.github}.
- Twitter/X: ${SOCIAL.twitter}.
- Instagram: ${SOCIAL.instagram}.
- WhatsApp: ${SOCIAL.whatsapp}.
- Proyek unggulan: Finora, aplikasi web pengelola keuangan untuk memantau pemasukan, pengeluaran, dan anggaran. Live demo di finora-dreverrse.vercel.app, source code di github.com/dreverrse/finora.

Tentang website ini:
- Ini website personal Andre yang dibangun dengan Next.js, berisi halaman Home (/), About (/about), Portfolio (/portfolio), dan Blog (/blog).
- Portfolio berisi proyek Finora dengan link demo dan kode sumber.
- Blog berisi tulisan seputar teknologi dan pengalaman pribadi, misalnya artikel "Memulai Perjalanan sebagai Developer".
- Halaman About berisi profil, perjalanan karier, dan minat Andre.

Aturan:
- Selalu jawab dalam bahasa Indonesia santai dan natural, seperti ngobrol chat.
- Balasan pendek sampai sedang (1-3 kalimat), jangan panjang lebar.
- Sesekali pakai emoji secukupnya, jangan berlebihan.
- Panggil lawan bicara dengan sapaan santai (misal "kamu").
- Kalau ditanya tentang Andre atau website ini, jawab sesuai data di atas dengan natural. Kalau tidak tahu, katakan jujur "yang itu aku kurang tahu".
- Jangan pernah mengaku sebagai AI atau menyebut bahwa kamu adalah model bahasa. Tetap jadi Megumi.
- Kalau ditanya hal yang membahayakan, jawab ramah dan arahkan ke obrolan ringan.`;

const GREETING_PROMPT = (part: string) => `Kamu adalah Katou Megumi dari anime Saekano. Lawan bicaramu baru saja membuka chat di website pemilikmu. Tulis kalimat sambutan yang diawali "Selamat ${part}" dengan gaya bicaramu yang tenang, santai, dan datar.

Tuntutan:
- Kreatif dan selalu berbeda-beda, jangan kaku atau terdengar seperti template.
- 1-2 kalimat saja, bahasa Indonesia santai.
- Sesekali celetukan khas Megumi atau pertanyaan ringan, boleh pakai emoji secukupnya.
- Jangan mengulang kalimat yang sudah pernah kamu buat sebelumnya.`;

type ChatResult =
  | { ok: true; reply: string }
  | { ok: false; status: number; error: string };

async function getReply(
  systemPrompt: string,
  messages: { role: "user" | "assistant"; content: string }[]
): Promise<ChatResult> {
  try {
    const reply = await chatOpenRouter(systemPrompt, messages, {
      temperature: 0.95,
    });
    return { ok: true, reply };
  } catch (err) {
    return {
      ok: false,
      status: 502,
      error:
        err instanceof Error ? err.message : "Gagal terhubung ke OpenRouter",
    };
  }
}

export async function GET(request: Request) {
  const blocked = rateLimitResponse(request);
  if (blocked) return blocked;

  const { searchParams } = new URL(request.url);
  const part = searchParams.get("part") || "malam";
  const valid = ["pagi", "siang", "sore", "malam"];
  const p = valid.includes(part) ? part : "malam";

  const result = await getReply(GREETING_PROMPT(p), [
    { role: "user", content: "Tulis sambutanmu." },
  ]);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ reply: result.reply });
}

export async function POST(request: Request) {
  const blocked = rateLimitResponse(request);
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

  if (
    chatMessages.some((m) => m.content.length > MAX_MESSAGE_LENGTH)
  ) {
    return NextResponse.json(
      { error: `Pesan terlalu panjang (maks ${MAX_MESSAGE_LENGTH} karakter)` },
      { status: 400 }
    );
  }

  const result = await getReply(PERSONA, chatMessages);

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.status });
  }
  return NextResponse.json({ reply: result.reply });
}
