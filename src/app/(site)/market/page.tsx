import Link from "next/link";
import { MarketGrid } from "@/components/market/MarketGrid";
import { getMarketplace } from "@/lib/marketplace.server";
import { formatINR } from "@/lib/format";

export const metadata = { title: "Marketplace" };
export const revalidate = 30;

export default async function MarketPage() {
  const { products, bundles, categories } = await getMarketplace();

  return (
    <main className="bg-bg">
      <section className="container-page pb-6 pt-10 md:pt-14">
        <p className="text-[15px] font-bold uppercase tracking-wider text-accent-2">Software Hub Pool</p>
        <h1 className="t-h1 mt-3 max-w-[18ch] text-balance text-ink">Premium software, activated instantly with a code.</h1>
        <p className="mt-4 max-w-[60ch] text-[16px] text-ink-muted">
          Subscriptions, keys and tools from verified resellers — every order protected by escrow until you confirm it works.
        </p>
      </section>

      {bundles.length > 0 && (
        <section className="container-page py-6">
          <h2 className="t-h2 text-ink">Bundles</h2>
          <p className="mt-1 text-[15px] text-ink-muted">Groups of products at one price.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {bundles.map((b) => (
              <Link key={b.id} href={`/market/bundle/${b.slug}`} className="flex flex-col rounded-[var(--r-card-lg)] border-2 border-ink-line bg-accent-soft p-5 shadow-[6px_6px_0_var(--offset-card)] transition-transform hover:-translate-y-0.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-[18px] font-black text-ink">{b.name}</h3>
                  {b.badge && <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold text-on-accent">{b.badge}</span>}
                </div>
                <p className="mt-2 text-[13px] leading-snug text-ink-muted">{b.blurb}</p>
                <p className="mt-3 text-[12px] font-semibold text-ink">{b.items.length} products included</p>
                <div className="mt-auto flex items-end gap-2 pt-4">
                  <span className="text-[24px] font-black text-ink">{formatINR(b.pricePaise)}</span>
                  {b.valuePaise > b.pricePaise && <span className="pb-1 text-[13px] text-ink-faint line-through">{formatINR(b.valuePaise)}</span>}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="container-page py-8">
        <h2 className="t-h2 text-ink">All products</h2>
        <p className="mt-1 text-[15px] text-ink-muted">{products.length} products · prices include our buyer protection.</p>
        <div className="mt-5">
          <MarketGrid products={products} categories={categories} />
        </div>
      </section>
    </main>
  );
}
