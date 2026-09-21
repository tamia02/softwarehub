"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { nav } from "@/config/site";
import { LogoLockup } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [me, setMe] = useState<{ signedIn: boolean; role: string | null }>({ signedIn: false, role: null });
  const role = me.role;
  const signedIn = me.signedIn;

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
    const onScroll = () => setScrolled(window.scrollY > 24);
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

  const resellerHref = role === "reseller" ? "/reseller" : role === "admin" ? "/admin" : "/?switch=1&role=reseller";
  const resellerLabel = role === "reseller" ? "Dashboard" : role === "admin" ? "Admin" : "Reseller login";
  const links = [...nav, { label: resellerLabel, href: resellerHref }, ...(signedIn ? [{ label: "My Pass", href: "/account" }] : [{ label: "Sign in", href: "/login" }])];

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-[background-color,box-shadow,border-color] duration-300",
        scrolled
          ? "border-b border-line bg-[rgba(255,251,235,0.78)] shadow-[0_1px_0_rgba(146,64,14,0.05)] backdrop-blur-[12px]"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="container-page flex h-[68px] items-center justify-between gap-6">
        <Link href="/home" aria-label="Software Hub Pool home" className="shrink-0">
          <LogoLockup stacked />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="rounded-full px-4 py-2 font-display text-[15px] font-medium text-ink-muted transition-colors hover:bg-bg-soft hover:text-ink"
            >
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:block">
          <Button href="/checkout/direct?tier=pro" size="md">
            Get Pro Pass
          </Button>
        </div>

        <button
          className="grid h-11 w-11 place-items-center rounded-full hover:bg-bg-soft md:hidden"
          aria-label="Open menu"
          aria-expanded={open}
          onClick={() => setOpen(true)}
        >
          <Menu />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex flex-col bg-bg md:hidden"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 32 }}
            role="dialog"
            aria-modal="true"
          >
            <div className="container-page flex h-[68px] items-center justify-between">
              <LogoLockup />
              <button
                className="grid h-11 w-11 place-items-center rounded-full hover:bg-bg-soft"
                aria-label="Close menu"
                onClick={() => setOpen(false)}
              >
                <X />
              </button>
            </div>
            <nav className="container-page flex flex-1 flex-col gap-1 pt-6" aria-label="Mobile">
              {links.map((n, i) => (
                <motion.div
                  key={n.href}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.08 + i * 0.05 }}
                >
                  <Link
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-2xl px-4 py-4 font-display text-2xl font-semibold hover:bg-bg-soft"
                  >
                    {n.label}
                  </Link>
                </motion.div>
              ))}
              <div className="mt-auto pb-10">
                <Button href="/checkout/direct?tier=pro" size="lg" className="w-full">
                  Get Pro Pass
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
