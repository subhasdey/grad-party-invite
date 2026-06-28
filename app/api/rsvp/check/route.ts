import { NextRequest, NextResponse } from "next/server";
import { findRsvpRowByEmail } from "@/lib/googledrive";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get("email");
  if (!email) return NextResponse.json({ rsvped: false });
  try {
    const row = await findRsvpRowByEmail(email);
    return NextResponse.json({ rsvped: !!row });
  } catch {
    return NextResponse.json({ rsvped: false });
  }
}
