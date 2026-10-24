import Link from "next/link";
import { ArrowRight, BadgeCheck, ChevronRight, Gamepad2, Gift, KeyRound, ShieldCheck, Sparkles, Tv, UserRound, Zap, type LucideIcon } from "lucide-react";
import { SectionShowcase } from "@/components/home/SectionShowcase";
import { Testimonials } from "@/components/home/Testimonials";
import { MarketGrid } from "@/components/market/MarketGrid";
import { ToolLogo } from "@/components/brand/ToolLogo";
import { Button } from "@/components/ui/Button";
import { getMarketplace } from "@/lib/marketplace.server";
import { formatINR } from "@/lib/format";

export const metadata = { title: "Marketplace" };
export const dynamic = "force-dynamic";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "AI Tools": Sparkles,
  Subscriptions: Tv,
  "Game Top-Up": Gamepad2,
  "Game Accounts": UserRound,
  "Gift Cards": Gift,
  Software: KeyRound,
};

const steps = [
  { icon: Sparkles, title: "Pick a product", body: "Browse subscriptions, keys, top-ups and gift cards from verified sellers." },
  { icon: ShieldCheck, title: "Pay into escrow", body: "Your money is held safely — the seller isn't paid until you're happy." },
  { icon: Zap, title: "Get your code", body: "Delivered instantly. Confirm it works and the order completes." },
];

