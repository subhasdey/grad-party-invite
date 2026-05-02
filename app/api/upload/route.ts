import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import connectDB from "@/lib/mongodb";
import { Media } from "@/lib/models";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file    = formData.get("file") as File;
    const name    = formData.get("name") as string || "Guest";
    const caption = formData.get("caption") as string || "";

    if (!file) return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const bytes  = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext    = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const slug   = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const result = await uploadToCloudinary(buffer, slug, "auto");

    await connectDB();
    const media = await Media.create({
      name,
      url:       result.url,
      publicId:  result.publicId,
      type:      result.type,
      thumbnail: result.thumbnail,
      caption,
    });

    return NextResponse.json(media, { status: 201 });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
