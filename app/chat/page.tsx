"use client";
import { useState, useEffect, useRef } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import type { ChatMessage } from "@/lib/store";
import { GraduationCap } from "lucide-react";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(iso).toLocaleDateString();
}

function Avatar({ name, avatar, size = 32 }: { name: string; avatar: string; size?: number }) {
  const isUrl = avatar?.startsWith("http");
  if (isUrl) {
    return (
      <Image src={avatar} alt={name} width={size} height={size}
        className="rounded-full flex-shrink-0 object-cover"
        style={{ width: size, height: size }} />
    );
  }
  return (
    <div className="rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
      style={{ width: size, height: size, background: avatar || "#FFCB05", color: "#0d1525" }}>
      {name[0]?.toUpperCase()}
    </div>
  );
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const name = session?.user?.name || "";
  const photoUrl = session?.user?.image || "";

  const load = async () => {
    const data = await fetch("/api/messages").then(r => r.json());
    setMessages(data);
  };

  useEffect(() => { if (status === "authenticated") load(); }, [status]);
  useEffect(() => { if (status !== "authenticated") return; const id = setInterval(load, 3000); return () => clearInterval(id); }, [status]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !name) return;
    setSending(true);
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, text, photoUrl }),
    });
    setText("");
    await load();
    setSending(false);
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ background: "#f4f7ff" }}>
        <p className="text-sm" style={{ color: "rgba(0,0,0,0.35)" }}>Loading...</p>
      </main>
    );
  }

  if (status === "unauthenticated") {
    return (
      <main className="min-h-screen flex items-center justify-center px-6" style={{ background: "#f4f7ff" }}>
        <div className="max-w-sm w-full p-8 text-center rounded-3xl" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
          <GraduationCap className="w-10 h-10 mx-auto mb-4" style={{ color: "#8A6E00" }} />
          <h2 className="font-display text-2xl font-bold mb-1" style={{ color: "#0d1525" }}>Party Chat</h2>
          <p className="text-sm mb-6" style={{ color: "rgba(0,0,0,0.45)" }}>Sign in to join the conversation</p>
          <button onClick={() => signIn("google")}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl font-semibold text-sm mb-4 transition-all hover:scale-[1.02]"
            style={{ background: "rgba(0,0,0,0.05)", color: "#0d1525", border: "1px solid rgba(0,0,0,0.1)" }}>
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>
          <Link href="/" className="inline-block mt-2 text-xs transition-all" style={{ color: "rgba(0,0,0,0.35)" }}>← Back</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col h-screen" style={{ background: "#f4f7ff" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(0,0,0,0.08)", background: "rgba(244,247,255,0.96)", backdropFilter: "blur(16px)" }}>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm transition-all" style={{ color: "rgba(0,0,0,0.35)" }}>←</Link>
          <div className="flex items-center gap-2">
            {photoUrl && <Image src={photoUrl} alt="" width={28} height={28} className="rounded-full" />}
            <div>
              <h1 className="font-display text-lg font-bold leading-tight" style={{ color: "#0d1525" }}>Party Chat</h1>
              <p className="text-xs" style={{ color: "rgba(0,0,0,0.35)" }}>as <span style={{ color: "#8A6E00" }}>{name}</span></p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/gallery" className="px-3 py-1.5 rounded-full text-xs transition-all border" style={{ color: "rgba(0,0,0,0.45)", borderColor: "rgba(0,0,0,0.1)" }}>Gallery</Link>
          <Link href="/rsvp" className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "#FFCB05", color: "#0d1525" }}>RSVP</Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 chat-scroll">
        {messages.length === 0 && (
          <div className="text-center py-20 text-sm" style={{ color: "rgba(0,0,0,0.25)" }}>
            <GraduationCap className="w-10 h-10 mb-3 mx-auto opacity-30" />
            <p>Be the first to send a message!</p>
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.name === name;
          return (
            <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
              {!isMe && <Avatar name={msg.name} avatar={msg.avatar} size={32} />}
              <div className={`max-w-[75%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                {!isMe && <span className="text-[11px] px-1" style={{ color: "rgba(0,0,0,0.35)" }}>{msg.name}</span>}
                <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                  style={isMe
                    ? { background: "#FFCB05", color: "#0d1525", borderBottomRightRadius: 4 }
                    : { background: "rgba(255,255,255,0.9)", color: "#0d1525", border: "1px solid rgba(0,0,0,0.08)", borderBottomLeftRadius: 4, boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                  {msg.text}
                </div>
                <span className="text-[10px] px-1" style={{ color: "rgba(0,0,0,0.25)" }}>{timeAgo(msg.createdAt)}</span>
              </div>
              {isMe && <Avatar name={msg.name} avatar={photoUrl || msg.avatar} size={32} />}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 pt-4 pb-20 md:pb-4 border-t" style={{ borderColor: "rgba(0,0,0,0.08)", background: "rgba(244,247,255,0.96)" }}>
        <form onSubmit={send} className="flex gap-2">
          <input value={text} onChange={e => setText(e.target.value)}
            placeholder="Say something..."
            className="flex-1 bg-white border rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-300/40"
            style={{ borderColor: "rgba(0,0,0,0.1)", color: "#0d1525" }} />
          <button type="submit" disabled={!text.trim() || sending}
            className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-30"
            style={{ background: "#FFCB05" }}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#00274C"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
          </button>
        </form>
      </div>
    </main>
  );
}
