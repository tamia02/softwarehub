"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Users } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FadeUp } from "@/components/motion/FadeUp";
import { NumberFlip } from "@/components/motion/NumberFlip";
import { Section, SectionHeading } from "@/components/ui/Section";
import { settings } from "@/config/site";
import { tierList, type TierSlug } from "@/data/tiers";
import type { TierPricing } from "@/lib/pricing";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

type Mode = "bundle" | "pool";

export function Pricing({ pricing }: { pricing: Record<TierSlug, TierPricing> }) {
  const [mode, setMode] = useState<Mode>("bundle");

  return (
    <Section id="pricing">
      <SectionHeading
        eyebrow="Pricing"
        title={
          <>
            Two passes. <em className="font-normal italic text-primary">Two ways to pay.</em>
          </>
        }
        sub="Buy a pass and the activation code arrives immediately. Or open a pool, share the link, and each seat pays a tenth."
      />

      {/* Segmented toggle */}
      <div className="mt-8 flex justify-center">
        <div role="tablist" aria-label="Purchase mode" className="relative inline-flex rounded-full border-2 border-line-strong bg-white p-1 shadow-sm">
          {(
            [
              { id: "bundle", label: "Buy whole bundle" },
              { id: "pool", label: `Join a pool of ${settings.poolSeatsDefault}` },
            ] as { id: Mode; label: string }[]
          ).map((m) => (
            <button
              key={m.id}
              role="tab"
              aria-selected={mode === m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                "relative cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold transition-colors",
                mode === m.id ? "text-[#fbf6ec]" : "text-ink-muted hover:text-ink",
              )}
            >
              {mode === m.id && (
                <motion.span layoutId="pricing-mode" className="absolute inset-0 rounded-full bg-primary" transition={{ type: "spring", stiffness: 400, damping: 34 }} />
              )}
              <span className="relative">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-4xl items-stretch gap-6 md:grid-cols-2">
        {tierList.map((tier, i) => {
          const p = pricing[tier.slug];
          const price = mode === "bundle" ? p.pricePaise : p.seatPricePaise;
          const href = mode === "bundle" ? `/checkout/direct?tier=${tier.slug}` : `/checkout/pool?tier=${tier.slug}`;
          return (
            <FadeUp
              key={tier.slug}
              index={i}
              className={cn(
                "relative flex flex-col rounded-[24px] border bg-white p-7 md:p-8",
                tier.bestValue
                  ? "border-primary/60 shadow-[0_24px_64px_rgba(138,59,10,0.16)] md:-translate-y-3"
                  : "border-line-strong shadow-[var(--shadow-card)]",
              )}
            >
              {tier.bestValue && (
                <span className="font-mono-label absolute -top-3 right-6 rounded-full bg-primary px-3 py-1.5 text-[#fbf6ec] shadow-md">
                  Best value
                </span>
              )}
              <h3 className="font-display text-[28px] font-medium">{tier.name}</h3>
              <p className="mt-1 text-sm text-ink-muted">{tier.headline}</p>

              <div className="mt-6 flex items-end gap-1.5">
                <span className="font-display text-[48px] leading-none tabular-nums text-ink">
                  <NumberFlip value={formatINR(price)} />
                </span>
                <span className="pb-1 text-sm font-semibold text-ink-muted">{mode === "bundle" ? "/year" : "/seat"}</span>
              </div>
              <p className="mt-2 text-sm text-ink-muted">
                {mode === "bundle" ? (
                  <>
                    or <strong className="text-ink">{formatINR(p.seatPricePaise)}</strong> in a pool of {p.seats}
                  </>
                ) : (
                  <>
                    {p.seats} seats × {formatINR(p.seatPricePaise)} = <strong className="text-ink">{formatINR(p.pricePaise)}</strong>{" "}
                    bundle
                  </>
                )}
              </p>

              <ul className="mt-6 space-y-3 text-[15px]">
                {tier.benefits.map((b) => (
                  <li key={b} className="flex items-start gap-2.5">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    {b}
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <Button href={href} size="lg" variant={tier.bestValue ? "primary" : "dark"} className="w-full">
                  {mode === "bundle" ? tier.cta : `Join a ${tier.name} pool`} <ArrowRight size={18} />
                </Button>
              </div>
            </FadeUp>
          );
        })}
      </div>

      {/* Teams strip */}
      <FadeUp className="mx-auto mt-10 flex max-w-4xl flex-col items-center justify-between gap-4 rounded-[20px] border border-line-strong bg-white px-6 py-5 sm:flex-row">
        <div className="flex items-center gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary">
            <Users size={22} />
          </span>
          <p className="font-semibold">
            Equipping a team of {settings.teamMinSeats} or more?{" "}
            <span className="font-normal text-ink-muted">Volume pricing takes {settings.teamDiscountPct}% off every seat.</span>
          </p>
        </div>
        <Button href="/contact?topic=teams" variant="secondary">
          Talk to us
        </Button>
      </FadeUp>
    </Section>
  );
}
