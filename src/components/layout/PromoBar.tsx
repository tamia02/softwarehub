"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";

const KEY = "shp_promo_dismissed_v1";

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
    <div className="anim-promo-in relative z-50 bg-ink text-white">
      <div className="container-page flex h-10 items-center justify-center gap-2 pr-10 text-[13px] font-medium sm:text-sm">
        <span className="truncate">Launch offer: pool seats from ₹2,500 — codes are limited.</span>
        <Link href="/home#pool" className="inline-flex shrink-0 items-center gap-1 font-bold text-accent hover:underline">
          Join a pool <ArrowRight size={14} />
        </Link>
        <button
          aria-label="Dismiss announcement"
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/70 hover:bg-white/10 hover:text-white"
          onClick={() => {
            setOpen(false);
            try {
              localStorage.setItem(KEY, "1");
            } catch {}
          }}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
