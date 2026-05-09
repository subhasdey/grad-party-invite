import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { put } from "@vercel/blob";
import { updateMediaFileInSheet } from "@/lib/googledrive";

export const maxDuration = 60;

// Handles client-side upload: token generation + completion webhook
export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (_pathname, clientPayload) => {
        return {
          allowedContentTypes: [
            "image/jpeg", "image/jpg", "image/png", "image/gif",
            "image/webp", "image/heic", "image/heif", "image/avif",
            "video/mp4", "video/quicktime", "video/webm", "video/mov", "video/avi",
          ],
          maximumSizeInBytes: 250 * 1024 * 1024,
          tokenPayload: clientPayload, // carries { name, caption } from client
        };
      },
      onUploadCompleted: async () => {
        // Metadata is recorded client-side via POST /api/media after upload completes.
        // This webhook fires only in production and serves as a no-op backup.
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (err) {
    console.error("handleUpload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload token error" },
      { status: 400 }
    );
  }
}

// Replace existing media file (server-side, used for small replacements)
export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const id = (formData.get("id") as string | null)?.trim();

    if (!file || !id) return NextResponse.json({ error: "Missing file or id" }, { status: 400 });

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const slug = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const blob = await put(slug, file, { access: "public" });
    await updateMediaFileInSheet(Number(id), blob.url);

    return NextResponse.json({ url: blob.url });
  } catch (err) {
    console.error("Replace error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Replace failed" },
      { status: 500 }
    );
  }
}
