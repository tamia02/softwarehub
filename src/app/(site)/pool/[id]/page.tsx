import { notFound } from "next/navigation";
import { Clock, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ProgressRing } from "@/components/motion/ProgressRing";
import { mockPools } from "@/data/mockPools";
import { tiers } from "@/data/tiers";
import { settings } from "@/config/site";
import { formatINR } from "@/lib/format";

export const metadata = { title: "Pool" };

/**
 * Public pool page (Phase 3). Reads from mock data until GET /api/pools/:id
 * exists; the layout (ring, seats left, countdown, share, join) is final.
 */
export default async function PoolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const pool = mockPools.find((p) => p.id === id);
  if (!pool) notFound();
  const tier = tiers[pool.tier];
  const left = pool.seats - pool.filled;
  const expires = new Date(pool.expiresAt);

  return (
    <div className="container-page py-12 md:py-16">
      <div className="card mx-auto max-w-2xl p-7 md:p-10">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <ProgressRing value={pool.filled} max={pool.seats} size={120} stroke={10}>
            <div className="text-center">
              <p className="font-display text-2xl font-black leading-none tabular-nums">
                {pool.filled}/{pool.seats}
              </p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">seats</p>
            </div>
          </ProgressRing>
          <div className="flex-1 text-center sm:text-left">
            <p className="text-xs font-black uppercase tracking-wider text-primary">{tier.name} pool</p>
            <h1 className="mt-1 text-[28px] font-black leading-tight">
              {left === 1 ? "1 seat left" : `${left} seats left`} · {pool.city}
            </h1>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink-muted">
              <Clock size={15} /> Closes {expires.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
            </p>
            <p className="mt-4 text-ink-muted">
              {pool.seats} members share one {tier.name} bundle. Each seat is {formatINR(pool.seatPricePaise)}, held in
              escrow and refunded automatically if the pool does not fill within {settings.poolExpiryDays} days.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="flex-1" disabled>
            Join for {formatINR(pool.seatPricePaise)}
          </Button>
          <Button size="lg" variant="secondary" disabled>
            <Share2 size={16} /> Share link
          </Button>
        </div>
        <p className="mt-3 text-center text-xs text-ink-faint">Joining and sharing go live in Phase 3 (escrow payments + expiry cron).</p>

        <div className="mt-8 rounded-2xl bg-bg-soft p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink-faint">Members</h2>
          <ul className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-10">
            {Array.from({ length: pool.seats }).map((_, i) => (
              <li
                key={i}
                className={`grid aspect-square place-items-center rounded-full text-xs font-bold ${
                  i < pool.filled ? "bg-primary text-white" : "border-2 border-dashed border-line text-ink-faint"
                }`}
                title={i < pool.filled ? `Seat ${i + 1} · paid` : `Seat ${i + 1} · open`}
              >
                {i + 1}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
