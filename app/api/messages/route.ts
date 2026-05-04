import { NextRequest, NextResponse } from "next/server";
import { appendMessageToSheet, readMessagesFromSheet } from "@/lib/googledrive";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const messages = await readMessagesFromSheet();
    return NextResponse.json(messages);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, text } = await req.json();
    if (!name || !text?.trim()) return NextResponse.json({ error: "Name and text required" }, { status: 400 });
    const colors = ["#FFCB05", "#CFB991", "#0891b2", "#10b981", "#f472b6"];
    const avatar = colors[name.charCodeAt(0) % colors.length];
    await appendMessageToSheet(name, text.trim(), avatar);
    return NextResponse.json({ name, text: text.trim(), avatar, createdAt: new Date().toISOString() }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
