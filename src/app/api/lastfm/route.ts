import { getLastTrack } from "@/lib/lastfm";
import { NextResponse } from "next/server";

export async function GET() {
  const track = await getLastTrack();

  if (!track) {
    return NextResponse.json({ track: null });
  }

  return NextResponse.json({ track });
}
