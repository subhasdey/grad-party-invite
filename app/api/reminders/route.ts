import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { RSVP } from "@/lib/models";
import { sendReminderEmail } from "@/lib/email";
import { sendReminderSMS } from "@/lib/sms";

export async function POST(req: NextRequest) {
  const { password } = await req.json();
  if (password !== process.env.ADMIN_PASSWORD) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const pending = await RSVP.find({ attending: true, reminderSent: false });
  const results = await Promise.allSettled(
    pending.map(async (r) => {
      if (r.email) await sendReminderEmail(r.email, r.name);
      if (r.phone) await sendReminderSMS(r.phone, r.name);
      r.reminderSent = true;
      await r.save();
    })
  );
  const sent = results.filter(r => r.status === "fulfilled").length;
  return NextResponse.json({ message: `Reminders sent to ${sent} guests` });
}
