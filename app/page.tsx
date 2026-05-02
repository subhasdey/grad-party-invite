"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const PARTY = {
  date: "June 26, 2026",
  time: "6:00 PM",
  venue: "Redmond Senior & Community Center",
  city: "Redmond, WA",
  deadline: "June 12, 2026",
};

const MICHIGAN = {
  name: "Inesh Dey",
  school: "University of Michigan",
  short: "U of M",
  slogan: "Go Blue!",
  mascot: "Wolverines",
  colors: { primary: "#00274C", accent: "#FFCB05" },
};

const PURDUE = {
  name: "Iris Dey",
  school: "Purdue University",
  short: "Purdue",
  slogan: "Boiler Up!",
  mascot: "Boilermakers",
  colors: { primary: "#1a1400", accent: "#CFB991" },
};

interface ParticleData {
  width: number; height: number; left: number; top: number;
  color: string; opacity: number; delay: number; duration: number;
}

function generateParticles(): ParticleData[] {
  const colors = [MICHIGAN.colors.accent, PURDUE.colors.accent, "#ffffff"];
  return Array.from({ length: 24 }, (_, i) => ({
    width: 3 + Math.random() * 5,
    height: 3 + Math.random() * 5,
    left: Math.random() * 100,
    top: Math.random() * 100,
    color: colors[i % colors.length],
    opacity: 0.15 + Math.random() * 0.25,
    delay: Math.random() * 5,
    duration: 5 + Math.random() * 6,
  }));
}

function CountdownBox({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center rounded-2xl font-display font-bold text-2xl md:text-3xl"
        style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", color: "#FFCB05" }}
      >
        {String(value).padStart(2, "0")}
      </div>
      <span className="mt-2 text-[10px] uppercase tracking-widest text-white/30">{label}</span>
    </div>
  );
}

function SchoolBadge({ school, side }: { school: typeof MICHIGAN; side: "left" | "right" }) {
  const isLeft = side === "left";
  return (
    <div
      className={`flex flex-col ${isLeft ? "items-end text-right" : "items-start text-left"} gap-1`}
    >
      <span
        className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full"
        style={{ background: school.colors.accent + "22", color: school.colors.accent, border: `1px solid ${school.colors.accent}44` }}
      >
        {school.slogan}
      </span>
      <p className="font-display text-xl md:text-2xl font-bold text-white">{school.name}</p>
      <p className="text-sm" style={{ color: school.colors.accent + "cc" }}>{school.mascot} · {school.short}</p>
    </div>
  );
}

