"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface MediaItem {
  _id: string;
  name: string;
  url: string;
  type: "image" | "video";
  caption?: string;
  thumbnail?: string;
  createdAt: string;
}

export default function GalleryPage() {
  const [media, setMedia]       = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [name, setName]           = useState("");
  const [caption, setCaption]     = useState("");
  const [selected, setSelected]   = useState<MediaItem | null>(null);
  const [error, setError]         = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () =>
    fetch("/api/media", { cache: "no-store" }).then(r => r.json()).then(setMedia).catch(console.error);

  useEffect(() => {
    load();
    const id = setInterval(load, 10000);
    return () => clearInterval(id);
  }, []);

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!name.trim()) { setError("Please enter your name first"); return; }
    setError("");
    setUploading(true);
    setProgress(10);

    const fd = new FormData();
    fd.append("file", file);
    fd.append("name", name.trim());
    fd.append("caption", caption.trim());

    try {
      setProgress(40);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      setProgress(90);
      if (!res.ok) throw new Error(await res.text());
      await load();
      setCaption("");
      setProgress(100);
      setTimeout(() => setProgress(0), 800);
    } catch (err) {
      setError("Upload failed — please try again");
      console.error(err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const inputCls = "bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm w-full transition-all";

  return (
    <div className="min-h-screen bg-[#070a10] flex flex-col">

      {/* Nav */}
      <nav className="flex items-center justify-between px-5 md:px-10 py-5 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-white/30 hover:text-white/70 text-sm transition-all">←</Link>
          <h1 className="font-display text-xl font-bold text-white">Gallery</h1>
        </div>
        <div className="flex gap-2">
          <Link href="/chat" className="px-4 py-2 text-xs text-white/40 hover:text-white transition-all rounded-full border border-white/10">Chat</Link>
          <Link href="/rsvp" className="px-4 py-2 text-xs font-semibold rounded-full" style={{ background: "#FFCB05", color: "#070a10" }}>RSVP</Link>
        </div>
      </nav>

      <main className="flex-1 px-4 md:px-8 py-8 max-w-6xl mx-auto w-full">

        {/* Upload card */}
        <div className="mb-8 p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-xs uppercase tracking-widest text-white/30 mb-4">Share a Memory</p>
          <p className="text-xs text-white/40 mb-4">Everything shared here is visible to all guests in this live tile gallery.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Your name *</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Priya Sharma" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs text-white/40 mb-1.5">Caption</label>
              <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Add a caption..." className={inputCls} />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

          {/* Progress bar */}
          {progress > 0 && (
            <div className="h-0.5 rounded-full overflow-hidden mb-3" style={{ background: "rgba(255,255,255,0.08)" }}>
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, background: "#FFCB05" }} />
            </div>
          )}

          <button
            onClick={() => { setError(""); fileRef.current?.click(); }}
            disabled={uploading}
            className="flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            style={{ background: "#FFCB05", color: "#070a10" }}
          >
            {uploading
              ? <><span className="spin w-4 h-4 border-2 border-[#070a10]/30 border-t-[#070a10] rounded-full inline-block" />Uploading to cloud...</>
              : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>Upload Photo or Video</>
            }
          </button>
          <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={upload} />
        </div>

        {/* Grid */}
        {media.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-white/20">
            <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p className="text-sm">No photos yet — be the first to share!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {media.map(item => (
              <button
                key={item._id}
                onClick={() => setSelected(item)}
                className="group relative rounded-2xl overflow-hidden bg-white/5 focus:outline-none"
                style={{ aspectRatio: "3/4", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                {item.type === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.url}
                    alt={item.caption || item.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <>
                    {item.thumbnail
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={item.thumbnail} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                      : <video src={item.url} className="w-full h-full object-cover" muted preload="metadata" />
                    }
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center backdrop-blur-sm">
                        <svg className="w-4 h-4 fill-white ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    </div>
                  </>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                    <p className="text-white text-xs font-medium truncate">{item.name}</p>
                    {item.caption && <p className="text-white/60 text-[11px] truncate mt-0.5">{item.caption}</p>}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.95)" }}
          onClick={() => setSelected(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex-1 flex items-center justify-center overflow-hidden rounded-2xl">
              {selected.type === "image"
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={selected.url} alt="" className="max-w-full max-h-[80vh] object-contain rounded-2xl" />
                : <video src={selected.url} controls autoPlay playsInline className="max-w-full max-h-[80vh] rounded-2xl" />
              }
            </div>
            <div className="flex items-center justify-between mt-4 px-1">
              <div>
                <p className="text-white text-sm font-medium">{selected.name}</p>
                {selected.caption && <p className="text-white/40 text-xs mt-0.5">{selected.caption}</p>}
              </div>
              <button
                onClick={() => setSelected(null)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs text-white/50 hover:text-white transition-all"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
