import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, Check, ChevronRight, Clock, CreditCard, Headphones, ShieldCheck, Zap } from "lucide-react";
import { ToolLogo } from "@/components/brand/ToolLogo";
import { ProductCard } from "@/components/market/MarketGrid";
import { Button } from "@/components/ui/Button";
import { getMarketplace, getProduct } from "@/lib/marketplace.server";
import { formatINR } from "@/lib/format";
import { site } from "@/config/site";

export const dynamic = "force-dynamic";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [p, market] = await Promise.all([getProduct(slug), getMarketplace()]);
  if (!p) notFound();
  const inStock = p.stock > 0;
  const similar = market.products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);

  const facts = [
    { icon: Zap, label: "Delivery", value: "Instant · activation code" },
    { icon: ShieldCheck, label: "Warranty", value: `${p.warrantyDays} days` },
    { icon: Clock, label: "Availability", value: inStock ? `${p.stock} in stock` : "Sold out" },
    { icon: CreditCard, label: "Payment", value: "UPI, cards, net-banking" },
  ];

  return (
    <div className="container-page pb-24 pt-5 md:pt-6 lg:pb-6">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[13px] text-ink-faint">
        <Link href="/market" className="hover:text-ink">Marketplace</Link>
        <ChevronRight size={13} />
        <Link href={`/market?cat=${encodeURIComponent(p.category)}#products`} className="hover:text-ink">{p.category}</Link>
        <ChevronRight size={13} />
        <span className="truncate text-ink-muted">{p.name}</span>
      </nav>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-4">
          {/* Title card */}
          <section className="card p-5 md:p-6">
            <div className="flex items-start gap-4">
              <ToolLogo slug={p.slug} name={p.vendor} logoUrl={p.logoUrl} size={72} />
              <div className="min-w-0">
                <p className="text-[13px] text-ink-faint">{p.vendor} · {p.category}</p>
                <h1 className="mt-1 text-[22px] font-extrabold leading-tight text-ink md:text-[28px]">{p.name}</h1>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-[5px] bg-emerald-50 px-2 py-1 text-[12px] font-medium text-emerald-700"><Zap size={12} /> Instant delivery</span>
                  <span className="inline-flex items-center gap-1 rounded-[5px] bg-bg-soft px-2 py-1 text-[12px] font-medium text-ink-muted"><ShieldCheck size={12} /> {p.warrantyDays}-day warranty</span>
                  {p.badge && <span className="rounded-[5px] bg-accent-soft px-2 py-1 text-[12px] font-semibold text-accent-2">{p.badge}</span>}
                </div>
              </div>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-[10px] border border-line bg-line md:grid-cols-4">
              {facts.map((f) => (
                <div key={f.label} className="bg-bg-card p-3.5">
                  <dt className="flex items-center gap-1.5 text-[12px] text-ink-faint"><f.icon size={13} /> {f.label}</dt>
                  <dd className="mt-1 text-[13.5px] font-semibold text-ink">{f.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* Description */}
          <section className="card p-5 md:p-6">
            <h2 className="text-[16px] font-bold text-ink">Product description</h2>
            <p className="mt-3 whitespace-pre-line text-[14.5px] leading-relaxed text-ink-muted">{p.description ?? p.blurb}</p>
          </section>

          {/* Delivery & protection */}
          <section className="card p-5 md:p-6">
            <h2 className="text-[16px] font-bold text-ink">Delivery &amp; buyer protection</h2>
            <ul className="mt-4 grid gap-3 text-[14px] text-ink-muted md:grid-cols-2">
              {[
                "Delivered as an activation code, instantly after payment clears.",
                `${p.warrantyDays}-day buyer protection — report any issue and we step in.`,
                "Payment held in escrow until you confirm it works.",
                "Your code is saved under My account → Purchases.",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Check size={12} strokeWidth={3} /></span>
                  {b}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Buy box */}
        <aside className="flex flex-col gap-4 lg:sticky lg:top-[132px]">
          <div className="card p-5">
            <p className="text-[12px] text-ink-faint">Price</p>
            <div className="flex items-end justify-between gap-3">
              <span className="font-display text-[32px] font-extrabold leading-tight text-ink">{formatINR(p.pricePaise)}</span>
              <span className={`mb-1.5 inline-flex items-center gap-1.5 text-[13px] font-medium ${inStock ? "text-emerald-600" : "text-rose-600"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${inStock ? "bg-emerald-500" : "bg-rose-500"}`} />
                {inStock ? `${p.stock} in stock` : "Sold out"}
              </span>
            </div>
            <div className="mt-5">
              <Button href={`/checkout/product?slug=${p.slug}`} size="lg" className="w-full" variant={inStock ? "primary" : "secondary"}>
                {inStock ? "Buy now" : "Notify me"}
              </Button>
            </div>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[12px] text-ink-faint">
              <ShieldCheck size={13} className="text-emerald-600" /> Escrow-protected · UPI, cards, net-banking
            </p>
          </div>

          <div className="card p-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-faint">Sold by</p>
            <div className="mt-3 flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-primary font-display text-[15px] font-bold text-white">O</span>
              <div>
                <p className="flex items-center gap-1 text-[14px] font-semibold text-ink">{site.name} <BadgeCheck size={15} className="text-[#3b82f6]" /></p>
                <p className="text-[12px] text-ink-faint">Verified seller · Official store</p>
              </div>
            </div>
            <a href={`https://wa.me/${site.whatsapp}`} target="_blank" rel="noreferrer" className="mt-4 flex h-10 items-center justify-center gap-2 rounded-[8px] border border-line-strong text-[13.5px] font-medium text-ink hover:bg-bg">
              <Headphones size={15} /> Chat with support
            </a>
          </div>
        </aside>
      </div>

      {/* Sticky buy bar (phones) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-ink-line bg-bg-card/95 px-4 py-3 shadow-[0_-8px_24px_rgba(16,24,40,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-[640px] items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] text-ink-faint">{p.name}</p>
            <p className="font-display text-[20px] font-extrabold leading-tight text-ink">{formatINR(p.pricePaise)}</p>
          </div>
          <Button href={`/checkout/product?slug=${p.slug}`} variant={inStock ? "primary" : "secondary"}>
            {inStock ? "Buy now" : "Notify me"}
          </Button>
        </div>
      </div>

      {similar.length > 0 && (
        <section className="pt-10">
          <div className="flex items-end justify-between">
            <h2 className="t-h2 text-ink">More in {p.category}</h2>
            <Link href={`/market?cat=${encodeURIComponent(p.category)}#products`} className="inline-flex items-center text-[13px] font-semibold text-accent-2 hover:underline">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {similar.map((x) => (
              <li key={x.id}>
                <ProductCard p={x} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
