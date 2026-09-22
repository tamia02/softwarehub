"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card3D } from "@/components/ui/Card3D";
import { FadeUp } from "@/components/motion/FadeUp";
import { ProgressRing } from "@/components/motion/ProgressRing";
import { Hand, Panel } from "@/components/ui/Section";
import { settings } from "@/config/site";
import { tiers } from "@/data/tiers";
import type { PoolSummary } from "@/data/pools";
import { formatINR } from "@/lib/format";

const steps = [
  ["Open a pool, or join one", "Pick a pass and a seat count, then share the link."],
  ["Each seat pays its share", `Every member pays one seat. Funds are held until all ${settings.poolSeatsDefault} are in.`],
  ["Everyone gets the pass", "When the last seat is paid, the tools appear in each member's My Pass. Unfilled pools refund every seat."],
];

/** Pools: heading, three plain steps, three open pools. */
export function PoolExplainer({ pools }: { pools: PoolSummary[] }) {
  return (
    <Panel id="pool">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center">
        <h2 className="t-h2 text-ink-line">Split a pass ten ways</h2>
        <Hand>
          {formatINR(Math.ceil(tiers.starter.pricePaise / settings.poolSeatsDefault))} or {formatINR(Math.ceil(tiers.pro.pricePaise / settings.poolSeatsDefault))} a seat
        </Hand>
      </div>

      <ol className="mx-auto mt-10 grid max-w-4xl gap-8 md:mt-12 md:grid-cols-3">
        {steps.map(([title, desc], i) => (
          <FadeUp key={title} index={i} className="text-center md:text-left">
            <span className="font-hand text-[24px] leading-none text-accent-2">{i + 1}.</span>
            <h3 className="mt-1 text-[18px] font-bold leading-[1.2] text-ink-line">{title}</h3>
            <p className="mt-1.5 text-[15px] leading-[1.45] text-ink-muted">{desc}</p>
          </FadeUp>
        ))}
      </ol>

      {pools.length > 0 && (
        <div className="mx-auto mt-12 max-w-4xl md:mt-16">
          <div className="flex items-end justify-between gap-4">
            <h3 className="text-[22px] font-bold leading-none text-ink-line md:text-[26px]">Open pools</h3>
            <Button href="/checkout/pool" variant="secondary" size="sm">
              Create a pool
            </Button>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {pools.slice(0, 3).map((p, i) => (
              <PoolCard key={p.id} pool={p} index={i} />
            ))}
          </div>
        </div>
      )}
    </Panel>
  );
}

function PoolCard({ pool, index }: { pool: PoolSummary; index: number }) {
  const t = tiers[pool.tier];
  const left = pool.seats - pool.filled;
  return (
    <FadeUp index={index}>
      <Card3D className="h-full" bodyClassName="flex h-full flex-col gap-4 p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wider text-ink-faint">{t.name}</p>
            <p className="mt-1 text-[17px] font-bold leading-none text-ink-line">{pool.city ?? "Open pool"}</p>
          </div>
          <ProgressRing value={pool.filled} max={pool.seats} size={48} stroke={5}>
            <span className="text-[12px] font-bold tabular-nums">
              {pool.filled}/{pool.seats}
            </span>
          </ProgressRing>
        </div>
        <p className="text-[14px] text-ink-muted">
          {left === 1 ? "1 seat left" : `${left} seats left`} · <Countdown to={pool.expiresAt} />
        </p>
        <Button href={`/pool/${pool.id}`} size="sm" variant="secondary" className="w-full">
          Join for {formatINR(pool.seatPricePaise)}
        </Button>
      </Card3D>
    </FadeUp>
  );
}

function Countdown({ to }: { to: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);
  if (now === null) return <span className="skeleton inline-block h-3 w-12 align-middle" />;
  const ms = Math.max(0, new Date(to).getTime() - now);
  const h = Math.floor(ms / 3_600_000);
  const d = Math.floor(h / 24);
  return <span className="tabular-nums">{d > 0 ? `${d}d ${h % 24}h left` : `${h}h left`}</span>;
}
