import Link from "next/link";
import { ShieldCheck, Zap, BadgeCheck, Headphones, ArrowRight } from "lucide-react";
import { StaggerWords } from "@/components/motion/StaggerWords";
import { MarketHero } from "@/components/market/MarketHero";
import { MarketGrid } from "@/components/market/MarketGrid";
import { Panel } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { getMarketplace } from "@/lib/marketplace.server";
import { formatINR } from "@/lib/format";

export const metadata = { title: "Marketplace" };
export const revalidate = 30;

const at = (s: number) => ({ animationDelay: `${s}s` });

const trust = [
  { icon: ShieldCheck, label: "Escrow protected", sub: "on every order" },
  { icon: Zap, label: "Instant delivery", sub: "codes in seconds" },
  { icon: BadgeCheck, label: "Verified sellers", sub: "ID-checked" },
  { icon: Headphones, label: "24/7 support", sub: "we've got you" },
];

const steps = [
  { n: "01", title: "Pick a product", body: "Browse subscriptions, keys, top-ups and gift cards from verified sellers." },
  { n: "02", title: "Pay into escrow", body: "Your money is held safely — the seller isn't paid until you're happy." },
  { n: "03", title: "Get your code", body: "Delivered instantly. Confirm it works and the order completes." },
];

export default async function MarketPage() {
  const { products, bundles, categories } = await getMarketplace();

  return (
    <main className="bg-bg">
      {/* Hero */}
      <section className="relative">
        <div className="container-page grid items-center gap-8 pb-8 pt-6 md:grid-cols-[minmax(0,660px)_minmax(0,1fr)] md:gap-12 md:pb-16 md:pt-12">
          <div className="order-2 md:order-1">
            <p className="anim-fade-up text-[15px] font-bold uppercase tracking-wider text-accent-2" style={at(0.1)}>Software Hub</p>
            <StaggerWords
              as="h1"
              delay={0.15}
              text="Premium software and game credits, activated instantly with a code."
              highlight={["Premium", "software", "instantly"]}
              className="t-h1 mt-3 max-w-[660px] text-balance text-ink"
            />
            <p className="anim-fade-up mt-4 text-[20px] leading-[1.1] text-ink md:text-[23px]" style={at(0.45)}>
              Every order held in <span className="font-hand text-[26px] text-accent-2 md:text-[30px]">escrow</span> until you&apos;re happy.
            </p>
            <p className="anim-fade-up mt-5 max-w-[560px] text-[16px] leading-[1.45] text-ink-muted" style={at(0.55)}>
              Subscriptions, activation keys, game top-ups and gift cards from verified sellers — delivered in seconds, protected until you confirm.
            </p>
            <div className="anim-fade-up mt-7 flex flex-wrap gap-3" style={at(0.65)}>
              <Button href="#products" size="lg">Browse the marketplace <ArrowRight size={18} /></Button>
              <Button href="#how" size="lg" variant="secondary">How escrow works</Button>
            </div>
          </div>
          <div className="anim-fade-scale order-1 md:order-2" style={at(0.15)}>
            <MarketHero />
          </div>
        </div>

        {/* Trust strip */}
        <div className="container-page pb-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {trust.map((t) => (
              <div key={t.label} className="flex items-center gap-3 rounded-[var(--r-card)] border-2 border-ink-line bg-bg-card px-4 py-3 shadow-[3px_3px_0_var(--offset-card)]">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent-soft text-ink"><t.icon size={18} /></span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-black leading-tight text-ink">{t.label}</span>
                  <span className="block truncate text-[12px] text-ink-faint">{t.sub}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bundles */}
      {bundles.length > 0 && (
        <Panel id="bundles">
          <div className="flex flex-col items-center gap-2 text-center">
            <h2 className="t-h2 text-ink">Bundles</h2>
            <p className="font-hand text-[24px] text-accent-2 md:text-[28px]">more tools, one price</p>
          </div>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {bundles.map((b) => (
              <Link key={b.id} href={`/market/bundle/${b.slug}`} className="group card-3d card-3d-lg block">
                <div className="card-3d-body flex h-full flex-col bg-bg-card p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[19px] font-black text-ink">{b.name}</h3>
                    {b.badge && <span className="rounded-full border-2 border-ink-line bg-accent px-2.5 py-0.5 text-[10px] font-bold text-on-accent">{b.badge}</span>}
                  </div>
                  <p className="mt-2 text-[14px] leading-snug text-ink-muted">{b.blurb}</p>
                  <p className="mt-4 text-[13px] font-bold text-ink">{b.items.length} products included</p>
                  <div className="mt-auto flex items-end gap-2 pt-5">
                    <span className="font-display text-[28px] font-black text-ink">{formatINR(b.pricePaise)}</span>
                    {b.valuePaise > b.pricePaise && <span className="pb-1.5 text-[14px] text-ink-faint line-through">{formatINR(b.valuePaise)}</span>}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Panel>
      )}

      {/* Products */}
      <section id="products" className="container-page scroll-mt-24 py-10 md:py-14">
        <div className="flex flex-col items-center gap-2 text-center">
          <h2 className="t-h2 text-ink">Everything, in stock</h2>
          <p className="t-lead max-w-2xl text-ink-muted">{products.length} products from verified sellers — every price includes buyer protection.</p>
        </div>
        <div className="mt-8">
          <MarketGrid products={products} categories={categories} />
        </div>
      </section>

      {/* How escrow works */}
      <Panel id="how" className="bg-bg-dark" innerClassName="text-center">
        <h2 className="t-h2 text-on-primary">How it works</h2>
        <p className="mt-2 font-hand text-[24px] text-[color:var(--brand-accent)] md:text-[28px]">safe, in three steps</p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="rounded-[var(--r-card-lg)] border-2 border-[rgba(255,251,235,0.18)] bg-[rgba(255,251,235,0.05)] p-6 text-left">
              <span className="grid h-11 w-11 place-items-center rounded-full border-2 border-[color:var(--brand-accent)] font-display text-[16px] font-black text-[color:var(--brand-accent)]">{s.n}</span>
              <h3 className="t-card-title mt-4 text-[18px] text-on-primary">{s.title}</h3>
              <p className="mt-2 text-[15px] leading-[1.5] text-[rgba(255,251,235,0.72)]">{s.body}</p>
            </div>
          ))}
        </div>
      </Panel>

      {/* Closing CTA */}
      <section className="container-page py-14 md:py-20">
        <div className="card-3d card-3d-lg">
          <div className="card-3d-body flex flex-col items-center gap-5 bg-accent-soft p-10 text-center md:p-14">
            <h2 className="t-h2 max-w-[20ch] text-ink">Find it, pay safely, get your code.</h2>
            <p className="max-w-[52ch] text-[16px] text-ink-muted">Thousands of products from verified sellers — every order protected by escrow until you confirm it works.</p>
            <Button href="#products" size="lg">Start browsing <ArrowRight size={18} /></Button>
          </div>
        </div>
      </section>
    </main>
  );
}
