import { NextRequest, NextResponse } from "next/server";
import { getRSVPs, markReminderSent } from "@/lib/store";
import { sendReminderEmail } from "@/lib/email";
import { sendReminderSMS } from "@/lib/sms";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rsvps = getRSVPs().filter((r) => r.attending && !r.reminderSent);
  const results = await Promise.allSettled(
    rsvps.map(async (r) => {
      if (r.email) await sendReminderEmail(r.email, r.name);
      if (r.phone) await sendReminderSMS(r.phone, r.name);
      markReminderSent(r.id);
      return r.name;
    })
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  return NextResponse.json({ message: `Reminders sent to ${sent} guests` });
}
