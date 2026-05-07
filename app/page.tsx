"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  DoorOpen, Wine, Utensils, Mic, CakeSlice, Music, Gift,
  Calendar, Clock, MapPin, Shirt, Car, Heart, type LucideIcon,
} from "lucide-react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://grad-party-invite-tan.vercel.app";

interface Countdown { days: number; hours: number; minutes: number; seconds: number; }
interface Wish { name: string; message: string; attending: boolean; }

const ITINERARY: { time: string; label: string; Icon: LucideIcon }[] = [
  { time: "6:00 PM", label: "Doors Open",       Icon: DoorOpen   },
  { time: "6:30 PM", label: "Welcome & Drinks",  Icon: Wine       },
  { time: "7:00 PM", label: "Dinner",            Icon: Utensils   },
  { time: "8:00 PM", label: "Speeches",          Icon: Mic        },
  { time: "8:30 PM", label: "Cake & Dessert",    Icon: CakeSlice  },
  { time: "9:00 PM", label: "Fun Activities",     Icon: Music      },
];

const DETAILS: { Icon: LucideIcon; val: string; sub: string }[] = [
  { Icon: Calendar, val: "June 26, 2026",  sub: "Friday"                        },
  { Icon: Clock,    val: "6:00 PM",        sub: "Evening"                       },
  { Icon: MapPin,   val: "Redmond, WA",    sub: "Senior & Community Center"     },
];

function useReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return { ref, visible };
}

