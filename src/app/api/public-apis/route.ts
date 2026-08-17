import { NextResponse } from "next/server";
import { getPublicApis } from "@/lib/public-apis";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.toLowerCase() || "";
  const category = searchParams.get("category") || "";

  const { apis, categories } = await getPublicApis();

  let filtered = apis;

  if (category) {
    filtered = filtered.filter(
      (a) => a.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (q) {
    filtered = filtered.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    ok: true,
    data: { categories, apis: filtered },
  });
}
