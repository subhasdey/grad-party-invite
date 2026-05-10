"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import {
  DoorOpen, Wine, Utensils, Mic, CakeSlice, Music, Gift,
  Calendar, Clock, MapPin, Shirt, Car, Heart, type LucideIcon,
} from "lucide-react";


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
  const { data: session, status: authStatus } = useSession();
  const ADMINS = ["subhascdey@gmail.com", "monjoy.dey@gmail.com"];
  const isAdmin = ADMINS.includes(session?.user?.email ?? "");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [copiedZelle, setCopiedZelle] = useState<string | null>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
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
    const onClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => { clearInterval(id); window.removeEventListener("scroll", onScroll); document.removeEventListener("mousedown", onClickOutside); };
  }, []);

  const appUrl    = "https://iris-and-inesh-2026.vercel.app";
  const copyLink = () => { navigator.clipboard?.writeText(appUrl); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const shareText = encodeURIComponent("You're invited to Iris & Inesh Dey's Graduation Party! June 26, 2026 · Redmond, WA 🎓");
  const shareUrl  = encodeURIComponent(appUrl);

  return (
    <div style={{ background: "#f8f6ff", color: "#0d1525" }}>

      {/* ── STICKY NAV ── */}
      <nav className="fixed top-0 inset-x-0 z-50 transition-all duration-500"
        style={{ background: navBg ? "rgba(248,246,255,0.96)" : "transparent", backdropFilter: navBg ? "blur(20px)" : "none", borderBottom: navBg ? "1px solid rgba(0,0,0,0.08)" : "none" }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">
          <span className="text-xs font-semibold uppercase tracking-[0.2em]" style={{ color: "#8A6E00" }}>Class of 2026</span>
          <div className="flex items-center gap-2">
            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-2">
              {([["Gallery","/gallery"],["Gifts","/wishlist"],["Chat","/chat"],["Admin","/admin"]] as [string,string][]).map(([l,h]) => (
                <Link key={h} href={h} className="px-4 py-1.5 rounded-full text-xs font-medium transition-all hover:text-[#0d1525]"
                  style={{ color: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,0,0,0.12)" }}>{l}</Link>
              ))}
              <Link href="/rsvp" className="ml-2 px-5 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105"
                style={{ background: "#FFCB05", color: "#0d1525" }}>RSVP Now</Link>
            </div>
            {/* Auth — all screen sizes */}
            {authStatus === "loading" ? (
              <div className="ml-2 w-8 h-8 rounded-full animate-pulse" style={{ background: "rgba(0,0,0,0.08)" }} />
            ) : session?.user ? (
              <div ref={userMenuRef} className="relative ml-2">
                <button onClick={() => setUserMenuOpen(v => !v)}
                  className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full transition-all hover:scale-105 focus:outline-none"
                  style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(255,203,5,0.4)" }}>
                  {session.user.image
                    ? <Image src={session.user.image} alt="" width={30} height={30} className="rounded-full" style={{ boxShadow: "0 0 0 2px #FFCB05" }} />
                    : <div className="w-[30px] h-[30px] rounded-full flex items-center justify-center text-xs font-bold" style={{ background: "#FFCB05", color: "#0d1525" }}>{session.user.name?.[0]}</div>
                  }
                  <span className="hidden sm:block text-xs font-medium max-w-[100px] truncate" style={{ color: "rgba(0,0,0,0.7)" }}>
                    {session.user.name?.split(" ")[0]}
                  </span>
                  <svg className="w-3 h-3 flex-shrink-0 transition-transform" style={{ color: "rgba(0,0,0,0.4)", transform: userMenuOpen ? "rotate(180deg)" : "rotate(0deg)" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-60 rounded-2xl overflow-hidden z-50"
                    style={{ background: "rgba(255,255,255,0.98)", border: "1px solid rgba(0,0,0,0.08)", backdropFilter: "blur(24px)", boxShadow: "0 20px 60px rgba(0,0,0,0.15)" }}>
                    {/* Profile */}
                    <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      {session.user.image
                        ? <Image src={session.user.image} alt="" width={44} height={44} className="rounded-full flex-shrink-0" style={{ boxShadow: "0 0 0 2px #FFCB05" }} />
                        : <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold flex-shrink-0" style={{ background: "#FFCB05", color: "#0d1525" }}>{session.user.name?.[0]}</div>
                      }
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: "#0d1525" }}>{session.user.name}</p>
                        <p className="text-xs truncate" style={{ color: "rgba(0,0,0,0.45)" }}>{session.user.email}</p>
                        {isAdmin && <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#8A6E00" }}>Admin</span>}
                      </div>
                    </div>
                    {/* Links */}
                    <div className="px-2 py-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                      {([["RSVP","/rsvp"],["Gallery","/gallery"],["Chat","/chat"],["Gifts","/wishlist"]] as [string,string][]).map(([l,h]) => (
                        <Link key={h} href={h} onClick={() => setUserMenuOpen(false)}
                          className="flex items-center px-3 py-2 rounded-xl text-sm transition-all hover:bg-black/[0.04]"
                          style={{ color: "rgba(0,0,0,0.65)" }}>{l}</Link>
                      ))}
                    </div>
                    {/* Sign out */}
                    <div className="px-2 py-2">
                      <button onClick={() => { signOut(); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-all hover:bg-red-500/10 text-left"
                        style={{ color: "#FF453A" }}>
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => signIn("google")}
                className="ml-2 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all hover:scale-105"
                style={{ background: "rgba(0,0,0,0.05)", color: "#0d1525", border: "1px solid rgba(0,0,0,0.12)" }}>
                <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Sign in
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{ background: "linear-gradient(135deg, #eef2ff 0%, #e6edff 50%, #eef2ff 100%)" }} />
        {/* Flowing gradient orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute" style={{ top: "-15%", right: "-5%", width: "65vw", height: "65vw", background: "radial-gradient(circle, rgba(255,203,5,0.18) 0%, transparent 60%)", filter: "blur(70px)" }} />
          <div className="absolute" style={{ bottom: "-15%", left: "-10%", width: "55vw", height: "55vw", background: "radial-gradient(circle, rgba(0,39,76,0.12) 0%, transparent 65%)", filter: "blur(60px)" }} />
          <div className="absolute" style={{ top: "45%", left: "25%", width: "40vw", height: "40vw", background: "radial-gradient(circle, rgba(255,203,5,0.08) 0%, transparent 65%)", filter: "blur(90px)" }} />
        </div>

        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-24">
          {/* Ganesha blessing at top */}
          <div className="mb-5 flex justify-center">
            <div style={{ width: 80, height: 80, borderRadius: "50%", overflow: "hidden", border: "2px solid rgba(255,203,5,0.6)", boxShadow: "0 0 24px rgba(255,203,5,0.25)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ganesha.png" alt="Shree Ganesha"
                style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          </div>
          <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.2em] sm:tracking-[0.35em] mb-6 px-4 text-center" style={{ color: "#6B4E00" }}>
            You&rsquo;re Invited · A Twin Celebration
          </p>
          {/* Mobile: caps side-by-side above text */}
          <div className="flex sm:hidden justify-center items-end gap-6 mb-1">
            <div className="w-20">
              <Image src="/cap-purdue.svg" alt="Purdue graduation cap" width={140} height={120}
                style={{ width: "100%", height: "auto", filter: "drop-shadow(0 4px 20px rgba(100,75,30,0.7))", transform: "rotate(-20deg)" }} />
            </div>
            <div className="w-20">
              <Image src="/cap-michigan.svg" alt="Michigan graduation cap" width={140} height={120}
                style={{ width: "100%", height: "auto", filter: "drop-shadow(0 4px 16px rgba(255,203,5,0.5))", transform: "rotate(20deg)" }} />
            </div>
          </div>
          <h1 className="sm:hidden font-display font-bold leading-[0.95] tracking-tight mb-2 text-center"
            style={{ fontSize: "clamp(2.6rem,12vw,4rem)", background: "linear-gradient(135deg, #00274C 0%, #FFCB05 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Graduation
          </h1>

          {/* Desktop: caps flanking text */}
          <div className="hidden sm:flex items-center gap-3 mb-2">
            <div className="w-[110px] flex-shrink-0">
              <Image src="/cap-purdue.svg" alt="Purdue graduation cap" width={140} height={120}
                style={{ width: "100%", height: "auto", filter: "drop-shadow(0 4px 28px rgba(100,75,30,0.75))", transform: "rotate(-20deg)" }} />
            </div>
            <h1 className="font-display font-bold leading-[0.95] tracking-tight"
              style={{ fontSize: "clamp(2.2rem,10vw,8rem)", background: "linear-gradient(135deg, #00274C 0%, #FFCB05 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
              Graduation
            </h1>
            <div className="w-[110px] flex-shrink-0">
              <Image src="/cap-michigan.svg" alt="Michigan graduation cap" width={140} height={120}
                style={{ width: "100%", height: "auto", filter: "drop-shadow(0 4px 24px rgba(255,203,5,0.5))", transform: "rotate(20deg)" }} />
            </div>
          </div>
          <h1 className="font-display font-bold leading-[0.95] tracking-tight mb-10"
            style={{ fontSize: "clamp(2.2rem,10vw,8rem)", color: "rgba(0,39,76,0.18)" }}>
            Party
          </h1>

          <div className="flex items-center justify-center gap-2 sm:gap-4 mb-10 text-xs sm:text-sm font-medium flex-wrap" style={{ color: "rgba(0,0,0,0.55)" }}>
            <span>June 26, 2026</span>
            <span style={{ color: "rgba(0,0,0,0.2)" }}>·</span>
            <span>6:00 PM</span>
            <span style={{ color: "rgba(0,0,0,0.2)" }}>·</span>
            <span>Redmond, WA</span>
          </div>

          {/* School badges */}
          <div className="flex items-center gap-3 mb-12">
            <span className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full"
              style={{ background: "rgba(139,112,64,0.15)", color: "#5A3E10", border: "1px solid rgba(139,112,64,0.45)" }}>
              Boiler Up!
            </span>
            <span style={{ color: "rgba(0,0,0,0.3)", fontSize: 20 }}>×</span>
            <span className="text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full"
              style={{ background: "rgba(0,39,76,0.1)", color: "#00274C", border: "1px solid rgba(0,39,76,0.3)" }}>
              Go Blue!
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link href="/rsvp"
              className="px-10 py-4 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #FFCB05, #f5c400)", color: "#0d1525", boxShadow: "0 8px 40px rgba(255,203,5,0.35)" }}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              RSVP Now
            </Link>
            <Link href="/gallery"
              className="px-8 py-4 rounded-full text-sm font-semibold transition-all hover:scale-105 active:scale-95 text-center flex items-center justify-center gap-2"
              style={{ background: "linear-gradient(135deg, #00274C, #003d7a)", color: "#FFCB05", border: "1px solid rgba(0,39,76,0.3)", boxShadow: "0 8px 32px rgba(0,39,76,0.25)" }}>
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.069A1 1 0 0121 8.845v6.31a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/>
              </svg>
              Video Message
            </Link>
          </div>

          {/* Parent message */}
          <div className="mt-12 max-w-xl px-6 py-6 rounded-2xl text-center"
            style={{ background: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,203,5,0.25)", backdropFilter: "blur(20px)", boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
            <p className="text-sm leading-relaxed mb-3" style={{ color: "rgba(0,0,0,0.65)", fontStyle: "italic" }}>
              &ldquo;Today, our family has double the reason to celebrate the Class of 2026 for all of their hard work and sleepless nights. Our twins have officially made their college commitments, and we couldn&rsquo;t be more proud of the paths they have each chosen. As they prepare to embark on this exciting next chapter, we would love to celebrate their achievements with the people who matter most. Please join us with your family to bless, cheer, and send Inesh and Iris off on their next great adventure!&rdquo;
            </p>
            <p className="text-xs font-semibold" style={{ color: "#8A6E00" }}>— Sanchita and Subhas</p>
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce" style={{ color: "rgba(0,0,0,0.3)" }}>
          <span className="text-[10px] uppercase tracking-widest">Scroll</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 — THE GRADUATES
      ══════════════════════════════════════════ */}
      <section className="min-h-screen flex flex-col items-center justify-center py-24 px-6 relative overflow-hidden"
        style={{ background: "linear-gradient(180deg, #f4f7ff 0%, #f8f6ff 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute" style={{ top: "10%", left: "-10%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(255,203,5,0.12) 0%, transparent 65%)", filter: "blur(80px)" }} />
        </div>
        <div ref={graduatesReveal.ref} className="relative z-10 w-full max-w-5xl transition-all duration-1000"
          style={{ opacity: graduatesReveal.visible ? 1 : 0, transform: graduatesReveal.visible ? "translateY(0)" : "translateY(60px)" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-center mb-4" style={{ color: "#8A6E00" }}>The Graduates</p>
          <h2 className="font-display text-center font-bold mb-16"
            style={{ fontSize: "clamp(2rem,6vw,4rem)", background: "linear-gradient(135deg, #0d1525 0%, #FFCB05 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Celebrating Two Milestones
          </h2>

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
              style={{ background: "linear-gradient(135deg, #FFCB05, #f5c400)", color: "#0d1525" }}>
              <Gift className="w-4 h-4" />
              Gift Ideas
            </Link>
          </div>

          {/* Zelle card */}
          <div className="mt-6 rounded-2xl overflow-hidden" style={{ background: "rgba(109,30,212,0.06)", border: "1px solid rgba(109,30,212,0.2)" }}>
            <div className="flex items-center gap-2 px-5 pt-4 pb-3" style={{ borderBottom: "1px solid rgba(109,30,212,0.15)" }}>
              <svg className="w-4 h-4 flex-shrink-0" style={{ fill: "#6d1ed4" }} viewBox="0 0 24 24"><path d="M13.5 2L3 13.5h7.5L9 22l12-12h-7.5L13.5 2z"/></svg>
              <p className="text-sm font-bold" style={{ color: "#6d1ed4" }}>Send via Zelle</p>
              {!session?.user && (
                <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.4)" }}>
                  Sign in to reveal
                </span>
              )}
            </div>
            <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {([
                { name: "Inesh Dey", number: "+14252999168", color: "#7A5E00", hint: "•••• •••• 9168" },
                { name: "Iris Dey",  number: "+14255153937", color: "#6B5020", hint: "•••• •••• 3937" },
              ] as { name: string; number: string; color: string; hint: string }[]).map(({ name: n, number, color, hint }) => (
                <div key={n} className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                  <div>
                    <p className="text-xs font-bold mb-0.5" style={{ color }}>{n}</p>
                    <p className="text-sm font-mono font-semibold" style={{ color: session?.user ? "#0d1525" : "rgba(0,0,0,0.25)", letterSpacing: "0.05em", filter: session?.user ? "none" : "blur(4px)" }}>
                      {session?.user ? number : hint}
                    </p>
                  </div>
                  {session?.user ? (
                    <button
                      onClick={() => { navigator.clipboard?.writeText(number); setCopiedZelle(n); setTimeout(() => setCopiedZelle(null), 2000); }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105 active:scale-95 flex-shrink-0"
                      style={{ background: copiedZelle === n ? "rgba(52,199,89,0.12)" : "rgba(109,30,212,0.1)", color: copiedZelle === n ? "#1a7a3a" : "#6d1ed4", border: `1px solid ${copiedZelle === n ? "rgba(52,199,89,0.3)" : "rgba(109,30,212,0.25)"}` }}>
                      {copiedZelle === n
                        ? <><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Copied</>
                        : <><svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>Copy</>
                      }
                    </button>
                  ) : (
                    <button onClick={() => signIn("google")}
                      className="text-xs px-3 py-1.5 rounded-lg font-semibold flex-shrink-0 transition-all hover:scale-105"
                      style={{ background: "rgba(0,0,0,0.05)", color: "rgba(0,0,0,0.5)", border: "1px solid rgba(0,0,0,0.1)" }}>
                      Sign in
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 3 — EVENT DETAILS + COUNTDOWN
      ══════════════════════════════════════════ */}
      <section className="min-h-screen flex flex-col items-center justify-center py-24 px-6 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #eef2ff 0%, #f4f7ff 50%, #eef2ff 100%)" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute" style={{ top: "20%", right: "-10%", width: "50vw", height: "50vw", background: "radial-gradient(circle, rgba(255,203,5,0.15) 0%, transparent 65%)", filter: "blur(70px)" }} />
          <div className="absolute" style={{ bottom: "10%", left: "-5%", width: "40vw", height: "40vw", background: "radial-gradient(circle, rgba(0,39,76,0.1) 0%, transparent 65%)", filter: "blur(70px)" }} />
        </div>
        <div ref={detailsReveal.ref} className="relative z-10 w-full max-w-4xl transition-all duration-1000"
          style={{ opacity: detailsReveal.visible ? 1 : 0, transform: detailsReveal.visible ? "translateY(0)" : "translateY(60px)" }}>

          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-center mb-4" style={{ color: "#8A6E00" }}>The Details</p>
          <h2 className="font-display text-center font-bold mb-16"
            style={{ fontSize: "clamp(2rem,6vw,4rem)", background: "linear-gradient(135deg, #0d1525 0%, #FFCB05 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Mark Your Calendar
          </h2>

          {/* Big detail cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {DETAILS.map(({ Icon, val, sub }) => (
              <div key={val} className="flex flex-col items-center text-center py-10 px-6 rounded-3xl"
                style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(255,203,5,0.2)", backdropFilter: "blur(20px)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                <div className="mb-4 p-3 rounded-2xl" style={{ background: "rgba(255,203,5,0.12)", border: "1px solid rgba(255,203,5,0.25)" }}>
                  <Icon className="w-8 h-8" style={{ color: "#8A6E00" }} />
                </div>
                <p className="font-display text-2xl font-bold mb-2" style={{ color: "#0d1525" }}>{val}</p>
                <p className="text-sm" style={{ color: "rgba(0,0,0,0.5)" }}>{sub}</p>
              </div>
            ))}
          </div>

          <div className="text-center mb-12 py-5 px-4 rounded-2xl"
            style={{ background: "rgba(255,255,255,0.8)", border: "1px solid rgba(0,0,0,0.08)", backdropFilter: "blur(20px)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <p className="text-sm font-semibold mb-1" style={{ color: "#0d1525" }}>Redmond Senior &amp; Community Center</p>
            <p className="text-sm mb-1" style={{ color: "rgba(0,0,0,0.5)" }}>
              Hosted by <span className="font-medium" style={{ color: "#0d1525" }}>Subhas &amp; Sanchita Dey</span>
              &nbsp;·&nbsp; RSVP by <span style={{ color: "#8A6E00", fontWeight: 600 }}>June 12, 2026</span>
            </p>
            <a href="tel:4252896422" className="text-sm font-medium transition-all hover:underline" style={{ color: "#8A6E00" }}>
              (425) 289-6422
            </a>
          </div>

          {/* Countdown */}
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-center mb-8" style={{ color: "#8A6E00" }}>Counting Down</p>
          <div className="grid grid-cols-4 gap-2 sm:gap-4">
            {Object.entries(count).map(([unit, val]) => (
              <div key={unit} className="flex flex-col items-center py-8 rounded-3xl relative overflow-hidden"
                style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,203,5,0.25)", backdropFilter: "blur(20px)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 0%, rgba(255,203,5,0.1), transparent 70%)" }} />
                <span className="relative font-display font-bold tabular-nums" style={{ fontSize: "clamp(2rem,5vw,3.5rem)", color: "#8A6E00" }}>
                  {String(val).padStart(2, "0")}
                </span>
                <span className="relative text-xs font-semibold uppercase tracking-widest mt-2" style={{ color: "rgba(0,0,0,0.45)" }}>{unit}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <Link href="/rsvp"
              className="px-12 py-4 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #FFCB05, #f5c400)", color: "#0d1525", boxShadow: "0 8px 32px rgba(255,203,5,0.3)" }}>
              Confirm Your Spot
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 4 — EVENING ITINERARY
      ══════════════════════════════════════════ */}
      <section className="min-h-screen flex flex-col items-center justify-center py-24 px-6"
        style={{ background: "linear-gradient(180deg, #f8f6ff 0%, #f2f5ff 100%)" }}>
        <div ref={itineraryReveal.ref} className="w-full max-w-3xl transition-all duration-1000"
          style={{ opacity: itineraryReveal.visible ? 1 : 0, transform: itineraryReveal.visible ? "translateY(0)" : "translateY(60px)" }}>

          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-center mb-4" style={{ color: "#8A6E00" }}>The Program</p>
          <h2 className="font-display text-center font-bold mb-16"
            style={{ fontSize: "clamp(2rem,6vw,4rem)", background: "linear-gradient(135deg, #0d1525 0%, #FFCB05 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Evening Schedule
          </h2>

          <div className="space-y-4">
            {ITINERARY.map((item, i) => (
              <div key={item.time} className="flex items-center gap-6 p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02]"
                style={{ background: "rgba(255,255,255,0.85)", border: `1px solid ${i % 2 === 0 ? "rgba(139,112,64,0.18)" : "rgba(255,203,5,0.2)"}`, backdropFilter: "blur(20px)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", transitionDelay: `${i * 60}ms`, opacity: itineraryReveal.visible ? 1 : 0, transform: itineraryReveal.visible ? "translateX(0)" : "translateX(-30px)" }}>
                <item.Icon className="w-6 h-6 flex-shrink-0" style={{ color: i % 2 === 0 ? "#6B5020" : "#8A6E00" }} />
                <div className="flex-1">
                  <p className="font-semibold text-lg" style={{ color: "#0d1525" }}>{item.label}</p>
                </div>
                <span className="text-sm font-semibold tabular-nums" style={{ color: i % 2 === 0 ? "#6B5020" : "#8A6E00" }}>{item.time}</span>
              </div>
            ))}
          </div>

          {/* Dress code */}
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(139,112,64,0.18)", backdropFilter: "blur(20px)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Shirt className="w-4 h-4" style={{ color: "#6B5020" }} />
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#6B5020" }}>Dress Code</p>
              </div>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex-shrink-0 shadow-sm" style={{ background: "#00274C", border: "1px solid rgba(0,0,0,0.1)" }} />
                  <p className="text-base font-bold" style={{ color: "#0d1525" }}>Navy Blue</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl flex-shrink-0 shadow-sm" style={{ background: "#1a1a1a", border: "1px solid rgba(0,0,0,0.1)" }} />
                  <p className="text-base font-bold" style={{ color: "#0d1525" }}>Black</p>
                </div>
                <p className="text-xs" style={{ color: "rgba(0,0,0,0.4)" }}>Festive semi-formal</p>
              </div>
            </div>
            <div className="p-6 rounded-2xl" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(255,203,5,0.2)", backdropFilter: "blur(20px)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <div className="flex items-center gap-2 mb-3">
                <Car className="w-4 h-4" style={{ color: "#8A6E00" }} />
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "#8A6E00" }}>Parking</p>
              </div>
              <p className="text-sm" style={{ color: "rgba(0,0,0,0.55)" }}>Free parking at the Redmond Senior &amp; Community Center lot. Street parking nearby.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 5 — WISH WALL
      ══════════════════════════════════════════ */}
      {wishes.length > 0 && (
        <section className="py-24 px-6" style={{ background: "linear-gradient(135deg, #f4f7ff 0%, #f8f6ff 100%)" }}>
          <div ref={wishReveal.ref} className="w-full max-w-4xl mx-auto transition-all duration-1000"
            style={{ opacity: wishReveal.visible ? 1 : 0, transform: wishReveal.visible ? "translateY(0)" : "translateY(60px)" }}>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-center mb-4" style={{ color: "#8A6E00" }}>Guest Wishes</p>
            <h2 className="font-display text-center font-bold mb-16 flex items-center justify-center gap-3"
              style={{ fontSize: "clamp(2rem,6vw,4rem)", color: "#0d1525" }}>
              Words of Love <Heart className="w-8 h-8 inline-block" style={{ color: "#FFCB05" }} />
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {wishes.map((w, i) => (
                <div key={i} className="p-6 rounded-2xl flex flex-col"
                  style={{ background: "rgba(255,255,255,0.85)", border: `1px solid ${i % 2 === 0 ? "rgba(139,112,64,0.18)" : "rgba(255,203,5,0.2)"}`, backdropFilter: "blur(20px)", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
                  <p className="text-sm leading-relaxed flex-1 mb-4" style={{ color: "rgba(0,0,0,0.65)" }}>&ldquo;{w.message}&rdquo;</p>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: i % 2 === 0 ? "#6B5020" : "#8A6E00" }}>— {w.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          SECTION 6 — SHARE (admin only)
      ══════════════════════════════════════════ */}
      {isAdmin && <section className="py-24 px-6" style={{ background: "linear-gradient(180deg, #f8f6ff 0%, #f2f5ff 100%)" }}>
        <div ref={shareReveal.ref} className="w-full max-w-3xl mx-auto transition-all duration-1000"
          style={{ opacity: shareReveal.visible ? 1 : 0, transform: shareReveal.visible ? "translateY(0)" : "translateY(60px)" }}>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-center mb-4" style={{ color: "#8A6E00" }}>Spread the Word</p>
          <h2 className="font-display text-center font-bold mb-16"
            style={{ fontSize: "clamp(2rem,6vw,4rem)", background: "linear-gradient(135deg, #0d1525 0%, #FFCB05 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            Share the Invite
          </h2>

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
                style={{ background: "rgba(0,0,0,0.05)", color: copied ? "#8A6E00" : "rgba(0,0,0,0.6)", border: "1px solid rgba(0,0,0,0.1)" }}>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
                {copied ? "Copied!" : "Copy Link"}
              </button>
            </div>

          </div>
        </div>
      </section>}

      {/* ══════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════ */}
      <footer className="py-10 px-6" style={{ borderTop: "1px solid rgba(0,0,0,0.08)", background: "#eef2ff" }}>
        <div className="max-w-4xl mx-auto flex flex-col items-center gap-6">
          {/* School badges */}
          <div className="flex items-center gap-3 text-xs font-medium">
            <span style={{ color: "#6B5020" }}>Purdue Boilermakers</span>
            <span style={{ color: "rgba(0,0,0,0.2)" }}>×</span>
            <span style={{ color: "#8A6E00" }}>Michigan Wolverines</span>
          </div>

          {/* Links row */}
          <div className="flex items-center gap-5 text-xs flex-wrap justify-center" style={{ color: "rgba(0,0,0,0.45)" }}>
            <Link href="/contact" className="hover:text-[#8A6E00] transition-all">Contact Us</Link>
            <span style={{ color: "rgba(0,0,0,0.15)" }}>·</span>
            <Link href="/privacy" className="hover:text-[#8A6E00] transition-all">Privacy Policy</Link>
            <span style={{ color: "rgba(0,0,0,0.15)" }}>·</span>
            {rsvps !== null && rsvps > 0 && (
              <>
                <span>{rsvps} guests attending</span>
                <span style={{ color: "rgba(0,0,0,0.15)" }}>·</span>
              </>
            )}
            <Link href="/admin" className="hover:text-[#8A6E00] transition-all">Admin</Link>
          </div>

          {/* Trademark / copyright */}
          <p className="text-[11px] text-center" style={{ color: "rgba(0,0,0,0.3)" }}>
            © 2026 Iris &amp; Inesh Dey Graduation Celebration™ · All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
