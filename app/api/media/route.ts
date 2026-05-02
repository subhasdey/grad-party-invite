import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Media } from "@/lib/models";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const media = await Media.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(media);
  } catch (err) {
    console.error("Media fetch error:", err);
    return NextResponse.json([], { status: 200 });
  }
}
