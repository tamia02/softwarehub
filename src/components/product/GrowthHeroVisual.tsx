"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const bars = [38, 52, 45, 66, 58, 79, 72, 92];
const brands = ["instagram", "youtube", "tiktok", "telegram", "spotify", "x"];

/** Small count-up that respects reduced motion. */
function useCountUp(target: number, ms = 1400) {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? target : 0);
  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / ms, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setN(Math.round(target * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms, reduce]);
  return n;
}

export function GrowthHeroVisual() {
  const reduce = useReducedMotion();
  const delivered = useCountUp(48210);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref} className="anim-fade-scale relative rounded-[var(--r-card-lg)] border-2 border-ink-line bg-bg-card p-5 shadow-[7px_7px_0_var(--offset-card)] sm:p-6" style={{ animationDelay: "0.15s" }}>
      {/* header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[13px] font-bold text-ink">Live dispatch</span>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-accent-soft px-2.5 py-1 text-[12px] font-black text-accent-2">
          <TrendingUp size={13} /> +12.4%
        </span>
      </div>

      {/* big counter */}
      <div className="mt-4">
        <p className="font-display text-[38px] font-black leading-none tabular-nums text-ink">{delivered.toLocaleString("en-IN")}</p>
        <p className="mt-1 text-[13px] font-medium text-ink-muted">orders delivered today</p>
      </div>

      {/* animated bar chart */}
      <div className="mt-5 flex h-28 items-end gap-2 rounded-[16px] border-2 border-ink-line/70 bg-bg-soft/50 p-3">
        {bars.map((h, i) => (
          <motion.span
            key={i}
            className="flex-1 rounded-t-[4px] bg-accent"
            style={{ transformOrigin: "bottom" }}
            initial={reduce ? false : { scaleY: 0, opacity: 0.4 }}
            animate={reduce ? undefined : { scaleY: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
          >
            <span className="block w-full" style={{ height: `${h}%`, minHeight: 6 }} />
          </motion.span>
        ))}
      </div>

      {/* platforms */}
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[12px] font-medium text-ink-faint">across</span>
        <div className="flex items-center gap-2.5">
          {brands.map((b, i) => (
            <motion.img
              key={b}
              src={`https://cdn.simpleicons.org/${b}`}
              alt=""
              width={20}
              height={20}
              loading="lazy"
              className="object-contain"
              initial={reduce ? false : { y: 8, opacity: 0 }}
              animate={reduce ? undefined : { y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.6 + i * 0.06 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
