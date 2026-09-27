"use client";

import { useRef } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { ToolLogo } from "@/components/brand/ToolLogo";
import { tools } from "@/data/tools";
import { HeroIllustration } from "./HeroIllustration";

/**
 * The Pro Pass ticket as *real* 3D — but built from the site's own DOM, so it
 * inherits the exact theme: matte cream paper, 2px ink outline, hard offset
 * shadow (card-3d), Bricolage + Caveat fonts and real product logos. The card
 * tilts toward the pointer in true perspective and its layers sit at different
 * depths (translateZ) so they parallax like a physical object. No WebGL.
 * Falls back to the flat illustration under reduced-motion.
 */
interface Tile {
  slug: string;
  x: string;
  y: string;
  size: number;
  z: number; // depth in px (+ = toward viewer)
  rot: number;
  delay: number;
  depth: number; // pointer-parallax multiplier
  mobile?: boolean;
}

const TILES: Tile[] = [
  { slug: "cursor", x: "2%", y: "10%", size: 62, z: 90, rot: -8, delay: 0.1, depth: 1.4, mobile: true },
  { slug: "notion", x: "33%", y: "-4%", size: 50, z: 40, rot: 5, delay: 0.7, depth: 1.0, mobile: true },
  { slug: "linear", x: "60%", y: "-3%", size: 54, z: -30, rot: -3, delay: 1.3, depth: 0.7 },
  { slug: "framer", x: "88%", y: "26%", size: 50, z: 70, rot: 7, delay: 0.4, depth: 1.3 },
  { slug: "supabase", x: "-2%", y: "46%", size: 52, z: -20, rot: 4, delay: 1.0, depth: 0.8, mobile: true },
  { slug: "posthog", x: "86%", y: "56%", size: 56, z: 100, rot: -6, delay: 0.2, depth: 1.5, mobile: true },
  { slug: "replit", x: "0%", y: "70%", size: 50, z: 50, rot: -4, delay: 1.6, depth: 1.1, mobile: true },
  { slug: "lovable", x: "60%", y: "86%", size: 54, z: 80, rot: -5, delay: 1.2, depth: 1.3 },
  { slug: "n8n", x: "88%", y: "82%", size: 46, z: -10, rot: 3, delay: 0.9, depth: 0.8 },
];

