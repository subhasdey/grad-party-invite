import { NextRequest, NextResponse } from "next/server";
import { readWishlistFromSheet, appendWishlistItem, claimWishlistItem, deleteWishlistItem } from "@/lib/googledrive";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await readWishlistFromSheet();
    return NextResponse.json(items);
  } catch {
    return NextResponse.json([]);
  }
}

// Add item (admin only)
export async function POST(req: NextRequest) {
  try {
    const { password, person, name, description, price, url, category } = await req.json();
    if (password !== "admin123") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!name?.trim()) return NextResponse.json({ error: "Name required" }, { status: 400 });
    await appendWishlistItem({ person: person || "both", name: name.trim(), description: description?.trim() || "", price: price?.trim() || "", url: url?.trim() || "", category: category?.trim() || "" });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}

// Claim item
export async function PUT(req: NextRequest) {
  try {
    const { id, claimedBy } = await req.json();
    if (!id || !claimedBy?.trim()) return NextResponse.json({ error: "Missing id or name" }, { status: 400 });
    await claimWishlistItem(Number(id), claimedBy.trim());
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}

// Delete item (admin only)
export async function DELETE(req: NextRequest) {
  try {
    const { password, id } = await req.json();
    if (password !== "admin123") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await deleteWishlistItem(Number(id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
