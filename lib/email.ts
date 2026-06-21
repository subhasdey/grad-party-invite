import nodemailer from "nodemailer";

function getTransporter() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const FROM = `Iris & Inesh Graduation <${process.env.SMTP_USER || "ineshandiris@gmail.com"}>`;
const HOST_EMAILS = ["subhascdey@gmail.com", "monjoy.dey@gmail.com"];

const APP_URL = "https://iris-and-inesh-2026.vercel.app";
const DATE = "Friday, June 26, 2026";
const TIME = "5:00 PM";
const VENUE = "Redmond Senior & Community Center, Redmond, WA";

function confirmationHtml(guestName: string, attending: boolean): string {
  if (!attending) {
    return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;background:#FAF6EE;border-radius:20px;overflow:hidden;border:1px solid rgba(0,0,0,0.08)">
  <div style="background:#00274C;padding:36px 32px;text-align:center">
    <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,203,5,0.7)">Class of 2026</p>
    <h1 style="margin:0;color:#FFCB05;font-size:26px;font-weight:700">Iris &amp; Inesh Dey</h1>
    <p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:13px">Graduation Celebration</p>
  </div>
  <div style="padding:32px">
    <h2 style="color:#1d1d1f;margin:0 0 12px;font-size:20px">Thanks for letting us know, ${guestName}.</h2>
    <p style="color:rgba(0,0,0,0.6);line-height:1.7;margin:0 0 20px">We're sorry you can't make it, but we appreciate you responding. You can still leave a message and follow along on our party page.</p>
    <a href="${APP_URL}" style="display:inline-block;background:#00274C;color:#FFCB05;padding:12px 24px;border-radius:50px;text-decoration:none;font-size:13px;font-weight:700">Visit Party Page</a>
    <div style="margin-top:16px;padding:12px 16px;background:#f0f4ff;border-radius:12px;text-align:center">
      <p style="margin:0 0 4px;font-size:11px;color:rgba(0,0,0,0.4);letter-spacing:0.05em;text-transform:uppercase">Party Website</p>
      <a href="${APP_URL}" style="font-size:13px;font-weight:700;color:#00274C;text-decoration:none">${APP_URL}</a>
    </div>
  </div>
</div>`;
  }

  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;background:#FAF6EE;border-radius:20px;overflow:hidden;border:1px solid rgba(0,0,0,0.08)">
  <div style="background:#00274C;padding:36px 32px;text-align:center">
    <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,203,5,0.7)">You're Confirmed - Class of 2026</p>
    <h1 style="margin:0;color:#FFCB05;font-size:26px;font-weight:700">Iris &amp; Inesh Dey</h1>
    <p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:13px">Graduation Celebration</p>
  </div>
  <div style="padding:32px">
    <h2 style="color:#1d1d1f;margin:0 0 8px;font-size:22px">You're on the list, ${guestName}!</h2>
    <p style="color:rgba(0,0,0,0.6);line-height:1.7;margin:0 0 24px">We're so excited to celebrate with you. Here are the details for the evening:</p>
    <div style="background:#ffffff;border:1px solid rgba(0,0,0,0.08);border-radius:16px;padding:20px;margin-bottom:16px">
      <p style="margin:0 0 10px;color:#1d1d1f"><strong>Date:</strong> ${DATE}</p>
      <p style="margin:0 0 10px;color:#1d1d1f"><strong>Time:</strong> ${TIME}</p>
      <p style="margin:0;color:#1d1d1f"><strong>Venue:</strong> ${VENUE}</p>
    </div>
    <div style="background:#ffffff;border:1px solid rgba(0,0,0,0.08);border-radius:16px;padding:20px;margin-bottom:24px">
      <p style="margin:0 0 6px;color:#1d1d1f;font-weight:600">Dress Code</p>
      <p style="margin:0;color:rgba(0,0,0,0.6)">Festive semi-formal - Navy Blue or Black</p>
    </div>
    <div style="text-align:center">
      <a href="${APP_URL}/gallery" style="display:inline-block;background:#00274C;color:#FFCB05;padding:14px 28px;border-radius:50px;text-decoration:none;font-size:13px;font-weight:700;margin-right:8px">Share Photos &amp; Videos</a>
      <a href="${APP_URL}" style="display:inline-block;background:rgba(0,39,76,0.08);color:#00274C;padding:14px 28px;border-radius:50px;text-decoration:none;font-size:13px;font-weight:700">View Invite</a>
    </div>
    <div style="margin-top:20px;padding:14px 16px;background:#f0f4ff;border-radius:12px;text-align:center">
      <p style="margin:0 0 4px;font-size:11px;color:rgba(0,0,0,0.4);letter-spacing:0.05em;text-transform:uppercase">Party Website</p>
      <a href="${APP_URL}" style="font-size:13px;font-weight:700;color:#00274C;text-decoration:none">${APP_URL}</a>
    </div>
  </div>
  <div style="padding:20px 32px;text-align:center;border-top:1px solid rgba(0,0,0,0.06)">
    <p style="margin:0;font-size:11px;color:rgba(0,0,0,0.35)">Questions? Call us at <a href="tel:4252896422" style="color:#00274C">(425) 289-6422</a></p>
  </div>
</div>`;
}

