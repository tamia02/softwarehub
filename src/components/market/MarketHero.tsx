"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { ShieldCheck } from "lucide-react";

/**
 * Marketplace hero visual: real brand logos float and drift with the pointer
 * around a central "escrow code" card. HTML/SVG in the site's outline language.
 */
interface Tile {
  brand: string;
  x: string;
  y: string;
  size: number;
  rot: number;
  delay: number;
  depth: number;
  mobile?: boolean;
}

const TILES: Tile[] = [
  { brand: "netflix", x: "2%", y: "6%", size: 70, rot: -8, delay: 0.1, depth: 1.3, mobile: true },
  { brand: "steam", x: "30%", y: "-3%", size: 58, rot: 5, delay: 0.7, depth: 0.9, mobile: true },
  { brand: "spotify", x: "60%", y: "-1%", size: 62, rot: -4, delay: 1.3, depth: 1.1 },
  { brand: "valorant", x: "86%", y: "22%", size: 60, rot: 7, delay: 0.4, depth: 1.4, mobile: true },
  { brand: "playstation", x: "-2%", y: "46%", size: 64, rot: 4, delay: 1.0, depth: 1.0, mobile: true },
  { brand: "claude", x: "84%", y: "54%", size: 66, rot: -6, delay: 0.2, depth: 1.3, mobile: true },
  { brand: "roblox", x: "4%", y: "80%", size: 58, rot: -4, delay: 1.6, depth: 0.8, mobile: true },
  { brand: "youtube", x: "34%", y: "90%", size: 56, rot: 6, delay: 0.5, depth: 1.1 },
  { brand: "razer", x: "62%", y: "86%", size: 62, rot: -5, delay: 1.2, depth: 1.5, mobile: true },
  { brand: "googleplay", x: "88%", y: "82%", size: 52, rot: 3, delay: 0.9, depth: 0.9 },
];

export function MarketHero() {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 45, damping: 18 });
  const sy = useSpring(my, { stiffness: 45, damping: 18 });
  const px = useTransform(sx, (v) => v * 8);
  const py = useTransform(sy, (v) => v * 6);
  const cardX = useTransform(sx, (v) => v * -4);
  const cardY = useTransform(sy, (v) => v * -3);

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 2);
      my.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduce, mx, my]);

  return (
    <div className="relative mx-auto aspect-square w-full max-w-[340px] select-none md:max-w-[460px]" aria-hidden>
      <div className="absolute inset-[14%] rounded-full bg-[radial-gradient(closest-side,rgba(245,158,11,0.30),transparent)] blur-2xl" />

      {/* hand-drawn sparks */}
      <svg viewBox="0 0 460 460" className="absolute inset-0 h-full w-full overflow-visible">
        <g stroke="var(--brand-accent-2)" strokeWidth="4" strokeLinecap="round" fill="none">
          <path d="M110 120 l-14 -16" />
          <path d="M92 142 l-20 -6" />
          <path d="M360 356 l16 14" />
          <path d="M380 338 l20 6" />
        </g>
      </svg>

      {TILES.map((t) => (
        <FloatingTile key={t.brand} tile={t} px={px} py={py} />
      ))}

      {/* central escrow code card */}
      <motion.div style={{ x: cardX, y: cardY }} className="absolute left-1/2 top-1/2 z-10 w-[46%] -translate-x-1/2 -translate-y-1/2 md:w-[44%]">
        <div className="anim-float" style={{ animationDuration: "7s" }}>
          <div className="card-3d card-3d-lg rotate-[-4deg]">
            <div className="card-3d-body relative overflow-hidden bg-[linear-gradient(165deg,#fff7e0,#fde9c0)] px-4 pb-4 pt-5 text-center md:px-5 md:pb-5 md:pt-6">
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-full border-2 border-ink-line bg-accent text-on-accent md:h-12 md:w-12">
                <ShieldCheck size={22} />
              </span>
              <p className="mt-3 whitespace-nowrap text-[9px] font-bold uppercase tracking-[0.2em] text-ink-muted md:text-[11px]">Escrow protected</p>
              <p className="font-display text-[22px] font-black uppercase leading-[0.95] tracking-[-0.02em] text-ink md:text-[28px]">Instant
                <br />delivery</p>
              <div className="relative mx-[-16px] my-3 border-t-2 border-dashed border-ink-line md:my-4">
                <span className="absolute -left-2 -top-2 h-4 w-4 rounded-full border-2 border-ink-line bg-bg" />
                <span className="absolute -right-2 -top-2 h-4 w-4 rounded-full border-2 border-ink-line bg-bg" />
              </div>
              <p className="font-hand whitespace-nowrap text-[16px] leading-none text-accent-2 md:text-[20px]">your code, in seconds</p>
              <p className="font-code mt-2 whitespace-nowrap text-[8px] tracking-[0.2em] text-ink-faint md:text-[10px]">SHOP-••••-••••</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function FloatingTile({ tile, px, py }: { tile: Tile; px: MotionValue<number>; py: MotionValue<number> }) {
  const x = useTransform(px, (n) => n * tile.depth);
  const y = useTransform(py, (n) => n * tile.depth);
  const [failed, setFailed] = useState(false);
  return (
    <motion.div style={{ left: tile.x, top: tile.y, x, y, rotate: tile.rot }} className={`absolute z-20 ${tile.mobile ? "" : "hidden md:block"}`}>
      <div className="anim-float" style={{ animationDelay: `${tile.delay}s`, animationDuration: `${5.5 + tile.depth}s` }}>
        <div className="card-3d">
          <div className="card-3d-body grid place-items-center bg-bg-card" style={{ width: tile.size, height: tile.size }}>
            {failed ? (
              <span className="font-display text-[18px] font-black uppercase text-accent-2">{tile.brand[0]}</span>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={`https://cdn.simpleicons.org/${tile.brand}`} alt="" width={tile.size * 0.5} height={tile.size * 0.5} className="object-contain" onError={() => setFailed(true)} />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
