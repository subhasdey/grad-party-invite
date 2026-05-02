"use client";
import { useState } from "react";
import Link from "next/link";

type Diet = "veg" | "non-veg" | "both";

export default function RSVPPage() {
  const [form, setForm] = useState({
    name: "", email: "", phone: "",
    adults: 1, kids: 0,
    diet: "non-veg" as Diet,
    message: "", attending: true,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

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
      setErrorMsg("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <main className="min-h-screen flex items-center justify-center px-6" style={{ background: "radial-gradient(ellipse at center, rgba(124,58,237,0.2) 0%, #0a0618 70%)" }}>
        <div className="glass p-10 max-w-md w-full text-center">
          <div className="text-6xl mb-4 float-anim">{form.attending ? "🎉" : "💌"}</div>
          <h2 className="font-display text-3xl font-bold gradient-text mb-3">
            {form.attending ? "You're on the list!" : "Thanks for letting us know!"}
          </h2>
          <p className="text-white/60 mb-6">
            {form.attending
              ? `We can't wait to celebrate with you, ${form.name}! Check your email for confirmation.`
              : `We'll miss you, ${form.name}. Hope to see you next time!`}
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/gallery" className="px-6 py-3 rounded-full text-white font-semibold" style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}>
              Visit Gallery
            </Link>
            <Link href="/chat" className="px-6 py-3 rounded-full glass text-white/80 hover:text-white transition-all">
              Join the Chat
            </Link>
            <Link href="/" className="text-white/40 hover:text-white/70 text-sm transition-all">
              Back to invite
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-12" style={{ background: "radial-gradient(ellipse at 30% 0%, rgba(124,58,237,0.15) 0%, #0a0618 60%)" }}>
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="text-white/40 hover:text-white/70 text-sm transition-all mb-6 inline-block">← Back</Link>
          <div className="text-5xl mb-4">🎓</div>
          <h1 className="font-display text-4xl font-bold gradient-text mb-2">RSVP</h1>
          <p className="text-white/50">Let us know you're coming!</p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          {/* Attending toggle */}
          <div className="glass p-1 flex rounded-full">
            {[true, false].map(v => (
              <button
                key={String(v)}
                type="button"
                onClick={() => update("attending", v)}
                className={`flex-1 py-3 rounded-full font-semibold text-sm transition-all ${form.attending === v ? "text-white" : "text-white/40"}`}
                style={form.attending === v ? { background: "linear-gradient(135deg, #7c3aed, #db2777)" } : {}}
              >
                {v ? "Yes, I'll be there!" : "Can't make it"}
              </button>
            ))}
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Your Name *</label>
            <input
              required
              value={form.name}
              onChange={e => update("name", e.target.value)}
              placeholder="Full name"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 transition-all"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Email *</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={e => update("email", e.target.value)}
              placeholder="your@email.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 transition-all"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Phone (for SMS reminders)</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => update("phone", e.target.value)}
              placeholder="+1 (555) 000-0000"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 transition-all"
            />
          </div>

          {/* Guests */}
          {form.attending && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/60 mb-2">Adults</label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <button type="button" onClick={() => update("adults", Math.max(1, form.adults - 1))} className="text-purple-400 hover:text-purple-300 text-xl font-bold w-6">-</button>
                  <span className="flex-1 text-center text-white font-semibold">{form.adults}</span>
                  <button type="button" onClick={() => update("adults", form.adults + 1)} className="text-purple-400 hover:text-purple-300 text-xl font-bold w-6">+</button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-white/60 mb-2">Kids</label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <button type="button" onClick={() => update("kids", Math.max(0, form.kids - 1))} className="text-purple-400 hover:text-purple-300 text-xl font-bold w-6">-</button>
                  <span className="flex-1 text-center text-white font-semibold">{form.kids}</span>
                  <button type="button" onClick={() => update("kids", form.kids + 1)} className="text-purple-400 hover:text-purple-300 text-xl font-bold w-6">+</button>
                </div>
              </div>
            </div>
          )}

          {/* Diet */}
          {form.attending && (
            <div>
              <label className="block text-sm text-white/60 mb-2">Dietary Preference</label>
              <div className="grid grid-cols-3 gap-3">
                {([["veg", "Veg", "🥦"], ["non-veg", "Non-Veg", "🍗"], ["both", "Both", "🍽️"]] as [Diet, string, string][]).map(([val, label, icon]) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => update("diet", val)}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-1 ${form.diet === val ? "border-purple-500 bg-purple-500/20 text-purple-300" : "border-white/10 bg-white/5 text-white/50 hover:border-white/30"}`}
                  >
                    <span className="text-xl">{icon}</span>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-sm text-white/60 mb-2">Message for the Grads</label>
            <textarea
              value={form.message}
              onChange={e => update("message", e.target.value)}
              placeholder="Share your wishes, memories, or excitement..."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 transition-all resize-none"
            />
          </div>

          {status === "error" && (
            <p className="text-red-400 text-sm text-center">{errorMsg}</p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full py-4 rounded-xl text-white font-bold text-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}
          >
            {status === "loading" ? "Sending..." : form.attending ? "Confirm My Spot!" : "Send RSVP"}
          </button>
        </form>
      </div>
    </main>
  );
}
