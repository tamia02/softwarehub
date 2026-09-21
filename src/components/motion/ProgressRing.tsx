"use client";

import { useEffect } from "react";
import { motion, useInView, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef } from "react";

export function ProgressRing({
  value,
  max,
  size = 64,
  stroke = 6,
  className,
  children,
}: {
  value: number;
  max: number;
  size?: number;
  stroke?: number;
  className?: string;
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const target = useMotionValue(0);
  const spring = useSpring(target, { stiffness: 60, damping: 16 });
  const dashoffset = useTransform(spring, (p) => c * (1 - p));

  useEffect(() => {
    if (inView) target.set(Math.min(1, value / max));
  }, [inView, value, max, target]);

  return (
    <div ref={ref} className={`relative grid place-items-center ${className ?? ""}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="var(--line)" strokeWidth={stroke} fill="none" />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="var(--brand-primary)"
          strokeWidth={stroke}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={c}
          style={{ strokeDashoffset: dashoffset }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">{children}</div>
    </div>
  );
}
