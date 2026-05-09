"use client";
import { useState, useEffect, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { upload as blobUpload } from "@vercel/blob/client";

interface MediaItem {
  _id: string;
  name: string;
  url: string;
  type: "image" | "video";
  caption?: string;
  thumbnail?: string;
  createdAt: string;
  likes: number;
}

export default function GalleryPage() {
  const { data: session, status } = useSession();
  const userName = session?.user?.name || "";

  const [media, setMedia]         = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [caption, setCaption]     = useState("");
  const [selected, setSelected]   = useState<MediaItem | null>(null);
  const [error, setError]         = useState("");

  // Edit caption state
  const [editingId, setEditingId]       = useState<string | null>(null);
  const [editCaption, setEditCaption]   = useState("");
  const [savingCaption, setSavingCaption] = useState(false);

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Likes
  const [liking, setLiking] = useState<string | null>(null);

  // Lightbox video error
  const [videoError, setVideoError] = useState(false);
  // Per-tile video errors (format not supported by browser, e.g. MOV on Chrome)
  const [videoErrors, setVideoErrors] = useState<Set<string>>(new Set());
  const addVideoError = (id: string) => setVideoErrors(prev => new Set([...prev, id]));

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
    if (!userName) { setError("Please sign in to upload"); return; }
    setError("");
    setUploading(true);
    setProgress(15);

    try {
      // Upload file directly to Vercel Blob CDN from the browser —
      // bypasses the 4.5 MB serverless body limit, so large iPhone photos/videos work.
      const blob = await blobUpload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload",
        clientPayload: JSON.stringify({ name: userName, caption: caption.trim() }),
        onUploadProgress: ({ percentage }) => {
          setProgress(Math.min(85, Math.round(percentage * 0.85)));
        },
      });
      setProgress(90);

      // Record the metadata in Google Sheets
      const type = file.type.startsWith("video/") ? "video" : "image";
      await fetch("/api/media", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userName, url: blob.url, caption: caption.trim(), type }),
      });

      // Optimistically add the new item so it appears instantly
      const newItem: MediaItem = {
        _id: String(Date.now()),
        name: userName,
        url: blob.url,
        type,
        caption: caption.trim(),
        createdAt: new Date().toISOString(),
        likes: 0,
      };
      setMedia(prev => [newItem, ...prev]);

      setCaption("");
      setProgress(100);
      setTimeout(() => setProgress(0), 800);
      // Sync from sheet after a brief delay to get the real row id
      setTimeout(load, 2000);
    } catch (err) {
      setError("Upload failed — please try again");
      console.error(err);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const likeItem = async (id: string) => {
    if (liking === id) return;
    setLiking(id);
    setMedia(prev => prev.map(m => m._id === id ? { ...m, likes: (m.likes || 0) + 1 } : m));
    try {
      await fetch("/api/media", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    } catch { /* ignore */ }
    setLiking(null);
  };

  const saveCaption = async (id: string) => {
    setSavingCaption(true);
    try {
      await fetch("/api/media", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, caption: editCaption }),
      });
      await load();
      setEditingId(null);
    } catch { /* ignore */ }
    setSavingCaption(false);
  };

  const deleteItem = async (item: MediaItem) => {
    if (!confirm("Delete this photo/video? This cannot be undone.")) return;
    setDeletingId(item._id);
    // Optimistically remove from UI
    setMedia(prev => prev.filter(m => m._id !== item._id));
    if (selected?._id === item._id) { setSelected(null); setVideoError(false); }
    try {
      await fetch("/api/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item._id, url: item.url }),
      });
    } catch (err) { console.error(err); }
    setDeletingId(null);
    setTimeout(load, 1500);
  };

  const inputCls = "bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm w-full";

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

      <main className="flex-1 px-4 md:px-8 py-8 pb-24 max-w-6xl mx-auto w-full">

        {/* Upload card */}
        <div className="mb-8 p-5 rounded-2xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
          <p className="text-xs uppercase tracking-widest text-white/30 mb-1">Share a Memory</p>
          <p className="text-xs mb-3" style={{ color: "rgba(255,203,5,0.6)" }}>
            📸 Photos up to <span className="font-semibold">25 MB</span> · 🎥 Videos up to <span className="font-semibold">20 seconds</span> or <span className="font-semibold">100 MB</span>
          </p>

          {status === "unauthenticated" ? (
            <div className="py-4">
              <p className="text-sm text-white/40 mb-3">Sign in with Google to share photos and videos</p>
              <button onClick={() => signIn("google")}
                className="flex items-center gap-3 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
                style={{ background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}>
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </button>
            </div>
          ) : status === "authenticated" ? (
            <>
              <div className="flex items-center gap-2 mb-4 mt-1">
                {session.user?.image && <Image src={session.user.image} alt="" width={24} height={24} className="rounded-full" />}
                <span className="text-sm text-white/60">Uploading as <span className="text-white font-medium">{userName}</span></span>
              </div>

              <div className="mb-3">
                <label className="block text-xs text-white/40 mb-1.5">Caption (optional)</label>
                <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Add a caption..." className={inputCls} />
              </div>

              {error && <p className="text-red-400 text-xs mb-3">{error}</p>}

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
                  ? <><span className="w-4 h-4 border-2 border-[#070a10]/30 border-t-[#070a10] rounded-full inline-block animate-spin" />Uploading...</>
                  : <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>Upload Photo or Video</>
                }
              </button>
              <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={upload} />
            </>
          ) : (
            <p className="text-sm text-white/30 mt-2">Loading...</p>
          )}
        </div>


        {/* Grid — login required to view */}
        {status === "unauthenticated" ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 p-4 rounded-3xl inline-block" style={{ background: "rgba(255,203,5,0.1)" }}>
              <svg className="w-10 h-10" fill="none" stroke="#FFCB05" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
              </svg>
            </div>
            <p className="text-white font-semibold mb-1">Sign in to view the gallery</p>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.4)" }}>Photos and videos are only visible to guests</p>
            <button onClick={() => signIn("google")}
              className="flex items-center gap-3 px-6 py-3 rounded-2xl font-semibold text-sm transition-all hover:scale-[1.02]"
              style={{ background: "rgba(255,255,255,0.06)", color: "#fff", border: "1px solid rgba(255,255,255,0.1)" }}>
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign in with Google
            </button>
          </div>
        ) : media.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-white/20">
            <svg className="w-12 h-12 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
            </svg>
            <p className="text-sm">No photos yet — be the first to share!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {media.map(item => {
              const isOwn = userName && item.name === userName;
              return (
                <div key={item._id} className="flex flex-col gap-2">
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelected(item)}
                    onKeyDown={e => e.key === "Enter" && setSelected(item)}
                    className="group relative rounded-2xl overflow-hidden bg-white/5 cursor-pointer w-full"
                    style={{ aspectRatio: "3/4", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    {item.type === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.url} alt={item.caption || item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                    ) : videoErrors.has(item._id) ? (
                      // Fallback for unsupported formats (e.g. MOV on Chrome)
                      <>
                        <div className="w-full h-full" style={{ background: "linear-gradient(160deg,#1a1f2e,#0b0e17)" }} />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
                          <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "rgba(255,203,5,0.15)", border: "2px solid rgba(255,203,5,0.4)" }}>
                            <svg className="w-6 h-6 ml-1" viewBox="0 0 24 24" fill="#FFCB05"><path d="M8 5v14l11-7z"/></svg>
                          </div>
                          <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>Video</span>
                        </div>
                      </>
                    ) : (
                      // Autoplay muted loop preview
                      <video
                        src={item.url}
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        className="w-full h-full object-cover"
                        onError={() => addVideoError(item._id)}
                      />
                    )}
                    {/* Always-visible overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent">
                      {/* Like button top-right */}
                      <button
                        onClick={e => { e.stopPropagation(); likeItem(item._id); }}
                        className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1.5 rounded-full backdrop-blur-sm transition-all hover:scale-110 active:scale-95"
                        style={{ background: "rgba(0,0,0,0.45)" }}>
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="#ff4d6d" stroke="#ff4d6d" strokeWidth={1.5}><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        {item.likes > 0 && <span className="text-white text-[11px] font-semibold">{item.likes}</span>}
                      </button>
                      <div className="absolute bottom-0 left-0 right-0 p-3 text-left">
                        <p className="text-white text-xs font-semibold truncate">{item.name}</p>
                        {item.caption && <p className="text-white/70 text-[11px] leading-snug mt-0.5 line-clamp-2">{item.caption}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Edit / Replace controls for own items */}
                  {isOwn && (
                    editingId === item._id ? (
                      <div className="flex gap-2">
                        <input
                          autoFocus
                          value={editCaption}
                          onChange={e => setEditCaption(e.target.value)}
                          placeholder="Edit message..."
                          className="flex-1 bg-white/[0.04] border border-white/10 rounded-xl px-3 py-2 text-white placeholder-white/25 text-xs"
                        />
                        <button onClick={() => saveCaption(item._id)} disabled={savingCaption}
                          className="px-3 py-2 rounded-xl text-xs font-semibold disabled:opacity-50"
                          style={{ background: "#FFCB05", color: "#070a10" }}>
                          {savingCaption ? "..." : "Save"}
                        </button>
                        <button onClick={() => setEditingId(null)}
                          className="px-3 py-2 rounded-xl text-xs text-white/40 hover:text-white border border-white/10">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setEditingId(item._id); setEditCaption(item.caption || ""); }}
                          className="flex-1 py-2 rounded-xl text-xs font-medium text-white/50 hover:text-white transition-all"
                          style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                          Edit message
                        </button>
                        <button
                          onClick={() => deleteItem(item)}
                          disabled={deletingId === item._id}
                          className="py-2 px-3 rounded-xl text-xs font-medium transition-all disabled:opacity-50 hover:bg-red-500/20"
                          style={{ border: "1px solid rgba(255,69,58,0.3)", color: "#FF453A" }}>
                          {deletingId === item._id ? "..." : "Delete"}
                        </button>
                      </div>
                    )
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.95)" }}
          onClick={() => { setSelected(null); setVideoError(false); }}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex-1 flex items-center justify-center overflow-hidden rounded-2xl">
              {selected.type === "image" ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={selected.url} alt="" className="max-w-full max-h-[80vh] object-contain rounded-2xl" />
              ) : videoError ? (
                <div className="flex flex-col items-center gap-4 py-12 px-6 text-center rounded-2xl w-full max-w-sm mx-auto" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: "rgba(255,203,5,0.1)", border: "2px solid rgba(255,203,5,0.3)" }}>
                    <svg className="w-7 h-7 ml-0.5" viewBox="0 0 24 24" fill="#FFCB05"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">iPhone video</p>
                    <p className="text-white/50 text-xs leading-relaxed">This video was recorded on iPhone.<br/>Open in Safari to play it directly, or download to watch.</p>
                  </div>
                  <div className="flex gap-2 w-full">
                    <a href={selected.url} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold"
                      style={{ background: "rgba(255,255,255,0.08)", color: "#fff", border: "1px solid rgba(255,255,255,0.12)" }}>
                      Open in Safari
                    </a>
                    <a href={selected.url} download target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold"
                      style={{ background: "#FFCB05", color: "#070a10" }}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                      Download
                    </a>
                  </div>
                </div>
              ) : (
                <video
                  key={selected._id}
                  src={selected.url}
                  controls
                  autoPlay
                  playsInline
                  className="max-w-full max-h-[80vh] rounded-2xl"
                  onError={() => setVideoError(true)}
                />
              )}
            </div>
            <div className="flex items-start justify-between mt-4 px-1 gap-3 flex-wrap">
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">{selected.name}</p>
                {selected.caption && <p className="text-white/40 text-xs mt-0.5 line-clamp-2">{selected.caption}</p>}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {selected.type === "video" && !videoError && (
                  <a href={selected.url} download target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs text-white/50 hover:text-white transition-all"
                    style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    Download
                  </a>
                )}
                <button
                  onClick={() => { setSelected(null); setVideoError(false); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs text-white/50 hover:text-white transition-all"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
