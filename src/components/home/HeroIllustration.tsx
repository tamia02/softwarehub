"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { ToolLogo } from "@/components/brand/ToolLogo";
import { tools } from "@/data/tools";

/**
 * Hero illustration: a ticket-shaped Pro Pass in the centre with real product
 * tiles orbiting it at different sizes and tilts, hand-drawn amber sparks and
 * a hand-script note. Everything is HTML/SVG in the site's outline language;
 * tiles float gently and shift with the pointer.
 */
interface Tile {
  slug: string;
  x: string; // % from left
  y: string; // % from top
  size: number;
  rot: number;
  delay: number;
  depth: number;
  mobile?: boolean;
}

const TILES: Tile[] = [
  { slug: "cursor", x: "6%", y: "8%", size: 60, rot: -8, delay: 0.1, depth: 1.3, mobile: true },
  { slug: "notion", x: "34%", y: "-2%", size: 50, rot: 5, delay: 0.7, depth: 0.9, mobile: true },
  { slug: "linear", x: "57%", y: "-2%", size: 54, rot: -3, delay: 1.3, depth: 1.1 },
  { slug: "framer", x: "84%", y: "28%", size: 48, rot: 7, delay: 0.4, depth: 1.4 },
  { slug: "supabase", x: "2%", y: "44%", size: 52, rot: 4, delay: 1.0, depth: 1.0, mobile: true },
  { slug: "posthog", x: "82%", y: "56%", size: 56, rot: -6, delay: 0.2, depth: 1.3, mobile: true },
  { slug: "replit", x: "1%", y: "66%", size: 52, rot: -4, delay: 1.6, depth: 0.8, mobile: true },
  { slug: "elevenlabs", x: "34%", y: "90%", size: 46, rot: 6, delay: 0.5, depth: 1.1, mobile: true },
  { slug: "lovable", x: "62%", y: "84%", size: 54, rot: -5, delay: 1.2, depth: 1.5 },
  { slug: "n8n", x: "86%", y: "82%", size: 44, rot: 3, delay: 0.9, depth: 0.9 },
];

