import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Iris & Inesh Dey Graduation Party – June 26, 2026";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#0b0e17", alignItems: "center", justifyContent: "center", flexDirection: "column", fontFamily: "Georgia, serif" }}>
        {/* Background split */}
        <div style={{ position: "absolute", left: 0, top: 0, width: "50%", height: "100%", background: "linear-gradient(135deg, #1a1200 0%, #0b0e17 100%)", display: "flex" }} />
        <div style={{ position: "absolute", right: 0, top: 0, width: "50%", height: "100%", background: "linear-gradient(225deg, #00111f 0%, #0b0e17 100%)", display: "flex" }} />

        {/* Top color bars */}
        <div style={{ position: "absolute", top: 0, left: 0, width: "50%", height: "6px", background: "#CFB991", display: "flex" }} />
        <div style={{ position: "absolute", top: 0, right: 0, width: "50%", height: "6px", background: "#FFCB05", display: "flex" }} />

        {/* Content */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", zIndex: 1, padding: "0 60px", textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 20, letterSpacing: "0.3em", textTransform: "uppercase", marginBottom: 24 }}>You&apos;re Invited · A Twin Celebration</p>
          <h1 style={{ color: "#ffffff", fontSize: 88, fontWeight: "bold", margin: "0 0 8px", lineHeight: 1 }}>Graduation</h1>
          <h1 style={{ color: "rgba(255,255,255,0.3)", fontSize: 88, fontWeight: "bold", margin: "0 0 40px", lineHeight: 1 }}>Party</h1>

          <div style={{ display: "flex", gap: 48, marginBottom: 40 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <p style={{ color: "#CFB991", fontSize: 32, fontWeight: "bold", margin: "0 0 4px" }}>Iris Dey</p>
              <p style={{ color: "rgba(207,185,145,0.7)", fontSize: 18, margin: 0 }}>Purdue University · Boiler Up!</p>
            </div>
            <div style={{ color: "rgba(255,255,255,0.2)", fontSize: 40, display: "flex", alignItems: "center" }}>×</div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <p style={{ color: "#FFCB05", fontSize: 32, fontWeight: "bold", margin: "0 0 4px" }}>Inesh Dey</p>
              <p style={{ color: "rgba(255,203,5,0.7)", fontSize: 18, margin: 0 }}>Univ. of Michigan · Go Blue!</p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 32, color: "rgba(255,255,255,0.6)", fontSize: 20 }}>
            <span>📅 June 26, 2026</span>
            <span>🕕 6:00 PM</span>
            <span>📍 Redmond, WA</span>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
