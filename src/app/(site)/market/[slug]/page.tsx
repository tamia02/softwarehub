import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Check, ChevronRight, Clock, Headphones, Send, Wallet, Zap } from "lucide-react";
import { ToolLogo } from "@/components/brand/ToolLogo";
import { LuciferBuyBox } from "@/components/market/LuciferBuyBox";
import { LuciferCard, WarrantyTag, logoUrlFor } from "@/components/market/LuciferGrid";
import { getSessionUser } from "@/lib/auth.server";
import { getLuciferAccount, getLuciferCatalog, getLuciferProduct, luciferBotUrl } from "@/lib/lucifer.server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await getLuciferProduct(slug).catch(() => null);
  return { title: p?.name ?? "Product" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // Old site-catalog links (/market/valorant-1000vp) predate the Lucifer catalog.
  if (!/^\d+$/.test(slug)) redirect("/market");

  const [p, user] = await Promise.all([getLuciferProduct(slug).catch(() => null), getSessionUser()]);
  if (!p) notFound();
  const [catalog, account] = await Promise.all([
    getLuciferCatalog().catch(() => []),
    user?.telegramId ? getLuciferAccount(user.telegramId).catch(() => null) : Promise.resolve(null),
  ]);
  const similar = catalog.filter((x) => x.section === p.section && x.ref !== p.ref && (x.stock === null || x.stock > 0)).slice(0, 4);
  const inStock = p.stock === null || p.stock > 0;

  const facts = [
    { icon: Wallet, label: "Payment", value: "Lucifer wallet" },
    { icon: Send, label: "Delivery", value: "On Telegram" },
    { icon: Clock, label: "Availability", value: !inStock ? "Sold out" : p.stock === null ? "Available" : `${p.stock} in stock` },
    { icon: Zap, label: "Min. order", value: `${p.minQty} ${p.minQty === 1 ? "unit" : "units"}` },
  ];

  return (
    <div className="container-page pb-6 pt-5 md:pt-6">
      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-[13px] text-ink-faint">
        <Link href="/market" className="hover:text-ink">Marketplace</Link>
        <ChevronRight size={13} />
        <Link href={`/market?cat=${p.section}#products`} className="hover:text-ink">{p.sectionName}</Link>
        <ChevronRight size={13} />
        <span className="truncate text-ink-muted">{p.name}</span>
      </nav>

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-4">
          <section className="card p-5 md:p-6">
            <div className="flex items-start gap-4">
              <ToolLogo slug={`lucifer-${p.ref}`} name={p.name} logoUrl={logoUrlFor(p)} size={72} />
              <div className="min-w-0">
                <p className="text-[13px] text-ink-faint">{p.sectionName}</p>
                <h1 className="mt-1 text-[22px] font-extrabold leading-tight text-ink md:text-[28px]">{p.name}</h1>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center gap-1 rounded-[5px] bg-emerald-50 px-2 py-1 text-[12px] font-medium text-emerald-700"><Zap size={12} /> Wallet checkout</span>
                  <WarrantyTag w={p.warranty} className="px-2 py-1 text-[12px]" />
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

          {p.description.trim() && (
            <section className="card p-5 md:p-6">
              <h2 className="text-[16px] font-bold text-ink">Product details</h2>
              <p className="mt-3 whitespace-pre-line break-words text-[14.5px] leading-relaxed text-ink-muted">{p.description.trim()}</p>
            </section>
          )}

          <section className="card p-5 md:p-6">
            <h2 className="text-[16px] font-bold text-ink">How delivery works</h2>
            <ul className="mt-4 grid gap-3 text-[14px] text-ink-muted md:grid-cols-2">
              {[
                "Pay from your Lucifer wallet — the amount is debited instantly.",
                "You get a Telegram message with your order details right away.",
                "Tap “Get delivery on Telegram” and our team delivers it there.",
                "Every order also appears under My account on this site.",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600"><Check size={12} strokeWidth={3} /></span>
                  {b}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-[132px]">
          <LuciferBuyBox
            productRef={p.ref}
            unitPaise={p.pricePaise}
            minQty={p.minQty}
            maxQty={p.maxQty}
            stock={p.stock}
            signedIn={Boolean(user)}
            hasTelegram={Boolean(user?.telegramId)}
            balancePaise={account?.balancePaise ?? null}
            botUrl={luciferBotUrl}
          />
          <div className="card p-5">
            <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-ink-faint">Need help?</p>
            <p className="mt-2 text-[13.5px] text-ink-muted">Questions about this product or your order? Our team answers on Telegram.</p>
            <a href={luciferBotUrl} target="_blank" rel="noreferrer" className="mt-4 flex h-10 items-center justify-center gap-2 rounded-[8px] border border-line-strong text-[13.5px] font-medium text-ink hover:bg-bg">
              <Headphones size={15} /> Open the Lucifer bot
            </a>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="pt-10">
          <div className="flex items-end justify-between">
            <h2 className="t-h2 text-ink">More in {p.sectionName}</h2>
            <Link href={`/market?cat=${p.section}#products`} className="inline-flex items-center text-[13px] font-semibold text-accent-2 hover:underline">
              View all <ChevronRight size={14} />
            </Link>
          </div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {similar.map((x) => (
              <li key={x.ref}>
                <LuciferCard p={x} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
