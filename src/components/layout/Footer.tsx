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
    <footer className="border-t-2 border-ink-line bg-accent-soft">
      <div className="container-page grid gap-10 py-12 md:grid-cols-[1.4fr_1fr_1fr] md:py-16">
        <div>
          <LogoLockup />
          <p className="mt-4 max-w-sm text-[16px] leading-[1.4] text-ink-muted">
            Annual plans on 35 premium tools, issued as one activation code. Buy a pass outright or share one through a pool.
          </p>
          <p className="mt-4">
            <a className="text-[16px] font-bold text-ink hover:text-accent-2" href={`mailto:${site.supportEmail}`}>
              {site.supportEmail}
            </a>
          </p>
        </div>
        <div>
          <h4 className="text-[13px] font-bold uppercase tracking-wider text-ink-faint">Explore</h4>
          <ul className="mt-4 space-y-2.5 text-[16px]">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="font-medium text-ink hover:text-accent-2">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/?switch=1&role=reseller" className="font-medium text-ink hover:text-accent-2">
                Reseller program
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="text-[13px] font-bold uppercase tracking-wider text-ink-faint">Legal</h4>
          <ul className="mt-4 space-y-2.5 text-[16px]">
            {legal.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="font-medium text-ink hover:text-accent-2">
                  {n.label}
                </Link>
              </li>
            ))}
            <li>
              <a href="/api/gate/switch" className="font-medium text-ink hover:text-accent-2">
                Switch role
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-ink-line/15">
        <div className="container-page flex flex-col items-start justify-between gap-2 py-5 text-[14px] text-ink-faint sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} {site.name}. All rights reserved.</span>
          <span>Prices in INR. Tool names and logos belong to their respective owners.</span>
        </div>
      </div>
    </footer>
  );
}
