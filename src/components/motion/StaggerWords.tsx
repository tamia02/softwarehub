"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Splits text into words and staggers them in (opacity + 12 px rise, 40 ms/word). */
export function StaggerWords({
  text,
  className,
  as: Tag = "span",
  delay = 0,
  highlight,
}: {
  text: string;
  className?: string;
  as?: "span" | "h1" | "h2" | "p";
  delay?: number;
  /** Words (exact match) rendered in the primary colour. */
  highlight?: string[];
}) {
  const reduce = useReducedMotion();
  const words = text.split(" ");
  return (
    <Tag className={className} aria-label={text}>
      {words.map((w, i) => {
        const hl = highlight?.includes(w.replace(/[^\w$+%]/g, ""));
        return (
          <motion.span
            key={i}
            aria-hidden
            className={hl ? "inline-block text-primary" : "inline-block"}
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay: delay + i * 0.04 }}
          >
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        );
      })}
    </Tag>
  );
}
