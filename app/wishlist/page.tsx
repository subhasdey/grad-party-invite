"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { Gift, ExternalLink, CheckCircle, Lock, Plus, Trash2 } from "lucide-react";

const ADMINS = ["subhascdey@gmail.com", "monjoy.dey@gmail.com"];

interface WishItem {
  _id: string;
  person: string;
  name: string;
  description: string;
  price: string;
  url: string;
  category: string;
  claimedBy: string;
}

const CATEGORIES = ["Tech", "Books", "Clothing", "Home", "Experience", "Gift Card", "Other"];
const PERSON_COLORS = {
  iris:  { accent: "#8A6E00", label: "Iris",  badge: { background: "#f5ead5", color: "#6b4e00" } },
  inesh: { accent: "#00274C", label: "Inesh", badge: { background: "#e6eef7", color: "#00274C" } },
};

function maskName(name: string) {
  const parts = name.trim().split(" ");
  return parts.map((p, i) => i === 0 ? p : p[0] + ".").join(" ");
}

export default function WishlistPage() {
  const { data: session, status } = useSession();
  const isAdmin = ADMINS.includes(session?.user?.email || "");
  const [items, setItems]         = useState<WishItem[]>([]);
  const [tab, setTab]             = useState<"iris" | "inesh">("iris");
  const [loading, setLoading]     = useState(true);

  const [claimItem, setClaimItem] = useState<WishItem | null>(null);
  const [claimName, setClaimName] = useState("");
  const [claiming, setClaiming]   = useState(false);
  const [claimError, setClaimError] = useState("");
  const [keyboardOffset, setKeyboardOffset] = useState(0);

  const [adminOpen, setAdminOpen] = useState(false);
  const [adminPwd, setAdminPwd]   = useState("");
  const [authed, setAuthed]       = useState(false);
  const [form, setForm]           = useState({ person: "iris", name: "", description: "", price: "", url: "", category: "Other" });
  const [adding, setAdding]       = useState(false);
  const [deleting, setDeleting]   = useState<string | null>(null);

  const load = async () => {
    const data = await fetch("/api/wishlist").then(r => r.json()).catch(() => []);
    setItems(Array.isArray(data) ? data.filter((i: WishItem) => i.name) : []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { if (session?.user?.name) setClaimName(session.user.name); }, [session]);

  // Track keyboard height via Visual Viewport API (fixes iPhone hidden buttons)
  useEffect(() => {
    if (!claimItem) { setKeyboardOffset(0); return; }
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      const offset = window.innerHeight - vv.height - vv.offsetTop;
      setKeyboardOffset(Math.max(0, offset));
    };
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    update();
    return () => { vv.removeEventListener("resize", update); vv.removeEventListener("scroll", update); };
  }, [claimItem]);

  const filtered = items.filter(i => i.person === tab || i.person === "both");
  const available = filtered.filter(i => !i.claimedBy).length;

  const openClaim = (item: WishItem) => {
    if (item.claimedBy) return;
    setClaimItem(item);
    setClaimError("");
  };

  const submitClaim = async () => {
    if (!claimName.trim()) { setClaimError("Please enter your name"); return; }
    if (!claimItem) return;
    setClaiming(true);
    const res = await fetch("/api/wishlist", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: claimItem._id, claimedBy: claimName.trim() }),
    });
    if (res.ok) { await load(); setClaimItem(null); }
    else setClaimError("Something went wrong. Try again.");
    setClaiming(false);
  };

  const addItem = async () => {
    if (!form.name.trim()) return;
    setAdding(true);
    await fetch("/api/wishlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: adminPwd, ...form }),
    });
    setForm({ person: "iris", name: "", description: "", price: "", url: "", category: "Other" });
    await load();
    setAdding(false);
  };

  const deleteItem = async (id: string) => {
    setDeleting(id);
    await fetch("/api/wishlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: adminPwd, id }),
    });
    await load();
    setDeleting(null);
  };

  const inputCls = "w-full rounded-2xl px-4 py-3 text-sm bg-white border border-black/10 text-[#0d1525] placeholder-black/30 focus:outline-none focus:ring-2 focus:ring-yellow-300/40";

  return (
    <main className="min-h-screen px-4 py-10 pb-24 relative" style={{ background: "#f4f7ff" }}>
      {/* Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-20" style={{ background: "#c8d8ff", transform: "translate(30%,-30%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-15" style={{ background: "#FFCB05", transform: "translate(-30%,30%)", filter: "blur(80px)" }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-10">
          <Link href="/" className="text-xs mb-6 transition-all self-start" style={{ color: "rgba(0,0,0,0.35)" }}>← Back to invite</Link>
          <div className="mb-4 p-4 rounded-3xl" style={{ background: "rgba(255,203,5,0.15)" }}>
            <Gift className="w-12 h-12" style={{ color: "#8A6E00" }} />
          </div>
          <h1 className="text-3xl font-bold mb-1" style={{ letterSpacing: "-0.03em", color: "#0d1525" }}>Gift Ideas</h1>
          <p className="text-sm" style={{ color: "rgba(0,0,0,0.45)" }}>Iris &amp; Inesh Dey · Class of 2026</p>
        </div>

        {/* Tabs — only shown when logged in */}
        {status === "authenticated" && <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl mb-8"
          style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          {(["iris", "inesh"] as const).map(p => {
            const c = PERSON_COLORS[p];
            const count = items.filter(i => (i.person === p || i.person === "both") && !i.claimedBy && i.name).length;
            return (
              <button key={p} onClick={() => setTab(p)}
                className="py-3.5 rounded-xl text-sm font-semibold transition-all"
                style={tab === p
                  ? { background: p === "iris" ? "#CFB991" : "#00274C", color: p === "iris" ? "#3a2800" : "#FFCB05", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }
                  : { color: "rgba(0,0,0,0.4)" }}>
                {c.label}
                {count > 0 && <span className="ml-2 text-xs opacity-70">{count} available</span>}
              </button>
            );
          })}
        </div>}

        {/* Login wall */}
        {status !== "loading" && status !== "authenticated" && (
          <div className="text-center py-16 px-6 rounded-3xl" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <div className="mb-4 p-4 rounded-3xl inline-block" style={{ background: "rgba(255,203,5,0.12)" }}>
              <Lock className="w-10 h-10" style={{ color: "#8A6E00" }} />
            </div>
            <h2 className="text-xl font-bold mb-2" style={{ color: "#0d1525" }}>Sign in to view gifts</h2>
            <p className="text-sm mb-6" style={{ color: "rgba(0,0,0,0.45)" }}>Please sign in with Google to browse and claim gifts.</p>
            <button onClick={() => signIn("google")}
              className="px-8 py-3.5 rounded-2xl text-sm font-bold transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg,#FFCB05,#f5c400)", color: "#0d1525" }}>
              Sign in with Google
            </button>
          </div>
        )}

        {/* Stats bar */}
        {status === "authenticated" && !loading && filtered.length > 0 && (
          <div className="flex items-center justify-between mb-5 px-1">
            <p className="text-xs" style={{ color: "rgba(0,0,0,0.45)" }}>
              {available} of {filtered.length} items still available
            </p>
            <div className="flex-1 mx-4 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.08)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.round(((filtered.length - available) / Math.max(filtered.length, 1)) * 100)}%`, background: "#FFCB05" }} />
            </div>
            <p className="text-xs font-semibold" style={{ color: "#8A6E00" }}>
              {Math.round(((filtered.length - available) / Math.max(filtered.length, 1)) * 100)}% claimed
            </p>
          </div>
        )}

        {/* Items */}
        {status === "authenticated" && (loading ? (
          <div className="grid grid-cols-1 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-3xl p-5 animate-pulse" style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.06)" }}>
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl flex-shrink-0" style={{ background: "rgba(0,0,0,0.07)" }} />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 rounded-full w-3/4" style={{ background: "rgba(0,0,0,0.07)" }} />
                    <div className="h-3 rounded-full w-1/2" style={{ background: "rgba(0,0,0,0.05)" }} />
                    <div className="h-3 rounded-full w-1/3" style={{ background: "rgba(0,0,0,0.05)" }} />
                  </div>
                  <div className="h-8 w-20 rounded-xl" style={{ background: "rgba(0,0,0,0.07)" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Gift className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: "#0d1525" }} />
            <p className="text-sm" style={{ color: "rgba(0,0,0,0.4)" }}>No gifts added yet — check back soon!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(item => {
              const claimed = !!item.claimedBy;
              return (
                <div key={item._id} className="p-4 sm:p-5 rounded-2xl transition-all"
                  style={{
                    background: "rgba(255,255,255,0.85)",
                    border: `1px solid ${claimed ? "rgba(0,0,0,0.06)" : "rgba(255,203,5,0.4)"}`,
                    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                    opacity: claimed ? 0.65 : 1,
                  }}>
                  <div className="flex flex-col gap-3">
                    {/* Top: badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.category && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(255,203,5,0.18)", color: "#8A6E00" }}>{item.category}</span>
                      )}
                      {(item.person === "iris" || item.person === "inesh") && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={PERSON_COLORS[item.person as "iris" | "inesh"].badge}>
                          {PERSON_COLORS[item.person as "iris" | "inesh"].label}
                        </span>
                      )}
                    </div>
                    {/* Middle: name + description */}
                    <div>
                      <p className="font-semibold text-base mb-0.5" style={{ color: "#0d1525" }}>{item.name}</p>
                      {item.description && <p className="text-sm leading-relaxed" style={{ color: "rgba(0,0,0,0.5)" }}>{item.description}</p>}
                    </div>
                    {/* Bottom: price + link + action */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3 flex-wrap">
                        {item.price && <span className="text-sm font-semibold" style={{ color: "#8A6E00" }}>{item.price}</span>}
                        {item.url && (
                          <a href={item.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-medium transition-all hover:underline"
                            style={{ color: "rgba(0,0,0,0.4)" }}>
                            <ExternalLink className="w-3 h-3" /> View item
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {claimed ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                            style={{ background: "rgba(52,199,89,0.1)", color: "#1a7a35", border: "1px solid rgba(52,199,89,0.25)" }}>
                            <CheckCircle className="w-3.5 h-3.5" />
                            {isAdmin ? item.claimedBy : "Claimed"}
                          </div>
                        ) : (
                          <button onClick={() => openClaim(item)}
                            className="px-4 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105 active:scale-95"
                            style={{ background: "#00274C", color: "#FFCB05" }}>
                            I&apos;ll get this!
                          </button>
                        )}
                        {authed && (
                          <button onClick={() => deleteItem(item._id)} disabled={deleting === item._id}
                            className="p-1.5 rounded-lg transition-all opacity-30 hover:opacity-80 disabled:opacity-20"
                            style={{ color: "#FF453A" }}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Admin section */}
        <div className="mt-12">
          {!adminOpen ? (
            <button onClick={() => setAdminOpen(true)}
              className="flex items-center gap-2 mx-auto text-xs transition-all"
              style={{ color: "rgba(0,0,0,0.25)" }}>
              <Lock className="w-3 h-3" /> Manage list
            </button>
          ) : !authed ? (
            <div className="p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <p className="text-xs font-semibold mb-3" style={{ color: "rgba(0,0,0,0.4)" }}>Admin Password</p>
              <div className="flex gap-2">
                <input type="password" value={adminPwd} onChange={e => setAdminPwd(e.target.value)}
                  placeholder="Password" className={`${inputCls} flex-1`} />
                <button onClick={() => setAuthed(adminPwd === "admin123")}
                  className="px-5 py-3 rounded-2xl text-sm font-bold"
                  style={{ background: "linear-gradient(135deg,#FFCB05,#f5c400)", color: "#0d1525" }}>Go</button>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl space-y-3" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "#8A6E00" }}>
                <Plus className="w-3.5 h-3.5" /> Add Gift Idea
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs mb-1" style={{ color: "rgba(0,0,0,0.45)" }}>For</label>
                  <select value={form.person} onChange={e => setForm(f => ({ ...f, person: e.target.value }))} className={inputCls}>
                    <option value="iris">Iris</option>
                    <option value="inesh">Inesh</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "rgba(0,0,0,0.45)" }}>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(0,0,0,0.45)" }}>Item name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. AirPods Pro" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(0,0,0,0.45)" }}>Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description..." className={inputCls} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs mb-1" style={{ color: "rgba(0,0,0,0.45)" }}>Price range</label>
                  <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. ~$50" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "rgba(0,0,0,0.45)" }}>Link (optional)</label>
                  <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." className={inputCls} />
                </div>
              </div>
              <button onClick={addItem} disabled={adding || !form.name.trim()}
                className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all hover:scale-[1.01] disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#FFCB05,#f5c400)", color: "#0d1525" }}>
                {adding ? "Adding..." : "Add Gift Idea"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Claim modal */}
      {claimItem && (
        <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center sm:px-4"
          style={{ background: "rgba(0,0,0,0.5)", paddingBottom: keyboardOffset > 0 ? keyboardOffset : "calc(env(safe-area-inset-bottom, 0px) + 64px)" }}
          onClick={() => setClaimItem(null)}>
          <div className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl flex flex-col"
            style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 -8px 40px rgba(0,0,0,0.15)", maxHeight: "80dvh" }}
            onClick={e => e.stopPropagation()}>
            {/* Scrollable content */}
            <div className="overflow-y-auto px-6 pt-5 pb-2 flex-1">
              {/* drag handle */}
              <div className="w-10 h-1 rounded-full mx-auto mb-5 sm:hidden" style={{ background: "rgba(0,0,0,0.15)" }} />
              <div className="mb-4 p-3 rounded-2xl inline-block" style={{ background: "rgba(255,203,5,0.15)" }}>
                <Gift className="w-6 h-6" style={{ color: "#8A6E00" }} />
              </div>
              <h3 className="text-lg font-bold mb-1" style={{ color: "#0d1525" }}>Reserve this gift</h3>
              <p className="text-sm mb-1 font-medium" style={{ color: "#8A6E00" }}>{claimItem.name}</p>
              {claimItem.price && <p className="text-xs mb-4" style={{ color: "rgba(0,0,0,0.45)" }}>{claimItem.price}</p>}
              <p className="text-xs mb-3" style={{ color: "rgba(0,0,0,0.5)" }}>Your name will be shown as reserved so others don&apos;t duplicate.</p>
              <input
                autoFocus
                value={claimName}
                onChange={e => setClaimName(e.target.value)}
                onKeyDown={e => e.key === "Enter" && submitClaim()}
                placeholder="Your name"
                className={inputCls}
              />
              {claimError && <p className="text-xs text-red-500 mt-2">{claimError}</p>}
            </div>
            {/* Sticky buttons always visible above keyboard */}
            <div className="px-6 pt-3 pb-4 flex gap-2 border-t"
              style={{ borderColor: "rgba(0,0,0,0.06)", paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))", background: "#ffffff" }}>
              <button onClick={() => setClaimItem(null)}
                className="flex-1 py-3.5 rounded-2xl text-sm font-medium transition-all"
                style={{ background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.55)", border: "1px solid rgba(0,0,0,0.08)" }}>
                Cancel
              </button>
              <button onClick={submitClaim} disabled={claiming}
                className="flex-1 py-3.5 rounded-2xl text-sm font-bold transition-all disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#FFCB05,#f5c400)", color: "#0d1525" }}>
                {claiming ? "Saving..." : "I'll get this!"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
