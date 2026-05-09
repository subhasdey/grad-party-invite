"use client";
import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { GraduationCap, Leaf, Flame, Sprout } from "lucide-react";

type Diet = "veg" | "non-veg" | "both";

const defaultForm = { name: "", email: "", phone: "", adults: 1, kids: 0, diet: "non-veg" as Diet, message: "", attending: true };

export default function RSVPPage() {
  const { data: session, status } = useSession();
  const [form, setForm]     = useState(defaultForm);
  const [pageStatus, setPageStatus] = useState<"idle"|"loading"|"success"|"error"|"checking">("idle");
  const [isEdit, setIsEdit] = useState(false);

  const update = (k: string, v: string | number | boolean) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (session?.user) {
      setForm(f => ({ ...f, name: session.user?.name || f.name, email: session.user?.email || f.email }));
      if (session.user.email) {
        setPageStatus("checking");
        fetch("/api/rsvp")
          .then(r => r.json())
          .then((rsvps: Array<Record<string, unknown>>) => {
            const existing = rsvps.find(r => (r.email as string)?.toLowerCase() === session.user!.email!.toLowerCase());
            if (existing) {
              setIsEdit(true);
              setForm({
                name:      String(existing.name    || "") || session.user!.name  || "",
                email:     String(existing.email   || "") || session.user!.email || "",
                phone:     String(existing.phone   || ""),
                adults:    Number(existing.adults) || 1,
                kids:      Number(existing.kids)   || 0,
                diet:      (existing.diet as Diet) || "non-veg",
                message:   String(existing.message || ""),
                attending: Boolean(existing.attending),
              });
            }
            setPageStatus("idle");
          })
          .catch(() => setPageStatus("idle"));
      }
    }
  }, [session]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPageStatus("loading");
    try {
      const res = await fetch("/api/rsvp", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed");
      setPageStatus("success");
    } catch {
      setPageStatus("error");
    }
  };

  const inputCls = "w-full rounded-2xl px-4 py-3.5 text-[#1d1d1f] placeholder-black/30 text-sm transition-all bg-white border border-black/10";

  if (pageStatus === "success") {
    return (
      <main className="min-h-screen flex items-center justify-center px-6" style={{ background: "#FAF6EE" }}>
        <div className="max-w-sm w-full text-center">
          <div className="mb-6 p-4 rounded-3xl inline-block" style={{ background: "rgba(0,39,76,0.08)" }}>
            <GraduationCap className="w-16 h-16" style={{ color: "#00274C" }} />
          </div>
          <h2 className="text-3xl font-bold mb-3" style={{ letterSpacing: "-0.03em", color: "#1d1d1f" }}>
            {form.attending ? (isEdit ? "RSVP Updated!" : "You're on the list!") : "Thanks for letting us know"}
          </h2>
          <p className="text-sm mb-10 leading-relaxed" style={{ color: "rgba(0,0,0,0.5)" }}>
            {form.attending ? `We can't wait to celebrate with you, ${form.name}!` : `We'll miss you, ${form.name}. Your kind wishes mean a lot.`}
          </p>
          <div className="flex flex-col gap-3">
            <Link href="/gallery" className="py-3.5 rounded-2xl text-sm font-semibold text-center" style={{ background: "#00274C", color: "#FFCB05" }}>View Gallery</Link>
            <Link href="/chat" className="py-3.5 rounded-2xl text-sm font-medium transition-all text-center" style={{ background: "#FAF6EE", color: "rgba(0,0,0,0.6)", border: "1px solid rgba(0,0,0,0.08)" }}>Join Party Chat</Link>
            <Link href="/" className="text-xs transition-all mt-2 text-center block" style={{ color: "rgba(0,0,0,0.35)" }}>← Back to invite</Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-12 pb-24" style={{ background: "#FAF6EE" }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: "#00274C", transform: "translate(-40%,-40%)" }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: "#3a2800", transform: "translate(40%,40%)" }} />
      </div>

      <div className="relative z-10 max-w-lg mx-auto">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block text-xs transition-all mb-6" style={{ color: "rgba(0,0,0,0.35)" }}>← Back to invite</Link>
          <h1 className="text-4xl font-bold mb-1" style={{ letterSpacing: "-0.03em", color: "#1d1d1f" }}>
            {isEdit ? "Update RSVP" : "RSVP"}
          </h1>
          <p className="text-sm" style={{ color: "rgba(0,0,0,0.45)" }}>Inesh &amp; Iris Dey · June 26, 2026</p>
        </div>

        {/* Google Sign-In prompt */}
        {status === "unauthenticated" && (
          <div className="mb-6 p-5 rounded-2xl text-center" style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)" }}>
            <p className="text-sm mb-4" style={{ color: "rgba(0,0,0,0.55)" }}>Sign in to save your RSVP and edit it anytime</p>
            <button onClick={() => signIn("google")}
              className="flex items-center gap-3 mx-auto px-6 py-3 rounded-2xl font-semibold text-sm transition-all hover:scale-[1.02]"
              style={{ background: "#FAF6EE", color: "#1d1d1f", border: "1px solid rgba(0,0,0,0.1)" }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>
            <p className="text-xs mt-4" style={{ color: "rgba(0,0,0,0.3)" }}>Or fill in your details below without signing in</p>
          </div>
        )}

        {/* Signed-in banner */}
        {status === "authenticated" && session?.user && (
          <div className="mb-6 flex items-center justify-between px-4 py-3 rounded-2xl" style={{ background: "#fff", border: "1px solid rgba(0,39,76,0.2)" }}>
            <div className="flex items-center gap-3">
              {session.user.image && <Image src={session.user.image} alt="" width={32} height={32} className="rounded-full" />}
              <div>
                <p className="text-sm font-semibold" style={{ color: "#1d1d1f" }}>{session.user.name}</p>
                <p className="text-xs" style={{ color: "rgba(0,0,0,0.45)" }}>{isEdit ? "Editing your RSVP" : "New RSVP"}</p>
              </div>
            </div>
            <button onClick={() => signOut()} className="text-xs transition-all" style={{ color: "rgba(0,0,0,0.4)" }}>Sign out</button>
          </div>
        )}

        {pageStatus === "checking" ? (
          <div className="text-center py-10 text-sm" style={{ color: "rgba(0,0,0,0.4)" }}>Checking your RSVP...</div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl" style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.08)" }}>
              {([true, false] as const).map(v => (
                <button key={String(v)} type="button" onClick={() => update("attending", v)}
                  className="py-3.5 rounded-xl text-sm font-semibold transition-all"
                  style={form.attending === v
                    ? { background: v ? "#00274C" : "rgba(0,0,0,0.08)", color: v ? "#FFCB05" : "#1d1d1f" }
                    : { color: "rgba(0,0,0,0.35)" }}>
                  {v ? "Yes, I'll be there!" : "Can't make it"}
                </button>
              ))}
            </div>

            <input required value={form.name} onChange={e => update("name", e.target.value)} placeholder="Full name *" className={inputCls} />
            <input type="email" value={form.email} onChange={e => update("email", e.target.value)}
              placeholder="Email address" className={inputCls}
              readOnly={status === "authenticated" && !!session?.user?.email}
              style={status === "authenticated" && session?.user?.email ? { opacity: 0.6, cursor: "default" } : {}} />
            <input type="tel" value={form.phone} onChange={e => update("phone", e.target.value)} placeholder="Phone (for reminders)" className={inputCls} />

            {form.attending && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {([ ["Adults","adults",1], ["Kids","kids",0] ] as [string,string,number][]).map(([label,key,min]) => (
                    <div key={key}>
                      <p className="text-xs mb-2 px-1" style={{ color: "rgba(0,0,0,0.45)" }}>{label}</p>
                      <div className="flex items-center justify-between rounded-2xl px-4 py-3" style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.1)" }}>
                        <button type="button" onClick={() => update(key, Math.max(min, (form[key as keyof typeof form] as number) - 1))}
                          className="text-xl font-light w-8 h-8 rounded-xl flex items-center justify-center transition-all" style={{ color: "#00274C" }}>−</button>
                        <span className="font-semibold tabular-nums" style={{ color: "#1d1d1f" }}>{form[key as keyof typeof form] as number}</span>
                        <button type="button" onClick={() => update(key, (form[key as keyof typeof form] as number) + 1)}
                          className="text-xl font-light w-8 h-8 rounded-xl flex items-center justify-center transition-all" style={{ color: "#00274C" }}>+</button>
                      </div>
                    </div>
                  ))}
                </div>

                <div>
                  <p className="text-xs mb-2 px-1" style={{ color: "rgba(0,0,0,0.45)" }}>Dietary Preference</p>
                  <div className="grid grid-cols-3 gap-2">
                    {([
                      ["veg",     "Vegetarian", Leaf   ],
                      ["non-veg", "Non-Veg",    Flame  ],
                      ["both",    "Jain",       Sprout ],
                    ] as [Diet, string, typeof Leaf][]).map(([val, label, Icon]) => (
                      <button key={val} type="button" onClick={() => update("diet", val)}
                        className="py-3.5 rounded-2xl border text-xs font-medium transition-all flex flex-col items-center gap-1.5"
                        style={form.diet === val
                          ? { borderColor: "#00274C", background: "rgba(0,39,76,0.08)", color: "#00274C" }
                          : { borderColor: "rgba(0,0,0,0.08)", background: "#ffffff", color: "rgba(0,0,0,0.45)" }}>
                        <Icon className="w-5 h-5" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

              </>
            )}

            <textarea value={form.message} onChange={e => update("message", e.target.value)}
              placeholder="Leave a message for the graduates..." rows={3}
              className={`${inputCls} resize-none`} />

            {pageStatus === "error" && <p className="text-red-400 text-xs text-center">Something went wrong. Please try again.</p>}

            <button type="submit" disabled={pageStatus === "loading"}
              className="w-full py-4 rounded-2xl font-semibold text-sm transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              style={{ background: "#00274C", color: "#FFCB05" }}>
              {pageStatus === "loading" ? "Saving..." : isEdit ? "Update My RSVP" : form.attending ? "Confirm My Spot" : "Send RSVP"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
