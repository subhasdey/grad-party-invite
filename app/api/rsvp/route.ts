import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { RSVP } from "@/lib/models";
import { sendConfirmationEmail } from "@/lib/email";
import { sendConfirmationSMS } from "@/lib/sms";
import { appendRsvpToSheet } from "@/lib/googledrive";

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
    const { name, email, phone, adults, kids, diet, message, attending } = await req.json();
    const safeName = String(name || "").trim();
    const safeEmail = String(email || "").trim();
    const safePhone = String(phone || "").trim();
    const safeAdults = Number(adults) || 1;
    const safeKids = Number(kids) || 0;
    const safeAttending = Boolean(attending);

    if (!safeName || (!safeEmail && !safePhone)) {
      return NextResponse.json(
        { error: "Name and at least one contact method (email or phone) is required" },
        { status: 400 }
      );
    }

    let rsvp;
    let storage: "mongo" | "sheet_fallback" = "mongo";
    try {
      await connectDB();
      rsvp = await RSVP.create({
        name: safeName,
        email: safeEmail || undefined,
        phone: safePhone || undefined,
        adults: safeAdults,
        kids: safeKids,
        diet,
        message,
        attending: safeAttending,
      });
    } catch (dbErr) {
      console.error("RSVP mongo save failed, trying sheet fallback:", dbErr);
      await appendRsvpToSheet({
        name: safeName,
        email: safeEmail || undefined,
        phone: safePhone || undefined,
        attending: safeAttending,
        adults: safeAdults,
        kids: safeKids,
        diet: typeof diet === "string" ? diet : undefined,
        message: typeof message === "string" ? message : undefined,
      });
      storage = "sheet_fallback";
      rsvp = {
        name: safeName,
        email: safeEmail || undefined,
        phone: safePhone || undefined,
        adults: safeAdults,
        kids: safeKids,
        diet,
        message,
        attending: safeAttending,
      };
    }

    const confirmations: string[] = [];
    if (safeEmail) {
      sendConfirmationEmail(safeEmail, safeName, safeAttending).catch(() => {});
      confirmations.push("email");
    }
    if (safePhone) {
      sendConfirmationSMS(safePhone, safeName, safeAttending).catch(() => {});
      confirmations.push("sms");
    }

    return NextResponse.json({ rsvp, confirmations, storage }, { status: 201 });
  } catch (err) {
    console.error("RSVP save failed:", err);
    const message = err instanceof Error ? err.message : "Failed to save RSVP";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