export default function Home() {
  const [particles, setParticles] = useState<ParticleData[]>([]);
  const [rsvpCount, setRsvpCount] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setParticles(generateParticles());
    fetch("/api/rsvp")
      .then(r => r.json())
      .then((d: { attending: boolean }[]) => setRsvpCount(d.filter(r => r.attending).length));

    const target = new Date("2026-06-26T18:00:00");
    const tick = () => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) return;
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <main className="relative min-h-screen flex flex-col overflow-hidden bg-[#080c14]">

      {/* ── Background ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Split color wash */}
        <div className="absolute inset-y-0 left-0 w-1/2" style={{ background: "radial-gradient(ellipse at 0% 50%, rgba(0,39,76,0.55) 0%, transparent 70%)" }} />
        <div className="absolute inset-y-0 right-0 w-1/2" style={{ background: "radial-gradient(ellipse at 100% 50%, rgba(30,22,0,0.7) 0%, transparent 70%)" }} />
        {/* Maize glow top-left */}
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl" style={{ background: "rgba(255,203,5,0.06)", transform: "translate(-30%,-30%)" }} />
        {/* Gold glow bottom-right */}
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl" style={{ background: "rgba(207,185,145,0.07)", transform: "translate(30%,30%)" }} />
        {/* Center glow behind photo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-3xl" style={{ background: "rgba(255,255,255,0.02)" }} />
        {/* Particles */}
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: p.width, height: p.height,
              left: `${p.left}%`, top: `${p.top}%`,
              background: p.color, opacity: p.opacity,
              animation: `float ${p.duration}s ${p.delay}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* ── Nav ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-10 py-5">
        <div className="flex items-center gap-2">
          <span className="text-base font-display font-semibold" style={{ color: "#FFCB05" }}>M</span>
          <span className="text-white/20 text-sm">×</span>
          <span className="text-base font-display font-semibold" style={{ color: "#CFB991" }}>P</span>
          <span className="ml-2 text-white/40 text-sm hidden sm:inline">Class of 2026</span>
        </div>
        <div className="flex items-center gap-2">
          {([["Gallery", "/gallery"], ["Chat", "/chat"], ["RSVP", "/rsvp"]] as [string, string][]).map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className={`px-4 py-2 text-sm rounded-full transition-all font-medium ${label === "RSVP"
                ? "text-[#080c14] font-semibold"
                : "text-white/50 hover:text-white glass"
              }`}
              style={label === "RSVP" ? { background: "#FFCB05" } : {}}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-10">

        {/* Tag line */}
        <p className="fade-up-1 text-xs uppercase tracking-[0.25em] mb-8" style={{ color: "rgba(255,255,255,0.35)" }}>
          A double celebration · June 26, 2026
        </p>

        {/* School badges + Photo row */}
        <div className="fade-up-2 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 mb-10 w-full max-w-3xl">

          {/* Michigan side */}
          <div className="hidden md:flex flex-1 justify-end">
            <SchoolBadge school={MICHIGAN} side="left" />
          </div>

          {/* Photo */}
          <div className="relative flex-shrink-0">
            {/* Outer glow rings */}
            <div className="absolute inset-0 rounded-full blur-xl opacity-50" style={{ background: `conic-gradient(from 0deg, ${MICHIGAN.colors.accent}, ${PURDUE.colors.accent}, ${MICHIGAN.colors.accent})`, transform: "scale(1.2)" }} />
            {/* Ring border */}
            <div className="absolute inset-0 rounded-full" style={{ padding: 3, background: `conic-gradient(from 0deg, ${MICHIGAN.colors.accent} 0%, #fff 50%, ${PURDUE.colors.accent} 100%)`, borderRadius: "50%" }}>
              <div className="w-full h-full rounded-full bg-[#080c14]" />
            </div>
            {/* Photo */}
            <div className="relative w-48 h-48 md:w-60 md:h-60 rounded-full overflow-hidden" style={{ boxShadow: "0 0 60px rgba(0,0,0,0.8)" }}>
              <Image src="/hero.jpeg" alt="Inesh and Iris Dey" fill className="object-cover object-top" priority />
            </div>
            {/* Michigan badge */}
            <div
              className="absolute -left-3 top-4 w-9 h-9 rounded-full flex items-center justify-center text-sm font-display font-black shadow-lg"
              style={{ background: MICHIGAN.colors.primary, border: `2px solid ${MICHIGAN.colors.accent}`, color: MICHIGAN.colors.accent }}
              title="Go Blue!"
            >M</div>
            {/* Purdue badge */}
            <div
              className="absolute -right-3 bottom-4 w-9 h-9 rounded-full flex items-center justify-center text-sm font-display font-black shadow-lg"
              style={{ background: PURDUE.colors.primary, border: `2px solid ${PURDUE.colors.accent}`, color: PURDUE.colors.accent }}
              title="Boiler Up!"
            >P</div>
          </div>

          {/* Purdue side */}
          <div className="hidden md:flex flex-1 justify-start">
            <SchoolBadge school={PURDUE} side="right" />
          </div>
        </div>

        {/* Mobile school tags */}
        <div className="flex md:hidden gap-3 mb-6 flex-wrap justify-center">
          <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: "#00274C", color: "#FFCB05", border: "1px solid #FFCB0555" }}>Go Blue! · Inesh</span>
          <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: "#1a1400", color: "#CFB991", border: "1px solid #CFB99155" }}>Boiler Up! · Iris</span>
        </div>

        {/* Title */}
        <div className="fade-up-2 text-center mb-3">
          <h1 className="font-display font-bold leading-none tracking-tight">
            <span className="block text-4xl md:text-6xl lg:text-7xl shimmer">Graduation</span>
            <span className="block text-4xl md:text-6xl lg:text-7xl text-white mt-1">Celebration</span>
          </h1>
        </div>

        <p className="fade-up-3 text-white/40 text-sm mb-10">
          Hosted by <span className="text-white/70">Subhas &amp; Sanchita Dey</span>
        </p>

        {/* Countdown */}
        <div className="fade-up-3 flex gap-4 md:gap-6 mb-10">
          {Object.entries(timeLeft).map(([unit, val]) => (
            <CountdownBox key={unit} value={val} label={unit} />
          ))}
        </div>

        {/* Details row */}
        <div className="fade-up-4 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl w-full mb-10 px-2">
          {([
            ["📅", PARTY.date],
            ["🕕", PARTY.time],
            ["📍", `${PARTY.venue}`],
          ] as [string, string][]).map(([icon, val]) => (
            <div key={val} className="flex items-center gap-2.5 glass px-4 py-3 justify-center text-center">
              <span className="text-base">{icon}</span>
              <span className="text-sm text-white/70">{val}</span>
            </div>
          ))}
        </div>

        {/* RSVP deadline note */}
        <p className="fade-up-4 text-xs text-white/30 mb-8">
          RSVP by <span className="text-white/50">{PARTY.deadline}</span> · {PARTY.city}
        </p>

        {/* CTA buttons */}
        <div className="fade-up-4 flex flex-col sm:flex-row gap-3 items-center">
          <Link
            href="/rsvp"
            className="px-10 py-3.5 rounded-full font-semibold text-sm transition-all hover:scale-105 active:scale-95"
            style={{ background: "#FFCB05", color: "#00274C" }}
          >
            RSVP Now
          </Link>
          <Link
            href="/gallery"
            className="px-10 py-3.5 rounded-full font-semibold text-sm transition-all hover:scale-105 glass text-white/70 hover:text-white"
          >
            View Gallery
          </Link>
          <Link
            href="/chat"
            className="px-10 py-3.5 rounded-full font-semibold text-sm transition-all hover:scale-105 glass text-white/70 hover:text-white"
          >
            Party Chat
          </Link>
        </div>

        {rsvpCount !== null && rsvpCount > 0 && (
          <p className="mt-8 text-white/25 text-xs">
            {rsvpCount} {rsvpCount === 1 ? "guest" : "guests"} attending
          </p>
        )}
      </section>

      {/* ── Footer strip ── */}
      <div className="relative z-10 divider mx-8" />
      <footer className="relative z-10 flex items-center justify-between px-8 py-5 text-white/20 text-xs">
        <div className="flex items-center gap-4">
          <span style={{ color: "#FFCB0560" }}>Michigan Wolverines</span>
          <span>·</span>
          <span style={{ color: "#CFB99160" }}>Purdue Boilermakers</span>
        </div>
        <Link href="/admin" className="hover:text-white/40 transition-colors">Admin</Link>
      </footer>
    </main>
  );
}