export function HeroIllustration({ interactive = true, compact = false }: { interactive?: boolean; compact?: boolean }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 45, damping: 18 });
  const sy = useSpring(my, { stiffness: 45, damping: 18 });
  const px = useTransform(sx, (v) => v * 8);
  const py = useTransform(sy, (v) => v * 6);
  const passX = useTransform(sx, (v) => v * -4);
  const passY = useTransform(sy, (v) => v * -3);

  useEffect(() => {
    if (!interactive || reduce) return;
    const onMove = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 2);
      my.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [interactive, reduce, mx, my]);

  const scale = compact ? 0.72 : 1;

  return (
    <div className={`relative mx-auto w-full select-none ${compact ? "max-w-[320px]" : "max-w-[300px] md:max-w-[420px]"} aspect-[1/1]`} aria-hidden>
      {/* glow */}
      <div className="absolute inset-[14%] rounded-full bg-[radial-gradient(closest-side,rgba(245,158,11,0.32),transparent)] blur-2xl" />

      {/* hand-drawn sparks + note */}
      <svg viewBox="0 0 520 520" className="absolute inset-0 h-full w-full overflow-visible">
        <g stroke="var(--brand-accent-2)" strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M118 128 l-14 -18" />
          <path d="M100 150 l-22 -6" />
          <path d="M138 112 l-4 -22" />
          <path d="M404 402 l16 16" />
          <path d="M424 384 l22 6" />
          <path d="M386 420 l2 22" />
        </g>
      </svg>

      {/* orbiting product tiles */}
      {TILES.map((t) => (
        <FloatingTile key={t.slug} tile={t} px={px} py={py} scale={scale} />
      ))}

      {/* the pass */}
      <motion.div style={{ x: passX, y: passY }} className="absolute left-1/2 top-1/2 z-10 w-[42%] -translate-x-1/2 -translate-y-1/2 md:w-[40%]">
        <div className="anim-float" style={{ animationDuration: "7s" }}>
          <div className="card-3d card-3d-lg rotate-[-4deg]">
            <div className="card-3d-body relative overflow-hidden bg-[linear-gradient(165deg,#fff7e0,#fde9c0)] px-3 pb-4 pt-5 text-center md:px-4 md:pb-4 md:pt-5">
              {/* punched hole */}
              <span className="absolute left-1/2 top-2.5 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-ink-line bg-bg" />
              <div className="mt-3 flex justify-center">
                <Logo size={compact ? 30 : 38} />
              </div>
              <p className="mt-3 whitespace-nowrap text-[8px] font-bold uppercase tracking-[0.18em] text-ink-muted md:text-[9px] md:tracking-[0.2em]">Software Hub Pool</p>
              <p className={`font-display font-bold uppercase leading-[0.9] tracking-[-0.02em] text-ink ${compact ? "text-[26px]" : "text-[26px] md:text-[32px]"}`}>
                Pro
                <br />
                Pass
              </p>
              {/* tear line with side notches */}
              <div className="relative mx-[-20px] my-3 border-t-2 border-dashed md:my-4 border-ink-line">
                <span className="absolute -left-2 -top-2 h-4 w-4 rounded-full border-2 border-ink-line bg-bg" />
                <span className="absolute -right-2 -top-2 h-4 w-4 rounded-full border-2 border-ink-line bg-bg" />
              </div>
              <p className="font-hand whitespace-nowrap text-[16px] leading-none text-accent-2 md:text-[21px]">35 tools · 1 year</p>
              <p className="font-code mt-2 whitespace-nowrap text-[8px] tracking-[0.2em] text-ink-faint md:text-[10px] md:tracking-[0.25em]">SHP-P-••••-••••</p>
            </div>
          </div>
          {/* "save 90%" sticker on the corner */}
          <div className="absolute -right-6 -top-5 z-20 grid h-[62px] w-[62px] rotate-[10deg] place-items-center rounded-full border-2 border-ink-line bg-accent text-center shadow-[3px_3px_0_var(--ink-line)] md:-right-8 md:-top-6 md:h-[72px] md:w-[72px]">
            <span className="font-hand text-[15px] leading-[0.9] text-on-accent md:text-[18px]">
              save
              <br />
              <b className="font-display text-[17px] font-black tracking-tight md:text-[20px]">90%</b>
            </span>
          </div>
          {/* count chip */}
          <div className="absolute -bottom-9 -left-16 z-20 hidden rotate-[-6deg] items-center gap-2 rounded-full border-2 border-ink-line bg-bg-card px-3 py-1.5 shadow-[3px_3px_0_var(--ink-line)] md:flex">
            <span className="flex -space-x-1.5">
              {["cursor", "notion", "linear"].map((slug) => (
                <ToolLogo key={slug} slug={slug} name={slug} logoUrl={tools.find((t) => t.slug === slug)?.logoUrl} size={18} className="border border-ink-line/30 bg-bg-card" />
              ))}
            </span>
            <span className="text-[13px] font-bold text-ink">+32 more</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function FloatingTile({ tile, px, py, scale }: { tile: Tile; px: MotionValue<number>; py: MotionValue<number>; scale: number }) {
  const x = useTransform(px, (n) => n * tile.depth);
  const y = useTransform(py, (n) => n * tile.depth);
  const t = tools.find((x) => x.slug === tile.slug);
  const size = Math.round(tile.size * scale);
  return (
    <motion.div style={{ left: tile.x, top: tile.y, x, y, rotate: tile.rot }} className={`absolute z-20 ${tile.mobile ? "" : "hidden md:block"}`}>
      <div className="anim-float origin-center scale-[0.78] md:scale-100" style={{ animationDelay: `${tile.delay}s`, animationDuration: `${5.5 + tile.depth}s` }}>
        <div className="card-3d">
          <div className="card-3d-body grid place-items-center bg-bg-card" style={{ width: size, height: size }}>
            <ToolLogo slug={tile.slug} name={t?.vendor ?? tile.slug} logoUrl={t?.logoUrl} size={Math.round(size * 0.56)} className="border-0 bg-transparent" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
