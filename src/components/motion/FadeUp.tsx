"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface FadeUpProps extends HTMLMotionProps<"div"> {
  /** Stagger index — multiplied by 0.06 s. */
  index?: number;
  delay?: number;
  y?: number;
  once?: boolean;
}

/** Fade + rise into view. Respects prefers-reduced-motion. */
export function FadeUp({ index = 0, delay = 0, y = 24, once = true, className, children, ...rest }: FadeUpProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: delay + index * 0.06 }}
      className={cn(className)}
      data-motion=""
      {...rest}
    >
      {children}
    </motion.div>
  );
}
