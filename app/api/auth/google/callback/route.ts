import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return new NextResponse(`<html><body style="font-family:monospace;padding:2rem;background:#111;color:#f44">
      <h2>Auth failed: ${error || "no code"}</h2>
    </body></html>`, { headers: { "Content-Type": "text/html" } });
  }

  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const data = await res.json();

  if (!data.refresh_token) {
    return new NextResponse(`<html><body style="font-family:monospace;padding:2rem;background:#111;color:#f44">
      <h2>Token exchange failed</h2>
      <pre>${JSON.stringify(data, null, 2)}</pre>
    </body></html>`, { headers: { "Content-Type": "text/html" } });
  }

  return new NextResponse(`<html><body style="font-family:monospace;padding:2rem;background:#111;color:#0f0">
    <h2 style="color:white">Google Drive connected!</h2>
    <p>Add this to your <code>.env.local</code> on Vercel:</p>
    <pre style="background:#000;padding:1rem;border-radius:8px;word-break:break-all;color:#0f0">GOOGLE_REFRESH_TOKEN=${data.refresh_token}</pre>
    <p style="color:yellow;margin-top:1rem">Save this — you won't see it again unless you re-authorize.</p>
    <p style="color:#aaa;font-size:0.85rem">Next: create a folder in Google Drive for party photos, copy its ID from the URL, and set GOOGLE_DRIVE_FOLDER_ID=&lt;id&gt; in your env vars. Optionally create a Google Sheet for messages and set GOOGLE_SHEET_ID=&lt;id&gt;.</p>
  </body></html>`, { headers: { "Content-Type": "text/html" } });
}
