import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { RSVP } from "@/lib/models";
import { sendConfirmationEmail } from "@/lib/email";
import { sendConfirmationSMS } from "@/lib/sms";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const rsvps = await RSVP.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(rsvps);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, email, phone, adults, kids, diet, message, attending } = await req.json();
    const safeName = String(name || "").trim();
    const safeEmail = String(email || "").trim();
    const safePhone = String(phone || "").trim();

    if (!safeName || (!safeEmail && !safePhone)) {
      return NextResponse.json(
        { error: "Name and at least one contact method (email or phone) is required" },
        { status: 400 }
      );
    }

    const rsvp = await RSVP.create({
      name: safeName,
      email: safeEmail || undefined,
      phone: safePhone || undefined,
      adults: Number(adults) || 1,
      kids: Number(kids) || 0,
      diet,
      message,
      attending,
    });

    const confirmations: string[] = [];
    if (safeEmail) {
      sendConfirmationEmail(safeEmail, safeName, attending).catch(() => {});
      confirmations.push("email");
    }
    if (safePhone) {
      sendConfirmationSMS(safePhone, safeName, Boolean(attending)).catch(() => {});
      confirmations.push("sms");
    }
    return NextResponse.json({ rsvp, confirmations }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to save RSVP" }, { status: 500 });
  }
}
