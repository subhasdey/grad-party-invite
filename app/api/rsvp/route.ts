import { NextRequest, NextResponse } from "next/server";
import { appendRsvpToSheet, readRsvpsFromSheet } from "@/lib/googledrive";
import { sendConfirmationEmail } from "@/lib/email";
import { sendConfirmationSMS } from "@/lib/sms";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rsvps = await readRsvpsFromSheet();
    return NextResponse.json(rsvps);
  } catch {
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, adults, kids, diet, message, song, attending } = await req.json();
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

    await appendRsvpToSheet({
      name: safeName,
      email: safeEmail || undefined,
      phone: safePhone || undefined,
      adults: safeAdults,
      kids: safeKids,
      diet: typeof diet === "string" ? diet : undefined,
      message: typeof message === "string" ? message : undefined,
      song: typeof song === "string" ? song : undefined,
      attending: safeAttending,
    });

    const confirmations: string[] = [];
    if (safeEmail) {
      sendConfirmationEmail(safeEmail, safeName, safeAttending).catch(() => {});
      confirmations.push("email");
    }
    if (safePhone) {
      sendConfirmationSMS(safePhone, safeName, safeAttending).catch(() => {});
      confirmations.push("sms");
    }

    return NextResponse.json({ confirmations }, { status: 201 });
  } catch (err) {
    console.error("RSVP save failed:", err);
    const msg = err instanceof Error ? err.message : "Failed to save RSVP";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
