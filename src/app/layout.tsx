import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Plus_Jakarta_Sans } from "next/font/google";
import { Hydrated } from "@/components/motion/Hydrated";
import { site } from "@/config/site";
import "./globals.css";

/**
 * Fonts — Plus Jakarta Sans (display, buttons) + Inter (body) + JetBrains Mono (codes only).
 * Both are exposed as CSS variables consumed by globals.css.
 */
const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
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
    <html lang="en-IN" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body className="paper flex min-h-dvh flex-col">
        <Hydrated />
        {children}
      </body>
    </html>
  );
}
