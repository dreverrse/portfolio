import { NextResponse } from "next/server";
import {
  COOKIE_NAME,
  createSessionToken,
  verifyPassword,
} from "@/lib/admin-auth";

export async function POST(request: Request) {
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
