"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/** Old value slides up/out, new value slides in from below. */
export function NumberFlip({ value, className }: { value: string; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span className={`relative inline-grid overflow-hidden align-bottom ${className ?? ""}`}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={reduce ? false : { y: "60%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={reduce ? undefined : { y: "-60%", opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="[grid-area:1/1] inline-block"
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
