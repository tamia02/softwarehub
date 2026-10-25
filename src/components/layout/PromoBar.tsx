"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Send, X } from "lucide-react";

const KEY = "shp_promo_dismissed_v5";

/** Thin announcement strip above the header. Dismissal is remembered per browser. */
export function PromoBar() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);
  if (!open) return null;
  return (
    <div className="anim-promo-in relative z-50 flex min-h-[40px] items-center justify-center bg-accent px-12 md:min-h-[36px] text-center text-on-accent">
      <Link href="/login" className="group inline-flex items-center gap-1.5 text-[13px] font-medium leading-tight">
        <Send size={14} className="shrink-0" />
        <span className="sm:hidden">Log in with Telegram — wallet &amp; orders</span>
        <span className="hidden sm:inline">New · Log in with Telegram — your Lucifer wallet and orders, right here</span>
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
      </Link>
      <button
        aria-label="Dismiss announcement"
        className="absolute right-1.5 top-1/2 grid h-10 w-10 -translate-y-1/2 md:right-3 md:h-7 md:w-7 place-items-center rounded-[6px] text-white/80 hover:bg-white/15 hover:text-white"
        onClick={() => {
          setOpen(false);
          try {
            localStorage.setItem(KEY, "1");
          } catch {}
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
