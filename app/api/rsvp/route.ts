import { NextRequest, NextResponse } from "next/server";
import { addRSVP, getRSVPs } from "@/lib/store";
import { sendConfirmationEmail } from "@/lib/email";
import { sendConfirmationSMS } from "@/lib/sms";

export async function GET() {
  const rsvps = getRSVPs();
  return NextResponse.json(rsvps);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, adults, kids, diet, message, attending } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const rsvp = addRSVP({ name, email, phone, adults: Number(adults) || 1, kids: Number(kids) || 0, diet, message, attending });

    // Send notifications (non-blocking)
    if (email) sendConfirmationEmail(email, name, attending).catch(() => {});
    if (phone && attending) sendConfirmationSMS(phone, name).catch(() => {});

    return NextResponse.json(rsvp, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save RSVP" }, { status: 500 });
  }
}
