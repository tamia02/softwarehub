import { ImageResponse } from "next/og";
import { site } from "@/config/site";

export const runtime = "edge";
export const alt = site.tagline;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 72, background: "linear-gradient(135deg,#0057ff,#001a4d)", color: "white", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 32, fontWeight: 800 }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: "white", display: "flex" }} />
          {site.name}
        </div>
        <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1.05, letterSpacing: -2, maxWidth: 1000 }}>35 premium AI & product tools for a year.</div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 30, opacity: 0.9 }}>
          <span>Worth $40,000+ · from ₹2,500 in a pool</span>
          <span style={{ background: "#ffb800", color: "#0b0f19", padding: "8px 24px", borderRadius: 999, fontWeight: 800 }}>Codes are limited</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
