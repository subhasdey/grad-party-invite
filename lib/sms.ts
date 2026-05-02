import twilio from "twilio";

const partyInfo = {
  name: process.env.PARTY_HOST_NAME || "The Twins",
  date: process.env.PARTY_DATE || "TBD",
  time: process.env.PARTY_TIME || "TBD",
  venue: process.env.PARTY_VENUE || "TBD",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
};

function getClient() {
  if (!process.env.TWILIO_ACCOUNT_SID?.startsWith("AC")) return null;
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

export async function sendConfirmationSMS(to: string, guestName: string, attending = true) {
  const client = getClient();
  if (!client) { console.log("SMS skipped: Twilio not configured"); return; }
  const body = attending
    ? `Hi ${guestName}! Your RSVP for ${partyInfo.name}'s Graduation Party is confirmed! Date: ${partyInfo.date} at ${partyInfo.time}. Venue: ${partyInfo.venue}. View: ${partyInfo.url}`
    : `Hi ${guestName}! Thanks for your RSVP response for ${partyInfo.name}'s Graduation Party. We'll miss you. You can still follow updates here: ${partyInfo.url}`;
  try {
    await client.messages.create({ body, from: process.env.TWILIO_PHONE_NUMBER, to });
  } catch (err) {
    console.error("SMS failed:", err);
  }
}

export async function sendReminderSMS(to: string, guestName: string) {
  const client = getClient();
  if (!client) { console.log("SMS skipped: Twilio not configured"); return; }
  const body = `Hey ${guestName}! Reminder: ${partyInfo.name}'s Graduation Party on ${partyInfo.date} at ${partyInfo.time}. ${partyInfo.venue}. ${partyInfo.url}`;
  try {
    await client.messages.create({ body, from: process.env.TWILIO_PHONE_NUMBER, to });
  } catch (err) {
    console.error("Reminder SMS failed:", err);
  }
}
