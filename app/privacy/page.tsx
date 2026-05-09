import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-6 py-16 pb-24 relative" style={{ background: "#06090f" }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-15" style={{ background: "#00274C", transform: "translate(30%,-30%)" }} />
      </div>
      <div className="relative z-10 max-w-2xl mx-auto">
        <Link href="/" className="text-xs mb-8 inline-block transition-all" style={{ color: "rgba(255,255,255,0.35)" }}>
          ← Back to invite
        </Link>

        <h1 className="text-3xl font-bold mb-2" style={{ letterSpacing: "-0.03em", color: "#ffffff" }}>Privacy Policy</h1>
        <p className="text-sm mb-10" style={{ color: "rgba(255,255,255,0.4)" }}>Last updated: June 2026</p>

        <div className="space-y-8 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
          <section>
            <h2 className="text-base font-semibold mb-2" style={{ color: "#ffffff" }}>1. Information We Collect</h2>
            <p>When you RSVP, we collect your name, email address, phone number, and dietary preferences solely to plan the event. When you upload photos or videos to the gallery, we store the file and any caption you provide. When you use the party chat, we store your name and messages.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2" style={{ color: "#ffffff" }}>2. How We Use Your Information</h2>
            <p>Your information is used only to coordinate the graduation celebration — to confirm attendance, plan catering, share memories, and send event reminders if you opted in. We do not sell, rent, or share your personal data with any third parties.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2" style={{ color: "#ffffff" }}>3. Photos & Videos</h2>
            <p>Photos and videos you upload are stored securely and visible to all guests with access to this site. By uploading content, you confirm you have the right to share it. You may delete your own uploads at any time from the Gallery page.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2" style={{ color: "#ffffff" }}>4. Google Sign-In</h2>
            <p>We use Google Sign-In for authentication. We only access your name and email address from your Google account. We do not access any other Google data. Your sign-in is managed securely by Google.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2" style={{ color: "#ffffff" }}>5. Data Storage</h2>
            <p>Event data (RSVPs, messages, wishlists) is stored in Google Sheets accessible only to the event hosts. Media files are stored on Vercel Blob storage. Data is retained through the event and may be deleted thereafter.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2" style={{ color: "#ffffff" }}>6. Your Rights</h2>
            <p>You may request deletion of your personal information at any time by contacting us at the details below. RSVP data can also be updated by signing in and submitting the RSVP form again.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold mb-2" style={{ color: "#ffffff" }}>7. Contact</h2>
            <p>For any privacy concerns, please reach out to us:</p>
            <div className="mt-2 p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <p className="font-medium" style={{ color: "#ffffff" }}>Subhas &amp; Sanchita Dey</p>
              <a href="tel:4252896422" className="hover:underline" style={{ color: "#FFCB05" }}>(425) 289-6422</a>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
