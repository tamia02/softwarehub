"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StaggerWords } from "@/components/motion/StaggerWords";
import { HeroIllustration } from "./HeroIllustration";
import { formatUSD } from "@/lib/format";

export function Hero({ retailUsd, toolCount }: { retailUsd: number; toolCount: number }) {
  const reduce = useReducedMotion();
  const worth = `${formatUSD(Math.floor(retailUsd / 1000) * 1000)}+`;
  const fade = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const, delay },
  });

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(70%_60%_at_80%_0%,rgba(0,87,255,0.10),transparent_60%)]" />
      <div className="container-page grid items-center gap-12 pb-14 pt-10 md:grid-cols-[1.1fr_1fr] md:pb-24 md:pt-16">
        <div className="max-w-xl">
          <motion.p
            {...fade(0)}
            className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] font-semibold text-ink-muted shadow-sm"
          >
            <Sparkles size={14} className="text-accent" />
            {toolCount} tools · 1 activation code · 1 year
          </motion.p>

          <StaggerWords
            as="h1"
            delay={0.1}
            text={`${toolCount} premium AI and product tools for a year — worth ${worth}`}
            highlight={[worth]}
            className="mt-5 text-balance text-[36px] font-black leading-[1.15] md:text-[56px] md:leading-[1.12]"
          />

          <motion.p {...fade(0.55)} className="mt-6 text-lg text-ink-muted">
            One activation code unlocks the stack that top product teams run on. Buy the whole bundle, or join a
            pool of 10 and pay a tenth of the price.
          </motion.p>

          <motion.p {...fade(0.65)} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-rose-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
            </span>
            Codes are limited — allocated per vendor, first come first served.
          </motion.p>

          <motion.div {...fade(0.75)} className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button href="/checkout/direct?tier=pro" size="lg">
              Get Pro Pass <ArrowRight size={18} />
            </Button>
            <Button href="#tools" variant="secondary" size="lg">
              See all {toolCount} tools
            </Button>
          </motion.div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
        >
          <HeroIllustration />
        </motion.div>
      </div>
    </section>
  );
}
