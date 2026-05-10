"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { label: "Home",    href: "/",        icon: (active: boolean) => (
    <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )},
  { label: "RSVP",    href: "/rsvp",    icon: (active: boolean) => (
    <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )},
  { label: "Gallery", href: "/gallery", icon: (active: boolean) => (
    <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  )},
  { label: "Chat",    href: "/chat",    icon: (active: boolean) => (
    <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )},
  { label: "Gifts",   href: "/wishlist", icon: (active: boolean) => (
    <svg className="w-5 h-5" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12v10H4V12M22 7H2v5h20V7zM12 22V7M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z" />
    </svg>
  )},
];

export default function BottomNav() {
  const path = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 flex items-center"
      style={{
        background: "rgba(255,255,255,0.92)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderTop: "1px solid rgba(0,0,0,0.08)",
        paddingBottom: "env(safe-area-inset-bottom)",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.06)",
      }}>
      {TABS.map(({ label, href, icon }) => {
        const active = path === href;
        return (
          <Link key={href} href={href}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 active:opacity-60 transition-opacity"
            style={{ color: active ? "#00274C" : "rgba(0,0,0,0.35)", minHeight: 56 }}>
            <div className="relative">
              {icon(active)}
              {active && (
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                  style={{ background: "#FFCB05" }} />
              )}
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider mt-0.5"
              style={{ color: active ? "#00274C" : "rgba(0,0,0,0.35)" }}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
