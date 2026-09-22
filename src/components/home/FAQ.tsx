"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { FadeUp } from "@/components/motion/FadeUp";
import { Section } from "@/components/ui/Section";
import type { FaqItem } from "@/data/faq";
import { cn } from "@/lib/utils";

/** "Questions?" — 28→64px heading, outlined accordion rows, one open at a time. */
export function FAQ({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number>(0);
  return (
    <Section id="faq" className="py-16 md:py-24">
      <div className="mx-auto max-w-[720px] text-center lg:max-w-[880px]">
        <h2 className="text-[28px] font-bold leading-none text-ink-line sm:text-[40px] md:text-[48px] xl:text-[64px]">Questions?</h2>
      </div>
      <div className="mx-auto mt-8 max-w-[880px] overflow-hidden rounded-[22px] border-2 border-ink-line bg-white md:mt-12 lg:rounded-[30px]">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <FadeUp key={item.q} index={Math.min(i, 5)} className={cn("px-5 md:px-7", i > 0 && "border-t-2 border-ink-line")}>
              <h3>
                <button onClick={() => setOpen(isOpen ? -1 : i)} aria-expanded={isOpen} aria-controls={`faq-panel-${i}`} id={`faq-btn-${i}`} className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left text-[18px] font-bold leading-[1.2] text-ink-line hover:text-accent-2 md:text-[20px]">
                  {item.q}
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }} className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-ink-line", isOpen ? "bg-accent" : "bg-white")}>
                    <ChevronDown size={18} />
                  </motion.span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div id={`faq-panel-${i}`} role="region" aria-labelledby={`faq-btn-${i}`} key="panel" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                    <p className="pb-6 pr-12 text-[16px] leading-[1.45] text-ink-muted">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </FadeUp>
          );
        })}
      </div>
    </Section>
  );
}
