"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { ChatMessage } from "@/lib/store";

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(iso).toLocaleDateString();
}

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [name, setName] = useState("");
  const [nameSet, setNameSet] = useState(false);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = async () => {
    const data = await fetch("/api/messages").then(r => r.json());
    setMessages(data);
  };

  useEffect(() => { load(); }, []);
  useEffect(() => { const id = setInterval(load, 3000); return () => clearInterval(id); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, text }),
    });
    setText("");
    await load();
    setSending(false);
  };

  if (!nameSet) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 bg-[#080c14]">
        <div className="glass max-w-sm w-full p-8 text-center">
          <div className="text-4xl mb-4">💬</div>
          <h2 className="font-display text-2xl font-bold text-white mb-1">Party Chat</h2>
          <p className="text-white/40 text-sm mb-6">Join the conversation</p>
          <form onSubmit={e => { e.preventDefault(); if (name.trim()) setNameSet(true); }}>
            <input autoFocus value={name} onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 text-sm mb-3" />
            <button type="submit" className="w-full py-3 rounded-xl font-semibold text-sm" style={{ background: "#FFCB05", color: "#00274C" }}>
              Join Chat
            </button>
          </form>
          <Link href="/" className="inline-block mt-4 text-white/30 hover:text-white/60 text-xs transition-all">← Back</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col h-screen bg-[#080c14]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.07]" style={{ background: "rgba(8,12,20,0.9)", backdropFilter: "blur(16px)" }}>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-white/30 hover:text-white/60 text-sm transition-all">←</Link>
          <div>
            <h1 className="font-display text-lg font-bold text-white">Party Chat</h1>
            <p className="text-white/30 text-xs">Chatting as <span style={{ color: "#FFCB05" }}>{name}</span></p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/gallery" className="px-3 py-1.5 glass rounded-full text-white/50 hover:text-white text-xs transition-all">Gallery</Link>
          <Link href="/rsvp" className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: "#FFCB05", color: "#00274C" }}>RSVP</Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 chat-scroll">
        {messages.length === 0 && (
          <div className="text-center text-white/20 py-20 text-sm">
            <div className="text-4xl mb-3">🎓</div>
            <p>Be the first to send a message!</p>
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.name === name;
          return (
            <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
              {!isMe && (
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-[#080c14]"
                  style={{ background: msg.avatar }}>
                  {msg.name[0]?.toUpperCase()}
                </div>
              )}
              <div className={`max-w-[75%] flex flex-col gap-1 ${isMe ? "items-end" : "items-start"}`}>
                {!isMe && <span className="text-[11px] text-white/30 px-1">{msg.name}</span>}
                <div className="px-4 py-2.5 rounded-2xl text-sm leading-relaxed"
                  style={isMe
                    ? { background: "#FFCB05", color: "#00274C", borderBottomRightRadius: 4 }
                    : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,255,255,0.08)", borderBottomLeftRadius: 4 }}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-white/20 px-1">{timeAgo(msg.createdAt)}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-white/[0.07]">
        <form onSubmit={send} className="flex gap-2">
          <input value={text} onChange={e => setText(e.target.value)}
            placeholder="Say something..."
            className="flex-1 bg-white/[0.04] border border-white/10 rounded-full px-5 py-3 text-white placeholder-white/20 text-sm" />
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
