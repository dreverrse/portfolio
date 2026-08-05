import { NextResponse } from "next/server";
import { addComment, getComments } from "@/lib/blog-engagement";

export const dynamic = "force-dynamic";

const MAX_NAME_LENGTH = 30;
const MAX_MESSAGE_LENGTH = 500;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const comments = await getComments(slug);
  return NextResponse.json({ comments });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;
  const name = typeof b.name === "string" ? b.name.trim() : "";
  const message = typeof b.message === "string" ? b.message.trim() : "";

  if (!name || name.length > MAX_NAME_LENGTH) {
    return NextResponse.json(
      { error: `Nama wajib diisi (maks ${MAX_NAME_LENGTH} karakter)` },
      { status: 400 }
    );
  }
  if (!message || message.length > MAX_MESSAGE_LENGTH) {
    return NextResponse.json(
      { error: `Komentar wajib diisi (maks ${MAX_MESSAGE_LENGTH} karakter)` },
      { status: 400 }
    );
  }

  const comment = await addComment(slug, name, message);
  if (!comment) {
    return NextResponse.json({ error: "Gagal menyimpan komentar" }, { status: 500 });
  }

  return NextResponse.json({ comment }, { status: 201 });
}
