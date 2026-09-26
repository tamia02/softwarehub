"use client";

import { useEffect, useRef } from "react";

/** Falling code rain on a canvas (Matrix style). Pauses for reduced-motion. */
export function MatrixRain({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const chars = "01</>{}[]=+-*ﾊﾋﾌﾍﾎABCDEF0123456789$#&%".split("");
    let cols = 0;
    let drops: number[] = [];
    let w = 0, h = 0;

    const resize = () => {
      const parent = canvas.parentElement;
      w = canvas.width = parent?.clientWidth ?? window.innerWidth;
      h = canvas.height = parent?.clientHeight ?? 600;
      cols = Math.floor(w / 14);
      drops = Array.from({ length: cols }, () => Math.random() * -50);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let last = 0;
    const draw = (t: number) => {
      raf = requestAnimationFrame(draw);
      if (t - last < 55) return; // ~18fps, subtle
      last = t;
      ctx.fillStyle = "rgba(8, 11, 10, 0.16)";
      ctx.fillRect(0, 0, w, h);
      ctx.font = "13px monospace";
      for (let i = 0; i < cols; i++) {
        const c = chars[Math.floor(Math.random() * chars.length)];
        const x = i * 14;
        const y = drops[i] * 14;
        ctx.fillStyle = Math.random() > 0.975 ? "#a7f3d0" : "#1f9e6e";
        ctx.fillText(c, x, y);
        if (y > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={ref} className={className} aria-hidden />;
}
