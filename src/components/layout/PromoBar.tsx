"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, ShieldCheck, X } from "lucide-react";

const KEY = "shp_promo_dismissed_v4";

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
    <div className="anim-promo-in relative z-50 flex min-h-[36px] items-center justify-center bg-accent px-12 text-center text-on-accent">
      <Link href="/market#how" className="group inline-flex items-center gap-1.5 text-[13px] font-medium leading-tight">
        <ShieldCheck size={14} className="shrink-0" />
        <span className="hidden sm:inline">Instant delivery ·</span> Every order escrow-protected until you confirm it works
        <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
      </Link>
      <button
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-[6px] text-white/80 hover:bg-white/15 hover:text-white"
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
