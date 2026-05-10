"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { UserCheck, UserX, Users, Utensils, Music, Gift, CheckCircle, type LucideIcon } from "lucide-react";

interface RSVP {
  _id: string; name: string; email: string; phone?: string;
  adults: number; kids: number; diet: string; message?: string;
  song?: string; attending: boolean; reminderSent: boolean; createdAt: string;
}

interface WishItem {
  _id: string; person: string; name: string; description: string;
  price: string; url: string; category: string; claimedBy: string;
}

const inputCls = "w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm";

export default function AdminPage() {
  const [password, setPassword]       = useState("");
  const [authed, setAuthed]           = useState(false);
  const [rsvps, setRsvps]             = useState<RSVP[]>([]);
  const [wishlist, setWishlist]       = useState<WishItem[]>([]);
  const [loading, setLoading]         = useState(false);
  const [reminderMsg, setReminderMsg] = useState("");
  const [sending, setSending]         = useState(false);
  const [tab, setTab]                 = useState<"all"|"attending"|"declined"|"songs"|"wishlist">("all");
  const [search, setSearch]           = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [rsvpData, wishData] = await Promise.all([
        fetch("/api/rsvp").then(r => r.json()),
        fetch("/api/wishlist").then(r => r.json()),
      ]);
      setRsvps(Array.isArray(rsvpData) ? rsvpData : []);
      setWishlist(Array.isArray(wishData) ? wishData.filter((i: WishItem) => i.name) : []);
    } catch { setRsvps([]); setWishlist([]); }
    setLoading(false);
  };

  useEffect(() => { if (authed) load(); }, [authed]);

  const sendReminders = async () => {
    setSending(true);
    const res  = await fetch("/api/reminders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const data = await res.json();
    setReminderMsg(data.message || data.error);
    setSending(false);
  };

  // RSVP derived stats
  const attending    = rsvps.filter(r => r.attending);
  const declined     = rsvps.filter(r => !r.attending);
  const totalAdults  = attending.reduce((s, r) => s + (Number(r.adults) || 0), 0);
  const totalKids    = attending.reduce((s, r) => s + (Number(r.kids)   || 0), 0);
  const totalHeads   = totalAdults + totalKids;
  const vegCount     = attending.filter(r => r.diet === "veg").length;
  const nonVegCount  = attending.filter(r => r.diet === "non-veg").length;
  const jainCount    = attending.filter(r => r.diet === "both").length;
  const songs        = rsvps.filter(r => r.song?.trim());

  // Wishlist derived stats
  const claimed      = wishlist.filter(i => i.claimedBy);
  const unclaimed    = wishlist.filter(i => !i.claimedBy);

  const filtered = (tab === "attending" ? attending : tab === "declined" ? declined : tab === "songs" ? songs : rsvps)
    .filter(r => !search || [r.name, r.email, r.phone, r.song].some(v => v?.toLowerCase().includes(search.toLowerCase())));

  const filteredWish = wishlist.filter(i =>
    !search || [i.name, i.claimedBy, i.category, i.person].some(v => v?.toLowerCase().includes(search.toLowerCase()))
  );

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6" style={{ background: "#0b0e17" }}>
        <div className="w-full max-w-sm p-8 rounded-2xl text-center" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="text-4xl mb-4">🔐</div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Admin</h2>
          <p className="text-white/40 text-sm mb-6">Iris &amp; Inesh Graduation Party</p>
          <form onSubmit={e => { e.preventDefault(); setAuthed(password === "admin123"); }}>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Password" className={`${inputCls} mb-3`} />
            <button type="submit" className="w-full py-3 rounded-xl text-sm font-bold" style={{ background: "#FFCB05", color: "#0b0e17" }}>
              Sign In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "#0b0e17" }}>
      {/* Header */}
      <div className="sticky top-0 z-20 px-4 md:px-8 py-3 flex flex-wrap items-center justify-between gap-2"
        style={{ background: "rgba(11,14,23,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-white/40 hover:text-white/70 text-sm transition-all">←</Link>
          <div>
            <h1 className="font-display text-base md:text-xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-white/40 text-xs hidden sm:block">Iris &amp; Inesh · June 26, 2026</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="px-3 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}>Refresh</button>
          <button onClick={sendReminders} disabled={sending}
            className="px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 disabled:opacity-50 whitespace-nowrap"
            style={{ background: "#FFCB05", color: "#0b0e17" }}>
            {sending ? "Sending…" : "Send Reminders"}
          </button>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6 pb-24 max-w-7xl mx-auto">
        {reminderMsg && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm text-center font-medium"
            style={{ background: "rgba(52,199,89,0.1)", border: "1px solid rgba(52,199,89,0.3)", color: "#34C759" }}>
            {reminderMsg}
          </div>
        )}

        {/* ── STATS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
          {([
            { label: "Total Attendees", value: totalHeads,              sub: `${totalAdults} adults · ${totalKids} kids`, color: "#34C759", Icon: UserCheck as LucideIcon },
            { label: "RSVPs Attending", value: attending.length,        sub: `families / groups`,                         color: "#FFCB05", Icon: Users    as LucideIcon },
            { label: "Declined",        value: declined.length,         sub: "cannot make it",                            color: "#FF453A", Icon: UserX    as LucideIcon },
            { label: "Dietary Breakdown", value: `${vegCount}·${nonVegCount}·${jainCount}`, sub: "veg · non-veg · jain", color: "#CFB991", Icon: Utensils as LucideIcon },
          ] as { label: string; value: string|number; sub: string; color: string; Icon: LucideIcon }[]).map(s => (
            <div key={s.label} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <s.Icon className="w-5 h-5 mb-2" style={{ color: s.color }} />
              <div className="font-display text-2xl font-bold mb-0.5" style={{ color: s.color }}>{s.value}</div>
              <div className="text-white/60 text-xs font-medium">{s.label}</div>
              <div className="text-white/30 text-[11px] mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Wishlist summary stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {([
            { label: "Gift Items",   value: wishlist.length, sub: "total on list",     color: "#9b59ff" },
            { label: "Claimed",      value: claimed.length,  sub: "reserved by guests", color: "#34C759" },
            { label: "Still Available", value: unclaimed.length, sub: "not yet taken",  color: "#FFCB05" },
          ]).map(s => (
            <div key={s.label} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <Gift className="w-5 h-5 mb-2" style={{ color: s.color }} />
              <div className="font-display text-2xl font-bold mb-0.5" style={{ color: s.color }}>{s.value}</div>
              <div className="text-white/60 text-xs font-medium">{s.label}</div>
              <div className="text-white/30 text-[11px] mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── TABS + SEARCH ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="flex gap-1 p-1 rounded-xl flex-wrap" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {([
              ["all",      "All RSVPs", "white",    rsvps.length],
              ["attending","Attending", "#34C759",  attending.length],
              ["declined", "Declined",  "#FF453A",  declined.length],
              ["songs",    "Songs",     "#FFCB05",  songs.length],
              ["wishlist", "Wishlist",  "#9b59ff",  wishlist.length],
            ] as [typeof tab, string, string, number][]).map(([val, label, color, count]) => (
              <button key={val} onClick={() => setTab(val)}
                className="px-3 py-2 rounded-lg text-xs font-semibold transition-all"
                style={tab === val
                  ? { background: color === "white" ? "rgba(255,255,255,0.1)" : color + "22", color, border: `1px solid ${color}44` }
                  : { color: "rgba(255,255,255,0.4)" }}>
                {label} ({count})
              </button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/25 text-sm" />
        </div>

        {/* ── CONTENT ── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {loading ? (
            <div className="py-20 text-center text-white/30 text-sm">Loading…</div>

          ) : tab === "wishlist" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    {["Item","For","Category","Price","Status","Claimed By"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredWish.length === 0 && (
                    <tr><td colSpan={6} className="py-16 text-center text-white/30 text-sm">No gift items found</td></tr>
                  )}
                  {filteredWish.map(item => (
                    <tr key={item._id} className="transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "")}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white">{item.name}</p>
                        {item.description && <p className="text-white/40 text-xs mt-0.5 max-w-[200px] truncate">{item.description}</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold capitalize"
                          style={item.person === "iris"
                            ? { background: "rgba(207,185,145,0.15)", color: "#CFB991" }
                            : item.person === "inesh"
                            ? { background: "rgba(255,203,5,0.1)", color: "#FFCB05" }
                            : { background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }}>
                          {item.person}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/50 text-xs">{item.category || "—"}</td>
                      <td className="px-4 py-3 text-white/70 text-xs font-semibold">{item.price || "—"}</td>
                      <td className="px-4 py-3">
                        {item.claimedBy ? (
                          <span className="flex items-center gap-1 text-xs font-semibold" style={{ color: "#34C759" }}>
                            <CheckCircle className="w-3.5 h-3.5" /> Claimed
                          </span>
                        ) : (
                          <span className="text-xs font-semibold" style={{ color: "#FFCB05" }}>Available</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-white/60 text-xs">{item.claimedBy || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          ) : tab === "songs" ? (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filtered.length === 0 && <p className="col-span-3 py-12 text-center text-white/30 text-sm">No song requests yet</p>}
              {filtered.map(r => (
                <div key={r._id} className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="flex items-center gap-2">
                    <Music className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#FFCB05" }} />
                    <p className="text-white font-medium text-sm">{r.song}</p>
                  </div>
                  <p className="text-white/40 text-xs mt-1">— {r.name}</p>
                </div>
              ))}
            </div>

          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    {["Name","Email","Phone","Status","Adults","Kids","Total","Diet","Message","Date"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={10} className="py-16 text-center text-white/30 text-sm">No RSVPs found</td></tr>
                  )}
                  {filtered.map(r => (
                    <tr key={r._id} className="transition-colors" style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
                      onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                      onMouseLeave={e => (e.currentTarget.style.background = "")}>
                      <td className="px-4 py-3 font-semibold text-white whitespace-nowrap">{r.name}</td>
                      <td className="px-4 py-3 text-white/60 text-xs">{r.email}</td>
                      <td className="px-4 py-3 text-white/50 text-xs">{r.phone || "—"}</td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-full text-xs font-bold"
                          style={r.attending
                            ? { background: "rgba(52,199,89,0.15)",  color: "#34C759" }
                            : { background: "rgba(255,69,58,0.15)",  color: "#FF453A" }}>
                          {r.attending ? "Coming" : "Declined"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/70 text-xs text-center">{r.attending ? r.adults : "—"}</td>
                      <td className="px-4 py-3 text-white/70 text-xs text-center">{r.attending ? r.kids : "—"}</td>
                      <td className="px-4 py-3 text-center">
                        {r.attending
                          ? <span className="font-bold text-sm" style={{ color: "#FFCB05" }}>{(Number(r.adults)||0)+(Number(r.kids)||0)}</span>
                          : <span className="text-white/30 text-xs">—</span>}
                      </td>
                      <td className="px-4 py-3 text-white/60 text-xs capitalize">{r.diet || "—"}</td>
                      <td className="px-4 py-3 text-white/50 text-xs max-w-[160px] truncate">{r.message || "—"}</td>
                      <td className="px-4 py-3 text-white/30 text-xs whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
                {filtered.length > 0 && tab !== "declined" && (
                  <tfoot>
                    <tr style={{ borderTop: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                      <td colSpan={4} className="px-4 py-3 text-xs font-semibold" style={{ color: "rgba(255,255,255,0.4)" }}>
                        Totals ({filtered.filter(r => r.attending).length} attending RSVPs)
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-sm" style={{ color: "#FFCB05" }}>
                        {filtered.filter(r => r.attending).reduce((s, r) => s + (Number(r.adults)||0), 0)}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-sm" style={{ color: "#FFCB05" }}>
                        {filtered.filter(r => r.attending).reduce((s, r) => s + (Number(r.kids)||0), 0)}
                      </td>
                      <td className="px-4 py-3 text-center font-bold text-sm" style={{ color: "#34C759" }}>
                        {filtered.filter(r => r.attending).reduce((s, r) => s + (Number(r.adults)||0) + (Number(r.kids)||0), 0)}
                      </td>
                      <td colSpan={3} />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
