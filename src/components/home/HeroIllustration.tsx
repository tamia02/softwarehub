"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Logo } from "@/components/brand/Logo";
import { VendorMark } from "@/components/brand/VendorMark";
import { tools } from "@/data/tools";

/**
 * Layered brand illustration placeholder: a "pass" card in front, a stack of
 * tool tiles behind. Both layers float on a slow loop and parallax ±10 px
 * with the pointer. Replace the inner content with the real front/back
 * artwork (PNG/SVG) — keep the two-layer structure for the parallax.
 */
export function HeroIllustration({ interactive = true }: { interactive?: boolean }) {
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });

  const backX = useTransform(sx, (v) => v * -10);
  const backY = useTransform(sy, (v) => v * -10);
  const frontX = useTransform(sx, (v) => v * 10);
  const frontY = useTransform(sy, (v) => v * 10);

  useEffect(() => {
    if (!interactive || reduce) return;
    const onMove = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 2);
      my.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [interactive, reduce, mx, my]);

  const featured = tools.filter((t) => ["cursor", "notion", "framer", "linear", "posthog", "supabase"].includes(t.slug));

  return (
    <div className="relative mx-auto aspect-[5/4] w-full max-w-[520px] select-none" aria-hidden>
      {/* soft glow */}
      <div className="absolute inset-0 rounded-full bg-[radial-gradient(closest-side,rgba(0,87,255,0.18),transparent)] blur-2xl" />

      {/* back layer: tool tiles */}
      <motion.div style={{ x: backX, y: backY }} className="absolute inset-0">
        <div className="anim-float-rev absolute inset-0">
          {featured.map((t, i) => {
            const pos = [
              "left-[4%] top-[8%] -rotate-6",
              "right-[6%] top-[4%] rotate-3",
              "left-[0%] top-[46%] rotate-2",
              "right-[2%] top-[42%] -rotate-3",
              "left-[14%] bottom-[2%] rotate-6",
              "right-[14%] bottom-[0%] -rotate-2",
            ][i];
            return (
              <div
                key={t.slug}
                className={`absolute rounded-2xl border border-line bg-white/90 px-3.5 py-2.5 shadow-[var(--shadow-card)] backdrop-blur ${pos}`}
              >
                <VendorMark name={t.vendor} hue={t.hue} size="sm" />
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* front layer: pass card */}
      <motion.div style={{ x: frontX, y: frontY }} className="absolute inset-0 grid place-items-center">
        <div className="anim-float w-[68%] rounded-[28px] bg-[linear-gradient(140deg,var(--brand-primary),var(--brand-primary-600)_60%,#001a4d)] p-6 text-white shadow-[0_30px_80px_rgba(0,87,255,0.35)]">
          <div className="flex items-center justify-between">
            <Logo size={36} className="rounded-xl ring-2 ring-white/30" />
            <span className="rounded-full bg-accent px-3 py-1 text-[11px] font-black uppercase tracking-wider text-ink">
              Pro Pass
            </span>
          </div>
          <p className="mt-8 font-mono text-[13px] tracking-[0.2em] text-white/70">SHP-P-••••-••••-••••</p>
          <div className="mt-6 flex items-end justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/60">Tools</p>
              <p className="font-display text-3xl font-black leading-none">35</p>
            </div>
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-wider text-white/60">Valid</p>
              <p className="font-display text-xl font-extrabold leading-none">1 year</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
