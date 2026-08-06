import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  createSessionToken,
  verifyPassword,
} from "@/lib/admin-auth";
import { getClientIp, rateLimit } from "@/lib/ratelimit";

const LOGIN_WINDOW_MS = 60 * 1000;
const LOGIN_MAX_ATTEMPTS = 5;

export async function POST(request: Request) {
  const blocked = await rateLimit(getClientIp(request), {
    limit: LOGIN_MAX_ATTEMPTS,
    windowMs: LOGIN_WINDOW_MS,
    prefix: "rl:admin-login",
  });
  if (!blocked.success) {
    return NextResponse.json(
      {
        error: "Terlalu banyak percobaan login. Coba lagi beberapa saat.",
      },
      {
        status: 429,
        headers: { "Retry-After": `${Math.ceil((blocked.reset - Date.now()) / 1000)}` },
      }
    );
  }

  let body: { password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!verifyPassword(password)) {
    return NextResponse.json({ error: "Password salah" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
  return response;
}
