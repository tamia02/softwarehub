"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

const KEY = "shp_promo_dismissed_v2";

/** Cream pill announcement, centred inside the page width (dismissible). */
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
    <div className="container-page anim-promo-in pt-3">
      <div className="relative mx-auto flex max-w-2xl items-center justify-center gap-2 rounded-full border border-line-strong bg-white px-10 py-2 text-center text-[13px] text-ink sm:text-sm">
        <span className="truncate"><span className="hidden sm:inline">Launch allocation open: </span>Pool seats from ₹2,500</span>
        <Link href="/home#pool" className="inline-flex shrink-0 items-center gap-1 font-semibold text-primary hover:underline">
          <span className="hidden sm:inline">See open pools</span> <ArrowRight size={14} />
        </Link>
        <button
          aria-label="Dismiss announcement"
          className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-ink-muted hover:bg-white/70 hover:text-ink"
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
    </div>
  );
}
