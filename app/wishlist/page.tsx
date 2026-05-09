"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Gift, ExternalLink, CheckCircle, Lock, Plus, Trash2 } from "lucide-react";

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
  iris:  { bg: "#1a1200", accent: "#CFB991", label: "Iris", badge: { background: "#CFB991", color: "#3a2800" } },
  inesh: { bg: "#00111f", accent: "#FFCB05", label: "Inesh", badge: { background: "#00274C", color: "#FFCB05" } },
};

function maskName(name: string) {
  const parts = name.trim().split(" ");
  return parts.map((p, i) => i === 0 ? p : p[0] + ".").join(" ");
}

export default function WishlistPage() {
  const { data: session } = useSession();
  const [items, setItems]         = useState<WishItem[]>([]);
  const [tab, setTab]             = useState<"iris" | "inesh">("iris");
  const [loading, setLoading]     = useState(true);

  // Claim modal
  const [claimItem, setClaimItem] = useState<WishItem | null>(null);
  const [claimName, setClaimName] = useState("");
  const [claiming, setClaiming]   = useState(false);
  const [claimError, setClaimError] = useState("");

  // Admin
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

  // Pre-fill claim name from Google session
  useEffect(() => {
    if (session?.user?.name) setClaimName(session.user.name);
  }, [session]);

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
    if (res.ok) {
      await load();
      setClaimItem(null);
    } else {
      setClaimError("Something went wrong. Try again.");
    }
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

  const inputCls = "w-full rounded-2xl px-4 py-3 text-sm text-[#1d1d1f] placeholder-black/30 bg-white border border-black/10";

  return (
    <main className="min-h-screen px-4 py-10 pb-24" style={{ background: "#FAF6EE" }}>
      {/* Blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10" style={{ background: "#00274C", transform: "translate(30%,-30%)", filter: "blur(80px)" }} />
        <div className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-10" style={{ background: "#CFB991", transform: "translate(-30%,30%)", filter: "blur(80px)" }} />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block text-xs mb-6 transition-all" style={{ color: "rgba(0,0,0,0.35)" }}>← Back to invite</Link>
          <div className="mb-4 p-4 rounded-3xl inline-block" style={{ background: "rgba(0,39,76,0.08)" }}>
            <Gift className="w-12 h-12" style={{ color: "#00274C" }} />
          </div>
          <h1 className="text-3xl font-bold mb-1" style={{ letterSpacing: "-0.03em", color: "#1d1d1f" }}>Gift Ideas</h1>
          <p className="text-sm" style={{ color: "rgba(0,0,0,0.45)" }}>Iris &amp; Inesh Dey · Class of 2026</p>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl mb-8" style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.08)" }}>
          {(["iris", "inesh"] as const).map(p => {
            const c = PERSON_COLORS[p];
            const count = items.filter(i => (i.person === p || i.person === "both") && !i.claimedBy && i.name).length;
            return (
              <button key={p} onClick={() => setTab(p)}
                className="py-3.5 rounded-xl text-sm font-semibold transition-all"
                style={tab === p
                  ? { background: p === "iris" ? "#CFB991" : "#00274C", color: p === "iris" ? "#3a2800" : "#FFCB05" }
                  : { color: "rgba(0,0,0,0.4)" }}>
                {c.label}
                {count > 0 && <span className="ml-2 text-xs opacity-70">{count} available</span>}
              </button>
            );
          })}
        </div>

        {/* Stats bar */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between mb-5 px-1">
            <p className="text-xs" style={{ color: "rgba(0,0,0,0.45)" }}>
              {available} of {filtered.length} items still available
            </p>
            <div className="flex-1 mx-4 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.08)" }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${Math.round(((filtered.length - available) / Math.max(filtered.length, 1)) * 100)}%`, background: "#00274C" }} />
            </div>
            <p className="text-xs font-semibold" style={{ color: "#00274C" }}>
              {Math.round(((filtered.length - available) / Math.max(filtered.length, 1)) * 100)}% claimed
            </p>
          </div>
        )}

        {/* Items */}
        {loading ? (
          <div className="text-center py-20 text-sm" style={{ color: "rgba(0,0,0,0.35)" }}>Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Gift className="w-12 h-12 mx-auto mb-4 opacity-20" style={{ color: "#1d1d1f" }} />
            <p className="text-sm" style={{ color: "rgba(0,0,0,0.4)" }}>No gifts added yet — check back soon!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(item => {
              const claimed = !!item.claimedBy;
              return (
                <div key={item._id} className="p-4 sm:p-5 rounded-2xl transition-all"
                  style={{ background: "#ffffff", border: `1px solid ${claimed ? "rgba(0,0,0,0.06)" : "rgba(0,39,76,0.12)"}`, opacity: claimed ? 0.75 : 1 }}>
                  <div className="flex flex-col gap-3">
                    {/* Top: badges */}
                    <div className="flex items-center gap-2 flex-wrap">
                      {item.category && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={{ background: "rgba(0,39,76,0.07)", color: "#00274C" }}>{item.category}</span>
                      )}
                      {(item.person === "iris" || item.person === "inesh") && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                          style={PERSON_COLORS[item.person as "iris" | "inesh"].badge}>{PERSON_COLORS[item.person as "iris" | "inesh"].label}</span>
                      )}
                    </div>
                    {/* Middle: name + description */}
                    <div>
                      <p className="font-semibold text-base mb-0.5" style={{ color: "#1d1d1f" }}>{item.name}</p>
                      {item.description && <p className="text-sm leading-relaxed" style={{ color: "rgba(0,0,0,0.5)" }}>{item.description}</p>}
                    </div>
                    {/* Bottom: price + link + action */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3 flex-wrap">
                        {item.price && <span className="text-sm font-semibold" style={{ color: "#00274C" }}>{item.price}</span>}
                        {item.url && (
                          <a href={item.url} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs font-medium transition-all hover:underline"
                            style={{ color: "rgba(0,0,0,0.45)" }}>
                            <ExternalLink className="w-3 h-3" /> View item
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {claimed ? (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold"
                            style={{ background: "rgba(52,199,89,0.1)", color: "#34C759", border: "1px solid rgba(52,199,89,0.2)" }}>
                            <CheckCircle className="w-3.5 h-3.5" />
                            {maskName(item.claimedBy)}
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
        )}

        {/* Admin section */}
        <div className="mt-12">
          {!adminOpen ? (
            <button onClick={() => setAdminOpen(true)}
              className="flex items-center gap-2 mx-auto text-xs transition-all"
              style={{ color: "rgba(0,0,0,0.25)" }}>
              <Lock className="w-3 h-3" /> Manage list
            </button>
          ) : !authed ? (
            <div className="p-5 rounded-2xl" style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)" }}>
              <p className="text-xs font-semibold mb-3" style={{ color: "rgba(0,0,0,0.4)" }}>Admin Password</p>
              <div className="flex gap-2">
                <input type="password" value={adminPwd} onChange={e => setAdminPwd(e.target.value)}
                  placeholder="Password" className={`${inputCls} flex-1`} />
                <button onClick={() => setAuthed(adminPwd === "admin123")}
                  className="px-5 py-3 rounded-2xl text-sm font-bold"
                  style={{ background: "#00274C", color: "#FFCB05" }}>Go</button>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl space-y-3" style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)" }}>
              <p className="text-xs font-bold uppercase tracking-wider flex items-center gap-2" style={{ color: "#00274C" }}>
                <Plus className="w-3.5 h-3.5" /> Add Gift Idea
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs mb-1" style={{ color: "rgba(0,0,0,0.4)" }}>For</label>
                  <select value={form.person} onChange={e => setForm(f => ({ ...f, person: e.target.value }))} className={inputCls}>
                    <option value="iris">Iris</option>
                    <option value="inesh">Inesh</option>
                    <option value="both">Both</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "rgba(0,0,0,0.4)" }}>Category</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className={inputCls}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(0,0,0,0.4)" }}>Item name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. AirPods Pro" className={inputCls} />
              </div>
              <div>
                <label className="block text-xs mb-1" style={{ color: "rgba(0,0,0,0.4)" }}>Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description..." className={inputCls} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs mb-1" style={{ color: "rgba(0,0,0,0.4)" }}>Price range</label>
                  <input value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="e.g. ~$50" className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs mb-1" style={{ color: "rgba(0,0,0,0.4)" }}>Link (optional)</label>
                  <input value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." className={inputCls} />
                </div>
              </div>
              <button onClick={addItem} disabled={adding || !form.name.trim()}
                className="w-full py-3.5 rounded-2xl text-sm font-bold transition-all hover:scale-[1.01] disabled:opacity-50"
                style={{ background: "#00274C", color: "#FFCB05" }}>
                {adding ? "Adding..." : "Add Gift Idea"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Claim modal */}
      {claimItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4"
          style={{ background: "rgba(0,0,0,0.5)" }}
          onClick={() => setClaimItem(null)}>
          <div className="w-full max-w-sm rounded-3xl p-6" style={{ background: "#FAF6EE" }} onClick={e => e.stopPropagation()}>
            <div className="mb-4 p-3 rounded-2xl inline-block" style={{ background: "rgba(0,39,76,0.08)" }}>
              <Gift className="w-6 h-6" style={{ color: "#00274C" }} />
            </div>
            <h3 className="text-lg font-bold mb-1" style={{ color: "#1d1d1f" }}>Reserve this gift</h3>
            <p className="text-sm mb-1 font-medium" style={{ color: "#00274C" }}>{claimItem.name}</p>
            {claimItem.price && <p className="text-xs mb-4" style={{ color: "rgba(0,0,0,0.45)" }}>{claimItem.price}</p>}
            <p className="text-xs mb-3" style={{ color: "rgba(0,0,0,0.5)" }}>Your name will be shown as reserved so others don&apos;t duplicate.</p>
            <input
              autoFocus
              value={claimName}
              onChange={e => setClaimName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && submitClaim()}
              placeholder="Your name"
              className={`${inputCls} mb-2`}
            />
            {claimError && <p className="text-xs text-red-500 mb-2">{claimError}</p>}
            <div className="flex gap-2 mt-3">
              <button onClick={() => setClaimItem(null)}
                className="flex-1 py-3 rounded-2xl text-sm font-medium transition-all"
                style={{ background: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.6)" }}>
                Cancel
              </button>
              <button onClick={submitClaim} disabled={claiming}
                className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all hover:scale-[1.02] disabled:opacity-50"
                style={{ background: "#00274C", color: "#FFCB05" }}>
                {claiming ? "Saving..." : "I'll get this!"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
