"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { CountUp } from "@/components/motion/CountUp";
import { FadeUp } from "@/components/motion/FadeUp";
import { settings } from "@/config/site";
import type { TierSlug } from "@/data/tiers";
import type { TierPricing } from "@/lib/pricing";
import { formatINR, formatINRNumber, formatUSD } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CatalogTool } from "./ToolCard";

/** Espresso panel with three outlined count-up stats, tier toggle, expandable comparison and the guarantee card. */
export function Savings({ pricing, tools }: { pricing: Record<TierSlug, TierPricing>; tools: CatalogTool[] }) {
  const [tier, setTier] = useState<TierSlug>("pro");
  const [expanded, setExpanded] = useState(false);
  const p = pricing[tier];
  const rows = tier === "pro" ? tools : tools.filter((t) => t.tierMin === "starter");

  return (
    <section id="savings" className="scroll-mt-24 py-3 md:py-4">
      <div className="panel border-2 border-ink-line bg-bg-dark text-[#fffbeb]">
        <div className="panel-inner">
          <FadeUp className="mx-auto max-w-2xl text-center">
            <h2 className="t-h2 text-[#fffbeb]">What the same plans cost separately</h2>
            <p className="mt-4 text-[16px] leading-[1.4] text-[#fffbeb]/75 md:text-[20px]">
              Retail is each vendor&apos;s own list price, converted at ₹{settings.usdInrRate} to the dollar. Your price is the pass.
            </p>
          </FadeUp>

          <div className="mt-6 flex justify-center md:mt-8">
            <div role="tablist" className="relative inline-flex rounded-[100px] border-2 border-[#fffbeb]/30 p-1">
              {(["starter", "pro"] as TierSlug[]).map((t) => (
                <button key={t} role="tab" aria-selected={tier === t} onClick={() => setTier(t)} className={cn("relative h-10 cursor-pointer rounded-[100px] px-5 text-[16px] font-bold leading-none transition-colors", tier === t ? "text-ink-line" : "text-[#fffbeb]/80 hover:text-[#fffbeb]")}>
                  {tier === t && <motion.span layoutId="savings-toggle" className="absolute inset-0 rounded-[100px] bg-accent" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
                  <span className="relative">{pricing[t].name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:mt-10 md:grid-cols-3">
            <Stat label="Retail value" sub={`${p.toolCount} tools · ${formatUSD(p.retailUsd)}`} value={p.retailPaise} />
            <Stat label="Your price" sub="one activation code" value={p.pricePaise} accent />
            <Stat label="You save" sub={`${p.savingsPct.toFixed(1)}% off retail`} value={p.savingsPaise} />
          </div>

          <div className="mt-8 text-center">
            <button onClick={() => setExpanded((v) => !v)} aria-expanded={expanded} className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-[100px] border-2 border-[#fffbeb]/40 px-5 text-[16px] font-bold text-[#fffbeb] hover:bg-white/10">
              {expanded ? "Hide" : "Show"} the per-tool comparison
              <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
                <ChevronDown size={16} />
              </motion.span>
            </button>
          </div>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div key="table" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                <div className="mt-6 max-h-[520px] overflow-auto rounded-[22px] border-2 border-[#fffbeb]/20">
                  <table className="w-full min-w-[560px] text-left text-[15px]">
                    <thead className="sticky top-0 bg-[#3d2212] text-[12px] font-bold uppercase tracking-wider text-[#fffbeb]/70">
                      <tr>
                        <th className="px-4 py-3">Tool</th>
                        <th className="px-4 py-3">Offer</th>
                        <th className="px-4 py-3 text-right">Retail (USD)</th>
                        <th className="px-4 py-3 text-right">Retail (INR)</th>
                        <th className="px-4 py-3 text-right">With pass</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((t, i) => (
                        <tr key={t.slug} className={i % 2 ? "bg-white/[0.04]" : ""}>
                          <td className="px-4 py-2.5 font-bold">{t.name}</td>
                          <td className="px-4 py-2.5 text-[#fffbeb]/75">{t.offerTitle}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-[#fffbeb]/75">{formatUSD(t.valueUsd)}</td>
                          <td className="px-4 py-2.5 text-right tabular-nums text-[#fffbeb]/75">{formatINR(t.retailPaise)}</td>
                          <td className="px-4 py-2.5 text-right font-bold text-accent">Included</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="sticky bottom-0 bg-[#3d2212] font-bold">
                      <tr>
                        <td className="px-4 py-3" colSpan={2}>
                          Total ({rows.length} tools)
                        </td>
                        <td className="px-4 py-3 text-right tabular-nums">{formatUSD(p.retailUsd)}</td>
                        <td className="px-4 py-3 text-right tabular-nums">{formatINR(p.retailPaise)}</td>
                        <td className="px-4 py-3 text-right tabular-nums text-accent">{formatINR(p.pricePaise)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <FadeUp className="mx-auto mt-10 flex max-w-3xl flex-col items-start gap-5 rounded-[22px] border-2 border-[#fffbeb]/25 bg-white/5 p-6 md:mt-12 md:flex-row md:items-center md:p-7">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border-2 border-ink-line bg-accent text-ink-line">
              <ShieldCheck size={26} />
            </span>
            <div className="flex-1">
              <h3 className="text-[22px] font-bold leading-none text-[#fffbeb] md:text-[24px]">Code Works Guarantee</h3>
              <p className="mt-2 text-[16px] leading-[1.4] text-[#fffbeb]/75">
                If any code fails to activate we issue a replacement — or refund that tool&apos;s share — within {settings.guaranteeDays} days. One click from My Pass.
              </p>
            </div>
            <Link href="/refund-policy" className="shrink-0 text-[16px] font-bold text-accent hover:underline">
              Read the policy →
            </Link>
          </FadeUp>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, sub, value, accent }: { label: string; sub: string; value: number; accent?: boolean }) {
  return (
    <FadeUp className={cn("rounded-[22px] border-2 p-6 md:p-7", accent ? "border-ink-line bg-accent text-ink-line" : "border-[#fffbeb]/25 bg-white/5")}>
      <p className={cn("text-[13px] font-bold uppercase tracking-wider", accent ? "text-ink-line/70" : "text-[#fffbeb]/60")}>{label}</p>
      <p className="mt-2 text-[36px] font-bold leading-none tabular-nums md:text-[44px]">
        ₹<CountUp value={value} format={(n) => formatINRNumber(n)} />
      </p>
      <p className={cn("mt-2 text-[15px]", accent ? "text-ink-line/70" : "text-[#fffbeb]/60")}>{sub}</p>
    </FadeUp>
  );
}
