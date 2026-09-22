"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform, type MotionValue } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { ToolLogo } from "@/components/brand/ToolLogo";
import { tools } from "@/data/tools";

/**
 * Hero visual: a collage of outlined tiles carrying the real product logos,
 * loosely rotated and floating, with the brand tile in the middle. Built in
 * the same 2px-outline / offset-layer language as the rest of the site.
 */
interface Tile {
  slug: string;
  col: number; // 0..3
  row: number; // 0..2
  rot: number;
  delay: number;
  depth: number;
}

const TILES: Tile[] = [
  { slug: "cursor", col: 0, row: 0, rot: -6, delay: 0.1, depth: 1.2 },
  { slug: "notion", col: 1, row: 0, rot: 3, delay: 0.7, depth: 0.9 },
  { slug: "linear", col: 2, row: 0, rot: -2, delay: 1.3, depth: 1.1 },
  { slug: "framer", col: 3, row: 0, rot: 5, delay: 0.4, depth: 1.4 },
  { slug: "supabase", col: 0, row: 1, rot: 4, delay: 1.0, depth: 1.0 },
  { slug: "posthog", col: 3, row: 1, rot: -4, delay: 0.2, depth: 1.3 },
  { slug: "replit", col: 0, row: 2, rot: -3, delay: 1.6, depth: 0.8 },
  { slug: "elevenlabs", col: 1, row: 2, rot: 5, delay: 0.5, depth: 1.1 },
  { slug: "lovable", col: 2, row: 2, rot: -5, delay: 1.2, depth: 1.5 },
  { slug: "n8n", col: 3, row: 2, rot: 2, delay: 0.9, depth: 0.9 },
];

export function HeroIllustration({ interactive = true, compact = false }: { interactive?: boolean; compact?: boolean }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 45, damping: 18 });
  const sy = useSpring(my, { stiffness: 45, damping: 18 });
  const px = useTransform(sx, (v) => v * 8);
  const py = useTransform(sy, (v) => v * 6);

  useEffect(() => {
    if (!interactive || reduce) return;
    const onMove = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 2);
      my.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [interactive, reduce, mx, my]);

  const size = compact ? 56 : 78;

  return (
    <div className={`relative mx-auto w-full select-none ${compact ? "max-w-[300px]" : "max-w-[360px] md:max-w-[470px]"}`} aria-hidden>
      <div className="grid grid-cols-4 gap-3 md:gap-4">
        {Array.from({ length: 12 }).map((_, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const tile = TILES.find((t) => t.col === col && t.row === row);
          // Centre two cells of the middle row hold the brand tile.
          if (row === 1 && col === 1) {
            return (
              <div key="brand" className="col-span-2 flex items-center justify-center" style={{ transform: "rotate(-2deg)" }}>
                <div className="card-3d w-full">
                  <div className="card-3d-body flex h-full flex-col items-center justify-center gap-1 bg-primary px-4 py-4 text-center text-on-primary" style={{ minHeight: size * 1.05 }}>
                    <Logo size={compact ? 24 : 30} tone="light" />
                    <span className="mt-1 text-[14px] font-bold leading-none md:text-[16px]">Pro Pass</span>
                    <span className="font-hand text-[20px] leading-none text-accent md:text-[23px]">35 tools · 1 year</span>
                  </div>
                </div>
              </div>
            );
          }
          if (row === 1 && col === 2) return null;
          if (!tile) return <div key={i} />;
          return <FloatingTile key={tile.slug} tile={tile} px={px} py={py} size={size} />;
        })}
      </div>
    </div>
  );
}

function FloatingTile({ tile, px, py, size }: { tile: Tile; px: MotionValue<number>; py: MotionValue<number>; size: number }) {
  const x = useTransform(px, (n) => n * tile.depth);
  const y = useTransform(py, (n) => n * tile.depth);
  const t = tools.find((t) => t.slug === tile.slug);
  return (
    <motion.div style={{ x, y, rotate: tile.rot }} className="flex items-center justify-center">
      <div className="anim-float" style={{ animationDelay: `${tile.delay}s`, animationDuration: `${5.5 + tile.depth}s` }}>
        <div className="card-3d">
          <div className="card-3d-body grid place-items-center bg-bg-card" style={{ width: size, height: size }}>
            <ToolLogo slug={tile.slug} name={t?.vendor ?? tile.slug} logoUrl={t?.logoUrl} size={Math.round(size * 0.58)} className="border-0 bg-transparent" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
