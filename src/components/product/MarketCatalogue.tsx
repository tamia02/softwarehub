"use client";

import { useState } from "react";
import { marketCategories, marketListings, marketStats } from "@/data/market";
import { formatINR } from "@/lib/format";

const rankTone: Record<string, string> = {
  Legendary: "bg-accent text-on-accent",
  Epic: "bg-primary-soft text-primary",
  Rare: "bg-bg-soft text-ink",
  Uncommon: "bg-bg-soft text-ink-muted",
  Common: "bg-bg-soft text-ink-muted",
  Normal: "bg-bg-soft text-ink-faint",
};

export function MarketCatalogue() {
  const [cat, setCat] = useState("all");
  const listings = cat === "all" ? marketListings : marketListings.filter((l) => l.category === cat);

  return (
    <section id="categories" className="container-page scroll-mt-24 py-10 md:py-14">
      <h2 className="t-h2 text-ink">Browse the market</h2>
      <p className="mt-2 text-[15px] text-ink-muted">
        {marketStats.listings} listings · {marketStats.categories} categories · {marketStats.sellers} verified sellers
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <button
          onClick={() => setCat("all")}
          className={`rounded-full border-2 px-3.5 py-1.5 text-[13px] font-bold ${cat === "all" ? "border-ink-line bg-accent text-on-accent" : "border-line-strong bg-bg-card text-ink hover:border-ink/40"}`}
        >
          All
        </button>
        {marketCategories.map((c) => (
          <button
            key={c.key}
            onClick={() => setCat(c.key)}
            className={`rounded-full border-2 px-3.5 py-1.5 text-[13px] font-bold ${cat === c.key ? "border-ink-line bg-accent text-on-accent" : "border-line-strong bg-bg-card text-ink hover:border-ink/40"}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {listings.map((l) => (
          <div key={l.id} className="flex flex-col rounded-[var(--r-card)] border-2 border-ink-line bg-bg-card p-4 shadow-[4px_4px_0_var(--offset-card)]">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-bg-soft px-2.5 py-0.5 text-[11px] font-bold text-ink-muted">{l.brand}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${rankTone[l.sellerRank]}`}>{l.sellerRank}</span>
            </div>
            <h3 className="t-card-title mt-3 text-[15px] leading-snug text-ink">{l.title}</h3>
            <p className="mt-1 text-[12px] text-ink-faint">
              {l.seller} · {l.rating}% · {l.sold.toLocaleString("en-IN")} sold
            </p>
            <p className="mt-1 text-[12px] font-medium text-ink-muted">{l.delivery}</p>
            <div className="mt-4 flex items-end justify-between">
              <span className="text-[13px] text-ink-faint">
                from <span className="text-[18px] font-black text-ink">{formatINR(l.fromInr * 100)}</span>
              </span>
              <a href="/login" className="rounded-full border-2 border-ink-line bg-accent px-3.5 py-1.5 text-[12px] font-bold text-on-accent hover:brightness-105">
                Buy
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
