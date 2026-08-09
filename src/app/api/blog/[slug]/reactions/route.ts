import { NextResponse } from "next/server";
import {
  getReactions,
  toggleReaction,
} from "@/lib/blog-engagement";
import { isValidSlug } from "@/lib/utils";

export const dynamic = "force-dynamic";

const MAX_USER_ID_LENGTH = 64;

function validUserId(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, MAX_USER_ID_LENGTH);
}

function validReaction(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, 8);
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!isValidSlug(slug)) {
    return NextResponse.json({ counts: {}, mine: [] });
  }
  const url = new URL(_request.url);
  const userId = validUserId(url.searchParams.get("userId"));
  const result = await getReactions(slug, userId);
  return NextResponse.json(result);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!isValidSlug(slug)) {
    return NextResponse.json({ error: "Slug tidak valid" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const userId = validUserId(b.userId);
  const reaction = validReaction(b.reaction);

  if (!userId) {
    return NextResponse.json({ error: "userId wajib diisi" }, { status: 400 });
  }

  const result = await toggleReaction(slug, reaction, userId);
  if (!result) {
    return NextResponse.json({ error: "Reaksi tidak valid" }, { status: 400 });
  }

  return NextResponse.json(result);
}
