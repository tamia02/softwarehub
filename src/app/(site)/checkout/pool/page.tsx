import { PhaseStub } from "@/components/ui/PhaseStub";
import { settings } from "@/config/site";
import { tiers, type TierSlug } from "@/data/tiers";
import { seatPricePaise } from "@/lib/pricing";
import { formatINR } from "@/lib/format";

export const metadata = { title: "Create or join a pool" };

export default async function PoolCheckoutPage({ searchParams }: { searchParams: Promise<{ tier?: string }> }) {
  const { tier: q } = await searchParams;
  const slug: TierSlug = q === "starter" ? "starter" : "pro";
  return (
    <PhaseStub title={`Create a ${tiers[slug].name} pool`} phase={3}>
      <ul className="space-y-2 text-sm text-ink-muted">
        <li>
          Seats: {settings.poolSeatsMin}–{settings.poolSeatsMax} (default {settings.poolSeatsDefault})
        </li>
        <li>
          Seat price at {settings.poolSeatsDefault} seats: <strong className="text-ink">{formatINR(seatPricePaise(slug))}</strong>
        </li>
        <li>Expiry: {settings.poolExpiryDays} days, then auto-refund via Razorpay</li>
        <li>Distribution: shared bundle (default) or assigned tools</li>
      </ul>
    </PhaseStub>
  );
}
