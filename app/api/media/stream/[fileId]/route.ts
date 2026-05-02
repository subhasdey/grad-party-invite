import { NextRequest } from "next/server";
import { streamFile } from "@/lib/googledrive";

export async function GET(req: NextRequest, ctx: RouteContext<"/api/media/stream/[fileId]">) {
  try {
    const { fileId } = await ctx.params;
    const driveRes = await streamFile(fileId, req.headers.get("range"));

    const headers = new Headers();
    for (const key of ["content-type", "content-length", "content-range", "accept-ranges"]) {
      const val = driveRes.headers.get(key);
      if (val) headers.set(key, val);
    }
    headers.set("cache-control", "public, max-age=86400");

    return new Response(driveRes.body, { status: driveRes.status, headers });
  } catch (err) {
    console.error("Stream error:", err);
    return new Response("Media not found", { status: 404 });
  }
}
