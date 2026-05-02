"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import Fireworks from "@/components/Fireworks";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://grad-party-invite-tan.vercel.app";

interface Countdown { days: number; hours: number; minutes: number; seconds: number; }
interface Wish { name: string; message: string; attending: boolean; }

const ITINERARY = [
  { time: "6:00 PM", label: "Doors Open",      icon: "🚪" },
  { time: "6:30 PM", label: "Welcome & Drinks", icon: "🥂" },
  { time: "7:00 PM", label: "Dinner",           icon: "🍽️" },
  { time: "8:00 PM", label: "Speeches",         icon: "🎤" },
  { time: "8:30 PM", label: "Cake & Dessert",   icon: "🎂" },
  { time: "9:00 PM", label: "Dancing & Music",  icon: "🎶" },
];

export default function Home() {
  const [count, setCount]   = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [rsvps, setRsvps]   = useState<number | null>(null);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    fetch("/api/rsvp")
      .then(r => r.json())
      .then((d: Wish[]) => {
        setRsvps(d.filter(r => r.attending).length);
        setWishes(d.filter(r => r.attending && r.message?.trim()).slice(0, 8));
      })
      .catch(() => {});

    const target = new Date("2026-06-26T18:00:00").getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) return;
      setCount({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const shareText = encodeURIComponent("You're invited to Iris & Inesh Dey's Graduation Party! June 26, 2026 · Redmond, WA 🎓");
  const shareUrl  = encodeURIComponent(APP_URL);

  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden" style={{ background: "#0b0e17" }}>
      <Fireworks />

      {/* ── NAV (desktop only) ── */}
      <nav className="relative z-10 hidden md:flex items-center justify-between px-12 py-5">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Class of 2026</span>
        <div className="flex items-center gap-2">
          {([["Gallery", "/gallery"], ["Chat", "/chat"], ["RSVP", "/rsvp"]] as [string,string][]).map(([l,h]) => (
            <Link key={h} href={h}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={l === "RSVP"
                ? { background: "#FFCB05", color: "#0b0e17", fontWeight: 600 }
                : { color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)" }}>
              {l}
            </Link>
          ))}
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center px-4 md:px-6 pt-8 pb-24 md:pb-12">

        {/* ── EYEBROW ── */}
        <p className="text-xs font-semibold uppercase tracking-[0.3em] mb-8 text-center" style={{ color: "rgba(255,255,255,0.5)" }}>
          You&rsquo;re invited &middot; A Twin Celebration
        </p>

        {/* ── TITLE ── */}
        <div className="text-center mb-8">
          <h1 className="font-display font-bold leading-none tracking-tight text-white" style={{ fontSize: "clamp(2.6rem,9vw,6rem)" }}>
            Graduation
          </h1>
          <h2 className="font-display font-bold leading-none tracking-tight" style={{ fontSize: "clamp(2.6rem,9vw,6rem)", color: "rgba(255,255,255,0.3)" }}>
            Party
          </h2>
        </div>

        {/* ── PORTRAIT CARDS ── */}
        <div className="w-full max-w-xl grid grid-cols-2 gap-3 mb-8">

          {/* IRIS – PURDUE */}
          <div className="relative rounded-2xl overflow-hidden flex flex-col"
            style={{ background: "linear-gradient(170deg,#1a1200,#0e0b00)", border: "1px solid rgba(207,185,145,0.25)" }}>
            <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: "linear-gradient(90deg,transparent,#CFB991,transparent)" }} />
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: "3/4", borderBottom: "1px solid rgba(207,185,145,0.15)" }}>
              <Image src="/iris.jpeg" alt="Iris Dey" fill className="object-cover object-top" sizes="(max-width:768px) 50vw,340px" />
              <div className="absolute bottom-0 inset-x-0 h-20" style={{ background: "linear-gradient(to top,#1a1200,transparent)" }} />
            </div>
            <div className="flex flex-col items-center text-center px-3 py-4">
              <p className="font-display text-lg md:text-xl font-bold text-white mb-0.5">Iris Dey</p>
              <p className="text-xs font-semibold mb-3" style={{ color: "#CFB991" }}>Purdue University</p>
              <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                style={{ background: "rgba(207,185,145,0.15)", color: "#CFB991", border: "1px solid rgba(207,185,145,0.3)" }}>
                Boiler Up! 🚂
              </span>
            </div>
          </div>

          {/* INESH – MICHIGAN */}
          <div className="relative rounded-2xl overflow-hidden flex flex-col"
            style={{ background: "linear-gradient(170deg,#00111f,#000b16)", border: "1px solid rgba(255,203,5,0.25)" }}>
            <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: "linear-gradient(90deg,transparent,#FFCB05,transparent)" }} />
            <div className="relative w-full overflow-hidden" style={{ aspectRatio: "3/4", borderBottom: "1px solid rgba(255,203,5,0.15)" }}>
              <Image src="/inesh.jpeg" alt="Inesh Dey" fill className="object-cover object-top" sizes="(max-width:768px) 50vw,340px" />
              <div className="absolute bottom-0 inset-x-0 h-20" style={{ background: "linear-gradient(to top,#00111f,transparent)" }} />
            </div>
            <div className="flex flex-col items-center text-center px-3 py-4">
              <p className="font-display text-lg md:text-xl font-bold text-white mb-0.5">Inesh Dey</p>
              <p className="text-xs font-semibold mb-3" style={{ color: "#FFCB05" }}>Univ. of Michigan</p>
              <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full"
                style={{ background: "rgba(255,203,5,0.12)", color: "#FFCB05", border: "1px solid rgba(255,203,5,0.3)" }}>
                Go Blue! 〽️
              </span>
            </div>
          </div>
        </div>

        {/* ── EVENT DETAILS ── */}
        <div className="w-full max-w-xl rounded-2xl mb-6 overflow-hidden"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div className="grid grid-cols-3 divide-x divide-white/[0.08]">
            {([["📅","June 26, 2026","Date"],["🕕","6:00 PM","Time"],["📍","Redmond, WA","Location"]] as [string,string,string][]).map(([icon,val,label]) => (
              <div key={label} className="flex flex-col items-center justify-center py-5 px-2 text-center">
                <span className="text-lg mb-1">{icon}</span>
                <p className="text-white font-semibold text-sm">{val}</p>
                <p className="text-xs font-medium uppercase tracking-widest mt-0.5" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.08] px-5 py-4 text-center">
            <p className="text-sm font-semibold text-white mb-0.5">Redmond Senior &amp; Community Center</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              Hosted by <span className="text-white/80 font-medium">Subhas &amp; Sanchita Dey</span>
              &nbsp;&middot;&nbsp;RSVP by <span className="text-white/80 font-medium">June 12</span>
            </p>
          </div>
        </div>

        {/* ── COUNTDOWN ── */}
        <div className="flex gap-4 md:gap-8 mb-8">
          {Object.entries(count).map(([unit,val]) => (
            <div key={unit} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <span className="font-display text-2xl md:text-3xl font-bold text-white tabular-nums">
                  {String(val).padStart(2,"0")}
                </span>
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.45)" }}>{unit}</span>
            </div>
          ))}
        </div>

        {/* ── CTA BUTTONS ── */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-10">
          <Link href="/rsvp"
            className="px-10 py-3.5 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95"
            style={{ background: "#FFCB05", color: "#0b0e17" }}>
            RSVP Now
          </Link>
          <Link href="/gallery"
            className="px-8 py-3.5 rounded-full text-sm font-medium transition-all hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}>
            Gallery
          </Link>
          <Link href="/chat"
            className="px-8 py-3.5 rounded-full text-sm font-medium transition-all hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.15)" }}>
            Party Chat
          </Link>
        </div>

        {/* ── ITINERARY ── */}
        <div className="w-full max-w-xl mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-center mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>Evening Schedule</p>
          <div className="relative">
            <div className="absolute left-[calc(50%-1px)] top-0 bottom-0 w-px" style={{ background: "rgba(255,255,255,0.08)" }} />
            {ITINERARY.map((item, i) => {
              const isLeft = i % 2 === 0;
              return (
                <div key={item.time} className={`flex items-center mb-4 ${isLeft ? "flex-row" : "flex-row-reverse"}`}>
                  <div className={`flex-1 ${isLeft ? "pr-6 text-right" : "pl-6 text-left"}`}>
                    <p className="text-white font-semibold text-sm">{item.label}</p>
                    <p className="text-xs font-medium mt-0.5" style={{ color: "rgba(255,255,255,0.4)" }}>{item.time}</p>
                  </div>
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 text-base z-10"
                    style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
                    {item.icon}
                  </div>
                  <div className="flex-1" />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── DRESS CODE & PARKING ── */}
        <div className="w-full max-w-xl mb-8 rounded-2xl overflow-hidden"
          style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <button
            onClick={() => setDetailsOpen(o => !o)}
            className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-white/80 hover:text-white transition-all">
            <span>Dress Code &amp; Parking Info</span>
            <svg className="w-4 h-4 transition-transform duration-300" style={{ transform: detailsOpen ? "rotate(180deg)" : "rotate(0deg)" }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {detailsOpen && (
            <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/[0.07]" style={{ paddingTop: 16 }}>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#FFCB05" }}>👔 Dress Code</p>
                <p className="text-sm text-white/80">Festive semi-formal. School colors welcome — wear your Maize &amp; Blue or Old Gold &amp; Black with pride!</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: "#CFB991" }}>🚗 Parking</p>
                <p className="text-sm text-white/80">Free parking available at the Redmond Senior &amp; Community Center lot. Street parking also available on adjacent roads.</p>
              </div>
            </div>
          )}
        </div>

        {/* ── WISH WALL ── */}
        {wishes.length > 0 && (
          <div className="w-full max-w-xl mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-center mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>
              Guest Wishes 💌
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {wishes.map((w, i) => (
                <div key={i} className="rounded-xl px-4 py-3"
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
                  <p className="text-white/80 text-sm leading-relaxed mb-2">&ldquo;{w.message}&rdquo;</p>
                  <p className="text-xs font-semibold" style={{ color: i % 2 === 0 ? "#CFB991" : "#FFCB05" }}>— {w.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── SHARE + QR ── */}
        <div className="w-full max-w-xl mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-center mb-5" style={{ color: "rgba(255,255,255,0.4)" }}>
            Share the Invite
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            {/* Share buttons */}
            <div className="flex flex-col gap-2 flex-1 w-full">
              <a href={`https://wa.me/?text=${shareText}%20${shareUrl}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
                style={{ background: "#25D366", color: "#fff" }}>
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Share on WhatsApp
              </a>
              <a href={`sms:&body=${shareText}%20${shareUrl}`}
                className="flex items-center gap-3 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
                style={{ background: "#34C759", color: "#fff" }}>
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                Share via iMessage
              </a>
              <button
                onClick={() => { navigator.clipboard?.writeText(APP_URL); }}
                className="flex items-center gap-3 px-5 py-3 rounded-xl font-semibold text-sm transition-all hover:scale-[1.02]"
                style={{ background: "rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                Copy Link
              </button>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0">
              <div className="p-3 rounded-2xl" style={{ background: "#fff" }}>
                <QRCodeSVG value={APP_URL} size={120} fgColor="#0b0e17" bgColor="#ffffff" />
              </div>
              <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.4)" }}>Scan to open invite</p>
            </div>
          </div>
        </div>

        {rsvps !== null && rsvps > 0 && (
          <p className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
            {rsvps} {rsvps === 1 ? "guest" : "guests"} attending
          </p>
        )}
      </main>

      {/* ── FOOTER (desktop) ── */}
      <footer className="relative z-10 hidden md:flex items-center justify-between px-12 py-4"
        style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="flex items-center gap-3 text-xs font-medium">
          <span style={{ color: "rgba(207,185,145,0.6)" }}>Purdue Boilermakers</span>
          <span style={{ color: "rgba(255,255,255,0.2)" }}>×</span>
          <span style={{ color: "rgba(255,203,5,0.6)" }}>Michigan Wolverines</span>
        </div>
        <Link href="/admin" className="text-xs font-medium transition-all" style={{ color: "rgba(255,255,255,0.3)" }}>Admin</Link>
      </footer>
    </div>
  );
}
