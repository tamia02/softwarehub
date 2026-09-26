"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ToolLogo } from "@/components/brand/ToolLogo";
import { Tilt } from "@/components/motion/Tilt";
import { Stagger, StaggerItem } from "@/components/motion/Reveal";
import { formatINR } from "@/lib/format";
import type { MarketProduct } from "@/lib/marketplace.server";

const pillSpring = { type: "spring", stiffness: 420, damping: 34 } as const;

export function MarketGrid({ products, categories }: { products: MarketProduct[]; categories: string[] }) {
  const [cat, setCat] = useState("All");
  const shown = cat === "All" ? products : products.filter((p) => p.category === cat);

  return (
    <div id="products" className="scroll-mt-24">
      <div className="flex flex-wrap gap-2">
        {["All", ...categories].map((c) => {
          const active = cat === c;
          return (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`relative rounded-full border-2 px-3.5 py-1.5 text-[13px] font-bold transition-colors ${
                active ? "border-ink-line text-on-accent" : "border-line-strong bg-bg-card text-ink hover:border-ink/40"
              }`}
            >
              {active && (
                <motion.span
                  layoutId="mkt-cat-pill"
                  className="absolute inset-0 -z-0 rounded-full bg-accent"
                  transition={pillSpring}
                />
              )}
              <span className="relative z-10">{c}</span>
            </button>
          );
        })}
      </div>

      <Stagger key={cat} className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((p) => (
          <StaggerItem key={p.id} className="h-full">
            <Tilt className="group h-full rounded-[var(--r-card)] [transform-style:preserve-3d]">
              <Link
                href={`/market/${p.slug}`}
                className="relative flex h-full flex-col overflow-hidden rounded-[var(--r-card)] border-2 border-ink-line bg-bg-card p-4 shadow-[4px_4px_0_var(--offset-card)] transition-[box-shadow] duration-200 group-hover:shadow-[7px_7px_0_var(--offset-card)]"
              >
                <div className="flex items-start justify-between [transform:translateZ(28px)]">
                  <ToolLogo slug={p.slug} name={p.vendor} logoUrl={p.logoUrl} size={40} />
                  {p.badge && <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-on-accent">{p.badge}</span>}
                </div>
                <h3 className="t-card-title mt-3 text-[15px] leading-snug text-ink">{p.name}</h3>
                <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-ink-muted">{p.blurb}</p>
                <div className="mt-auto flex items-end justify-between pt-4 [transform:translateZ(18px)]">
                  <span className="text-[20px] font-black text-ink">{formatINR(p.pricePaise)}</span>
                  <span className={`text-[11px] font-bold ${p.stock > 0 ? "text-ink-faint" : "text-rose-600"}`}>
                    {p.stock > 0 ? `${p.stock} in stock` : "Sold out"}
                  </span>
                </div>
              </Link>
            </Tilt>
          </StaggerItem>
        ))}
      </Stagger>
    </div>
  );
}
