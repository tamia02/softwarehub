import type { Metadata } from "next";
import { Inter, Nunito } from "next/font/google";
import { Hydrated } from "@/components/motion/Hydrated";
import { site } from "@/config/site";
import "./globals.css";

/**
 * Fonts — swap `Nunito` for the brand display font once chosen.
 * Both are exposed as CSS variables consumed by globals.css.
 */
const display = Nunito({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
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
      <body className="flex min-h-dvh flex-col">
        <Hydrated />
        {children}
      </body>
    </html>
  );
}
