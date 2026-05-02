import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Media } from "@/lib/models";

export async function GET() {
  await connectDB();
  const media = await Media.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(media);
}
