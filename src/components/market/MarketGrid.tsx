"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock, Search, ShieldCheck, SlidersHorizontal, Zap } from "lucide-react";
import { ToolLogo } from "@/components/brand/ToolLogo";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { MarketProduct } from "@/lib/marketplace.server";

type Sort = "recommended" | "price-asc" | "price-desc";

/**
 * Marketplace listing: category sidebar (pills on mobile), search, sort and an
 * in-stock toggle over a dense product grid. `initialCat` / `initialQ` come from
 * the URL (header search + category strip link here).
 */
export function MarketGrid({
  products,
  categories,
  initialCat = "All",
  initialQ = "",
}: {
  products: MarketProduct[];
  categories: string[];
  initialCat?: string;
  initialQ?: string;
}) {
  const [cat, setCat] = useState(categories.includes(initialCat) ? initialCat : "All");
  const [q, setQ] = useState(initialQ);
  const [sort, setSort] = useState<Sort>("recommended");
  const [inStock, setInStock] = useState(false);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) m.set(p.category, (m.get(p.category) ?? 0) + 1);
    return m;
  }, [products]);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    const list = products.filter(
      (p) =>
        (cat === "All" || p.category === cat) &&
        (!inStock || p.stock > 0) &&
        (!term || `${p.name} ${p.vendor} ${p.category} ${p.blurb}`.toLowerCase().includes(term)),
    );
    if (sort === "price-asc") list.sort((a, b) => a.pricePaise - b.pricePaise);
    if (sort === "price-desc") list.sort((a, b) => b.pricePaise - a.pricePaise);
    return list;
  }, [products, cat, q, sort, inStock]);

  const allCats = [{ name: "All", n: products.length }, ...categories.map((c) => ({ name: c, n: counts.get(c) ?? 0 }))];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:block">
        <div className="card sticky top-[132px] p-2">
          <p className="px-3 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-faint">Categories</p>
          {allCats.map((c) => (
            <button
              key={c.name}
              onClick={() => setCat(c.name)}
              className={cn(
                "flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-left text-[14px] transition-colors",
                cat === c.name ? "bg-accent-soft font-semibold text-accent-2" : "text-ink-muted hover:bg-bg hover:text-ink",
              )}
            >
              {c.name === "All" ? "All products" : c.name}
              <span className={cn("text-[12px] tabular-nums", cat === c.name ? "text-accent-2" : "text-ink-faint")}>{c.n}</span>
            </button>
          ))}
          <div className="mx-3 my-2 h-px bg-line" />
          <label className="flex cursor-pointer items-center justify-between rounded-[8px] px-3 py-2 text-[14px] text-ink-muted hover:bg-bg">
            In stock only
            <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="h-4 w-4 accent-[var(--brand-accent)]" />
          </label>
        </div>
      </aside>

      <div className="min-w-0">
        {/* Toolbar */}
        <div className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" aria-hidden />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Filter products…"
              aria-label="Filter products"
              className="h-10 w-full rounded-[8px] border border-line-strong bg-bg-card pl-9 pr-3 text-[14px] text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="flex h-10 cursor-pointer items-center gap-2 rounded-[8px] border border-line-strong px-3 text-[13px] text-ink-muted lg:hidden">
              <input type="checkbox" checked={inStock} onChange={(e) => setInStock(e.target.checked)} className="h-4 w-4 accent-[var(--brand-accent)]" />
              In stock
            </label>
            <div className="relative">
              <SlidersHorizontal size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" aria-hidden />
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                aria-label="Sort products"
                className="h-10 appearance-none rounded-[8px] border border-line-strong bg-bg-card pl-9 pr-8 text-[13px] font-medium text-ink focus:border-accent focus:outline-none"
              >
                <option value="recommended">Recommended</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category pills (mobile / tablet) */}
        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
          {allCats.map((c) => (
            <button
              key={c.name}
              onClick={() => setCat(c.name)}
              className={cn(
                "shrink-0 rounded-[8px] border px-3 py-1.5 text-[13px] font-medium transition-colors",
                cat === c.name ? "border-accent bg-accent-soft text-accent-2" : "border-line-strong bg-bg-card text-ink-muted",
              )}
            >
              {c.name === "All" ? "All" : c.name} <span className="text-ink-faint">{c.n}</span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-[13px] text-ink-faint">
          Showing <span className="font-semibold text-ink">{shown.length}</span> {shown.length === 1 ? "product" : "products"}
          {cat !== "All" && <> in <span className="font-semibold text-ink">{cat}</span></>}
          {q.trim() && <> for “<span className="font-semibold text-ink">{q.trim()}</span>”</>}
        </p>

        {shown.length === 0 ? (
          <div className="card mt-3 flex flex-col items-center gap-2 px-6 py-14 text-center">
            <Search size={22} className="text-ink-faint" />
            <p className="text-[15px] font-semibold text-ink">No products match</p>
            <p className="text-[13px] text-ink-muted">Try another search or category.</p>
            <button onClick={() => { setQ(""); setCat("All"); setInStock(false); }} className="mt-2 text-[13px] font-semibold text-accent-2 hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {shown.map((p) => (
              <li key={p.id}>
                <ProductCard p={p} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function ProductCard({ p }: { p: MarketProduct }) {
  const out = p.stock <= 0;
  return (
    <Link
      href={`/market/${p.slug}`}
      className="group flex h-full flex-col rounded-[var(--r-card)] border border-ink-line bg-bg-card p-4 shadow-[var(--shadow-card)] transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow-hover)]"
    >
      <div className="flex items-start gap-3">
        <ToolLogo slug={p.slug} name={p.vendor} logoUrl={p.logoUrl} size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] text-ink-faint">{p.vendor} · {p.category}</p>
          <h3 className="mt-0.5 line-clamp-2 text-[14.5px] font-semibold leading-snug text-ink group-hover:text-accent-2">{p.name}</h3>
        </div>
        {p.badge && <span className="shrink-0 rounded-[5px] bg-accent-soft px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-accent-2">{p.badge}</span>}
      </div>

      <div className="mb-4 mt-3 flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-[5px] bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700">
          <Zap size={11} /> Instant
        </span>
        <span className="inline-flex items-center gap-1 rounded-[5px] bg-bg-soft px-1.5 py-0.5 text-[11px] font-medium text-ink-muted">
          <ShieldCheck size={11} /> {p.warrantyDays}-day warranty
        </span>
      </div>

      <div className="mt-auto flex items-end justify-between border-t border-line pt-3">
        <div>
          <p className="text-[11px] text-ink-faint">Price</p>
          <p className="font-display text-[19px] font-extrabold leading-tight text-ink">{formatINR(p.pricePaise)}</p>
        </div>
        <span className={cn("inline-flex items-center gap-1 text-[12px] font-medium", out ? "text-rose-600" : "text-ink-muted")}>
          {out ? <Clock size={12} /> : <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
          {out ? "Sold out" : `${p.stock} in stock`}
        </span>
      </div>
    </Link>
  );
}
