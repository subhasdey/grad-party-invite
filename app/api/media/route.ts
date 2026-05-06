import { NextRequest, NextResponse } from "next/server";
import { readMediaFromSheet, updateMediaCaptionInSheet, likeMediaInSheet } from "@/lib/googledrive";

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

// Update caption
export async function PUT(req: NextRequest) {
  try {
    const { id, caption } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await updateMediaCaptionInSheet(Number(id), caption ?? "");
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}

// Like / heart
export async function PATCH(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const likes = await likeMediaInSheet(Number(id));
    return NextResponse.json({ likes });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
