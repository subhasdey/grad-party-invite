import type { Metadata } from "next";
import { Inter } from "next/font/google";
import BottomNav from "@/components/BottomNav";
import AuthProvider from "@/components/AuthProvider";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const URL = process.env.NEXT_PUBLIC_APP_URL || "https://grad-party-invite-tan.vercel.app";

export const metadata: Metadata = {
  title: "Iris & Inesh Dey – Graduation Party · June 26, 2026",
  description: "Join us to celebrate Iris (Purdue) & Inesh (Michigan) graduating — June 26, 2026 at Redmond Senior & Community Center. Hosted by Subhas & Sanchita Dey.",
  openGraph: {
    title: "Iris & Inesh Dey – Graduation Party 🎓",
    description: "Celebrate with us! June 26, 2026 · 6PM · Redmond Senior & Community Center",
    url: URL,
    siteName: "Dey Graduation Party 2026",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Iris & Inesh Dey – Graduation Party 🎓",
    description: "June 26, 2026 · Redmond Senior & Community Center",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen pb-16 md:pb-0" style={{ background: "#080c14", color: "#fff", fontFamily: "-apple-system, BlinkMacSystemFont, var(--font-inter), 'Helvetica Neue', Arial, sans-serif" }}>
        <AuthProvider>
          {children}
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
