import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { RSVP } from "@/lib/models";
import { sendConfirmationEmail } from "@/lib/email";
import { sendConfirmationSMS } from "@/lib/sms";

export async function GET() {
  await connectDB();
  const rsvps = await RSVP.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json(rsvps);
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, email, phone, adults, kids, diet, message, attending } = await req.json();
    if (!name || !email) return NextResponse.json({ error: "Name and email required" }, { status: 400 });

    const rsvp = await RSVP.create({ name, email, phone, adults: Number(adults) || 1, kids: Number(kids) || 0, diet, message, attending });

    if (email) sendConfirmationEmail(email, name, attending).catch(() => {});
    if (phone && attending) sendConfirmationSMS(phone, name).catch(() => {});

    return NextResponse.json(rsvp, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save RSVP" }, { status: 500 });
  }
}
