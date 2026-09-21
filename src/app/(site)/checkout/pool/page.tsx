import { CreatePoolForm } from "@/components/pool/CreatePoolForm";
import type { TierSlug } from "@/data/tiers";
import { getSessionUser } from "@/lib/auth.server";
import { getCatalog } from "@/lib/catalog.server";
import { getSettings } from "@/lib/settings.server";

export const metadata = { title: "Create a pool" };
export const dynamic = "force-dynamic";

export default async function PoolCheckoutPage({ searchParams }: { searchParams: Promise<{ tier?: string }> }) {
  const { tier: q } = await searchParams;
  const slug: TierSlug = q === "starter" ? "starter" : "pro";
  const [{ pricing }, s, user] = await Promise.all([getCatalog(), getSettings(), getSessionUser()]);
  const reseller = user?.role === "reseller" || user?.role === "admin";

  return (
    <div className="container-page py-12 md:py-16">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-[32px] font-black leading-tight">Create a pool</h1>
        <p className="mt-2 text-ink-muted">
          Pick a pass, choose how many people share it, then send the link. {reseller ? "Reseller options are enabled." : ""}
        </p>
        <div className="card mt-8 p-6 md:p-8">
          <CreatePoolForm
            prices={{
              starter: { name: pricing.starter.name, pricePaise: pricing.starter.pricePaise },
              pro: { name: pricing.pro.name, pricePaise: pricing.pro.pricePaise },
            }}
            defaultTier={slug}
            seatsMin={s.poolSeatsMin}
            seatsMax={s.poolSeatsMax}
            seatsDefault={s.poolSeatsDefault}
            expiryDays={s.poolExpiryDays}
            reseller={!!reseller}
            signedIn={!!user}
          />
        </div>
      </div>
    </div>
  );
}
