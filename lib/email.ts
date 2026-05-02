import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const partyInfo = {
  name: process.env.PARTY_HOST_NAME || "The Twins",
  date: process.env.PARTY_DATE || "TBD",
  time: process.env.PARTY_TIME || "TBD",
  venue: process.env.PARTY_VENUE || "TBD",
  deadline: process.env.PARTY_RSVP_DEADLINE || "TBD",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};

export async function sendConfirmationEmail(to: string, guestName: string, attending: boolean) {
  const subject = attending
    ? `You're confirmed for ${partyInfo.name}'s Graduation Party!`
    : `RSVP received - ${partyInfo.name}'s Graduation Party`;

  const html = attending
    ? `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0f0a1e; color: #fff; border-radius: 16px; overflow: hidden;">
      <div style="background: linear-gradient(135deg, #7c3aed, #db2777); padding: 40px; text-align: center;">
        <h1 style="margin: 0; font-size: 32px;">Graduation Party</h1>
        <p style="margin: 8px 0 0; opacity: 0.9; font-size: 18px;">Celebrating ${partyInfo.name}</p>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #a78bfa;">You're on the list, ${guestName}!</h2>
        <p style="color: #c4b5fd; line-height: 1.7;">We're so excited to celebrate with you! Here are the details:</p>
        <div style="background: rgba(124,58,237,0.2); border: 1px solid rgba(124,58,237,0.4); border-radius: 12px; padding: 20px; margin: 20px 0;">
          <p style="margin: 8px 0; color: #e9d5ff;"><strong style="color: #a78bfa;">Date:</strong> ${partyInfo.date}</p>
          <p style="margin: 8px 0; color: #e9d5ff;"><strong style="color: #a78bfa;">Time:</strong> ${partyInfo.time}</p>
          <p style="margin: 8px 0; color: #e9d5ff;"><strong style="color: #a78bfa;">Venue:</strong> ${partyInfo.venue}</p>
        </div>
        <p style="color: #c4b5fd;">Share your photos and videos on our party page:</p>
        <a href="${partyInfo.url}/gallery" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #db2777); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Visit Party Page</a>
      </div>
    </div>`
    : `<div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto;">
        <h2>Thanks ${guestName}, we got your RSVP.</h2>
        <p>We're sorry you can't make it! You can still share your wishes on our party page: <a href="${partyInfo.url}">${partyInfo.url}</a></p>
      </div>`;

  try {
    await transporter.sendMail({
      from: `"${partyInfo.name}'s Graduation Party" <${process.env.EMAIL_FROM}>`,
      to,
      subject,
      html,
    });
  } catch (err) {
    console.error("Email send failed:", err);
  }
}

export async function sendReminderEmail(to: string, guestName: string) {
  try {
    await transporter.sendMail({
      from: `"${partyInfo.name}'s Graduation Party" <${process.env.EMAIL_FROM}>`,
      to,
      subject: `Reminder: ${partyInfo.name}'s Graduation Party is coming up!`,
      html: `
      <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #0f0a1e; color: #fff; border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #7c3aed, #db2777); padding: 40px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">Party Reminder!</h1>
        </div>
        <div style="padding: 32px;">
          <h2 style="color: #a78bfa;">Hey ${guestName}, don't forget!</h2>
          <p style="color: #c4b5fd; line-height: 1.7;">${partyInfo.name}'s Graduation Party is just around the corner.</p>
          <div style="background: rgba(124,58,237,0.2); border: 1px solid rgba(124,58,237,0.4); border-radius: 12px; padding: 20px; margin: 20px 0;">
            <p style="margin: 8px 0; color: #e9d5ff;"><strong style="color: #a78bfa;">Date:</strong> ${partyInfo.date}</p>
            <p style="margin: 8px 0; color: #e9d5ff;"><strong style="color: #a78bfa;">Time:</strong> ${partyInfo.time}</p>
            <p style="margin: 8px 0; color: #e9d5ff;"><strong style="color: #a78bfa;">Venue:</strong> ${partyInfo.venue}</p>
          </div>
          <a href="${partyInfo.url}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #db2777); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">View Party Details</a>
        </div>
      </div>`,
    });
  } catch (err) {
    console.error("Reminder email failed:", err);
  }
}
