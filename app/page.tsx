"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Countdown { days: number; hours: number; minutes: number; seconds: number; }

export default function Home() {
  const [count, setCount] = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [rsvps, setRsvps] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/rsvp").then(r => r.json()).then((d: { attending: boolean }[]) =>
      setRsvps(d.filter(r => r.attending).length)
    );
    const target = new Date("2026-06-26T18:00:00").getTime();
    const tick = () => {
      const d = target - Date.now();
      if (d <= 0) return;
      setCount({
        days: Math.floor(d / 86400000),
        hours: Math.floor((d % 86400000) / 3600000),
        minutes: Math.floor((d % 3600000) / 60000),
        seconds: Math.floor((d % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen bg-[#070a10] flex flex-col">

      {/* ── NAV ── */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6 fade-up">
        <span className="text-xs uppercase tracking-[0.2em] text-white/30">Class of 2026</span>
        <div className="flex items-center gap-1">
          {([["Gallery", "/gallery"], ["Chat", "/chat"], ["RSVP", "/rsvp"]] as [string,string][]).map(([l, h]) => (
            <Link key={h} href={h}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
                l === "RSVP"
                  ? "text-[#070a10] font-semibold"
                  : "text-white/40 hover:text-white/80"
              }`}
              style={l === "RSVP" ? { background: "#FFCB05" } : {}}
            >{l}</Link>
          ))}
        </div>
      </nav>

      {/* ── MAIN ── */}
      <main className="flex-1 flex flex-col items-center justify-center px-5 pb-12">

        {/* eyebrow */}
        <p className="fade-up delay-1 text-[11px] uppercase tracking-[0.25em] text-white/30 mb-10">
          A twin graduation celebration
        </p>

        {/* ── SPLIT NAMEPLATE ── */}
        <div className="fade-up delay-2 w-full max-w-3xl grid grid-cols-2 gap-px mb-10 rounded-2xl overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>

          {/* IRIS – LEFT – PURDUE */}
          <div className="relative flex flex-col items-center justify-end pt-10 pb-8 px-6"
            style={{ background: "linear-gradient(160deg, #0d0b06 0%, #100d04 100%)" }}>
            {/* Purdue gold top bar */}
            <div className="absolute top-0 inset-x-0 h-[3px]" style={{ background: "#CFB991" }} />
            <div className="absolute top-3 left-5 text-[10px] uppercase tracking-widest font-semibold" style={{ color: "#CFB99166" }}>Purdue</div>
            <div className="absolute top-3 right-5 text-[10px] uppercase tracking-widest" style={{ color: "#CFB99166" }}>Boilermakers</div>

            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden mb-5 ring-2" style={{ boxShadow: "0 0 0 2px #CFB99140, 0 20px 60px rgba(0,0,0,0.6)" }}>
              <Image src="/hero.jpeg" alt="Iris Dey" fill={false} width={112} height={112} className="object-cover object-left scale-110" />
            </div>

            <p className="font-display text-xl md:text-2xl font-bold text-white mb-1">Iris Dey</p>
            <p className="text-xs mb-3" style={{ color: "#CFB991aa" }}>Purdue University</p>
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider" style={{ background: "rgba(207,185,145,0.12)", color: "#CFB991", border: "1px solid rgba(207,185,145,0.2)" }}>
              Boiler Up!
            </span>
          </div>

          {/* INESH – RIGHT – MICHIGAN */}
          <div className="relative flex flex-col items-center justify-end pt-10 pb-8 px-6"
            style={{ background: "linear-gradient(160deg, #05080f 0%, #040b1a 100%)" }}>
            {/* Michigan maize top bar */}
            <div className="absolute top-0 inset-x-0 h-[3px]" style={{ background: "#FFCB05" }} />
            <div className="absolute top-3 left-5 text-[10px] uppercase tracking-widest font-semibold" style={{ color: "#FFCB0566" }}>Michigan</div>
            <div className="absolute top-3 right-5 text-[10px] uppercase tracking-widest" style={{ color: "#FFCB0566" }}>Wolverines</div>

            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden mb-5" style={{ boxShadow: "0 0 0 2px #FFCB0540, 0 20px 60px rgba(0,0,0,0.6)" }}>
              <Image src="/hero.jpeg" alt="Inesh Dey" fill={false} width={112} height={112} className="object-cover object-right scale-110" />
            </div>

            <p className="font-display text-xl md:text-2xl font-bold text-white mb-1">Inesh Dey</p>
            <p className="text-xs mb-3" style={{ color: "#FFCB05aa" }}>Univ. of Michigan</p>
            <span className="text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wider" style={{ background: "rgba(255,203,5,0.1)", color: "#FFCB05", border: "1px solid rgba(255,203,5,0.2)" }}>
              Go Blue!
            </span>
          </div>
        </div>

        {/* ── TITLE ── */}
        <div className="fade-up delay-3 text-center mb-10">
          <h1 className="font-display font-bold text-white leading-none tracking-tight">
            <span className="block text-[clamp(3rem,10vw,7rem)]">Graduation</span>
            <span className="block text-[clamp(3rem,10vw,7rem)] text-white/20">Party</span>
          </h1>
        </div>

        {/* ── DIVIDER + EVENT INFO ── */}
        <div className="fade-up delay-3 w-full max-w-xl mb-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, transparent, rgba(255,255,255,0.08))" }} />
            <span className="text-[10px] uppercase tracking-[0.2em] text-white/25">Event Details</span>
            <div className="flex-1 h-px" style={{ background: "linear-gradient(to left, transparent, rgba(255,255,255,0.08))" }} />
          </div>

          <div className="grid grid-cols-3 gap-3 text-center mb-4">
            {([
              ["June 26, 2026", "Date"],
              ["6:00 PM", "Time"],
              ["Redmond, WA", "Location"],
            ] as [string, string][]).map(([val, label]) => (
              <div key={label}>
                <p className="text-white text-sm md:text-base font-medium">{val}</p>
                <p className="text-white/25 text-[10px] uppercase tracking-widest mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-white/30 text-xs">
            Redmond Senior &amp; Community Center
          </p>
          <p className="text-center text-white/20 text-[11px] mt-1">
            Hosted by Subhas &amp; Sanchita Dey · RSVP by June 12
          </p>
        </div>

        {/* ── COUNTDOWN ── */}
        <div className="fade-up delay-4 flex gap-5 md:gap-8 mb-10">
          {Object.entries(count).map(([unit, val]) => (
            <div key={unit} className="flex flex-col items-center gap-1">
              <span className="font-display text-3xl md:text-4xl font-bold text-white tabular-nums">
                {String(val).padStart(2, "0")}
              </span>
              <span className="text-[10px] uppercase tracking-widest text-white/25">{unit}</span>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="fade-up delay-5 flex flex-col sm:flex-row items-center gap-3">
          <Link href="/rsvp"
            className="px-10 py-3.5 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95"
            style={{ background: "#FFCB05", color: "#070a10" }}>
            RSVP Now
          </Link>
          <Link href="/gallery"
            className="px-8 py-3.5 rounded-full text-sm text-white/50 hover:text-white transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            Gallery
          </Link>
          <Link href="/chat"
            className="px-8 py-3.5 rounded-full text-sm text-white/50 hover:text-white transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
            Party Chat
          </Link>
        </div>

        {rsvps !== null && rsvps > 0 && (
          <p className="mt-6 text-white/20 text-xs">{rsvps} guests attending</p>
        )}
      </main>

      {/* ── FOOTER ── */}
      <footer className="flex items-center justify-between px-6 md:px-12 py-5 border-t border-white/[0.05]">
        <div className="flex items-center gap-3 text-[11px]">
          <span style={{ color: "#CFB99150" }}>Purdue Boilermakers</span>
          <span className="text-white/10">×</span>
          <span style={{ color: "#FFCB0550" }}>Michigan Wolverines</span>
        </div>
        <Link href="/admin" className="text-white/15 hover:text-white/40 text-[11px] transition-all">Admin</Link>
      </footer>
    </div>
  );
}
