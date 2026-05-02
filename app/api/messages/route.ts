import { NextRequest, NextResponse } from "next/server";
import { getMessages, addMessage } from "@/lib/store";

export async function GET() {
  const messages = getMessages();
  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, text } = body;
    if (!name || !text?.trim()) {
      return NextResponse.json({ error: "Name and text required" }, { status: 400 });
    }
    const colors = ["#7c3aed", "#db2777", "#0891b2", "#059669", "#d97706"];
    const avatar = colors[name.charCodeAt(0) % colors.length];
    const msg = addMessage({ name, text: text.trim(), avatar });
    return NextResponse.json(msg, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