export default async function MarketPage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string }> }) {
  const [{ products, bundles, categories }, { q = "", cat = "All" }] = await Promise.all([getMarketplace(), searchParams]);
  const trending = products.filter((p) => p.stock > 0).slice(0, 6);
  const stats = [
    { value: `${products.length}+`, label: "Products listed" },
    { value: "Instant", label: "Code delivery" },
    { value: "100%", label: "Escrow-protected" },
  ];
  const counts = new Map<string, number>();
  for (const p of products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);

  return (
    <div className="pb-6">
      {/* Hero banner */}
      <section className="container-page pt-5 md:pt-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
          <div className="relative overflow-hidden rounded-[var(--r-card-lg)] bg-primary px-6 py-9 text-on-primary md:px-10 md:py-12">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_80%_at_100%_0%,rgba(239,65,54,0.35),transparent_60%),radial-gradient(50%_60%_at_0%_100%,rgba(80,110,255,0.18),transparent_60%)]" />
            <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:32px_32px] [mask-image:linear-gradient(to_left,black,transparent_70%)]" />
            <div className="relative max-w-[600px]">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium text-white/85 ring-1 ring-inset ring-white/15">
                <BadgeCheck size={13} className="text-accent" /> Trusted digital marketplace in India
              </span>
              <h1 className="t-h1 mt-4 text-balance text-white">
                Premium software, subscriptions &amp; game credits — <span className="text-accent">delivered instantly.</span>
              </h1>
              <p className="mt-4 max-w-[520px] text-[15px] leading-relaxed text-white/65 md:text-[16px]">
                Activation keys, top-ups and gift cards from verified sellers. Every order is held in escrow until you confirm it works.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button href="#products" size="lg">
                  Browse marketplace <ArrowRight size={17} />
                </Button>
                <Link href="#how" className="inline-flex h-12 items-center gap-2 rounded-[8px] border border-white/20 px-5 text-[15px] font-semibold text-white transition-colors hover:bg-white/[0.07]">
                  How escrow works
                </Link>
              </div>
              <dl className="mt-9 flex flex-wrap gap-x-10 gap-y-4">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="sr-only">{s.label}</dt>
                    <dd className="font-display text-[22px] font-extrabold leading-none text-white">{s.value}</dd>
                    <dd className="mt-1 text-[12.5px] text-white/50">{s.label}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Trending now */}
          <div className="card flex flex-col p-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-[15px] font-bold text-ink">Trending now</h2>
              <Link href="#products" className="inline-flex items-center text-[12.5px] font-semibold text-accent-2 hover:underline">
                View all <ChevronRight size={14} />
              </Link>
            </div>
            <ul className="mt-3 flex flex-1 flex-col gap-1">
              {trending.map((p, i) => (
                <li key={p.id}>
                  <Link href={`/market/${p.slug}`} className="flex items-center gap-3 rounded-[10px] p-2 transition-colors hover:bg-bg">
                    <span className="w-4 text-center font-display text-[13px] font-bold text-ink-faint">{i + 1}</span>
                    <ToolLogo slug={p.slug} name={p.vendor} logoUrl={p.logoUrl} size={38} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-semibold text-ink">{p.name}</span>
                      <span className="block truncate text-[12px] text-ink-faint">{p.category}</span>
                    </span>
                    <span className="font-display text-[14px] font-bold text-ink">{formatINR(p.pricePaise)}</span>
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex items-center gap-2 rounded-[10px] bg-bg px-3 py-2.5 text-[12.5px] text-ink-muted">
              <ShieldCheck size={14} className="text-emerald-600" /> Escrow-protected on every order
            </div>
          </div>
        </div>
      </section>

      <SectionShowcase />

      {/* Categories */}
      <section className="container-page pt-8 md:pt-10">
        <div className="flex items-end justify-between">
          <h2 className="t-h2 text-ink">Popular categories</h2>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {categories.map((c) => {
            const Icon = CATEGORY_ICONS[c] ?? Sparkles;
            return (
              <li key={c}>
                <Link
                  href={`/market?cat=${encodeURIComponent(c)}#products`}
                  className="group flex h-full flex-col gap-3 rounded-[var(--r-card)] border border-ink-line bg-bg-card p-4 shadow-[var(--shadow-card)] transition-[box-shadow,border-color] duration-200 hover:border-accent/40 hover:shadow-[var(--shadow-hover)]"
                >
                  <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-accent-soft text-accent-2 transition-colors group-hover:bg-accent group-hover:text-white">
                    <Icon size={19} />
                  </span>
                  <span>
                    <span className="block text-[14px] font-semibold text-ink">{c}</span>
                    <span className="block text-[12px] text-ink-faint">{counts.get(c) ?? 0} products</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Bundles */}
      {bundles.length > 0 && (
        <section id="bundles" className="container-page scroll-mt-32 pt-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="t-h2 text-ink">Bundle deals</h2>
              <p className="mt-1 text-[14px] text-ink-muted">More tools, one price.</p>
            </div>
          </div>
          <ul className={`mt-4 grid gap-3 sm:grid-cols-2 ${bundles.length === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
            {bundles.map((b) => {
              const save = b.valuePaise > b.pricePaise ? Math.round((1 - b.pricePaise / b.valuePaise) * 100) : 0;
              return (
                <li key={b.id}>
                  <Link
                    href={`/market/bundle/${b.slug}`}
                    className="group flex h-full flex-col rounded-[var(--r-card)] border border-ink-line bg-bg-card p-5 shadow-[var(--shadow-card)] transition-[box-shadow,border-color] duration-200 hover:border-line-strong hover:shadow-[var(--shadow-hover)]"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-[16px] font-bold text-ink group-hover:text-accent-2">{b.name}</h3>
                      {save > 0 ? (
                        <span className="rounded-[5px] bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-700">Save {save}%</span>
                      ) : (
                        b.badge && <span className="rounded-[5px] bg-accent-soft px-1.5 py-0.5 text-[11px] font-semibold text-accent-2">{b.badge}</span>
                      )}
                    </div>
                    <p className="mt-1.5 text-[13.5px] leading-snug text-ink-muted">{b.blurb}</p>
                    <p className="mb-4 mt-3 truncate text-[12.5px] text-ink-faint">{b.items.map((i) => i.vendor).join(" · ")}</p>
                    <div className="mt-auto flex items-end gap-2 border-t border-line pt-3">
                      <span className="font-display text-[22px] font-extrabold text-ink">{formatINR(b.pricePaise)}</span>
                      {b.valuePaise > b.pricePaise && <span className="pb-1 text-[13px] text-ink-faint line-through">{formatINR(b.valuePaise)}</span>}
                      <span className="ml-auto pb-1 text-[12.5px] font-medium text-ink-muted">{b.items.length} products</span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Products */}
      <section id="products" className="container-page scroll-mt-32 pt-10">
        <div className="mb-4">
          <h2 className="t-h2 text-ink">All products</h2>
          <p className="mt-1 text-[14px] text-ink-muted">{products.length} products from verified sellers — every price includes buyer protection.</p>
        </div>
        <MarketGrid key={`${cat}|${q}`} products={products} categories={categories} initialCat={cat} initialQ={q} />
      </section>

      {/* How escrow works */}
      <section id="how" className="container-page scroll-mt-32 pt-12">
        <div className="panel">
          <div className="panel-inner">
            <div className="flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-accent-2">Buyer protection</p>
                <h2 className="t-h2 mt-1 text-ink">How it works</h2>
              </div>
              <p className="max-w-md text-[14px] text-ink-muted">Safe in three steps — your payment never reaches the seller until you&apos;ve confirmed the code works.</p>
            </div>
            <ol className="mt-6 grid gap-3 md:grid-cols-3">
              {steps.map((s, i) => (
                <li key={s.title} className="relative rounded-[var(--r-card)] border border-line bg-bg p-5">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-[10px] bg-primary text-white">
                      <s.icon size={18} />
                    </span>
                    <span className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-faint">Step {i + 1}</span>
                  </div>
                  <h3 className="mt-4 text-[16px] font-bold text-ink">{s.title}</h3>
                  <p className="mt-1.5 text-[14px] leading-relaxed text-ink-muted">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <Testimonials />

      {/* Seller CTA */}
      <section className="container-page pt-2">
        <div className="flex flex-col items-start justify-between gap-5 rounded-[var(--r-card-lg)] bg-primary px-6 py-8 text-on-primary md:flex-row md:items-center md:px-10">
          <div>
            <h2 className="text-[22px] font-bold text-white md:text-[26px]">Have stock to sell?</h2>
            <p className="mt-1 max-w-xl text-[14px] text-white/60">Join as a reseller — list your codes, get paid on confirmation, and manage everything from one dashboard or WhatsApp.</p>
          </div>
          <Button href="/?switch=1&role=reseller" size="lg">
            Become a seller <ArrowRight size={17} />
          </Button>
        </div>
      </section>
    </div>
  );
}
