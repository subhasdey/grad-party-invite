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

  useEffect(() => {
    const id = setInterval(load, 3000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
      <main className="min-h-screen flex items-center justify-center px-6" style={{ background: "radial-gradient(ellipse at center, rgba(6,182,212,0.15) 0%, #0a0618 70%)" }}>
        <div className="glass p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">💬</div>
          <h2 className="font-display text-2xl font-bold text-white mb-2">Join the Party Chat</h2>
          <p className="text-white/50 mb-6 text-sm">What should we call you?</p>
          <form onSubmit={e => { e.preventDefault(); if (name.trim()) setNameSet(true); }}>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your name"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 mb-4"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white font-semibold transition-all hover:scale-[1.02]"
              style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}
            >
              Join Chat
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col h-screen" style={{ background: "radial-gradient(ellipse at 80% 100%, rgba(6,182,212,0.1) 0%, #0a0618 60%)" }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 glass">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-white/40 hover:text-white/70 transition-all text-sm">←</Link>
          <div>
            <h1 className="font-display text-xl font-bold gradient-text">Party Chat</h1>
            <p className="text-white/40 text-xs">Chatting as <span className="text-purple-400">{name}</span></p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/gallery" className="px-3 py-1.5 glass rounded-full text-white/60 hover:text-white text-xs transition-all">Gallery</Link>
          <Link href="/rsvp" className="px-3 py-1.5 rounded-full text-white text-xs" style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}>RSVP</Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 chat-scroll">
        {messages.length === 0 && (
          <div className="text-center text-white/30 py-20">
            <div className="text-4xl mb-3">🎉</div>
            <p>Be the first to say something!</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.name === name;
          return (
            <div key={msg.id} className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
              {!isMe && (
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                  style={{ background: msg.avatar }}
                >
                  {msg.name[0]?.toUpperCase()}
                </div>
              )}
              <div className={`max-w-[75%] ${isMe ? "items-end" : "items-start"} flex flex-col gap-1`}>
                {!isMe && <span className="text-xs text-white/40 px-1">{msg.name}</span>}
                <div
                  className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isMe
                      ? "text-white rounded-tr-sm"
                      : "bg-white/8 text-white/90 rounded-tl-sm border border-white/10"
                  }`}
                  style={isMe ? { background: "linear-gradient(135deg, #7c3aed, #db2777)" } : {}}
                >
                  {msg.text}
                </div>
                <span className="text-xs text-white/25 px-1">{timeAgo(msg.createdAt)}</span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-4 border-t border-white/10">
        <form onSubmit={send} className="flex gap-3">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-white/5 border border-white/10 rounded-full px-5 py-3 text-white placeholder-white/20 transition-all"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 disabled:opacity-40"
            style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
          </button>
        </form>
      </div>
    </main>
  );
}