function hostNotificationHtml(guestName: string, attending: boolean, details: Record<string, string>): string {
  const badge = attending
    ? `<span style="background:#d1fae5;color:#065f46;padding:4px 12px;border-radius:50px;font-size:12px;font-weight:600">Attending</span>`
    : `<span style="background:#fee2e2;color:#991b1b;padding:4px 12px;border-radius:50px;font-size:12px;font-weight:600">Not Attending</span>`;

  const rows = Object.entries(details)
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 0;color:rgba(0,0,0,0.45);font-size:13px;width:90px;vertical-align:top">${k}</td><td style="padding:6px 0;color:#1d1d1f;font-size:13px;font-weight:500">${v}</td></tr>`)
    .join("");

  return `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:520px;margin:0 auto;background:#FAF6EE;border-radius:20px;overflow:hidden;border:1px solid rgba(0,0,0,0.08)">
  <div style="background:#00274C;padding:24px 28px">
    <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,203,5,0.7)">New RSVP</p>
    <h2 style="margin:0 0 8px;color:#FFCB05;font-size:20px;font-weight:700">${guestName}</h2>
    ${badge}
  </div>
  <div style="padding:24px 28px">
    <table style="width:100%;border-collapse:collapse">${rows}</table>
  </div>
  <div style="padding:12px 28px;border-top:1px solid rgba(0,0,0,0.06);text-align:center">
    <p style="margin:0;font-size:11px;color:rgba(0,0,0,0.35)">Iris &amp; Inesh Graduation Party · June 26, 2026</p>
  </div>
</div>`;
}

export async function sendConfirmationEmail(to: string, guestName: string, attending: boolean) {
  if (!process.env.SMTP_USER) { console.log("Email skipped: SMTP not configured"); return; }
  const subject = attending
    ? `You're confirmed! Iris & Inesh's Graduation Party - June 26`
    : `RSVP received - Iris & Inesh's Graduation Party`;
  try {
    await getTransporter().sendMail({ from: FROM, to, subject, html: confirmationHtml(guestName, attending) });
  } catch (err) {
    console.error("Confirmation email failed:", err);
  }
}

export async function sendHostNotification(guestName: string, attending: boolean, details: {
  email?: string; phone?: string; adults?: number; kids?: number; diet?: string; message?: string;
}) {
  if (!process.env.SMTP_USER) return;
  const subject = attending
    ? `New RSVP: ${guestName} is coming!`
    : `RSVP: ${guestName} can't make it`;
  const detailMap: Record<string, string> = {
    Email: details.email || "",
    Phone: details.phone || "",
    Adults: details.adults ? String(details.adults) : "",
    Kids: details.kids ? String(details.kids) : "",
    Diet: details.diet || "",
    Message: details.message || "",
  };
  try {
    await getTransporter().sendMail({ from: FROM, to: HOST_EMAILS, subject, html: hostNotificationHtml(guestName, attending, detailMap) });
  } catch (err) {
    console.error("Host notification failed:", err);
  }
}

export async function sendReminderEmail(to: string, guestName: string) {
  if (!process.env.SMTP_USER) { console.log("Reminder email skipped: SMTP not configured"); return; }
  try {
    await getTransporter().sendMail({
      from: FROM,
      to,
      subject: `Reminder: Iris & Inesh's Graduation Party is this Friday!`,
      html: `
<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:560px;margin:0 auto;background:#FAF6EE;border-radius:20px;overflow:hidden;border:1px solid rgba(0,0,0,0.08)">
  <div style="background:#00274C;padding:36px 32px;text-align:center">
    <p style="margin:0 0 6px;font-size:11px;letter-spacing:0.3em;text-transform:uppercase;color:rgba(255,203,5,0.7)">Don't forget!</p>
    <h1 style="margin:0;color:#FFCB05;font-size:26px;font-weight:700">Party Reminder</h1>
  </div>
  <div style="padding:32px">
    <h2 style="color:#1d1d1f;margin:0 0 8px;font-size:20px">Hey ${guestName}, see you soon!</h2>
    <p style="color:rgba(0,0,0,0.6);line-height:1.7;margin:0 0 24px">Just a reminder that Iris &amp; Inesh's Graduation Party is coming up.</p>
    <div style="background:#ffffff;border:1px solid rgba(0,0,0,0.08);border-radius:16px;padding:20px;margin-bottom:24px">
      <p style="margin:0 0 10px;color:#1d1d1f"><strong>Date:</strong> ${DATE}</p>
      <p style="margin:0 0 10px;color:#1d1d1f"><strong>Time:</strong> ${TIME}</p>
      <p style="margin:0;color:#1d1d1f"><strong>Venue:</strong> ${VENUE}</p>
    </div>
    <a href="${APP_URL}" style="display:inline-block;background:#00274C;color:#FFCB05;padding:14px 28px;border-radius:50px;text-decoration:none;font-size:13px;font-weight:700">View Party Details</a>
    <div style="margin-top:20px;padding:14px 16px;background:#f0f4ff;border-radius:12px;text-align:center">
      <p style="margin:0 0 4px;font-size:11px;color:rgba(0,0,0,0.4);letter-spacing:0.05em;text-transform:uppercase">Party Website</p>
      <a href="${APP_URL}" style="font-size:13px;font-weight:700;color:#00274C;text-decoration:none">${APP_URL}</a>
    </div>
  </div>
</div>`,
    });
  } catch (err) {
    console.error("Reminder email failed:", err);
  }
}
