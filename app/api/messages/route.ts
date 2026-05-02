import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Message } from "@/lib/models";

export async function GET() {
  await connectDB();
  const messages = await Message.find().sort({ createdAt: 1 }).lean();
  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, text } = await req.json();
    if (!name || !text?.trim()) return NextResponse.json({ error: "Name and text required" }, { status: 400 });

    const colors = ["#FFCB05", "#CFB991", "#0891b2", "#10b981", "#f472b6"];
    const avatar = colors[name.charCodeAt(0) % colors.length];
    const msg = await Message.create({ name, text: text.trim(), avatar });
    return NextResponse.json(msg, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
