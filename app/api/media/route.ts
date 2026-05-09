import { NextRequest, NextResponse } from "next/server";
import { readMediaFromSheet, appendMediaToSheet, updateMediaCaptionInSheet, likeMediaInSheet, deleteMediaFromSheet } from "@/lib/googledrive";
import { del } from "@vercel/blob";

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

// Record metadata after a client-side blob upload completes
export async function POST(req: NextRequest) {
  try {
    const { name, url, caption, type } = await req.json();
    if (!url) return NextResponse.json({ error: "Missing url" }, { status: 400 });
    await appendMediaToSheet({
      name: name || "Guest",
      url,
      fileId: url,
      type: type || "image",
      caption: caption || "",
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
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

// Delete media (removes row from sheet + blob from storage)
export async function DELETE(req: NextRequest) {
  try {
    const { id, url } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await deleteMediaFromSheet(Number(id));
    if (url) {
      try { await del(url); } catch { /* blob delete is best-effort */ }
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed" },
      { status: 500 }
    );
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
