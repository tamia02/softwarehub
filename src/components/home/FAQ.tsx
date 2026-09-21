"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { FadeUp } from "@/components/motion/FadeUp";
import { Section, SectionHeading } from "@/components/ui/Section";
import type { FaqItem } from "@/data/faq";
import { cn } from "@/lib/utils";

export function FAQ({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number>(0);

  return (
    <Section id="faq" className="bg-bg-soft">
      <SectionHeading eyebrow="FAQ" title="Questions, answered." sub="Still unsure? Email us and a human will reply." />
      <div className="mx-auto mt-10 max-w-3xl divide-y divide-line rounded-[24px] border border-line bg-white">
        {items.map((item, i) => {
          const isOpen = open === i;
          return (
            <FadeUp key={item.q} index={Math.min(i, 5)} className="px-5 sm:px-7">
              <h3>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  id={`faq-btn-${i}`}
                  className="flex w-full items-center justify-between gap-4 py-5 text-left text-[17px] font-bold hover:text-primary"
                >
                  {item.q}
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-full", isOpen ? "bg-primary text-white" : "bg-bg-soft text-ink-muted")}
                  >
                    <ChevronDown size={18} />
                  </motion.span>
                </button>
              </h3>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-btn-${i}`}
                    key="panel"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 pr-12 text-[15px] leading-relaxed text-ink-muted">{item.a}</p>
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
