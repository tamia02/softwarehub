"use client";

import { useState } from "react";
import Link from "next/link";
import { ToolLogo } from "@/components/brand/ToolLogo";
import { formatINR } from "@/lib/format";
import type { MarketProduct } from "@/lib/marketplace.server";

export function MarketGrid({ products, categories }: { products: MarketProduct[]; categories: string[] }) {
  const [cat, setCat] = useState("All");
  const shown = cat === "All" ? products : products.filter((p) => p.category === cat);

  return (
    <div id="products" className="scroll-mt-24">
      <div className="flex flex-wrap gap-2">
        {["All", ...categories].map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full border-2 px-3.5 py-1.5 text-[13px] font-bold transition-colors ${
              cat === c ? "border-ink-line bg-accent text-on-accent" : "border-line-strong bg-bg-card text-ink hover:border-ink/40"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {shown.map((p) => (
          <Link
            key={p.id}
            href={`/market/${p.slug}`}
            className="flex flex-col rounded-[var(--r-card)] border-2 border-ink-line bg-bg-card p-4 shadow-[4px_4px_0_var(--offset-card)] transition-transform hover:-translate-y-0.5"
          >
            <div className="flex items-start justify-between">
              <ToolLogo slug={p.slug} name={p.vendor} size={40} />
              {p.badge && <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-on-accent">{p.badge}</span>}
            </div>
            <h3 className="t-card-title mt-3 text-[15px] leading-snug text-ink">{p.name}</h3>
            <p className="mt-1 line-clamp-2 text-[12px] leading-snug text-ink-muted">{p.blurb}</p>
            <div className="mt-auto flex items-end justify-between pt-4">
              <span className="text-[20px] font-black text-ink">{formatINR(p.pricePaise)}</span>
              <span className={`text-[11px] font-bold ${p.stock > 0 ? "text-ink-faint" : "text-rose-600"}`}>
                {p.stock > 0 ? `${p.stock} in stock` : "Sold out"}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
