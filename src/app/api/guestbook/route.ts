import { NextResponse } from "next/server";
import { getEntries, addEntry, type GuestEntry } from "@/lib/guestbook";

const MAX_NAME_LENGTH = 30;
const MAX_MESSAGE_LENGTH = 500;
const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX = 5;

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

function cleanText(value: string): string {
  return value
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET() {
  const entries = await getEntries();
  return NextResponse.json({ entries });
}

export async function POST(request: Request) {
  if (isRateLimited(getClientIp(request))) {
    return NextResponse.json(
      { error: "Terlalu banyak permintaan. Coba lagi nanti." },
      { status: 429 }
    );
  }

  let body: { name?: string; message?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const name = cleanText(typeof body.name === "string" ? body.name : "");
  const message = cleanText(typeof body.message === "string" ? body.message : "");

  if (!name || name.length > MAX_NAME_LENGTH) {
    return NextResponse.json(
      { error: `Nama harus 1-${MAX_NAME_LENGTH} karakter` },
      { status: 400 }
    );
  }

  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Pesan harus 1-${MAX_MESSAGE_LENGTH} karakter` },
      { status: 400 }
    );
  }

  const entry: GuestEntry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name,
    message,
    createdAt: new Date().toISOString(),
  };

  await addEntry(entry);

  return NextResponse.json({ entry }, { status: 201 });
}
