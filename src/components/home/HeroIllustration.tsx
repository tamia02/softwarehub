"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { ToolLogo } from "@/components/brand/ToolLogo";
import { tools } from "@/data/tools";

/**
 * Hero object: a membership-style Pro Pass card in light perspective, with
 * real product tiles floating around it at different depths. Everything is
 * HTML/CSS so it stays crisp, themeable and cheap to render.
 */
const FLOATING: Array<{ slug: string; x: string; y: string; size: number; depth: number; delay: number; mobile?: boolean }> = [
  { slug: "cursor", x: "2%", y: "6%", size: 64, depth: 1.4, delay: 0, mobile: true },
  { slug: "notion", x: "72%", y: "0%", size: 56, depth: 1.1, delay: 0.6, mobile: true },
  { slug: "linear", x: "84%", y: "32%", size: 60, depth: 1.6, delay: 1.1 },
  { slug: "supabase", x: "-2%", y: "54%", size: 58, depth: 1.2, delay: 0.3 },
  { slug: "framer", x: "80%", y: "78%", size: 52, depth: 0.9, delay: 0.9, mobile: true },
  { slug: "posthog", x: "12%", y: "84%", size: 54, depth: 1.3, delay: 1.5, mobile: true },
  { slug: "elevenlabs", x: "48%", y: "90%", size: 48, depth: 0.8, delay: 0.2 },
  { slug: "replit", x: "36%", y: "-4%", size: 50, depth: 1.0, delay: 1.3, mobile: true },
];

export function HeroIllustration({ interactive = true, compact = false }: { interactive?: boolean; compact?: boolean }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 45, damping: 18 });
  const sy = useSpring(my, { stiffness: 45, damping: 18 });
  const rotY = useTransform(sx, (v) => -14 + v * 5);
  const rotX = useTransform(sy, (v) => 8 - v * 4);
  const tileX = useTransform(sx, (v) => v * 10);
  const tileY = useTransform(sy, (v) => v * 8);

  useEffect(() => {
    if (!interactive || reduce) return;
    const onMove = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 2);
      my.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [interactive, reduce, mx, my]);

  const scale = compact ? 0.8 : 1;

  return (
    <div className={`relative mx-auto w-full select-none ${compact ? "max-w-[360px]" : "max-w-[400px] md:max-w-[560px]"} aspect-[1/1]`} aria-hidden>
      {/* glow */}
      <div className="absolute inset-[10%] rounded-full bg-[radial-gradient(closest-side,rgba(232,163,23,0.24),transparent)] blur-3xl" />

      {/* floating product tiles */}
      {FLOATING.map((f) => (
        <FloatingTile key={f.slug} f={f} tileX={tileX} tileY={tileY} scale={scale} />
      ))}

      {/* card */}
      <div className="absolute inset-x-[7%] top-[18%] z-10" style={{ perspective: 1400 }}>
        <motion.div style={{ rotateY: rotY, rotateX: rotX, transformStyle: "preserve-3d" }} className="anim-float will-change-transform">
          <div className="relative w-full overflow-hidden rounded-[22px] md:aspect-[1.586/1] bg-[linear-gradient(135deg,#a2470f_0%,#7a3308_45%,#3a1a09_100%)] p-6 text-[#fbf6ec] shadow-[0_40px_80px_rgba(27,20,16,0.35),0_0_0_1px_rgba(255,255,255,0.08)_inset] md:p-7">
            {/* sheen */}
            <div className="pointer-events-none absolute -inset-y-10 -left-1/3 w-2/3 rotate-[20deg] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.14),transparent)]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_100%_0%,rgba(232,163,23,0.25),transparent_55%)]" />

            <div className="relative flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <Logo size={28} tone="light" />
                <span className="font-display text-[13px] font-bold tracking-[-0.01em]">Software Hub Pool</span>
              </div>
              <span className="font-mono-label rounded-full border border-white/25 px-2.5 py-1 text-[10.5px] text-[#fbf6ec]/90">Annual</span>
            </div>

            {/* chip */}
            <div className="relative mt-6 h-8 w-11 rounded-md bg-[linear-gradient(135deg,#f2c14e,#c9820c)] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.15)] md:mt-8">
              <div className="absolute inset-x-0 top-1/2 h-px bg-black/20" />
              <div className="absolute inset-y-0 left-1/2 w-px bg-black/20" />
            </div>

            <div className="relative mt-5 md:mt-7">
              <p className="font-code text-[13px] tracking-[0.22em] text-[#fbf6ec]/70 md:text-[15px]">SHP-P  ••••  ••••  ••••</p>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="font-mono-label text-[10.5px] text-[#fbf6ec]/60">Pass</p>
                  <p className="font-display text-[26px] font-extrabold leading-none tracking-[-0.03em] md:text-[32px]">Pro Pass</p>
                </div>
                <div className="text-right">
                  <p className="font-mono-label text-[10.5px] text-[#fbf6ec]/60">Includes</p>
                  <p className="font-display text-[20px] font-bold leading-none md:text-[24px]">35 tools</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/** Tiles further "in front" (higher depth) move more with the pointer. */
function FloatingTile({ f, tileX, tileY, scale }: { f: (typeof FLOATING)[number]; tileX: MotionValue<number>; tileY: MotionValue<number>; scale: number }) {
  const x = useTransform(tileX, (n) => n * f.depth);
  const y = useTransform(tileY, (n) => n * f.depth);
  return (
    <motion.div style={{ left: f.x, top: f.y, x, y }} className={`absolute z-20 ${f.mobile ? "" : "hidden md:block"}`}>
      <div className="anim-float" style={{ animationDelay: `${f.delay}s`, animationDuration: `${6 + f.depth}s` }}>
        <ToolLogo
          slug={f.slug}
          name={tools.find((t) => t.slug === f.slug)?.vendor ?? f.slug}
          size={Math.round(f.size * scale)}
          className="rounded-[24%] border-line shadow-[0_18px_40px_rgba(27,20,16,0.14)]"
        />
      </div>
    </motion.div>
  );
}
