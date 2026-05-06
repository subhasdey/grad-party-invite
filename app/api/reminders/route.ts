import { NextRequest, NextResponse } from "next/server";
import { readRsvpsFromSheet } from "@/lib/googledrive";
import { sendReminderEmail } from "@/lib/email";
import { sendReminderSMS } from "@/lib/sms";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password !== "admin123") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rsvps = await readRsvpsFromSheet() as Array<{
    name: string; email: string; phone: string; attending: boolean;
  }>;

  const attending = rsvps.filter(r => r.attending && (r.email || r.phone));

  const results = await Promise.allSettled(
    attending.map(async (r) => {
      if (r.email) await sendReminderEmail(r.email, r.name);
      if (r.phone) await sendReminderSMS(r.phone, r.name);
    })
  );

  const sent = results.filter(r => r.status === "fulfilled").length;
  return NextResponse.json({ message: `Reminders sent to ${sent} of ${attending.length} attending guests` });
}
