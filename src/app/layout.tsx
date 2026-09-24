import type { Metadata } from "next";
import localFont from "next/font/local";
import { Hydrated } from "@/components/motion/Hydrated";
import { site } from "@/config/site";
import "./globals.css";

/**
 * Fonts — self-hosted so the production build never calls Google Fonts (which
 * gets rate-limited in CI/Docker). Bricolage Grotesque for all text, Caveat for
 * hand-written value tags, JetBrains Mono for codes. All variable woff2 files
 * live in ./fonts and are exposed as CSS variables consumed by globals.css.
 */
const display = localFont({
  src: "./fonts/bricolage-var.woff2",
  variable: "--font-display",
  display: "swap",
  weight: "200 800",
});

const hand = localFont({
  src: "./fonts/caveat-var.woff2",
  variable: "--font-hand",
  display: "swap",
  weight: "400 700",
});

const mono = localFont({
  src: "./fonts/jetbrains-var.woff2",
  variable: "--font-mono",
  display: "swap",
  weight: "100 800",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description:
    "Software Hub is a marketplace for premium software, subscriptions and game top-ups — activated instantly with a code, protected by escrow. Prices in INR.",
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
