import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { appendMediaToSheet } from "@/lib/googledrive";

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

    const maxBytes = 250 * 1024 * 1024;
    if (file.size > maxBytes) {
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
    const message = err instanceof Error ? err.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
