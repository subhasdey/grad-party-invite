import { NextResponse } from "next/server";
import { readMediaFromSheet } from "@/lib/googledrive";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const media = await readMediaFromSheet();
    return NextResponse.json(media);
  } catch (err) {
    console.error("Media fetch error:", err);
    return NextResponse.json([]);
  }
}
