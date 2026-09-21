import type { Metadata } from "next";
import { Fredoka, Inter } from "next/font/google";
import { Hydrated } from "@/components/motion/Hydrated";
import { site } from "@/config/site";
import "./globals.css";

/**
 * Fonts — Fredoka (rounded, friendly display) + Inter (body). Swap here.
 * Both are exposed as CSS variables consumed by globals.css.
 */
const display = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description:
    "One activation code unlocks 35 premium AI and product tools for a year. Buy the full bundle or split it 10 ways in a pool. Prices in INR.",
  openGraph: {
    title: site.name,
    description: site.tagline,
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${display.variable} ${body.variable}`}>
      <body className="paper flex min-h-dvh flex-col">
        <Hydrated />
        {children}
      </body>
    </html>
  );
}
