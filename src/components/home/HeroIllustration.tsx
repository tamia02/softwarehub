"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { VendorTile } from "@/components/brand/VendorMark";
import { tools } from "@/data/tools";

/**
 * Brand illustration: two passes hanging from a lanyard. The front pass is
 * the brand card, the back one is a grid of tool tiles. Straps are SVG, the
 * cards are HTML so they stay crisp and themeable; both swing gently (CSS)
 * and parallax ±10 px with the pointer.
 */
export function HeroIllustration({ interactive = true, compact = false }: { interactive?: boolean; compact?: boolean }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });
  const backX = useTransform(sx, (v) => v * -8);
  const backY = useTransform(sy, (v) => v * -6);
  const frontX = useTransform(sx, (v) => v * 10);
  const frontY = useTransform(sy, (v) => v * 8);

  useEffect(() => {
    if (!interactive || reduce) return;
    const onMove = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 2);
      my.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [interactive, reduce, mx, my]);

  const grid = tools.filter((t) => ["cursor", "notion", "framer", "linear", "posthog", "supabase", "lovable", "elevenlabs", "replit"].includes(t.slug)).slice(0, 9);

  return (
    <div className={`relative mx-auto w-full select-none ${compact ? "max-w-[380px]" : "max-w-[400px] md:max-w-[540px]"} aspect-[1/1] md:aspect-[5/4]`} aria-hidden>
      {/* soft amber halo */}
      <div className="absolute inset-x-[10%] top-[18%] h-[70%] rounded-full bg-[radial-gradient(closest-side,rgba(245,158,11,0.28),transparent)] blur-2xl" />

      {/* lanyard straps */}
      <svg viewBox="0 0 540 432" className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <linearGradient id="strap" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#b45309" />
            <stop offset="1" stopColor="#7c2d12" />
          </linearGradient>
        </defs>
        {/* back strap */}
        <path d="M292 -40 C 330 40, 372 60, 388 118" stroke="url(#strap)" strokeWidth="22" strokeLinecap="round" fill="none" />
        <path d="M292 -40 C 330 40, 372 60, 388 118" stroke="#fcd34d" strokeWidth="2" strokeDasharray="6 8" strokeLinecap="round" fill="none" opacity="0.7" />
        {/* front strap */}
        <path d="M248 -40 C 236 40, 200 70, 178 136" stroke="url(#strap)" strokeWidth="22" strokeLinecap="round" fill="none" />
        <path d="M248 -40 C 236 40, 200 70, 178 136" stroke="#fcd34d" strokeWidth="2" strokeDasharray="6 8" strokeLinecap="round" fill="none" opacity="0.7" />
        {/* clips */}
        <rect x="374" y="108" width="28" height="18" rx="6" fill="#d6a55d" stroke="#7c2d12" strokeWidth="2" />
        <rect x="164" y="126" width="28" height="18" rx="6" fill="#d6a55d" stroke="#7c2d12" strokeWidth="2" />
        {/* hand-drawn sparks */}
        <g stroke="var(--brand-accent)" strokeWidth="4" strokeLinecap="round" className="anim-wiggle" style={{ transformOrigin: "60px 90px" }}>
          <path d="M40 92 l16 -6" />
          <path d="M46 110 l14 -12" />
          <path d="M62 122 l6 -16" />
        </g>
        <g stroke="var(--brand-accent-2)" strokeWidth="4" strokeLinecap="round" className="anim-wiggle" style={{ transformOrigin: "490px 300px", animationDelay: "1.2s" }}>
          <path d="M478 292 l16 6" />
          <path d="M484 312 l14 10" />
          <path d="M470 318 l-2 16" />
        </g>
      </svg>

      {/* back pass: tool grid */}
      <motion.div style={{ x: backX, y: backY }} className="absolute left-[54%] top-[27%] w-[42%]">
        <div className="anim-swing-rev">
          <div className="relative rotate-[7deg] rounded-[22px] border-2 border-line-strong bg-white p-4 shadow-[0_24px_50px_rgba(146,64,14,0.18)]">
            <span className="absolute left-1/2 top-2 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-line-strong bg-bg" />
            <div className="mt-3 grid grid-cols-3 gap-2.5">
              {grid.map((t) => (
                <VendorTile key={t.slug} name={t.vendor} hue={t.hue} size={compact ? 34 : 46} />
              ))}
            </div>
            <p className="mt-3 text-center font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-faint">+26 more</p>
          </div>
        </div>
      </motion.div>

      {/* front pass: brand card */}
      <motion.div style={{ x: frontX, y: frontY }} className="absolute left-[8%] top-[31%] w-[44%]">
        <div className="anim-swing">
          <div className="relative -rotate-[8deg] rounded-[22px] border-2 border-line-strong bg-[linear-gradient(170deg,#fff7e0,#fde9c0)] p-5 text-center shadow-[0_28px_60px_rgba(146,64,14,0.22)]">
            <span className="absolute left-1/2 top-2 h-3.5 w-3.5 -translate-x-1/2 rounded-full border-2 border-line-strong bg-bg" />
            <div className="mt-3 flex justify-center">
              <Logo size={compact ? 38 : 48} />
            </div>
            <p className="mt-3 font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">Software Hub</p>
            <p className={`font-display font-bold uppercase leading-[0.95] text-primary ${compact ? "text-[26px]" : "text-[34px]"}`}>
              Pool
              <br />
              Pass
            </p>
            <div className="mx-auto mt-3 w-4/5 border-t-2 border-dashed border-line-strong" />
            <p className="mt-2 font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-faint">35 tools · 1 year</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
