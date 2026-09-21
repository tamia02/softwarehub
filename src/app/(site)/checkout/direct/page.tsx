import Link from "next/link";
import { Check } from "lucide-react";
import { DirectCheckout } from "@/components/checkout/DirectCheckout";
import { tiers as tierCopy, type TierSlug } from "@/data/tiers";
import { getSessionUser } from "@/lib/auth.server";
import { getCatalog } from "@/lib/catalog.server";
import { formatINR } from "@/lib/format";

export const metadata = { title: "Checkout" };
export const dynamic = "force-dynamic";

export default async function DirectCheckoutPage({ searchParams }: { searchParams: Promise<{ tier?: string }> }) {
  const { tier: q } = await searchParams;
  const slug: TierSlug = q === "starter" ? "starter" : "pro";
  const [{ pricing }, user] = await Promise.all([getCatalog(), getSessionUser()]);
  const p = pricing[slug];
  const copy = tierCopy[slug];

  return (
    <div className="container-page py-12 md:py-16">
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-[1fr_380px]">
        <div>
          <h1 className="text-[32px] font-black leading-tight">Buy {p.name}</h1>
          <p className="mt-2 text-ink-muted">Pay once, get your activation code instantly on screen and by email/SMS.</p>

          <div className="mt-8 flex gap-3">
            {(["starter", "pro"] as TierSlug[]).map((s) => (
              <Link
                key={s}
                href={`/checkout/direct?tier=${s}`}
                className={`flex-1 rounded-2xl border p-4 ${s === slug ? "border-primary bg-primary-soft" : "border-line hover:border-ink/30"}`}
              >
                <p className="font-bold">{pricing[s].name}</p>
                <p className="text-sm text-ink-muted">
                  {pricing[s].toolCount} tools · {formatINR(pricing[s].pricePaise)}
                </p>
              </Link>
            ))}
          </div>

          <ul className="mt-8 space-y-3 text-[15px]">
            {copy.benefits.map((b) => (
              <li key={b} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                  <Check size={12} strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        <aside className="card h-fit p-6">
          <h2 className="text-lg font-extrabold">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">{p.name} · 1 year</dt>
              <dd className="font-semibold tabular-nums">{formatINR(p.pricePaise)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Retail value</dt>
              <dd className="tabular-nums text-ink-muted line-through">{formatINR(p.retailPaise)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base">
              <dt className="font-bold">Total (incl. GST)</dt>
              <dd className="font-black tabular-nums">{formatINR(p.pricePaise)}</dd>
            </div>
          </dl>
          <div className="mt-6">
            <DirectCheckout tier={slug} signedIn={!!user} defaultName={user?.name ?? ""} defaultGstin={user?.gstin ?? ""} />
          </div>
          <p className="mt-3 text-center text-xs text-ink-faint">UPI · Cards · Net banking via Razorpay. Prices in INR.</p>
        </aside>
      </div>
    </div>
  );
}
