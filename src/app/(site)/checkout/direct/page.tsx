import Link from "next/link";
import { Check, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { tiers, type TierSlug } from "@/data/tiers";
import { tierPricing } from "@/lib/pricing";
import { formatINR } from "@/lib/format";

export const metadata = { title: "Checkout" };

/**
 * Direct purchase (Phase 2): the order summary is real; the pay button will
 * create a Razorpay order via POST /api/orders/direct once the gateway lands.
 */
export default async function DirectCheckoutPage({ searchParams }: { searchParams: Promise<{ tier?: string }> }) {
  const { tier: q } = await searchParams;
  const slug: TierSlug = q === "starter" ? "starter" : "pro";
  const tier = tiers[slug];
  const p = tierPricing(slug);

  return (
    <div className="container-page py-12 md:py-16">
      <div className="mx-auto grid max-w-4xl gap-8 md:grid-cols-[1fr_380px]">
        <div>
          <h1 className="text-[32px] font-black leading-tight">Buy {tier.name}</h1>
          <p className="mt-2 text-ink-muted">Pay once, get your activation code instantly by email and SMS.</p>

          <div className="mt-8 flex gap-3">
            {(["starter", "pro"] as TierSlug[]).map((s) => (
              <Link
                key={s}
                href={`/checkout/direct?tier=${s}`}
                className={`flex-1 rounded-2xl border p-4 ${s === slug ? "border-primary bg-primary-soft" : "border-line hover:border-ink/30"}`}
              >
                <p className="font-bold">{tiers[s].name}</p>
                <p className="text-sm text-ink-muted">{tiers[s].toolCount} tools · {formatINR(tiers[s].pricePaise)}</p>
              </Link>
            ))}
          </div>

          <ul className="mt-8 space-y-3 text-[15px]">
            {tier.benefits.map((b) => (
              <li key={b} className="flex items-start gap-2.5">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary-soft text-primary">
                  <Check size={12} strokeWidth={3} />
                </span>
                {b}
              </li>
            ))}
          </ul>

          <div className="mt-10 rounded-2xl border border-dashed border-line bg-bg-soft p-5 text-sm text-ink-muted">
            <strong className="text-ink">Phase 2:</strong> phone/email OTP sign-in, GSTIN capture and Razorpay checkout (UPI, cards, net banking) plug in here.
          </div>
        </div>

        <aside className="card h-fit p-6">
          <h2 className="text-lg font-extrabold">Order summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">{tier.name} · 1 year</dt>
              <dd className="font-semibold tabular-nums">{formatINR(p.pricePaise)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Retail value</dt>
              <dd className="tabular-nums text-ink-muted line-through">{formatINR(p.retailPaise)}</dd>
            </div>
            <div className="flex justify-between border-t border-line pt-3 text-base">
              <dt className="font-bold">Total</dt>
              <dd className="font-black tabular-nums">{formatINR(p.pricePaise)}</dd>
            </div>
          </dl>
          <Button size="lg" className="mt-6 w-full" disabled>
            <Lock size={16} /> Pay with Razorpay
          </Button>
          <p className="mt-3 text-center text-xs text-ink-faint">Payments go live in Phase 2. Prices in INR.</p>
        </aside>
      </div>
    </div>
  );
}
