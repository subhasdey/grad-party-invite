"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";

const PARTY = {
  names: "Inesh Dey & Iris Dey",
  date: "June 26, 2026",
  time: "6:00 PM",
  venue: "Redmond Senior & Community Center",
  city: "Redmond, WA",
  deadline: "June 12, 2026",
};

const COLORS = ["#7c3aed", "#db2777", "#f59e0b", "#06b6d4", "#10b981"];

interface ParticleData {
  width: string; height: string; left: string; top: string;
  background: string; opacity: number; animationDelay: string; duration: string;
}

function generateParticles(): ParticleData[] {
  return Array.from({ length: 20 }, (_, i) => ({
    width: `${6 + Math.random() * 10}px`,
    height: `${6 + Math.random() * 10}px`,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    background: COLORS[i % 5],
    opacity: 0.3 + Math.random() * 0.4,
    animationDelay: `${Math.random() * 3}s`,
    duration: `${3 + Math.random() * 4}s`,
  }));
}

export default function Home() {
  const [particles, setParticles] = useState<ParticleData[]>([]);
  const [rsvpCount, setRsvpCount] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setParticles(generateParticles());
    fetch("/api/rsvp").then(r => r.json()).then((data: { attending: boolean }[]) =>
      setRsvpCount(data.filter(r => r.attending).length)
    );

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
    <main className="relative min-h-screen flex flex-col overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[#0a0618]">
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 20% 50%, rgba(124,58,237,0.15) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(219,39,119,0.12) 0%, transparent 60%), radial-gradient(ellipse at 50% 100%, rgba(245,158,11,0.08) 0%, transparent 60%)" }} />
        {particles.map((p, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: p.width, height: p.height,
              left: p.left, top: p.top,
              background: p.background, opacity: p.opacity,
              animationDelay: p.animationDelay,
              animation: `float ${p.duration} ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5">
        <span className="font-display text-xl font-bold gradient-text">Class of 2026</span>
        <div className="flex gap-3">
          {([["Gallery", "/gallery"], ["Chat", "/chat"], ["Admin", "/admin"]] as [string, string][]).map(([label, href]) => (
            <Link key={href} href={href} className="px-4 py-2 text-sm rounded-full glass hover:bg-white/10 transition-all text-white/80 hover:text-white">
              {label}
            </Link>
          ))}
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 py-12 text-center">

        {/* Photo */}
        <div className="relative mb-8">
          {/* Glowing ring */}
          <div className="absolute inset-0 rounded-full blur-2xl opacity-60" style={{ background: "linear-gradient(135deg, #7c3aed, #db2777, #f59e0b)", transform: "scale(1.15)" }} />
          <div className="relative w-52 h-52 md:w-64 md:h-64 rounded-full overflow-hidden border-4 pulse-glow" style={{ borderColor: "rgba(167,139,250,0.6)" }}>
            <Image
              src="/hero.jpeg"
              alt="Inesh and Iris Dey"
              fill
              className="object-cover object-top"
              priority
            />
          </div>
          {/* Cap badges */}
          <div className="absolute -top-2 -right-2 text-3xl float-anim">🎓</div>
          <div className="absolute -bottom-2 -left-2 text-3xl float-anim" style={{ animationDelay: "1s" }}>🎓</div>
        </div>

        <p className="text-sm uppercase tracking-widest text-purple-400 mb-3 font-medium">You're Invited</p>
        <h1 className="font-display text-5xl md:text-7xl font-bold mb-4 leading-tight">
          <span className="gradient-text">Graduation</span>
          <br />
          <span className="text-white">Celebration</span>
        </h1>
        <p className="text-2xl md:text-3xl font-display text-amber-400 mb-1">{PARTY.names}</p>
        <p className="text-white/60 text-base mb-10">Hosted by Subhas &amp; Sanchita Dey</p>

        {/* Countdown */}
        <div className="flex gap-4 mb-10">
          {Object.entries(timeLeft).map(([unit, val]) => (
            <div key={unit} className="glass px-4 py-3 text-center min-w-[70px]">
              <div className="text-3xl font-bold text-purple-300 font-display">{String(val).padStart(2, "0")}</div>
              <div className="text-xs uppercase tracking-widest text-white/40 mt-1">{unit}</div>
            </div>
          ))}
        </div>

        {/* Details card */}
        <div className="glass p-6 mb-10 max-w-md w-full text-left space-y-3">
          {([
            ["📅", "Date", PARTY.date],
            ["🕕", "Time", PARTY.time],
            ["📍", "Venue", `${PARTY.venue}, ${PARTY.city}`],
            ["⏰", "RSVP by", PARTY.deadline],
          ] as [string, string, string][]).map(([icon, label, val]) => (
            <div key={label} className="flex items-start gap-3">
              <span className="text-xl">{icon}</span>
              <div>
                <p className="text-xs text-white/40 uppercase tracking-wide">{label}</p>
                <p className="text-white/90">{val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link
            href="/rsvp"
            className="px-8 py-4 rounded-full text-white font-semibold text-lg pulse-glow transition-all hover:scale-105 active:scale-95"
            style={{ background: "linear-gradient(135deg, #7c3aed, #db2777)" }}
          >
            RSVP Now
          </Link>
          <Link href="/gallery" className="px-8 py-4 rounded-full glass text-white/80 hover:text-white font-semibold text-lg transition-all hover:bg-white/10">
            View Gallery
          </Link>
        </div>

        {rsvpCount !== null && (
          <p className="mt-6 text-white/40 text-sm">
            {rsvpCount} {rsvpCount === 1 ? "guest has" : "guests have"} already RSVP'd
          </p>
        )}
      </section>

      <div className="relative z-10 w-full py-4 px-6 flex justify-center gap-8 text-white/30 text-sm">
        {["Dinner & Drinks", "Live Music", "Photo Booth", "Dancing"].map(f => (
          <span key={f} className="hidden sm:inline">{f}</span>
        ))}
      </div>
    </main>
  );
}
