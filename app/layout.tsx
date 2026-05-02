import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import BottomNav from "@/components/BottomNav";
import "./globals.css";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const inter    = Inter({ subsets: ["latin"], variable: "--font-inter" });

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
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-[#0b0e17] text-white antialiased min-h-screen pb-16 md:pb-0">
        {children}
        <BottomNav />
      </body>
    </html>
  );
}
