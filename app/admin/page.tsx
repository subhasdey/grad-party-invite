"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { RSVP } from "@/lib/store";

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [reminderStatus, setReminderStatus] = useState("");
  const [sending, setSending] = useState(false);

  const load = () => fetch("/api/rsvp").then(r => r.json()).then(setRsvps);

  useEffect(() => { if (authed) load(); }, [authed]);

  const sendReminders = async () => {
    setSending(true);
    const res = await fetch("/api/reminders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    const data = await res.json();
    setReminderStatus(data.message || data.error);
    setSending(false);
  };

  const attending = rsvps.filter(r => r.attending);
  const declined = rsvps.filter(r => !r.attending);
  const totalAdults = attending.reduce((s, r) => s + r.adults, 0);
  const totalKids = attending.reduce((s, r) => s + r.kids, 0);
  const vegCount = attending.filter(r => r.diet === "veg" || r.diet === "both").length;
  const nonVegCount = attending.filter(r => r.diet === "non-veg" || r.diet === "both").length;

  if (!authed) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6" style={{ background: "#0a0618" }}>
        <div className="glass p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h2 className="font-display text-2xl font-bold text-white mb-6">Admin Access</h2>
          <form onSubmit={e => { e.preventDefault(); setAuthed(password === "admin123"); }}>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Admin password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 mb-4"
            />
            <button type="submit" className="w-full py-3 rounded-xl text-white font-semibold" style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}>
              Login
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-10" style={{ background: "#0a0618" }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-white/40 hover:text-white/70 text-sm">← Party Page</Link>
            <h1 className="font-display text-3xl font-bold gradient-text mt-1">Admin Dashboard</h1>
          </div>
          <button
            onClick={sendReminders}
            disabled={sending}
            className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm transition-all hover:scale-105 disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}
          >
            {sending ? "Sending..." : "Send Reminders"}
          </button>
        </div>

        {reminderStatus && (
          <div className="glass p-4 mb-6 text-green-400 text-sm text-center rounded-xl border border-green-500/30">
            {reminderStatus}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Attending", value: attending.length, icon: "✅", color: "text-green-400" },
            { label: "Declined", value: declined.length, icon: "❌", color: "text-red-400" },
            { label: "Total Guests", value: `${totalAdults}A + ${totalKids}K`, icon: "👥", color: "text-purple-400" },
            { label: "Veg / Non-Veg", value: `${vegCount} / ${nonVegCount}`, icon: "🍽️", color: "text-amber-400" },
          ].map(s => (
            <div key={s.label} className="glass p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className={`text-2xl font-bold font-display ${s.color}`}>{s.value}</div>
              <div className="text-white/40 text-xs mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* RSVP Table */}
        <div className="glass overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="font-semibold text-white">All RSVPs ({rsvps.length})</h3>
            <button onClick={load} className="text-purple-400 hover:text-purple-300 text-sm transition-all">Refresh</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {["Name", "Email", "Phone", "Status", "Adults", "Kids", "Diet", "Message", "RSVP'd"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-white/40 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rsvps.map(r => (
                  <tr key={r.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{r.name}</td>
                    <td className="px-4 py-3 text-white/60">{r.email}</td>
                    <td className="px-4 py-3 text-white/60">{r.phone || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.attending ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                        {r.attending ? "Coming" : "Declined"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/70 text-center">{r.adults}</td>
                    <td className="px-4 py-3 text-white/70 text-center">{r.kids}</td>
                    <td className="px-4 py-3 text-white/70 capitalize">{r.diet}</td>
                    <td className="px-4 py-3 text-white/50 max-w-xs truncate">{r.message || "-"}</td>
                    <td className="px-4 py-3 text-white/40 text-xs">{new Date(r.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {rsvps.length === 0 && (
              <div className="py-16 text-center text-white/30">No RSVPs yet</div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
