"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ShieldCheck } from "lucide-react";
import { CountUp } from "@/components/motion/CountUp";
import { FadeUp } from "@/components/motion/FadeUp";
import { Section } from "@/components/ui/Section";
import { settings } from "@/config/site";
import type { TierSlug } from "@/data/tiers";
import type { TierPricing } from "@/lib/pricing";
import { formatINR, formatINRNumber, formatUSD } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CatalogTool } from "./ToolCard";

export function Savings({
  pricing,
  tools,
}: {
  pricing: Record<TierSlug, TierPricing>;
  tools: CatalogTool[];
}) {
  const [tier, setTier] = useState<TierSlug>("pro");
  const [expanded, setExpanded] = useState(false);
  const p = pricing[tier];
  const rows = tier === "pro" ? tools : tools.filter((t) => t.tierMin === "starter");

  return (
    <Section id="savings" className="relative overflow-hidden bg-bg-dark text-[#fff8e8]" innerClassName="relative">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_45%_at_50%_0%,rgba(245,158,11,0.28),transparent_70%)]" />

      <FadeUp className="mx-auto max-w-2xl text-center">
        <p className="mb-3 font-display text-[12px] font-semibold uppercase tracking-[0.22em] text-accent">The math</p>
        <h2 className="text-balance text-[34px] font-bold leading-[1.08] md:text-[44px]">
          Pay a fraction. <span className="text-accent">Keep everything.</span>
        </h2>
        <p className="mt-4 text-lg text-white/70">
          Retail is what these plans cost if you bought each one directly, converted at ₹{settings.usdInrRate}/USD.
        </p>
      </FadeUp>

      {/* Tier toggle */}
      <div className="mt-8 flex justify-center">
        <div role="tablist" className="relative inline-flex rounded-full bg-white/10 p-1">
          {(["starter", "pro"] as TierSlug[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tier === t}
              onClick={() => setTier(t)}
              className={cn(
                "relative rounded-full px-5 py-2 font-display text-sm font-semibold transition-colors",
                tier === t ? "text-ink" : "text-white/70 hover:text-white",
              )}
            >
              {tier === t && (
                <motion.span layoutId="savings-toggle" className="absolute inset-0 rounded-full bg-accent" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
              )}
              <span className="relative">{pricing[t].name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <Stat label="Retail value" sub={`${p.toolCount} tools · ${formatUSD(p.retailUsd)}`} value={p.retailPaise} />
        <Stat label="Your price" sub="one activation code" value={p.pricePaise} accent />
        <Stat label="You save" sub={`${p.savingsPct.toFixed(1)}% off retail`} value={p.savingsPaise} />
      </div>

      {/* Expand table */}
      <div className="mt-8 text-center">
        <button
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 font-display text-sm font-semibold text-white hover:bg-white/10"
        >
          {expanded ? "Hide" : "Show"} per-tool comparison
          <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.25 }}>
            <ChevronDown size={16} />
          </motion.span>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="table"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="mt-6 max-h-[520px] overflow-auto rounded-2xl border border-white/10">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead className="sticky top-0 bg-[#3b1d0c] text-xs uppercase tracking-wider text-white/60">
                  <tr>
                    <th className="px-4 py-3 font-bold">Tool</th>
                    <th className="px-4 py-3 font-bold">Offer</th>
                    <th className="px-4 py-3 text-right font-bold">Retail (USD)</th>
                    <th className="px-4 py-3 text-right font-bold">Retail (INR)</th>
                    <th className="px-4 py-3 text-right font-bold">With pass</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((t, i) => (
                    <tr key={t.slug} className={i % 2 ? "bg-white/[0.03]" : ""}>
                      <td className="px-4 py-2.5 font-semibold">{t.name}</td>
                      <td className="px-4 py-2.5 text-white/70">{t.offerTitle}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-white/70">{formatUSD(t.valueUsd)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-white/70">{formatINR(t.retailPaise)}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-accent">Included</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="sticky bottom-0 bg-[#3b1d0c] font-bold">
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

      {/* Guarantee */}
      <FadeUp className="mx-auto mt-12 flex max-w-3xl flex-col items-start gap-5 rounded-[24px] border border-white/10 bg-white/5 p-6 sm:flex-row sm:items-center sm:p-8">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-accent text-ink">
          <ShieldCheck size={28} />
        </span>
        <div className="flex-1">
          <h3 className="text-xl font-semibold">Code Works Guarantee</h3>
          <p className="mt-1 text-white/70">
            If a code doesn’t activate, we replace it or refund you within {settings.guaranteeDays} days. No forms, no
            arguing.
          </p>
        </div>
        <Link href="/refund-policy" className="shrink-0 font-display text-sm font-semibold text-accent hover:underline">
          Read the policy →
        </Link>
      </FadeUp>
    </Section>
  );
}

function Stat({ label, sub, value, accent }: { label: string; sub: string; value: number; accent?: boolean }) {
  return (
    <FadeUp className={cn("rounded-[24px] border border-white/10 p-6 md:p-8", accent ? "bg-accent text-ink" : "bg-white/5")}>
      <p className={cn("font-display text-[12px] font-semibold uppercase tracking-[0.18em]", accent ? "text-ink/70" : "text-white/60")}>{label}</p>
      <p className="mt-3 font-display text-[36px] font-bold leading-none tabular-nums md:text-[44px]">
        ₹<CountUp value={value} format={(n) => formatINRNumber(n)} />
      </p>
      <p className={cn("mt-2 text-sm", accent ? "text-ink/70" : "text-white/60")}>{sub}</p>
    </FadeUp>
  );
}
