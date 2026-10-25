"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Clock, Search, ShieldCheck, ShieldOff, SlidersHorizontal, Zap } from "lucide-react";
import { ToolLogo } from "@/components/brand/ToolLogo";
import { formatINRPrecise } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { LuciferProduct } from "@/lib/lucifer.server";

type Sort = "recommended" | "price-asc" | "price-desc";
const PAGE = 48;

/**
 * Storefront listing over the Lucifer bot catalog: section sidebar (pills on
 * mobile), search, sort and an in-stock toggle, paged so 600+ items stay fast.
 */
export function LuciferGrid({
  products,
  sections,
  initialSection = "all",
  initialQ = "",
}: {
  products: LuciferProduct[];
  sections: { id: string; name: string }[];
  initialSection?: string;
  initialQ?: string;
}) {
  const [sec, setSec] = useState(sections.some((s) => s.id === initialSection) ? initialSection : "all");
  const [q, setQ] = useState(initialQ);
  const [sort, setSort] = useState<Sort>("recommended");
  const [inStock, setInStock] = useState(false);
  const [shownCount, setShownCount] = useState(PAGE);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of products) m.set(p.section, (m.get(p.section) ?? 0) + 1);
    return m;
  }, [products]);

  const filtered = useMemo(() => {
    const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    const list = products.filter((p) => {
      if (sec !== "all" && p.section !== sec) return false;
      if (inStock && p.stock !== null && p.stock <= 0) return false;
      if (!terms.length) return true;
      const hay = `${p.name} ${p.sectionName}`.toLowerCase();
      return terms.every((t) => hay.includes(t));
    });
    if (sort === "price-asc") list.sort((a, b) => a.pricePaise - b.pricePaise);
    if (sort === "price-desc") list.sort((a, b) => b.pricePaise - a.pricePaise);
    return list;
  }, [products, sec, q, sort, inStock]);

  const visible = filtered.slice(0, shownCount);
  const allSections = [{ id: "all", name: "All products", n: products.length }, ...sections.map((s) => ({ ...s, n: counts.get(s.id) ?? 0 })).filter((s) => s.n > 0)];
  const pick = (id: string) => {
    setSec(id);
    setShownCount(PAGE);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <div className="card sticky top-[132px] p-2">
          <p className="px-3 pb-2 pt-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-faint">Categories</p>
          {allSections.map((c) => (
            <button
              key={c.id}
              onClick={() => pick(c.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-[8px] px-3 py-2 text-left text-[14px] transition-colors",
                sec === c.id ? "bg-accent-soft font-semibold text-accent-2" : "text-ink-muted hover:bg-bg hover:text-ink",
              )}
            >
              {c.name}
              <span className={cn("text-[12px] tabular-nums", sec === c.id ? "text-accent-2" : "text-ink-faint")}>{c.n}</span>
            </button>
          ))}
          <div className="mx-3 my-2 h-px bg-line" />
          <label className="flex cursor-pointer items-center justify-between rounded-[8px] px-3 py-2 text-[14px] text-ink-muted hover:bg-bg">
            In stock only
            <input type="checkbox" checked={inStock} onChange={(e) => { setInStock(e.target.checked); setShownCount(PAGE); }} className="h-4 w-4 accent-[var(--brand-accent)]" />
          </label>
        </div>
      </aside>

      <div className="min-w-0">
        <div className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" aria-hidden />
            <input
              type="search"
              value={q}
              onChange={(e) => { setQ(e.target.value); setShownCount(PAGE); }}
              placeholder="Search ChatGPT, Netflix, Canva…"
              aria-label="Search products"
              className="h-10 w-full rounded-[8px] border border-line-strong bg-bg-card pl-9 pr-3 text-[14px] text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="flex h-10 cursor-pointer items-center gap-2 rounded-[8px] border border-line-strong px-3 text-[13px] text-ink-muted lg:hidden">
              <input type="checkbox" checked={inStock} onChange={(e) => { setInStock(e.target.checked); setShownCount(PAGE); }} className="h-4 w-4 accent-[var(--brand-accent)]" />
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

        <div className="-mx-4 mt-3 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] lg:hidden [&::-webkit-scrollbar]:hidden">
          {allSections.map((c) => (
            <button
              key={c.id}
              onClick={() => pick(c.id)}
              className={cn(
                "shrink-0 rounded-[8px] border px-3 py-1.5 text-[13px] font-medium transition-colors",
                sec === c.id ? "border-accent bg-accent-soft text-accent-2" : "border-line-strong bg-bg-card text-ink-muted",
              )}
            >
              {c.id === "all" ? "All" : c.name} <span className="text-ink-faint">{c.n}</span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-[13px] text-ink-faint">
          Showing <span className="font-semibold text-ink">{visible.length}</span> of <span className="font-semibold text-ink">{filtered.length}</span> products
          {q.trim() && <> for “<span className="font-semibold text-ink">{q.trim()}</span>”</>}
        </p>

        {filtered.length === 0 ? (
          <div className="card mt-3 flex flex-col items-center gap-2 px-6 py-14 text-center">
            <Search size={22} className="text-ink-faint" />
            <p className="text-[15px] font-semibold text-ink">No products match</p>
            <p className="text-[13px] text-ink-muted">Try another search or category.</p>
            <button onClick={() => { setQ(""); pick("all"); setInStock(false); }} className="mt-2 text-[13px] font-semibold text-accent-2 hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <ul className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {visible.map((p) => (
                <li key={p.ref}>
                  <LuciferCard p={p} />
                </li>
              ))}
            </ul>
            {visible.length < filtered.length && (
              <div className="mt-5 flex justify-center">
                <button onClick={() => setShownCount((n) => n + PAGE)} className="h-11 rounded-[8px] border border-line-strong bg-bg-card px-6 text-[14px] font-semibold text-ink hover:border-ink-faint">
                  Show more ({filtered.length - visible.length} left)
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function logoUrlFor(p: Pick<LuciferProduct, "logoSlug">): string | null {
  return p.logoSlug ? `https://cdn.simpleicons.org/${p.logoSlug}` : null;
}

export function WarrantyTag({ w, className }: { w: LuciferProduct["warranty"]; className?: string }) {
  if (w === "warranty")
    return (
      <span className={cn("inline-flex items-center gap-1 rounded-[5px] bg-sky-50 px-1.5 py-0.5 text-[11px] font-medium text-sky-700", className)}>
        <ShieldCheck size={11} /> Warranty
      </span>
    );
  if (w === "none")
    return (
      <span className={cn("inline-flex items-center gap-1 rounded-[5px] bg-bg-soft px-1.5 py-0.5 text-[11px] font-medium text-ink-muted", className)}>
        <ShieldOff size={11} /> No warranty
      </span>
    );
  return null;
}

export function LuciferCard({ p }: { p: LuciferProduct }) {
  const out = p.stock !== null && p.stock <= 0;
  return (
    <Link
      href={`/market/${p.ref}`}
      className="group flex h-full flex-col rounded-[var(--r-card)] border border-ink-line bg-bg-card p-4 shadow-[var(--shadow-card)] transition-[box-shadow,border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-line-strong hover:shadow-[var(--shadow-hover)]"
    >
      <div className="flex items-start gap-3">
        <ToolLogo slug={`lucifer-${p.ref}`} name={p.name} logoUrl={logoUrlFor(p)} size={44} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12px] text-ink-faint">{p.sectionName}</p>
          <h3 className="mt-0.5 line-clamp-2 text-[14.5px] font-semibold leading-snug text-ink group-hover:text-accent-2">{p.name}</h3>
        </div>
      </div>

      <div className="mb-4 mt-3 flex flex-wrap gap-1.5">
        <span className="inline-flex items-center gap-1 rounded-[5px] bg-emerald-50 px-1.5 py-0.5 text-[11px] font-medium text-emerald-700">
          <Zap size={11} /> Wallet checkout
        </span>
        <WarrantyTag w={p.warranty} />
      </div>

      <div className="mt-auto flex items-end justify-between border-t border-line pt-3">
        <div>
          <p className="text-[11px] text-ink-faint">Price</p>
          <p className="font-display text-[19px] font-extrabold leading-tight text-ink">{formatINRPrecise(p.pricePaise)}</p>
        </div>
        <span className={cn("inline-flex items-center gap-1 text-[12px] font-medium", out ? "text-rose-600" : "text-ink-muted")}>
          {out ? <Clock size={12} /> : <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />}
          {out ? "Sold out" : p.stock === null ? "Available" : `${p.stock} in stock`}
        </span>
      </div>
    </Link>
  );
}
