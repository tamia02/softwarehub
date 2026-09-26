"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";

/**
 * Pointer-driven 3D tilt for a card. Wraps its children in a perspective layer
 * and rotates toward the cursor with a soft, spring-damped feel. A light glare
 * follows the pointer for a premium "glass under light" touch.
 *
 * Purely additive — the child keeps its own borders/shadows/colours. Disabled
 * entirely under prefers-reduced-motion (renders a plain div), and never fires
 * on touch (pointer:coarse) where hover-tilt has no meaning.
 */
export function Tilt({
  children,
  className,
  max = 7,
  scale = 1.02,
  glare = true,
}: {
  children: ReactNode;
  className?: string;
  /** Max rotation in degrees on each axis. */
  max?: number;
  /** Hover scale. */
  scale?: number;
  glare?: boolean;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  // 0..1 pointer position within the card.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const glow = useSpring(0, { stiffness: 200, damping: 26 });

  const spring = { stiffness: 220, damping: 22, mass: 0.4 };
  const rotateX = useSpring(useTransform(py, [0, 1], [max, -max]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring);
  const s = useSpring(1, spring);

  const gx = useTransform(px, (v) => `${v * 100}%`);
  const gy = useTransform(py, (v) => `${v * 100}%`);
  const glareBg = useMotionTemplate`radial-gradient(220px circle at ${gx} ${gy}, rgba(255,255,255,0.5), transparent 60%)`;

  if (reduce) return <div className={className}>{children}</div>;

  function onMove(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  }
  function onEnter(e: React.PointerEvent<HTMLDivElement>) {
    if (e.pointerType !== "mouse") return;
    glow.set(1);
    s.set(scale);
  }
  function onLeave() {
    px.set(0.5);
    py.set(0.5);
    glow.set(0);
    s.set(1);
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      onPointerMove={onMove}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
      style={{
        rotateX,
        rotateY,
        scale: s,
        transformPerspective: 1000,
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
    >
      {children}
      {glare && (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-10 rounded-[inherit] mix-blend-soft-light"
          style={{ background: glareBg, opacity: glow }}
        />
      )}
    </motion.div>
  );
}
