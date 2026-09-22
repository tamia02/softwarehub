import { notFound } from "next/navigation";
import { Clock, Users } from "lucide-react";
import { ProgressRing } from "@/components/motion/ProgressRing";
import { JoinPool, ShareLink } from "@/components/pool/JoinPool";
import { Badge } from "@/components/ui/Badge";
import { site } from "@/config/site";
import { getSessionUser } from "@/lib/auth.server";
import { formatINR } from "@/lib/format";
import { getPool } from "@/lib/pools.server";
import { getSettings } from "@/lib/settings.server";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const d = await getPool(id);
  if (!d) return { title: "Pool" };
  return {
    title: `${d.tier?.name} pool — ${d.seatsLeft} seats left`,
    description: `Join for ${formatINR(d.pool.seatPricePaise)} and get every ${d.tier?.name} tool for a year.`,
  };
}

const statusTone: Record<string, "neutral" | "success" | "pro" | "limited" | "new"> = {
  open: "success",
  filled: "pro",
  paid: "pro",
  fulfilled: "new",
  expired: "limited",
};

/** Public pool page: progress ring, seats left, countdown, share, join. */
export default async function PoolPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [d, user, s] = await Promise.all([getPool(id), getSessionUser(), getSettings()]);
  if (!d) notFound();
  const { pool, members, tier, paidSeats, seatsLeft } = d;
  const mine = user ? members.find((m) => m.userId === user.id && (m.paidAt || pool.paymentModel === "single")) : undefined;
  const open = pool.status === "open" && pool.expiresAt > new Date();
  const url = `${site.url}/pool/${pool.id}`;

  return (
    <div className="container-page py-12 md:py-16">
      <div className="card mx-auto max-w-2xl p-7 md:p-10">
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <ProgressRing value={paidSeats} max={pool.seats} size={120} stroke={10}>
            <div className="text-center">
              <p className="font-display text-2xl font-black leading-none tabular-nums">
                {paidSeats}/{pool.seats}
              </p>
              <p className="text-[11px] font-bold uppercase tracking-wider text-ink-faint">seats</p>
            </div>
          </ProgressRing>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <p className="text-xs font-black uppercase tracking-wider text-primary">{tier?.name} pool</p>
              <Badge tone={statusTone[pool.status] ?? "neutral"}>{pool.status}</Badge>
            </div>
            <h1 className="mt-1 text-[28px] font-black leading-tight">{pool.name ?? `${tier?.name} pool`}</h1>
            <p className="mt-2 inline-flex items-center gap-1.5 text-sm text-ink-muted">
              <Clock size={15} />
              {open ? `Closes ${pool.expiresAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}` : `Closed`}
              <span className="mx-1">·</span>
              <Users size={15} /> {seatsLeft === 1 ? "1 seat left" : `${seatsLeft} seats left`}
            </p>
            <p className="mt-4 text-ink-muted">
              {pool.seats} members share one {tier?.name} bundle. Each seat is <strong className="text-ink">{formatINR(pool.seatPricePaise)}</strong>
              {pool.paymentModel === "escrow"
                ? `, held in escrow and refunded automatically if the pool does not fill within ${s.poolExpiryDays} days.`
                : `, collected by the pool organiser.`}
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <JoinPool poolId={pool.id} seatPricePaise={pool.seatPricePaise} open={open} alreadyIn={!!mine} signedIn={!!user} single={pool.paymentModel === "single"} />
          <ShareLink url={url} />
        </div>
        {mine?.passId && (
          <p className="mt-3 text-center text-sm">
            Your tools are ready —{" "}
            <a href="/account" className="font-bold text-primary hover:underline">
              open My Pass →
            </a>
          </p>
        )}

        <div className="mt-8 rounded-2xl bg-bg-soft p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-ink-faint">Seats</h2>
          <ul className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-10">
            {Array.from({ length: pool.seats }).map((_, i) => {
              const m = members.find((x) => x.seatNo === i + 1);
              const paid = !!m && (!!m.paidAt || pool.paymentModel === "single");
              return (
                <li
                  key={i}
                  className={`grid aspect-square place-items-center rounded-full text-xs font-bold ${
                    paid ? "bg-primary text-on-primary" : m ? "bg-primary-soft text-accent" : "border-2 border-dashed border-line text-ink-faint"
                  }`}
                  title={paid ? `Seat ${i + 1} · paid` : m ? `Seat ${i + 1} · reserved` : `Seat ${i + 1} · open`}
                >
                  {i + 1}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