export default function Home() {
  const [count, setCount]   = useState<Countdown>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [rsvps, setRsvps]   = useState<number | null>(null);
  const [navBg, setNavBg]   = useState(false);
  const [copied, setCopied] = useState(false);

  const graduatesReveal  = useReveal();
  const detailsReveal    = useReveal();
  const itineraryReveal  = useReveal();
  const wishReveal       = useReveal();
  const shareReveal      = useReveal();

  useEffect(() => {
    fetch("/api/rsvp").then(r => r.json()).then((d: Wish[]) => {
      setRsvps(d.filter(r => r.attending).length);
      setWishes(d.filter(r => r.attending && r.message?.trim()).slice(0, 6));
    }).catch(() => {});

    const target = new Date("2026-06-26T18:00:00").getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) return;
      setCount({ days: Math.floor(diff/86400000), hours: Math.floor((diff%86400000)/3600000), minutes: Math.floor((diff%3600000)/60000), seconds: Math.floor((diff%60000)/1000) });
    };
    tick();
    const id = setInterval(tick, 1000);

    const onScroll = () => setNavBg(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => { clearInterval(id); window.removeEventListener("scroll", onScroll); };
  }, []);

  const copyLink = () => { navigator.clipboard?.writeText(APP_URL); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const shareText = encodeURIComponent("You're invited to Iris & Inesh Dey's Graduation Party! June 26, 2026 · Redmond, WA 🎓");
  const shareUrl  = encodeURIComponent(APP_URL);

  return (
    <div style={{ background: "#FAF6EE", color: "#1d1d1f" }}>

      {/* ── STICKY NAV ── */}
      <nav className="fixed top-0 inset-x-0 z-50 transition-all duration-500"
        style={{ background: navBg ? "rgba(255,255,255,0.88)" : "transparent", backdropFilter: navBg ? "blur(20px)" : "none", borderBottom: navBg ? "1px solid rgba(0,0,0,0.08)" : "none" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "rgba(0,0,0,0.45)" }}>Class of 2026</span>
          <div className="hidden md:flex items-center gap-2">
            {([["Gallery","/gallery"],["Gifts","/wishlist"],["Chat","/chat"],["Admin","/admin"]] as [string,string][]).map(([l,h]) => (
              <Link key={h} href={h} className="px-4 py-1.5 rounded-full text-xs font-medium transition-all hover:text-[#1d1d1f]"
                style={{ color: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,0,0,0.1)" }}>{l}</Link>
            ))}
            <Link href="/rsvp" className="ml-2 px-5 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105"
              style={{ background: "#00274C", color: "#FFCB05" }}>RSVP Now</Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden" style={{ background: "#FAF6EE" }}>
        {/* Decorative background blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-10" style={{ background: "#00274C", transform: "translate(30%,-30%)", filter: "blur(80px)" }} />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full opacity-10" style={{ background: "#CFB991", transform: "translate(-30%,30%)", filter: "blur(80px)" }} />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center px-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] mb-6" style={{ color: "rgba(0,0,0,0.45)" }}>
            You&rsquo;re Invited · A Twin Celebration
          </p>
          <div className="mb-6 flex items-end gap-2">
            <Image src="/cap-purdue.svg" alt="Purdue graduation cap" width={100} height={86} style={{ filter: "drop-shadow(0 4px 12px rgba(207,185,145,0.3))", transform: "rotate(-18deg) translateY(6px)" }} />
            <Image src="/cap-michigan.svg" alt="Michigan graduation cap" width={100} height={86} style={{ filter: "drop-shadow(0 4px 12px rgba(0,39,76,0.3))", transform: "rotate(18deg) translateY(6px)" }} />
          </div>
          <h1 className="font-display font-bold leading-[0.95] tracking-tight mb-2"
            style={{ fontSize: "clamp(3.5rem,11vw,8rem)", color: "#1d1d1f" }}>
            Graduation
          </h1>
          <h1 className="font-display font-bold leading-[0.95] tracking-tight mb-10"
            style={{ fontSize: "clamp(3.5rem,11vw,8rem)", color: "rgba(0,0,0,0.18)" }}>
            Party
          </h1>

          <div className="flex items-center gap-4 mb-10 text-sm font-medium" style={{ color: "rgba(0,0,0,0.5)" }}>
            <span>June 26, 2026</span>
            <span style={{ color: "rgba(0,0,0,0.2)" }}>·</span>
            <span>6:00 PM</span>
            <span style={{ color: "rgba(0,0,0,0.2)" }}>·</span>
            <span>Redmond, WA</span>
          </div>

          {/* School badges */}
          <div className="flex items-center gap-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full"
              style={{ background: "#CFB991", color: "#3a2800", border: "1px solid #b8a070" }}>
              Boiler Up!
            </span>
            <span style={{ color: "rgba(0,0,0,0.25)", fontSize: 20 }}>×</span>
            <span className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full"
              style={{ background: "#00274C", color: "#FFCB05", border: "1px solid #003a70" }}>
              Go Blue!
            </span>
          </div>

          <Link href="/rsvp"
            className="px-10 py-4 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95"
            style={{ background: "#00274C", color: "#FFCB05" }}>
            RSVP Now
          </Link>

          {/* Parent message */}
          <div className="mt-12 max-w-xl px-6 py-6 rounded-2xl text-center" style={{ background: "rgba(0,39,76,0.05)", border: "1px solid rgba(0,39,76,0.1)" }}>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "rgba(0,0,0,0.65)", fontStyle: "italic" }}>
              &ldquo;With great pride and joy, we announce the graduation of Iris and Inesh Dey from Tesla STEAM High School. Please join us in celebrating their remarkable achievements as they prepare to embark on their next chapter at university.&rdquo;
            </p>
            <p className="text-xs font-semibold" style={{ color: "#00274C" }}>— Sanchita and Subhas</p>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce" style={{ color: "rgba(0,0,0,0.35)" }}>
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 — THE GRADUATES
      ══════════════════════════════════════════ */}
      <section className="min-h-screen flex flex-col items-center justify-center py-24 px-6">
        <div ref={graduatesReveal.ref} className="w-full max-w-5xl transition-all duration-1000"
          style={{ opacity: graduatesReveal.visible ? 1 : 0, transform: graduatesReveal.visible ? "translateY(0)" : "translateY(60px)" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-center mb-4" style={{ color: "rgba(0,0,0,0.4)" }}>The Graduates</p>
          <h2 className="font-display text-center font-bold mb-16" style={{ fontSize: "clamp(2rem,6vw,4rem)", color: "#1d1d1f" }}>Celebrating Two Milestones</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* IRIS */}
            <div className="group relative rounded-3xl overflow-hidden"
              style={{ background: "linear-gradient(160deg,#1a1200,#0b0e17)", border: "1px solid rgba(207,185,145,0.2)" }}>
              <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg,transparent,#CFB991,transparent)" }} />
              <div className="relative w-full" style={{ aspectRatio: "4/5" }}>
                <Image src="/iris.jpeg" alt="Iris Dey" fill className="object-cover object-top transition-transform duration-700 group-hover:scale-105" sizes="(max-width:768px) 100vw,50vw" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top,#1a1200 20%,transparent 60%)" }} />
                <div className="absolute bottom-0 inset-x-0 p-8">
                  <p className="font-display text-4xl font-bold text-white mb-1">Iris Dey</p>
                  <p className="text-sm font-medium mb-4" style={{ color: "#CFB991" }}>Purdue University</p>
                  <span className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(207,185,145,0.15)", color: "#CFB991", border: "1px solid rgba(207,185,145,0.3)" }}>
                    Boiler Up!
                  </span>
                </div>
              </div>
            </div>

            {/* INESH */}
            <div className="group relative rounded-3xl overflow-hidden"
              style={{ background: "linear-gradient(160deg,#00111f,#0b0e17)", border: "1px solid rgba(255,203,5,0.2)" }}>
              <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg,transparent,#FFCB05,transparent)" }} />
              <div className="relative w-full" style={{ aspectRatio: "4/5" }}>
                <Image src="/inesh.jpeg" alt="Inesh Dey" fill className="object-cover object-top transition-transform duration-700 group-hover:scale-105" sizes="(max-width:768px) 100vw,50vw" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top,#00111f 20%,transparent 60%)" }} />
                <div className="absolute bottom-0 inset-x-0 p-8">
                  <p className="font-display text-4xl font-bold text-white mb-1">Inesh Dey</p>
                  <p className="text-sm font-medium mb-4" style={{ color: "#FFCB05" }}>University of Michigan</p>
                  <span className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(255,203,5,0.1)", color: "#FFCB05", border: "1px solid rgba(255,203,5,0.3)" }}>
                    Go Blue!
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick links below photos */}
          <div className="flex items-center justify-center gap-3 mt-6 flex-wrap">
            <Link href="/wishlist"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
              style={{ background: "#00274C", color: "#FFCB05" }}>
              <Gift className="w-4 h-4" />
              Gift Ideas
            </Link>
            <a href="https://zellepay.com/pay-with-zelle"
              target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all hover:scale-105"
              style={{ background: "#6D1ED4", color: "#ffffff" }}>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M13.5 2L3 13.5h7.5L9 22l12-12h-7.5L13.5 2z"/></svg>
              Send via Zelle
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 3 — EVENT DETAILS + COUNTDOWN
      ══════════════════════════════════════════ */}
      <section className="min-h-screen flex flex-col items-center justify-center py-24 px-6"
        style={{ background: "#ffffff" }}>
        <div ref={detailsReveal.ref} className="w-full max-w-4xl transition-all duration-1000"
          style={{ opacity: detailsReveal.visible ? 1 : 0, transform: detailsReveal.visible ? "translateY(0)" : "translateY(60px)" }}>

          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-center mb-4" style={{ color: "rgba(0,0,0,0.4)" }}>The Details</p>
          <h2 className="font-display text-center font-bold mb-16" style={{ fontSize: "clamp(2rem,6vw,4rem)", color: "#1d1d1f" }}>Mark Your Calendar</h2>

          {/* Big detail cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {DETAILS.map(({ Icon, val, sub }) => (
              <div key={val} className="flex flex-col items-center text-center py-10 px-6 rounded-3xl"
                style={{ background: "#FAF6EE", border: "1px solid rgba(0,0,0,0.07)" }}>
                <div className="mb-4 p-3 rounded-2xl" style={{ background: "rgba(0,39,76,0.08)" }}>
                  <Icon className="w-8 h-8" style={{ color: "#00274C" }} />
                </div>
                <p className="font-display text-2xl font-bold mb-2" style={{ color: "#1d1d1f" }}>{val}</p>
                <p className="text-sm" style={{ color: "rgba(0,0,0,0.45)" }}>{sub}</p>
              </div>
            ))}
          </div>

          <div className="text-center mb-12 py-5 rounded-2xl" style={{ background: "#FAF6EE", border: "1px solid rgba(0,0,0,0.06)" }}>
            <p className="text-sm font-semibold mb-1" style={{ color: "#1d1d1f" }}>Redmond Senior &amp; Community Center</p>
            <p className="text-sm" style={{ color: "rgba(0,0,0,0.5)" }}>
              Hosted by <span className="font-medium" style={{ color: "#1d1d1f" }}>Subhas &amp; Sanchita Dey</span>
              &nbsp;·&nbsp; RSVP by <span style={{ color: "#00274C", fontWeight: 600 }}>June 12, 2026</span>
            </p>
          </div>

          {/* Countdown */}
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-center mb-8" style={{ color: "rgba(0,0,0,0.4)" }}>Counting Down</p>
          <div className="grid grid-cols-4 gap-4">
            {Object.entries(count).map(([unit, val]) => (
              <div key={unit} className="flex flex-col items-center py-8 rounded-3xl"
                style={{ background: "#00274C" }}>
                <span className="font-display font-bold tabular-nums" style={{ fontSize: "clamp(2rem,5vw,3.5rem)", color: "#FFCB05" }}>
                  {String(val).padStart(2, "0")}
                </span>
                <span className="text-xs font-semibold uppercase tracking-widest mt-2" style={{ color: "rgba(255,203,5,0.6)" }}>{unit}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <Link href="/rsvp"
              className="px-12 py-4 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95"
              style={{ background: "#00274C", color: "#FFCB05" }}>
              Confirm Your Spot
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 4 — EVENING ITINERARY
      ══════════════════════════════════════════ */}
      <section className="min-h-screen flex flex-col items-center justify-center py-24 px-6">
        <div ref={itineraryReveal.ref} className="w-full max-w-3xl transition-all duration-1000"
          style={{ opacity: itineraryReveal.visible ? 1 : 0, transform: itineraryReveal.visible ? "translateY(0)" : "translateY(60px)" }}>

          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-center mb-4" style={{ color: "rgba(0,0,0,0.4)" }}>The Program</p>
          <h2 className="font-display text-center font-bold mb-16" style={{ fontSize: "clamp(2rem,6vw,4rem)", color: "#1d1d1f" }}>Evening Schedule</h2>

          <div className="space-y-4">
            {ITINERARY.map((item, i) => (
              <div key={item.time} className="flex items-center gap-6 p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)", transitionDelay: `${i * 60}ms`, opacity: itineraryReveal.visible ? 1 : 0, transform: itineraryReveal.visible ? "translateX(0)" : "translateX(-30px)" }}>
                <item.Icon className="w-6 h-6 flex-shrink-0" style={{ color: i % 2 === 0 ? "#8a6500" : "#00274C" }} />
                <div className="flex-1">
                  <p className="font-semibold text-lg" style={{ color: "#1d1d1f" }}>{item.label}</p>
                </div>
                <span className="text-sm font-semibold tabular-nums" style={{ color: i % 2 === 0 ? "#8a6500" : "#00274C" }}>{item.time}</span>
              </div>
            ))}
          </div>

          {/* Dress code */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl" style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Shirt className="w-4 h-4" style={{ color: "#8a6500" }} />
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#8a6500" }}>Dress Code</p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex-shrink-0 shadow-sm" style={{ background: "#00274C", border: "3px solid #FFCB05" }} />
                  <div>
                    <p className="text-base font-bold" style={{ color: "#1d1d1f" }}>Girls — Blue</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex-shrink-0 shadow-sm" style={{ background: "#1a1a1a", border: "3px solid #CFB991" }} />
                  <div>
                    <p className="text-base font-bold" style={{ color: "#1d1d1f" }}>Boys — Black</p>
                  </div>
                </div>
                <p className="text-xs" style={{ color: "rgba(0,0,0,0.4)" }}>Festive semi-formal</p>
              </div>
            </div>
            <div className="p-6 rounded-2xl" style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Car className="w-4 h-4" style={{ color: "#00274C" }} />
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#00274C" }}>Parking</p>
              </div>
              <p className="text-sm" style={{ color: "rgba(0,0,0,0.6)" }}>Free parking at the Redmond Senior &amp; Community Center lot. Street parking nearby.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 5 — WISH WALL
      ══════════════════════════════════════════ */}
      {wishes.length > 0 && (
        <section className="py-24 px-6" style={{ background: "#FAF6EE" }}>
          <div ref={wishReveal.ref} className="w-full max-w-4xl mx-auto transition-all duration-1000"
            style={{ opacity: wishReveal.visible ? 1 : 0, transform: wishReveal.visible ? "translateY(0)" : "translateY(60px)" }}>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-center mb-4" style={{ color: "rgba(0,0,0,0.4)" }}>Guest Wishes</p>
            <h2 className="font-display text-center font-bold mb-16 flex items-center justify-center gap-3" style={{ fontSize: "clamp(2rem,6vw,4rem)", color: "#1d1d1f" }}>
              Words of Love <Heart className="w-8 h-8 inline-block" style={{ color: "#00274C" }} />
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishes.map((w, i) => (
                <div key={i} className="p-6 rounded-2xl flex flex-col"
                  style={{ background: "#ffffff", border: "1px solid rgba(0,0,0,0.07)" }}>
                  <p className="text-sm leading-relaxed flex-1 mb-4" style={{ color: "rgba(0,0,0,0.65)" }}>&ldquo;{w.message}&rdquo;</p>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: i % 2 === 0 ? "#8a6500" : "#00274C" }}>— {w.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          SECTION 6 — SHARE
      ══════════════════════════════════════════ */}
      <section className="py-24 px-6">
        <div ref={shareReveal.ref} className="w-full max-w-3xl mx-auto transition-all duration-1000"
          style={{ opacity: shareReveal.visible ? 1 : 0, transform: shareReveal.visible ? "translateY(0)" : "translateY(60px)" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-center mb-4" style={{ color: "rgba(0,0,0,0.4)" }}>Spread the Word</p>
          <h2 className="font-display text-center font-bold mb-16" style={{ fontSize: "clamp(2rem,6vw,4rem)", color: "#1d1d1f" }}>Share the Invite</h2>

          <div className="flex flex-col sm:flex-row gap-8 items-center justify-center">
            <div className="flex flex-col gap-3 flex-1 w-full max-w-xs">
              <a href={`https://wa.me/?text=${shareText}%20${shareUrl}`} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold text-sm transition-all hover:scale-[1.03]"
                style={{ background: "#25D366", color: "#fff" }}>
                <svg className="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Share on WhatsApp
              </a>
              <a href={`sms:&body=${shareText}%20${shareUrl}`}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold text-sm transition-all hover:scale-[1.03]"
                style={{ background: "#34C759", color: "#fff" }}>
                <svg className="w-5 h-5 fill-current flex-shrink-0" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                Share via iMessage
              </a>
              <button onClick={copyLink}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl font-semibold text-sm transition-all hover:scale-[1.03]"
                style={{ background: "#FAF6EE", color: copied ? "#00274C" : "rgba(0,0,0,0.7)", border: "1px solid rgba(0,0,0,0.1)" }}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="py-10 px-6" style={{ borderTop: "1px solid rgba(0,0,0,0.08)", background: "#ffffff" }}>
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs font-medium">
            <span style={{ color: "#8a6500" }}>Purdue Boilermakers</span>
            <span style={{ color: "rgba(0,0,0,0.2)" }}>×</span>
            <span style={{ color: "#00274C" }}>Michigan Wolverines</span>
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: "rgba(0,0,0,0.35)" }}>
            {rsvps !== null && rsvps > 0 && <span>{rsvps} guests attending</span>}
            <Link href="/admin" className="hover:text-white transition-all">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
