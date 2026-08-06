import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "blog_admin";
const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "";
}

function getSecret(): string {
  const secret = process.env.ADMIN_SECRET || getAdminPassword();
  if (!secret) {
    throw new Error(
      "Admin auth belum dikonfigurasi. Set ADMIN_SECRET (atau ADMIN_PASSWORD) di environment."
    );
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSecret()).update(payload).digest("hex");
}

export function verifyPassword(password: string): boolean {
  const expected = getAdminPassword();
  if (!expected || !password) return false;
  const a = Buffer.from(password);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createSessionToken(): string {
  const payload = JSON.stringify({
    sub: "admin",
    exp: Date.now() + SESSION_DURATION_MS,
  });
  const encoded = Buffer.from(payload).toString("base64url");
  return `${encoded}.${sign(encoded)}`;
}

export function verifySessionToken(token: string): boolean {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return false;

  try {
    const payload = Buffer.from(encoded, "base64url").toString("utf-8");
    const expected = sign(encoded);

    const a = Buffer.from(expected);
    const b = Buffer.from(signature);
    if (a.length !== b.length) return false;
    if (!timingSafeEqual(a, b)) return false;

    const data = JSON.parse(payload) as { sub: string; exp: number };
    return data.sub === "admin" && data.exp > Date.now();
  } catch {
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;
  return verifySessionToken(token);
}

export { COOKIE_NAME };
