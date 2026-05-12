import { NextRequest, NextResponse } from "next/server";
import { appendRsvpToSheet, readRsvpsFromSheet, findRsvpRowByEmail, findRsvpRowByPhone, updateRsvpInSheet } from "@/lib/googledrive";
import { sendConfirmationEmail, sendHostNotification } from "@/lib/email";
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

async function saveRsvp(body: Record<string, unknown>, isUpdate = false) {
  const { name, email, phone, adults, kids, diet, message, song, attending, glutenFree, nutAllergy } = body;
  const safeName     = String(name    || "").trim();
  const safeEmail    = String(email   || "").trim();
  const safePhone    = String(phone   || "").trim();
  const safeAdults   = Number(adults) || 1;
  const safeKids     = Number(kids)   || 0;
  const safeAttending = Boolean(attending);

  if (!safeName || !safePhone) {
    return NextResponse.json({ error: "Name and phone number are required" }, { status: 400 });
  }

  const data = {
    name: safeName, email: safeEmail||undefined, phone: safePhone||undefined,
    adults: safeAttending ? safeAdults : 0,
    kids:   safeAttending ? safeKids   : 0,
    diet:       safeAttending && typeof diet === "string" ? diet : undefined,
    message:    typeof message === "string" ? message : undefined,
    song:       typeof song    === "string" ? song    : undefined,
    attending:  safeAttending,
    glutenFree: safeAttending ? Boolean(glutenFree) : false,
    nutAllergy: safeAttending ? Boolean(nutAllergy) : false,
  };

  // For PUT: find by email first, fall back to phone
  if (isUpdate) {
    let existing = safeEmail ? await findRsvpRowByEmail(safeEmail) : null;
    if (!existing) existing = await findRsvpRowByPhone(safePhone);
    if (existing) {
      await updateRsvpInSheet(existing.rowIndex, data);
      return NextResponse.json({ updated: true }, { status: 200 });
    }
  }

  // For POST: prevent duplicates — update instead of appending if phone/email matches
  if (!isUpdate) {
    let existing = await findRsvpRowByPhone(safePhone);
    if (!existing && safeEmail) existing = await findRsvpRowByEmail(safeEmail);
    if (existing) {
      await updateRsvpInSheet(existing.rowIndex, data);
      return NextResponse.json({ updated: true, alreadyExisted: true }, { status: 200 });
    }
  }

  await appendRsvpToSheet(data);

  const confirmations: string[] = [];
  if (safeEmail) { sendConfirmationEmail(safeEmail, safeName, safeAttending).catch(() => {}); confirmations.push("email"); }
  if (safePhone) { sendConfirmationSMS(safePhone, safeName, safeAttending).catch(() => {}); confirmations.push("sms"); }
  sendHostNotification(safeName, safeAttending, { email: safeEmail||undefined, phone: safePhone||undefined, adults: safeAdults, kids: safeKids, diet: data.diet, message: data.message }).catch(() => {});

  return NextResponse.json({ confirmations }, { status: 201 });
}

export async function POST(req: NextRequest) {
  try { return await saveRsvp(await req.json()); }
  catch (err) { return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 }); }
}

export async function PUT(req: NextRequest) {
  try { return await saveRsvp(await req.json(), true); }
  catch (err) { return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 }); }
}
