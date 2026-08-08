import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/admin-auth";
import { checkSiteStatus } from "@/lib/site-status";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ integrations: await checkSiteStatus() });
}
