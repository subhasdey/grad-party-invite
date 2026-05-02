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

  return (
    <main className="min-h-screen px-4 py-10" style={{ background: "radial-gradient(ellipse at 70% 0%, rgba(219,39,119,0.15) 0%, #0a0618 60%)" }}>
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-white/40 hover:text-white/70 text-sm transition-all">← Back</Link>
            <h1 className="font-display text-4xl font-bold gradient-text mt-2">Party Gallery</h1>
            <p className="text-white/40 mt-1">Share your photos & videos</p>
          </div>
          <Link href="/chat" className="px-4 py-2 rounded-full glass text-white/70 hover:text-white transition-all text-sm">
            Chat →
          </Link>
        </div>

        {/* Upload panel */}
        <div className="glass p-6 mb-8">
          <h3 className="font-semibold text-white/80 mb-4">Upload a Memory</h3>
          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name *"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20"
            />
            <input
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Caption (optional)"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { if (!name.trim()) { alert("Enter your name first!"); return; } fileRef.current?.click(); }}
              disabled={uploading}
              className="flex-1 py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}
            >
              {uploading ? <span className="spin inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full" /> : "📸"}
              {uploading ? "Uploading..." : "Add Photo or Video"}
            </button>
          </div>
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={upload} />
        </div>

        {/* Grid */}
        {media.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <div className="text-5xl mb-4">📷</div>
            <p>No photos yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {media.map(item => (
              <div
                key={item.id}
                className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
                onClick={() => setSelected(item)}
              >
                {item.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.url} alt={item.caption || ""} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                ) : (
                  <video src={item.url} className="w-full h-full object-cover" muted />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-2 left-2 right-2">
                    <p className="text-white text-xs font-medium truncate">{item.name}</p>
                    {item.caption && <p className="text-white/60 text-xs truncate">{item.caption}</p>}
                  </div>
                </div>
                {item.type === "video" && (
                  <div className="absolute top-2 right-2 bg-black/60 rounded-full p-1">
                    <svg className="w-3 h-3 text-white fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {selected && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
            {selected.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selected.url} alt={selected.caption || ""} className="w-full max-h-[80vh] object-contain rounded-xl" />
            ) : (
              <video src={selected.url} controls autoPlay className="w-full max-h-[80vh] rounded-xl" />
            )}
            <div className="mt-3 flex justify-between items-center">
              <div>
                <p className="text-white font-medium">{selected.name}</p>
                {selected.caption && <p className="text-white/50 text-sm">{selected.caption}</p>}
              </div>
              <button onClick={() => setSelected(null)} className="text-white/50 hover:text-white px-4 py-2 glass rounded-xl text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
