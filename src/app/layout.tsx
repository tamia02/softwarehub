import type { Metadata } from "next";
import { Bricolage_Grotesque, Caveat, JetBrains_Mono } from "next/font/google";
import { Hydrated } from "@/components/motion/Hydrated";
import { site } from "@/config/site";
import "./globals.css";

/**
 * Fonts — Bricolage Grotesque for all text (closest open face to the reference's Degular),
 * Caveat for hand-written value tags, JetBrains Mono for codes only.
 * Both are exposed as CSS variables consumed by globals.css.
 */
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  axes: ["opsz", "wdth"],
  weight: "variable",
  variable: "--font-display",
  display: "swap",
});

const hand = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-hand",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description:
    "Software Hub Pool negotiates annual plans on 35 premium tools and issues them as a single activation code. Buy a pass outright, or share one through a pool. Prices in INR.",
  openGraph: {
    title: site.name,
    description: site.tagline,
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${hand.variable} ${mono.variable}`}>
      <body className="paper flex min-h-dvh flex-col">
        <Hydrated />
        {children}
      </body>
    </html>
  );
}
