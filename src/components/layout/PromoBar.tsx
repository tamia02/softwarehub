"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

const KEY = "shp_promo_dismissed_v3";

/** Full-width announcement strip: 44px, 2px bottom rule, 15px bold (measured from the reference). */
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
    <div className="anim-promo-in relative z-50 flex min-h-[44px] items-center justify-center border-b-2 border-ink-line bg-accent-soft px-12 text-center">
      <Link href="/home#pool" className="group inline-flex items-center gap-1.5 text-[15px] font-bold leading-[1.05] text-ink-line hover:text-accent-2">
        <span className="hidden sm:inline">Launch allocation open —</span> pool seats from ₹2,500
        <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
      </Link>
      <button
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-ink-muted hover:bg-white/60 hover:text-ink"
        onClick={() => {
          setOpen(false);
          try {
            localStorage.setItem(KEY, "1");
          } catch {}
        }}
      >
        <X size={15} />
      </button>
    </div>
  );
}
