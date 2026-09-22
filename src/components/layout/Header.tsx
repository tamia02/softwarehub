"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { nav } from "@/config/site";
import { LogoLockup } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/** Sticky header. Nav links 20px medium (24px on wide screens), CTA pill 18px bold — measured from the reference. */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
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
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const role = me.role;
  const resellerHref = role === "reseller" ? "/reseller" : role === "admin" ? "/admin" : "/?switch=1&role=reseller";
  const resellerLabel = role === "reseller" ? "Dashboard" : role === "admin" ? "Admin" : "Resellers";
  const links = [...nav, { label: resellerLabel, href: resellerHref }, me.signedIn ? { label: "My Pass", href: "/account" } : { label: "Sign in", href: "/login" }];

  return (
    <header className={cn("sticky top-0 z-40 transition-[background-color,box-shadow] duration-300", scrolled ? "bg-[rgba(255,251,235,0.9)] shadow-[0_2px_0_rgba(28,25,23,0.06)] backdrop-blur-[12px]" : "bg-transparent")}>
      <div className="container-page flex h-[68px] items-center justify-between gap-6 md:h-[76px]">
        <Link href="/home" aria-label="Software Hub Pool home" className="shrink-0">
          <LogoLockup />
        </Link>

        <nav className="hidden items-center gap-6 lg:flex xl:gap-7" aria-label="Primary">
          {links.map((n) => (
            <Link key={n.href} href={n.href} className="text-[16px] font-medium leading-none text-ink transition-colors duration-150 hover:text-accent-2">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:block">
          <Button href="/checkout/direct?tier=pro" size="sm">
            Get the Pro Pass
          </Button>
        </div>

        <button className="grid h-11 w-11 place-items-center rounded-full border-2 border-ink-line bg-bg-card lg:hidden" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)}>
          <Menu />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-50 flex flex-col bg-bg lg:hidden" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 32 }} role="dialog" aria-modal="true">
            <div className="container-page flex h-[76px] items-center justify-between">
              <LogoLockup />
              <button className="grid h-11 w-11 place-items-center rounded-full border-2 border-ink-line bg-bg-card" aria-label="Close menu" onClick={() => setOpen(false)}>
                <X />
              </button>
            </div>
            <nav className="container-page flex flex-1 flex-col gap-1 pt-4" aria-label="Mobile">
              {links.map((n, i) => (
                <motion.div key={n.href} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.06 + i * 0.05 }}>
                  <Link href={n.href} onClick={() => setOpen(false)} className="block border-b-2 border-line px-1 py-4 text-[26px] font-bold text-ink">
                    {n.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-auto pb-10">
                <Button href="/checkout/direct?tier=pro" size="lg" className="w-full">
                  Get the Pro Pass
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
