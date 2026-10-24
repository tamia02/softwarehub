"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, Store, UserRound, X } from "lucide-react";
import { nav } from "@/config/site";
import { LogoLockup } from "@/components/brand/Logo";
import { DemoQuickLogin } from "@/components/auth/DemoQuickLogin";
import { cn } from "@/lib/utils";

/** Marketplace categories shown in the header strip (match `products.category`). */
const CATEGORIES = ["AI Tools", "Subscriptions", "Game Top-Up", "Game Accounts", "Gift Cards", "Software"];

/**
 * Two-tier marketplace header: a navy bar with logo, product search and
 * account actions, and a slimmer strip below with categories + sections.
 */
export function Header() {
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<{ signedIn: boolean; role: string | null }>({ signedIn: false, role: null });

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && d && setMe({ signedIn: !!d.signedIn, role: d.role ?? null }))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const role = me.role;
  const sellHref = role === "reseller" ? "/reseller" : role === "admin" ? "/admin" : "/?switch=1&role=reseller";
  const sellLabel = role === "reseller" ? "Seller dashboard" : role === "admin" ? "Admin" : "Sell with us";
  const accountHref = me.signedIn ? "/account" : "/login";
  const accountLabel = me.signedIn ? "My account" : "Sign in";

  return (
    <header className="sticky top-0 z-40 bg-primary text-on-primary shadow-[0_1px_0_rgba(255,255,255,0.06)]">
      <div className="container-page flex h-[60px] items-center gap-4 md:h-[64px] md:gap-6">
        <Link href="/market" aria-label="Online Sallutions home" className="shrink-0">
          <LogoLockup tone="light" />
        </Link>

        <Suspense fallback={<div className="hidden h-10 flex-1 md:block" />}>
          <HeaderSearch className="hidden max-w-[640px] flex-1 md:flex" />
        </Suspense>

        <div className="ml-auto hidden items-center gap-1 lg:flex">
          <DemoQuickLogin />
          <Link href={sellHref} className="inline-flex h-10 items-center gap-2 rounded-[8px] px-3 text-[14px] font-medium text-white/80 transition-colors hover:bg-white/[0.07] hover:text-white">
            <Store size={17} /> {sellLabel}
          </Link>
          <Link
            href={accountHref}
            className={cn(
              "inline-flex h-10 items-center gap-2 rounded-[8px] px-4 text-[14px] font-semibold transition-colors",
              me.signedIn ? "text-white hover:bg-white/[0.07]" : "bg-accent text-on-accent hover:bg-accent-2",
            )}
          >
            <UserRound size={17} /> {accountLabel}
          </Link>
        </div>

        <button className="ml-auto grid h-10 w-10 place-items-center rounded-[8px] text-white hover:bg-white/[0.08] lg:hidden" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
          <Menu size={22} />
        </button>
      </div>

      {/* Mobile search */}
      <div className="container-page pb-3 md:hidden">
        <Suspense fallback={<div className="h-10" />}>
          <HeaderSearch className="flex" />
        </Suspense>
      </div>

      {/* Category + section strip */}
      <div className="border-t border-white/[0.07] bg-[#0b101b]">
        <nav className="container-page flex h-11 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Categories">
          <Suspense fallback={null}>
            <CategoryLinks />
          </Suspense>
          <span className="mx-2 h-4 w-px shrink-0 bg-white/15" aria-hidden />
          {nav
            .filter((n) => n.href !== "/market")
            .map((n) => (
              <Link key={n.href} href={n.href} className="shrink-0 rounded-[6px] px-3 py-1.5 text-[13px] font-medium text-white/65 transition-colors hover:bg-white/[0.06] hover:text-white">
                {n.label}
              </Link>
            ))}
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 flex flex-col bg-primary text-on-primary lg:hidden" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 320, damping: 34 }} role="dialog" aria-modal="true">
            <div className="container-page flex h-[60px] items-center justify-between">
              <LogoLockup tone="light" />
              <button className="grid h-10 w-10 place-items-center rounded-[8px] hover:bg-white/[0.08]" aria-label="Close menu" onClick={() => setOpen(false)}>
                <X size={22} />
              </button>
            </div>
            <nav className="container-page flex flex-1 flex-col overflow-y-auto pt-2" aria-label="Mobile">
              <p className="px-1 pb-2 pt-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-white/40">Browse</p>
              {[{ label: "All products", href: "/market#products" }, ...CATEGORIES.map((c) => ({ label: c, href: `/market?cat=${encodeURIComponent(c)}#products` })), ...nav.filter((n) => n.href !== "/market")].map((n) => (
                <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="border-b border-white/[0.07] px-1 py-3.5 text-[16px] font-medium text-white/90">
                  {n.label}
                </Link>
              ))}
              <div className="mt-auto flex flex-col gap-2 pb-8 pt-6">
                <Link href={accountHref} onClick={() => setOpen(false)} className="grid h-12 place-items-center rounded-[8px] bg-accent text-[15px] font-semibold text-on-accent">
                  {accountLabel}
                </Link>
                <Link href={sellHref} onClick={() => setOpen(false)} className="grid h-12 place-items-center rounded-[8px] border border-white/15 text-[15px] font-medium text-white/85">
                  {sellLabel}
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/** Search box that sends the query to the marketplace (`/market?q=`). */
function HeaderSearch({ className }: { className?: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const [q, setQ] = useState(params.get("q") ?? "");

  return (
    <form
      role="search"
      className={cn("relative h-10 items-center", className)}
      onSubmit={(e) => {
        e.preventDefault();
        const term = q.trim();
        router.push(term ? `/market?q=${encodeURIComponent(term)}#products` : "/market#products");
      }}
    >
      <Search size={17} className="pointer-events-none absolute left-3.5 text-ink-faint" aria-hidden />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search Netflix, Valorant points, ChatGPT…"
        aria-label="Search products"
        className="h-full w-full rounded-[8px] border border-transparent bg-white pl-10 pr-24 text-[14px] text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/20"
      />
      <button type="submit" className="absolute right-1 h-8 rounded-[6px] bg-accent px-4 text-[13px] font-semibold text-on-accent hover:bg-accent-2">
        Search
      </button>
    </form>
  );
}

function CategoryLinks() {
  const pathname = usePathname();
  const params = useSearchParams();
  const active = pathname === "/market" ? params.get("cat") ?? (params.get("q") ? null : "All") : null;
  const items = [{ label: "All products", value: "All", href: "/market#products" }, ...CATEGORIES.map((c) => ({ label: c, value: c, href: `/market?cat=${encodeURIComponent(c)}#products` }))];
  return (
    <>
      {items.map((c) => (
        <Link
          key={c.value}
          href={c.href}
          className={cn(
            "shrink-0 rounded-[6px] px-3 py-1.5 text-[13px] font-medium transition-colors",
            active === c.value ? "bg-white/[0.1] text-white" : "text-white/65 hover:bg-white/[0.06] hover:text-white",
          )}
        >
          {c.label}
        </Link>
      ))}
    </>
  );
}
