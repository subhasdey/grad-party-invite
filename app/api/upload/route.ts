import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { appendMediaToSheet, updateMediaFileInSheet } from "@/lib/googledrive";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const name = (formData.get("name") as string | null)?.trim() || "Guest";
    const caption = (formData.get("caption") as string | null)?.trim() || "";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });
    if (!file.type?.startsWith("image/") && !file.type?.startsWith("video/")) {
      return NextResponse.json({ error: "Only image and video uploads are supported" }, { status: 400 });
    }
    if (file.size > 250 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 250MB)" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const slug = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const blob = await put(slug, file, { access: "public" });
    const type = file.type.startsWith("video/") ? "video" : "image";
    await appendMediaToSheet({ name, url: blob.url, fileId: blob.url, type, caption });

    return NextResponse.json({ name, url: blob.url, publicId: blob.url, type, caption }, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Upload failed" }, { status: 500 });
  }
}

// Replace existing media file
export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const id = (formData.get("id") as string | null)?.trim();

    if (!file || !id) return NextResponse.json({ error: "Missing file or id" }, { status: 400 });
    if (!file.type?.startsWith("image/") && !file.type?.startsWith("video/")) {
      return NextResponse.json({ error: "Only image and video uploads are supported" }, { status: 400 });
    }
    if (file.size > 250 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large (max 250MB)" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const slug = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const blob = await put(slug, file, { access: "public" });
    await updateMediaFileInSheet(Number(id), blob.url);

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("Replace error:", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Replace failed" }, { status: 500 });
  }
}
