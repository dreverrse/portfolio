import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import {
  createStoredPost,
  getStoredPosts,
  slugify,
  type StoredPost,
} from "@/lib/posts-store";

const MAX_TITLE_LENGTH = 160;
const MAX_EXCERPT_LENGTH = 500;

interface PostInput {
  title?: string;
  date?: string;
  excerpt?: string;
  tags?: string[];
  content?: string;
}

function parseInput(body: unknown): PostInput {
  if (typeof body !== "object" || body === null) return {};
  const b = body as Record<string, unknown>;

  const tags = Array.isArray(b.tags)
    ? b.tags
        .map((t) => (typeof t === "string" ? t.trim() : ""))
        .filter(Boolean)
        .slice(0, 10)
    : [];

  return {
    title: typeof b.title === "string" ? b.title.trim() : "",
    date: typeof b.date === "string" ? b.date : "",
    excerpt: typeof b.excerpt === "string" ? b.excerpt.trim() : "",
    tags,
    content: typeof b.content === "string" ? b.content : "",
  };
}

function validate(input: PostInput): string | null {
  if (!input.title || input.title.length > MAX_TITLE_LENGTH) {
    return `Judul harus 1-${MAX_TITLE_LENGTH} karakter`;
  }
  if (!input.content || input.content.trim().length < 10) {
    return "Isi artikel minimal 10 karakter";
  }
  if (input.excerpt && input.excerpt.length > MAX_EXCERPT_LENGTH) {
    return `Ringkasan maksimal ${MAX_EXCERPT_LENGTH} karakter`;
  }
  if (!input.date || Number.isNaN(new Date(input.date).getTime())) {
    return "Tanggal tidak valid";
  }
  return null;
}

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const posts = await getStoredPosts();
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Body tidak valid" }, { status: 400 });
  }

  const input = parseInput(body);
  const error = validate(input);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  const slug = slugify(input.title as string);
  if (!slug) {
    return NextResponse.json({ error: "Judul tidak valid" }, { status: 400 });
  }

  const post: StoredPost = {
    slug,
    title: input.title as string,
    date: input.date as string,
    excerpt: input.excerpt || "",
    tags: input.tags || [],
    content: input.content as string,
  };

  const created = await createStoredPost(post);
  if (!created) {
    return NextResponse.json(
      { error: "Artikel dengan judul ini sudah ada" },
      { status: 409 }
    );
  }

  return NextResponse.json({ post: created }, { status: 201 });
}