export function ProPassCard3D() {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);

  const spring = { stiffness: 130, damping: 18, mass: 0.5 };
  const rotX = useSpring(useTransform(my, [0, 1], [13, -13]), spring);
  const rotY = useSpring(useTransform(mx, [0, 1], [-17, 17]), spring);
  const par = useSpring(useTransform(mx, [0, 1], [-1, 1]), spring);
  const parY = useSpring(useTransform(my, [0, 1], [-1, 1]), spring);

  if (reduce) return <HeroIllustration />;

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    const el = wrapRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width);
    my.set((e.clientY - r.top) / r.height);
  }
  function reset() {
    mx.set(0.5);
    my.set(0.5);
  }

  return (
    <div
      ref={wrapRef}
      onPointerMove={onMove}
      onPointerLeave={reset}
      className="relative mx-auto aspect-square w-full max-w-[320px] [perspective:1200px] md:max-w-[440px]"
      aria-hidden
    >
      {/* warm glow */}
      <div className="absolute inset-[16%] rounded-full bg-[radial-gradient(closest-side,rgba(245,158,11,0.30),transparent)] blur-2xl" />

      <motion.div className="absolute inset-0 [transform-style:preserve-3d]" style={{ rotateX: rotX, rotateY: rotY }}>
        {/* hand-drawn sparks, set slightly back */}
        <div className="absolute inset-0 [transform:translateZ(-40px)]">
          <svg viewBox="0 0 520 520" className="h-full w-full overflow-visible">
            <g stroke="var(--brand-accent-2)" strokeWidth="4" strokeLinecap="round" fill="none">
              <path d="M118 128 l-14 -18" />
              <path d="M100 150 l-22 -6" />
              <path d="M138 112 l-4 -22" />
              <path d="M404 402 l16 16" />
              <path d="M424 384 l22 6" />
              <path d="M386 420 l2 22" />
            </g>
          </svg>
        </div>

        {/* floating product tiles at varied depths */}
        {TILES.map((t) => (
          <Tile3D key={t.slug} tile={t} par={par} parY={parY} />
        ))}

        {/* the pass, lifted toward the viewer */}
        <div className="absolute left-1/2 top-1/2 w-[52%] -translate-x-1/2 -translate-y-1/2 [transform-style:preserve-3d] md:w-[46%]">
          <motion.div className="[transform-style:preserve-3d]" style={{ z: 40 }}>
            <div className="anim-float [transform-style:preserve-3d]" style={{ animationDuration: "7s" }}>
              <div className="card-3d card-3d-lg rotate-[-4deg] [transform-style:preserve-3d]">
                <div className="card-3d-body relative overflow-hidden bg-[linear-gradient(165deg,#fff7e0,#fde9c0)] px-4 pb-4 pt-5 text-center [transform-style:preserve-3d]">
                  <span className="absolute left-1/2 top-2.5 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-ink-line bg-bg" />
                  <div className="mt-3 flex justify-center [transform:translateZ(26px)]">
                    <Logo size={38} />
                  </div>
                  <p className="mt-3 whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.2em] text-ink-muted [transform:translateZ(20px)]">Software Hub</p>
                  <p className="font-display text-[30px] font-bold uppercase leading-[0.9] tracking-[-0.02em] text-ink [transform:translateZ(44px)] md:text-[34px]">
                    Pro
                    <br />
                    Pass
                  </p>
                  <div className="relative mx-[-20px] my-4 border-t-2 border-dashed border-ink-line">
                    <span className="absolute -left-2 -top-2 h-4 w-4 rounded-full border-2 border-ink-line bg-bg" />
                    <span className="absolute -right-2 -top-2 h-4 w-4 rounded-full border-2 border-ink-line bg-bg" />
                  </div>
                  <p className="whitespace-nowrap font-hand text-[19px] leading-none text-accent-2 [transform:translateZ(34px)] md:text-[23px]">35 tools · 1 year</p>
                  <p className="mt-2 whitespace-nowrap font-code text-[9px] tracking-[0.22em] text-ink-faint [transform:translateZ(16px)] md:text-[10px]">SHP-P-••••-••••</p>
                </div>
              </div>

              {/* "save 90%" sticker, popped forward */}
              <div className="absolute -right-6 -top-5 grid h-[64px] w-[64px] place-items-center rounded-full border-2 border-ink-line bg-accent text-center shadow-[3px_3px_0_var(--ink-line)] [transform:translateZ(80px)_rotate(10deg)] md:-right-8 md:-top-6 md:h-[74px] md:w-[74px]">
                <span className="font-hand text-[16px] leading-[0.9] text-on-accent md:text-[19px]">
                  save
                  <br />
                  <b className="font-display text-[18px] font-black tracking-tight md:text-[21px]">90%</b>
                </span>
              </div>

              {/* count chip, floating forward-left */}
              <div className="absolute -bottom-9 -left-14 hidden items-center gap-2 rounded-full border-2 border-ink-line bg-bg-card px-3 py-1.5 shadow-[3px_3px_0_var(--ink-line)] [transform:translateZ(64px)_rotate(-6deg)] md:flex">
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
      </motion.div>
    </div>
  );
}

function Tile3D({ tile, par, parY }: { tile: Tile; par: MotionValue<number>; parY: MotionValue<number> }) {
  const x = useTransform(par, (v) => v * tile.depth * 16);
  const y = useTransform(parY, (v) => v * tile.depth * 13);
  const t = tools.find((x) => x.slug === tile.slug);
  return (
    <motion.div
      style={{ left: tile.x, top: tile.y, x, y, z: tile.z, rotate: tile.rot }}
      className={`absolute [transform-style:preserve-3d] ${tile.mobile ? "" : "hidden md:block"}`}
    >
      <div className="anim-float origin-center scale-[0.8] md:scale-100" style={{ animationDelay: `${tile.delay}s`, animationDuration: `${5.5 + tile.depth}s` }}>
        <div className="card-3d">
          <div className="card-3d-body grid place-items-center bg-bg-card" style={{ width: tile.size, height: tile.size }}>
            <ToolLogo slug={tile.slug} name={t?.vendor ?? tile.slug} logoUrl={t?.logoUrl} size={Math.round(tile.size * 0.56)} className="border-0 bg-transparent" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
