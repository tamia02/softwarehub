"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card3D } from "@/components/ui/Card3D";
import { FadeUp } from "@/components/motion/FadeUp";
import { NumberFlip } from "@/components/motion/NumberFlip";
import { Hand, Section } from "@/components/ui/Section";
import { settings } from "@/config/site";
import { tierList, type TierSlug } from "@/data/tiers";
import type { TierPricing } from "@/lib/pricing";
import { formatINR, formatUSDFromPaise } from "@/lib/format";
import { cn } from "@/lib/utils";

type Mode = "bundle" | "pool";

/**
 * Pricing, measured: centred 32→48px heading, hand-script line, two outlined
 * plan cards (name 36px bold, price 52px regular, features 16px, pill CTA),
 * then the teams strip.
 */
export function Pricing({ pricing }: { pricing: Record<TierSlug, TierPricing> }) {
  const [mode, setMode] = useState<Mode>("bundle");

  return (
    <Section id="pricing" className="py-16 md:py-24">
      <div className="mx-auto flex w-full max-w-[1024px] flex-col items-center gap-[18px] text-center md:gap-[24px]">
        <h2 className="max-w-[296px] text-[32px] font-bold leading-[0.92] tracking-[-0.02em] text-ink sm:max-w-[620px] sm:text-[44px] md:max-w-[760px] md:text-[48px] lg:max-w-[940px] lg:text-[56px]">
          Unlock a year of premium tools
        </h2>
        <Hand>One code. Every plan. Twelve months.</Hand>

        <div role="tablist" aria-label="Purchase mode" className="relative mt-2 inline-flex rounded-[100px] border-2 border-ink-line bg-bg-card p-1">
          {(
            [
              { id: "bundle", label: "Buy a pass" },
              { id: "pool", label: `Join a pool of ${settings.poolSeatsDefault}` },
            ] as { id: Mode; label: string }[]
          ).map((m) => (
            <button key={m.id} role="tab" aria-selected={mode === m.id} onClick={() => setMode(m.id)} className={cn("relative h-10 cursor-pointer rounded-[100px] px-5 text-[16px] font-bold leading-none transition-colors", mode === m.id ? "text-on-primary" : "text-ink")}>
              {mode === m.id && <motion.span layoutId="pricing-mode" className="absolute inset-0 rounded-[100px] bg-primary" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
              <span className="relative">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-10 grid max-w-[900px] items-stretch gap-8 md:mt-14 md:grid-cols-2">
        {tierList.map((tier, i) => {
          const p = pricing[tier.slug];
          const price = mode === "bundle" ? p.pricePaise : p.seatPricePaise;
          const href = mode === "bundle" ? `/checkout/direct?tier=${tier.slug}` : `/checkout/pool?tier=${tier.slug}`;
          return (
            <FadeUp key={tier.slug} index={i} className="h-full">
              <Card3D className="h-full" bodyClassName={cn("relative flex h-full flex-col p-7 md:p-8", tier.bestValue && "bg-accent-soft")}>
                {tier.bestValue && (
                  <span className="font-hand absolute -top-4 right-6 rotate-[-4deg] rounded-[100px] border-2 border-ink-line bg-accent px-3 py-0.5 text-[22px] leading-none text-on-accent">Best value</span>
                )}
                <p className="text-[32px] font-bold leading-none text-ink md:text-[36px]">{tier.name}</p>
                <p className="mt-2 text-[16px] leading-[1.4] text-ink-muted">{tier.headline}</p>

                <div className="mt-5 flex items-end gap-1.5">
                  <span className="t-price text-ink">
                    <NumberFlip value={formatINR(price)} />
                  </span>
                  <span className="pb-2 text-[17px] leading-none text-ink-muted">{mode === "bundle" ? "/year" : "/seat"}</span>
                </div>
                <p className="mt-1 text-[15px] font-medium text-ink-faint">{formatUSDFromPaise(price, p.usdInrRate)} at ₹{p.usdInrRate}/USD</p>
                <p className="mt-1 text-[16px] text-ink-muted">
                  {mode === "bundle" ? (
                    <>
                      or <strong className="text-ink">{formatINR(p.seatPricePaise)}</strong> a seat in a pool of {p.seats}
                    </>
                  ) : (
                    <>
                      {p.seats} seats × {formatINR(p.seatPricePaise)} = <strong className="text-ink">{formatINR(p.pricePaise)}</strong>
                    </>
                  )}
                </p>

                <ul className="mt-6 space-y-3">
                  {tier.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2.5 text-[16px] leading-[1.1] text-ink">
                      <span className="mt-[1px] grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 border-ink-line bg-accent">
                        <Check size={11} strokeWidth={3.5} />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Button href={href} size="md" variant={tier.bestValue ? "primary" : "secondary"} className="w-full">
                    {mode === "bundle" ? tier.cta : `Join a ${tier.name} pool`}
                  </Button>
                </div>
              </Card3D>
            </FadeUp>
          );
        })}
      </div>

      <FadeUp className="mx-auto mt-12 flex max-w-[900px] flex-col items-center justify-between gap-5 rounded-[22px] border-2 border-ink-line bg-bg-card px-6 py-6 text-center md:mt-16 md:flex-row md:text-left">
        <div>
          <h3 className="text-[24px] font-bold leading-none text-ink md:text-[28px]">Plans for teams</h3>
          <p className="mt-1.5 text-[16px] text-ink-muted">
            Buying for {settings.teamMinSeats} or more people? Save {settings.teamDiscountPct}% on every seat.
          </p>
        </div>
        <Button href="/contact?topic=teams" variant="secondary" size="md">
          Get a team plan
        </Button>
      </FadeUp>
    </Section>
  );
}
