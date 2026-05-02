"use client";
import { useState } from "react";
import Link from "next/link";

type Diet = "veg" | "non-veg" | "both";

export default function RSVPPage() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    adults: 1, kids: 0,
    diet: "non-veg" as Diet,
    message: "", song: "", attending: true,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const update = (k: string, v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  const inputCls = "w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm transition-all";

  if (status === "success") {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-[#080c14]">
        <div className="glass max-w-sm w-full p-10 text-center">
          <div className="text-5xl mb-5">🎓</div>
          <h2 className="font-display text-2xl font-bold text-white mb-3">
            {form.attending ? "You're on the list!" : "Thanks for letting us know!"}
          </h2>
          <p className="text-white/50 text-sm mb-8">
            {form.attending
              ? `We can't wait to celebrate with you, ${form.name}! Check your email for details.`
              : `We'll miss you, ${form.name}. Your kind wishes mean a lot!`}
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/gallery" className="py-3 rounded-xl text-[#00274C] font-semibold text-sm" style={{ background: "#FFCB05" }}>View Gallery</Link>
            <Link href="/chat" className="py-3 rounded-xl glass text-white/70 hover:text-white text-sm transition-all">Join Party Chat</Link>
            <Link href="/" className="text-white/30 hover:text-white/60 text-xs transition-all mt-1">← Back to invite</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#080c14] px-4 py-12">
      {/* Background accents */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-80 h-80 rounded-full blur-3xl opacity-30" style={{ background: "rgba(0,39,76,0.8)", transform: "translate(-40%,-40%)" }} />
        <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl opacity-30" style={{ background: "rgba(30,22,0,0.8)", transform: "translate(40%,40%)" }} />
      </div>

      <div className="relative z-10 max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block text-white/30 hover:text-white/60 text-xs transition-all mb-6">← Back to invite</Link>
          <div className="flex justify-center gap-3 mb-5">
            <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: "#00274C", color: "#FFCB05", border: "1px solid #FFCB0540" }}>Go Blue!</span>
            <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: "#1a1400", color: "#CFB991", border: "1px solid #CFB99140" }}>Boiler Up!</span>
          </div>
          <h1 className="font-display text-4xl font-bold text-white mb-1">RSVP</h1>
          <p className="text-white/40 text-sm">Inesh &amp; Iris Dey · June 26, 2026</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {/* Attending toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
            {[true, false].map(v => (
              <button
                key={String(v)}
                type="button"
                onClick={() => update("attending", v)}
                className="py-3 rounded-xl text-sm font-semibold transition-all"
                style={form.attending === v
                  ? { background: v ? "#FFCB05" : "rgba(255,255,255,0.1)", color: v ? "#00274C" : "#fff" }
                  : { color: "rgba(255,255,255,0.4)" }}
              >
                {v ? "Yes, I'll be there!" : "Can't make it"}
              </button>
            ))}
          </div>

          <input required value={form.name} onChange={e => update("name", e.target.value)} placeholder="Full name *" className={inputCls} />
          <input required type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="Email address *" className={inputCls} />
          <input type="tel" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="Phone (for SMS reminders)" className={inputCls} />

          {form.attending && (
            <>
              {/* Guests */}
              <div className="grid grid-cols-2 gap-3">
                {([["Adults", "adults", 1], ["Kids", "kids", 0]] as [string, string, number][]).map(([label, key, min]) => (
                  <div key={key}>
                    <p className="text-xs text-white/40 mb-2 px-1">{label}</p>
                    <div className="flex items-center justify-between bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3">
                      <button type="button" onClick={() => update(key, Math.max(min, (form[key as keyof typeof form] as number) - 1))}
                        className="text-lg font-bold w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                        style={{ color: "#FFCB05" }}>−</button>
                      <span className="font-semibold text-white">{form[key as keyof typeof form] as number}</span>
                      <button type="button" onClick={() => update(key, (form[key as keyof typeof form] as number) + 1)}
                        className="text-lg font-bold w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                        style={{ color: "#FFCB05" }}>+</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Diet */}
              <div>
                <p className="text-xs text-white/40 mb-2 px-1">Dietary Preference</p>
                <div className="grid grid-cols-3 gap-2">
                  {([["veg", "Vegetarian", "🥦"], ["non-veg", "Non-Veg", "🍗"], ["both", "Both", "🍽️"]] as [Diet, string, string][]).map(([val, label, icon]) => (
                    <button key={val} type="button" onClick={() => update("diet", val)}
                      className="py-3 rounded-xl border text-xs font-medium transition-all flex flex-col items-center gap-1"
                      style={form.diet === val
                        ? { borderColor: "#FFCB05", background: "rgba(255,203,5,0.1)", color: "#FFCB05" }
                        : { borderColor: "rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.4)" }}>
                      <span className="text-lg">{icon}</span>{label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <textarea value={form.message} onChange={e => update("message", e.target.value)}
            placeholder="Leave a message for the graduates..." rows={3}
            className={`${inputCls} resize-none`} />

          {status === "error" && <p className="text-red-400 text-xs text-center">Something went wrong. Please try again.</p>}

          <button type="submit" disabled={status === "loading"}
            className="w-full py-4 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            style={{ background: "#FFCB05", color: "#00274C" }}>
            {status === "loading" ? "Sending..." : form.attending ? "Confirm My Spot" : "Send RSVP"}
          </button>
        </form>
      </div>
    </main>
  );
}
