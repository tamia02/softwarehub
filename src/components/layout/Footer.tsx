import Link from "next/link";
import { LogoLockup } from "@/components/brand/Logo";
import { nav, site } from "@/config/site";

const legal = [
  { label: "Terms", href: "/terms" },
  { label: "Refund policy", href: "/refund-policy" },
  { label: "Privacy", href: "/privacy" },
];

export function Footer() {
  return (
    <footer className="border-t border-line bg-bg-soft/70">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <LogoLockup stacked />
          <p className="mt-4 max-w-sm text-sm text-ink-muted">
            One activation code, 35 premium tools, a whole year. Buy the bundle outright or split it ten ways in a pool.
          </p>
          <p className="mt-4 text-sm">
            <a className="font-semibold text-ink hover:text-primary" href={`mailto:${site.supportEmail}`}>
              {site.supportEmail}
            </a>
          </p>
        </div>
        <div>
          <h4 className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">Explore</h4>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-ink-muted hover:text-ink">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/?switch=1&role=reseller" className="text-ink-muted hover:text-ink">
                Reseller program
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-ink-faint">Legal</h4>
          <ul className="mt-4 space-y-2.5 text-[15px]">
            {legal.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="text-ink-muted hover:text-ink">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <a href="/api/gate/switch" className="text-ink-muted hover:text-ink">
                Switch role
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-5 text-xs text-ink-faint sm:flex-row sm:items-center">
          <span>
            © {new Date().getFullYear()} {site.name}. All rights reserved.
          </span>
          <span>Prices in INR. Tool names belong to their respective owners.</span>
        </div>
      </div>
    </footer>
  );
}
