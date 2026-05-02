"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Countdown { days: number; hours: number; minutes: number; seconds: number; }

export default function Home() {
  const [count, setCount] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [rsvps, setRsvps] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/rsvp")
      .then(r => r.json())
      .then((d: { attending: boolean }[]) => setRsvps(d.filter(r => r.attending).length))
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

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0b0e17" }}>

      {/* ── NAV ── */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">Class of 2026</span>
        <div className="flex items-center gap-2">
          {([["Gallery", "/gallery"], ["Chat", "/chat"], ["RSVP", "/rsvp"]] as [string,string][]).map(([l, h]) => (
            <Link key={h} href={h}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={l === "RSVP"
                ? { background: "#FFCB05", color: "#0b0e17", fontWeight: 600 }
                : { color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.12)" }
              }
            >{l}</Link>
          ))}
        </div>
      </nav>

      {/* ── HERO ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-8">

        {/* Eyebrow */}
        <p className="text-xs font-semibold uppercase tracking-[0.3em] mb-8" style={{ color: "rgba(255,255,255,0.5)" }}>
          You&rsquo;re invited · A Twin Celebration
        </p>

        {/* Big title */}
        <div className="text-center mb-10">
          <h1 className="font-display font-bold leading-none tracking-tight text-white" style={{ fontSize: "clamp(2.8rem,9vw,6.5rem)" }}>
            Graduation
          </h1>
          <h2 className="font-display font-bold leading-none tracking-tight" style={{ fontSize: "clamp(2.8rem,9vw,6.5rem)", color: "rgba(255,255,255,0.35)" }}>
            Party
          </h2>
        </div>

        {/* ── PERSON CARDS ── */}
        <div className="w-full max-w-2xl grid grid-cols-2 gap-3 mb-10">

          {/* IRIS – PURDUE */}
          <div className="relative rounded-2xl overflow-hidden p-6 flex flex-col items-center text-center"
            style={{ background: "linear-gradient(145deg, #1a1200 0%, #110e00 100%)", border: "1px solid rgba(207,185,145,0.2)" }}>
            <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #CFB991, transparent)" }} />

            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-4 flex-shrink-0"
              style={{ border: "2px solid rgba(207,185,145,0.4)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
              <Image src="/iris.jpeg" alt="Iris Dey" width={96} height={96} className="object-cover object-top w-full h-full" />
            </div>

            <p className="font-display text-lg md:text-xl font-bold text-white mb-0.5">Iris Dey</p>
            <p className="text-xs font-medium mb-3" style={{ color: "#CFB991" }}>Purdue University</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#CFB991" }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#CFB991" }}>Boiler Up!</span>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#CFB991" }} />
            </div>
            <p className="text-xs mt-2" style={{ color: "rgba(207,185,145,0.55)" }}>Boilermakers</p>
          </div>

          {/* INESH – MICHIGAN */}
          <div className="relative rounded-2xl overflow-hidden p-6 flex flex-col items-center text-center"
            style={{ background: "linear-gradient(145deg, #00111f 0%, #000d18 100%)", border: "1px solid rgba(255,203,5,0.2)" }}>
            <div className="absolute top-0 inset-x-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, #FFCB05, transparent)" }} />

            <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden mb-4 flex-shrink-0"
              style={{ border: "2px solid rgba(255,203,5,0.4)", boxShadow: "0 8px 32px rgba(0,0,0,0.5)" }}>
              <Image src="/inesh.jpeg" alt="Inesh Dey" width={96} height={96} className="object-cover object-top w-full h-full" />
            </div>

            <p className="font-display text-lg md:text-xl font-bold text-white mb-0.5">Inesh Dey</p>
            <p className="text-xs font-medium mb-3" style={{ color: "#FFCB05" }}>Univ. of Michigan</p>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#FFCB05" }} />
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "#FFCB05" }}>Go Blue!</span>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#FFCB05" }} />
            </div>
            <p className="text-xs mt-2" style={{ color: "rgba(255,203,5,0.55)" }}>Wolverines</p>
          </div>
        </div>

        {/* ── EVENT DETAILS ── */}
        <div className="w-full max-w-2xl rounded-2xl mb-8 overflow-hidden"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)" }}>

          <div className="grid grid-cols-3 divide-x" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            {([
              ["📅", "June 26, 2026", "Date"],
              ["🕕", "6:00 PM", "Time"],
              ["📍", "Redmond, WA", "Location"],
            ] as [string, string, string][]).map(([icon, val, label]) => (
              <div key={label} className="flex flex-col items-center justify-center py-5 px-3 text-center gap-1">
                <span className="text-base mb-1">{icon}</span>
                <p className="text-white font-semibold text-sm md:text-base">{val}</p>
                <p className="text-xs font-medium uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.45)" }}>{label}</p>
              </div>
            ))}
          </div>

          <div className="border-t px-6 py-4 text-center" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
            <p className="text-sm font-medium text-white mb-0.5">Redmond Senior &amp; Community Center</p>
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.5)" }}>
              Hosted by <span className="text-white/80 font-medium">Subhas &amp; Sanchita Dey</span>
              &nbsp;·&nbsp; RSVP by <span className="text-white/80 font-medium">June 12</span>
            </p>
          </div>
        </div>

        {/* ── COUNTDOWN ── */}
        <div className="flex gap-4 md:gap-8 mb-10">
          {Object.entries(count).map(([unit, val]) => (
            <div key={unit} className="flex flex-col items-center gap-2">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <span className="font-display text-2xl md:text-3xl font-bold text-white tabular-nums">
                  {String(val).padStart(2, "0")}
                </span>
              </div>
              <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.45)" }}>{unit}</span>
            </div>
          ))}
        </div>

        {/* ── BUTTONS ── */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link href="/rsvp"
            className="px-10 py-3.5 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95 tracking-wide"
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

        {rsvps !== null && rsvps > 0 && (
          <p className="mt-6 text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
            {rsvps} {rsvps === 1 ? "guest" : "guests"} attending
          </p>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="flex items-center justify-between px-6 md:px-12 py-4"
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
