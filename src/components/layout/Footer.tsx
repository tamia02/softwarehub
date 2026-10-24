import Link from "next/link";
import { BadgeCheck, Headphones, ShieldCheck, Zap } from "lucide-react";
import { LogoLockup } from "@/components/brand/Logo";
import { nav, site } from "@/config/site";

const categories = ["AI Tools", "Subscriptions", "Game Top-Up", "Game Accounts", "Gift Cards", "Software"];

const legal = [
  { label: "Terms of service", href: "/terms" },
  { label: "Refund policy", href: "/refund-policy" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Contact us", href: "/contact" },
];

const promises = [
  { icon: ShieldCheck, title: "Escrow protection", body: "Paid out only after you confirm" },
  { icon: Zap, title: "Instant delivery", body: "Codes in seconds, 24/7" },
  { icon: BadgeCheck, title: "Verified sellers", body: "Every seller is ID-checked" },
  { icon: Headphones, title: "Real support", body: "WhatsApp & email, every day" },
];

export function Footer() {
  return (
    <footer className="mt-12 bg-primary text-on-primary">
      <div className="border-b border-white/[0.07]">
        <ul className="container-page grid grid-cols-2 gap-x-6 gap-y-5 py-7 md:grid-cols-4">
          {promises.map((p) => (
            <li key={p.title} className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-white/[0.06] text-accent">
                <p.icon size={19} />
              </span>
              <span className="min-w-0">
                <span className="block text-[14px] font-semibold text-white">{p.title}</span>
                <span className="block text-[12.5px] text-white/50">{p.body}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="container-page grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <LogoLockup tone="light" />
          <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-white/55">{site.tagline} Prices in INR, payments via UPI, cards and net-banking.</p>
          <a className="mt-4 inline-block text-[14px] font-medium text-white/85 hover:text-white" href={`mailto:${site.supportEmail}`}>
            {site.supportEmail}
          </a>
        </div>
        <FooterCol title="Categories" links={categories.map((c) => ({ label: c, href: `/market?cat=${encodeURIComponent(c)}#products` }))} />
        <FooterCol title="Explore" links={[...nav, { label: "Become a seller", href: "/?switch=1&role=reseller" }, { label: "My account", href: "/account" }]} />
        <FooterCol title="Help & legal" links={legal} />
      </div>

      <div className="border-t border-white/[0.07]">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-5 text-[12.5px] text-white/40 sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} {site.name}. All rights reserved.</span>
          <span className="flex items-center gap-4">
            <span>Tool names and logos belong to their respective owners.</span>
            <a href="/api/gate/switch" className="hover:text-white/70">Switch role</a>
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h4 className="text-[12px] font-semibold uppercase tracking-[0.1em] text-white/40">{title}</h4>
      <ul className="mt-4 space-y-2.5 text-[14px]">
        {links.map((n) => (
          <li key={n.href}>
            <Link href={n.href} className="text-white/75 transition-colors hover:text-white">
              {n.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
