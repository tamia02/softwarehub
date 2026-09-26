"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

/** Matches the cream theme's --ease-out (soft, decelerating). */
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Scroll-triggered entrance: fades + rises into place once, when it scrolls
 * into view. No-op under reduced motion. Additive only — the child keeps its
 * own layout classes.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  y = 20,
  amount = 0.25,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  amount?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount, margin: "0px 0px -8% 0px" }}
      transition={{ duration: 0.6, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/**
 * Container that staggers its <StaggerItem> children in as it enters the
 * viewport. Wrap the grid/flex element itself with this (it renders a div and
 * forwards className, so the grid layout is preserved).
 */
export function Stagger({
  children,
  className,
  gap = 0.07,
  amount = 0.15,
}: {
  children: ReactNode;
  className?: string;
  gap?: number;
  amount?: number;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount, margin: "0px 0px -8% 0px" }}
      variants={{ show: { transition: { staggerChildren: gap } } }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
