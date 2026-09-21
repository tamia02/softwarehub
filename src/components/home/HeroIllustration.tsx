"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { ToolLogo } from "@/components/brand/ToolLogo";
import { tools } from "@/data/tools";

/**
 * Hero object: an annual pass hanging from a lanyard. One strap, a metal
 * eyelet, an ivory card with the brand, a 3×3 grid of real vendor logos and a
 * mono footer; a second, quieter card sits behind for depth. Gentle swing
 * (CSS) and ±8 px parallax (spring) — no cartoon elements.
 */
export function HeroIllustration({ interactive = true, compact = false }: { interactive?: boolean; compact?: boolean }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 20 });
  const sy = useSpring(my, { stiffness: 50, damping: 20 });
  const backX = useTransform(sx, (v) => v * -6);
  const backY = useTransform(sy, (v) => v * -4);
  const frontX = useTransform(sx, (v) => v * 8);
  const frontY = useTransform(sy, (v) => v * 6);

  useEffect(() => {
    if (!interactive || reduce) return;
    const onMove = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 2);
      my.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [interactive, reduce, mx, my]);

  const grid = ["cursor", "notion", "linear", "framer", "supabase", "posthog", "replit", "elevenlabs", "n8n"]
    .map((s) => tools.find((t) => t.slug === s))
    .filter((t): t is (typeof tools)[number] => !!t);
  const logo = compact ? 30 : 42;

  return (
    <div className={`relative mx-auto w-full select-none ${compact ? "max-w-[360px]" : "max-w-[440px] md:max-w-[520px]"} aspect-[4/5.3] md:aspect-[5/5.9]`} aria-hidden>
      {/* warm halo + ground shadow */}
      <div className="absolute inset-x-[12%] top-[26%] h-[62%] rounded-full bg-[radial-gradient(closest-side,rgba(232,163,23,0.22),transparent)] blur-2xl" />
      <div className="absolute inset-x-[22%] bottom-[2%] h-6 rounded-[100%] bg-[radial-gradient(closest-side,rgba(27,20,16,0.18),transparent)] blur-md" />

      {/* strap */}
      <svg viewBox="0 0 520 614" className="absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <linearGradient id="strap-v3" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#5a2606" />
            <stop offset="0.5" stopColor="#8a3b0a" />
            <stop offset="1" stopColor="#4a1f05" />
          </linearGradient>
          <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#f3e7cf" />
            <stop offset="0.5" stopColor="#c9b48e" />
            <stop offset="1" stopColor="#8f7754" />
          </linearGradient>
        </defs>
        <path d="M262 -60 C 262 30, 258 80, 260 118" stroke="url(#strap-v3)" strokeWidth="26" strokeLinecap="round" fill="none" />
        <path d="M252 -60 C 252 30, 249 80, 251 110" stroke="rgba(255,244,220,0.22)" strokeWidth="1.5" strokeDasharray="3 6" fill="none" />
        <path d="M272 -60 C 272 30, 268 80, 270 110" stroke="rgba(255,244,220,0.22)" strokeWidth="1.5" strokeDasharray="3 6" fill="none" />
        {/* clip + ring */}
        <rect x="244" y="112" width="34" height="22" rx="7" fill="url(#metal)" stroke="#5a4326" strokeWidth="1.2" />
        <circle cx="261" cy="144" r="9" fill="none" stroke="url(#metal)" strokeWidth="4" />
      </svg>

      {/* back card (depth) */}
      <motion.div style={{ x: backX, y: backY }} className="absolute left-[19%] top-[27.5%] w-[62%]">
        <div className="anim-swing-rev">
          <div className="aspect-[3/3.9] rotate-[6deg] rounded-[18px] border border-line-strong bg-[linear-gradient(160deg,#f6ecd8,#ecdcbd)] shadow-[0_18px_40px_rgba(27,20,16,0.12)]" />
        </div>
      </motion.div>

      {/* front pass */}
      <motion.div style={{ x: frontX, y: frontY }} className="absolute left-[19%] top-[26%] w-[62%]">
        <div className="anim-swing">
          <div className="relative -rotate-[3deg] rounded-[18px] border border-line-strong bg-[linear-gradient(165deg,#fffdf7,#f7efe0)] p-5 shadow-[0_30px_70px_rgba(27,20,16,0.22),inset_0_1px_0_rgba(255,255,255,0.9)] md:p-6">
            {/* eyelet */}
            <span className="absolute left-1/2 top-3 h-4 w-4 -translate-x-1/2 rounded-full border-[3px] border-[#c9b48e] bg-bg shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)]" />

            <div className="mt-4 flex items-center justify-between">
              <Logo size={compact ? 26 : 32} />
              <span className="font-mono-label text-ink-faint">No. 0001</span>
            </div>
            <p className="mt-4 font-mono-label text-ink-faint">Software Hub Pool</p>
            <p className={`font-display leading-none text-ink ${compact ? "text-[30px]" : "text-[40px]"}`} style={{ fontVariationSettings: '"opsz" 96, "SOFT" 60' }}>
              Pro Pass
            </p>

            <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-line bg-white/70 p-2">
              {grid.map((t) => (
                <ToolLogo key={t.slug} slug={t.slug} name={t.vendor} logoUrl={t.logoUrl} size={logo} className="border-0 bg-transparent" />
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-dashed border-line-strong pt-3">
              <span className="font-mono-label text-ink-faint">35 tools</span>
              <span className="font-mono-label text-ink-faint">12 months</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
