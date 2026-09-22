"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CountUp } from "@/components/motion/CountUp";
import { FadeUp } from "@/components/motion/FadeUp";
import { Section } from "@/components/ui/Section";
import { settings } from "@/config/site";
import type { TierSlug } from "@/data/tiers";
import type { TierPricing } from "@/lib/pricing";
import { formatINRNumber, formatUSD } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CatalogTool } from "./ToolCard";

/** Three plain figures and one sentence. No dark band, no table. */
export function Savings({ pricing }: { pricing: Record<TierSlug, TierPricing>; tools: CatalogTool[] }) {
  const [tier, setTier] = useState<TierSlug>("pro");
  const p = pricing[tier];
  return (
    <Section id="savings" className="py-14 md:py-20">
      <FadeUp className="mx-auto max-w-2xl text-center">
        <h2 className="t-h2 text-ink-line">What the same plans cost separately</h2>
        <p className="mt-3 text-[16px] leading-[1.45] text-ink-muted md:text-[18px]">
          Each vendor&apos;s own list price, converted at ₹{settings.usdInrRate} to the dollar.
        </p>
      </FadeUp>

      <div className="mt-6 flex justify-center">
        <div role="tablist" className="relative inline-flex rounded-[100px] border-2 border-ink-line bg-white p-1">
          {(["starter", "pro"] as TierSlug[]).map((t) => (
            <button key={t} role="tab" aria-selected={tier === t} onClick={() => setTier(t)} className={cn("relative h-9 cursor-pointer rounded-[100px] px-4 text-[15px] font-bold leading-none transition-colors", tier === t ? "text-[#fffbeb]" : "text-ink-line")}>
              {tier === t && <motion.span layoutId="savings-toggle" className="absolute inset-0 rounded-[100px] bg-primary" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
              <span className="relative">{pricing[t].name}</span>
            </button>
          ))}
        </div>
      </div>

      <dl className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-8 text-center sm:grid-cols-3 md:mt-12">
        <Stat label="Retail value" sub={`${p.toolCount} tools · ${formatUSD(p.retailUsd)}`} value={p.retailPaise} />
        <Stat label="Your price" sub="one activation code" value={p.pricePaise} accent />
        <Stat label="You save" sub={`${p.savingsPct.toFixed(1)}% off retail`} value={p.savingsPaise} />
      </dl>

      <p className="mx-auto mt-10 max-w-xl text-center text-[15px] leading-[1.45] text-ink-muted md:mt-12">
        Every code is covered by the Code Works Guarantee — a replacement or refund within {settings.guaranteeDays} days if it fails to activate.{" "}
        <Link href="/refund-policy" className="font-bold text-accent-2 hover:underline">
          Read the policy
        </Link>
      </p>
    </Section>
  );
}

function Stat({ label, sub, value, accent }: { label: string; sub: string; value: number; accent?: boolean }) {
  return (
    <FadeUp>
      <dt className="text-[13px] font-bold uppercase tracking-wider text-ink-faint">{label}</dt>
      <dd className={cn("mt-2 text-[34px] font-bold leading-none tabular-nums md:text-[40px]", accent ? "text-accent-2" : "text-ink-line")}>
        ₹<CountUp value={value} format={(n) => formatINRNumber(n)} />
      </dd>
      <dd className="mt-2 text-[15px] text-ink-muted">{sub}</dd>
    </FadeUp>
  );
}
