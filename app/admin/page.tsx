"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

interface RSVP {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  adults: number;
  kids: number;
  diet: string;
  message?: string;
  song?: string;
  attending: boolean;
  reminderSent: boolean;
  createdAt: string;
}

const inputCls = "w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm";

export default function AdminPage() {
  const [password, setPassword]         = useState("");
  const [authed, setAuthed]             = useState(false);
  const [rsvps, setRsvps]               = useState<RSVP[]>([]);
  const [loading, setLoading]           = useState(false);
  const [reminderMsg, setReminderMsg]   = useState("");
  const [sending, setSending]           = useState(false);
  const [tab, setTab]                   = useState<"all" | "attending" | "declined" | "songs">("all");
  const [search, setSearch]             = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetch("/api/rsvp").then(r => r.json());
      setRsvps(Array.isArray(data) ? data : []);
    } catch { setRsvps([]); }
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

  const attending  = rsvps.filter(r => r.attending);
  const declined   = rsvps.filter(r => !r.attending);
  const totalAdults = attending.reduce((s, r) => s + (r.adults || 0), 0);
  const totalKids   = attending.reduce((s, r) => s + (r.kids || 0), 0);
  const vegCount    = attending.filter(r => r.diet === "veg" || r.diet === "both").length;
  const nonVegCount = attending.filter(r => r.diet === "non-veg" || r.diet === "both").length;
  const songs       = rsvps.filter(r => r.song?.trim());

  const filtered = (tab === "attending" ? attending : tab === "declined" ? declined : tab === "songs" ? songs : rsvps)
    .filter(r => !search || [r.name, r.email, r.phone, r.song].some(v => v?.toLowerCase().includes(search.toLowerCase())));

  // ── Login screen ──
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
      <div className="sticky top-0 z-20 px-4 md:px-8 py-4 flex items-center justify-between"
        style={{ background: "rgba(11,14,23,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-white/40 hover:text-white/70 text-sm transition-all">←</Link>
          <div>
            <h1 className="font-display text-lg md:text-xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-white/40 text-xs">Iris &amp; Inesh · June 26, 2026</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load} className="px-4 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            Refresh
          </button>
          <button onClick={sendReminders} disabled={sending}
            className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 disabled:opacity-50"
            style={{ background: "#FFCB05", color: "#0b0e17" }}>
            {sending ? "Sending…" : "Send Reminders"}
          </button>
        </div>
      </div>

      <div className="px-4 md:px-8 py-6 max-w-7xl mx-auto">

        {reminderMsg && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm text-center font-medium"
            style={{ background: "rgba(52,199,89,0.1)", border: "1px solid rgba(52,199,89,0.3)", color: "#34C759" }}>
            {reminderMsg}
          </div>
        )}

        {/* ── STATS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: "Attending",     value: attending.length,            sub: `${totalAdults} adults · ${totalKids} kids`, color: "#34C759", icon: "✅" },
            { label: "Declined",      value: declined.length,             sub: "cannot make it",                           color: "#FF453A", icon: "❌" },
            { label: "Total Guests",  value: totalAdults + totalKids,     sub: `${totalAdults}A + ${totalKids}K`,          color: "#FFCB05", icon: "👥" },
            { label: "Veg / Non-Veg", value: `${vegCount}/${nonVegCount}`, sub: "dietary split",                          color: "#CFB991", icon: "🍽️" },
          ].map(s => (
            <div key={s.label} className="rounded-2xl p-4" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <div className="text-2xl mb-2">{s.icon}</div>
              <div className="font-display text-2xl font-bold mb-0.5" style={{ color: s.color }}>{s.value}</div>
              <div className="text-white/60 text-xs font-medium">{s.label}</div>
              <div className="text-white/30 text-[11px] mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* ── TABS + SEARCH ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <div className="flex gap-1 p-1 rounded-xl flex-wrap" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {([["all","All","white"],["attending","Attending","#34C759"],["declined","Declined","#FF453A"],["songs","Songs 🎵","#FFCB05"]] as [typeof tab, string, string][]).map(([val, label, color]) => (
              <button key={val} onClick={() => setTab(val)}
                className="px-4 py-2 rounded-lg text-xs font-semibold transition-all"
                style={tab === val
                  ? { background: color === "white" ? "rgba(255,255,255,0.1)" : color + "22", color, border: `1px solid ${color}44` }
                  : { color: "rgba(255,255,255,0.4)" }}>
                {label} {val === "all" ? `(${rsvps.length})` : val === "attending" ? `(${attending.length})` : val === "declined" ? `(${declined.length})` : `(${songs.length})`}
              </button>
            ))}
          </div>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search name, email…"
            className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/25 text-sm" />
        </div>

        {/* ── TABLE ── */}
        <div className="rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          {loading ? (
            <div className="py-20 text-center text-white/30 text-sm">Loading…</div>
          ) : tab === "songs" ? (
            // Songs view
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filtered.length === 0 && <p className="col-span-3 py-12 text-center text-white/30 text-sm">No song requests yet</p>}
              {filtered.map(r => (
                <div key={r._id} className="rounded-xl px-4 py-3" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-white font-medium text-sm">🎵 {r.song}</p>
                  <p className="text-white/40 text-xs mt-1">— {r.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
                    {["Name","Email","Phone","Status","Guests","Diet","Song","Message","Date"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.35)" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={9} className="py-16 text-center text-white/30 text-sm">No RSVPs found</td></tr>
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
                            ? { background: "rgba(52,199,89,0.15)", color: "#34C759" }
                            : { background: "rgba(255,69,58,0.15)",  color: "#FF453A" }}>
                          {r.attending ? "Coming" : "Declined"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/70 text-xs whitespace-nowrap">{r.adults}A · {r.kids}K</td>
                      <td className="px-4 py-3 text-white/60 text-xs capitalize">{r.diet || "—"}</td>
                      <td className="px-4 py-3 text-white/60 text-xs max-w-[120px] truncate">{r.song || "—"}</td>
                      <td className="px-4 py-3 text-white/50 text-xs max-w-[160px] truncate">{r.message || "—"}</td>
                      <td className="px-4 py-3 text-white/30 text-xs whitespace-nowrap">{new Date(r.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
