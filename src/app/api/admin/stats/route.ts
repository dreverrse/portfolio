import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { getAdminStats } from "@/lib/admin-stats";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ stats: await getAdminStats() });
}
