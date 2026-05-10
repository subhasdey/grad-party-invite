import Link from "next/link";

export default function ContactPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6 pb-24 relative" style={{ background: "#f4f7ff" }}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: "#c8d8ff", transform: "translate(-40%,-40%)" }} />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl opacity-15" style={{ background: "#FFCB05", transform: "translate(40%,40%)" }} />
      </div>
      <div className="relative z-10 max-w-md w-full">
        <Link href="/" className="text-xs mb-8 inline-block transition-all" style={{ color: "rgba(0,0,0,0.35)" }}>
          ← Back to invite
        </Link>

        <h1 className="text-3xl font-bold mb-1" style={{ letterSpacing: "-0.03em", color: "#0d1525" }}>Contact Us</h1>
        <p className="text-sm mb-10" style={{ color: "rgba(0,0,0,0.45)" }}>We&apos;d love to hear from you</p>

        <div className="space-y-4">
          {/* Hosts */}
          <div className="p-6 rounded-3xl" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: "rgba(0,0,0,0.35)" }}>Your Hosts</p>
            <p className="text-xl font-bold mb-1" style={{ color: "#0d1525" }}>Subhas &amp; Sanchita Dey</p>
            <p className="text-sm mb-5" style={{ color: "rgba(0,0,0,0.45)" }}>Parents of Iris &amp; Inesh</p>

            <div className="space-y-3">
              <a href="tel:4252896422"
                className="flex items-center gap-3 w-full px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{ background: "#00274C", color: "#FFCB05" }}>
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                </svg>
                (425) 289-6422
              </a>

              <a href="https://wa.me/14252896422"
                target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 w-full px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{ background: "#25D366", color: "#fff" }}>
                <svg className="w-4 h-4 flex-shrink-0 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Message on WhatsApp
              </a>
            </div>
          </div>

          {/* Event details */}
          <div className="p-6 rounded-3xl" style={{ background: "rgba(255,255,255,0.85)", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: "rgba(0,0,0,0.35)" }}>Event Details</p>
            <div className="space-y-1.5 text-sm" style={{ color: "rgba(0,0,0,0.55)" }}>
              <p><span className="font-semibold" style={{ color: "#0d1525" }}>Date:</span> Friday, June 26, 2026</p>
              <p><span className="font-semibold" style={{ color: "#0d1525" }}>Time:</span> 6:00 PM</p>
              <p><span className="font-semibold" style={{ color: "#0d1525" }}>Venue:</span> Redmond Senior &amp; Community Center</p>
              <p><span className="font-semibold" style={{ color: "#0d1525" }}>City:</span> Redmond, WA</p>
            </div>
          </div>

          <Link href="/rsvp"
            className="flex items-center justify-center w-full py-4 rounded-2xl text-sm font-bold transition-all hover:scale-[1.01]"
            style={{ background: "linear-gradient(135deg,#FFCB05,#f5c400)", color: "#0d1525" }}>
            RSVP Now
          </Link>
        </div>
      </div>
    </main>
  );
}
