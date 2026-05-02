"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { MediaItem } from "@/lib/store";

export default function GalleryPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [name, setName] = useState("");
  const [caption, setCaption] = useState("");
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => fetch("/api/media").then(r => r.json()).then(setMedia);
  useEffect(() => { load(); }, []);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !name.trim()) { alert("Please enter your name first!"); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append("file", file);
    fd.append("name", name);
    fd.append("caption", caption);
    await fetch("/api/upload", { method: "POST", body: fd });
    await load();
    setUploading(false);
    setCaption("");
    if (fileRef.current) fileRef.current.value = "";
  };

  const inputCls = "flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm min-w-0";

  return (
    <main className="min-h-screen bg-[#080c14] px-4 py-10">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ background: "rgba(30,22,0,0.6)", transform: "translate(30%,-30%)" }} />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <Link href="/" className="text-white/30 hover:text-white/60 text-xs transition-all">← Back</Link>
            <h1 className="font-display text-3xl font-bold text-white mt-2">Memory Gallery</h1>
            <p className="text-white/30 text-sm mt-1">Share photos &amp; videos from the celebration</p>
          </div>
          <Link href="/chat" className="hidden sm:block px-4 py-2 glass rounded-full text-white/50 hover:text-white text-xs transition-all">
            Party Chat →
          </Link>
        </div>

        {/* Upload */}
        <div className="glass p-5 mb-8">
          <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Add a Memory</p>
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Your name *" className={inputCls} />
            <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Caption (optional)" className={inputCls} />
          </div>
          <button
            onClick={() => { if (!name.trim()) { alert("Enter your name first!"); return; } fileRef.current?.click(); }}
            disabled={uploading}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.01] disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: "#FFCB05", color: "#00274C" }}>
            {uploading
              ? <><span className="spin inline-block w-4 h-4 border-2 border-[#00274C]/40 border-t-[#00274C] rounded-full" />Uploading...</>
              : <><span>📸</span> Upload Photo or Video</>}
          </button>
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={upload} />
        </div>

        {/* Grid */}
        {media.length === 0 ? (
          <div className="text-center py-24 text-white/20">
            <div className="text-5xl mb-4">🎓</div>
            <p className="text-sm">No memories yet — be the first!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {media.map(item => (
              <div key={item.id} className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group bg-white/5"
                onClick={() => setSelected(item)}>
                {item.type === "image"
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={item.url} alt={item.caption || ""} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  : <video src={item.url} className="w-full h-full object-cover" muted />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="text-white text-xs font-medium truncate">{item.name}</p>
                    {item.caption && <p className="text-white/50 text-xs truncate">{item.caption}</p>}
                  </div>
                </div>
                {item.type === "video" && (
                  <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center">
                    <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selected && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            {selected.type === "image"
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={selected.url} alt="" className="w-full max-h-[80vh] object-contain rounded-2xl" />
              : <video src={selected.url} controls autoPlay className="w-full max-h-[80vh] rounded-2xl" />}
            <div className="mt-3 flex justify-between items-center px-1">
              <div>
                <p className="text-white text-sm font-medium">{selected.name}</p>
                {selected.caption && <p className="text-white/40 text-xs">{selected.caption}</p>}
              </div>
              <button onClick={() => setSelected(null)} className="glass px-4 py-2 rounded-xl text-white/50 hover:text-white text-xs transition-all">Close</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
