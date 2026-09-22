"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Clock, Gift, UserPlus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card3D } from "@/components/ui/Card3D";
import { FadeUp } from "@/components/motion/FadeUp";
import { ProgressRing } from "@/components/motion/ProgressRing";
import { Hand, Panel } from "@/components/ui/Section";
import { settings } from "@/config/site";
import { tiers } from "@/data/tiers";
import type { PoolSummary } from "@/data/pools";
import { formatINR, formatUSDFromPaise } from "@/lib/format";
import { cn } from "@/lib/utils";

const steps = [
  { icon: <UserPlus size={22} />, title: "Open a pool, or join one", desc: "Choose a pass and a seat count, then share the link with your team, cohort or community." },
  { icon: <Wallet size={22} />, title: "Each seat pays its share", desc: `Every member pays a single seat by UPI or card. Funds are held until all ${settings.poolSeatsDefault} seats are in.` },
  { icon: <Gift size={22} />, title: "The pass is issued to everyone", desc: "When the last seat is paid, each member's tools appear in My Pass. If the pool doesn't fill in time, every seat is refunded." },
];

export function PoolExplainer({ pools, usdInrRate }: { pools: PoolSummary[]; usdInrRate: number }) {
  return (
    <Panel id="pool">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 text-center md:gap-5">
        <h2 className="t-h2 text-ink">Split a pass ten ways</h2>
        <Hand>
          {formatINR(Math.ceil(tiers.starter.pricePaise / settings.poolSeatsDefault))} or {formatINR(Math.ceil(tiers.pro.pricePaise / settings.poolSeatsDefault))} a seat
        </Hand>
        <p className="text-[16px] leading-[1.4] text-ink-muted md:text-[20px]">The same plans, the same twelve months, a tenth of the outlay.</p>
      </div>

      <Stepper />

      <div className="mt-14 flex items-end justify-between gap-4 md:mt-20">
        <div>
          <h3 className="text-[26px] font-bold leading-none text-ink md:text-[32px]">Open pools</h3>
          <p className="mt-2 text-[16px] text-ink-muted">Take a seat in one that is nearly full, or start your own.</p>
        </div>
        <Button href="/checkout/pool" variant="secondary" size="md" className="hidden sm:inline-flex">
          Create a pool
        </Button>
      </div>

      <PoolCarousel pools={pools} usdInrRate={usdInrRate} />

      <div className="mt-6 sm:hidden">
        <Button href="/checkout/pool" variant="secondary" className="w-full">
          Create a pool
        </Button>
      </div>
    </Panel>
  );
}

function Stepper() {
  const ref = useRef<HTMLOListElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  return (
    <ol ref={ref} className="relative mt-10 grid gap-8 md:mt-14 md:grid-cols-3 md:gap-6">
      <div className="pointer-events-none absolute left-[16.6%] right-[16.6%] top-7 hidden h-[3px] rounded-full bg-line-strong md:block" aria-hidden>
        <motion.div className="h-full origin-left rounded-full bg-ink-line" initial={reduce ? { scaleX: 1 } : { scaleX: 0 }} animate={inView ? { scaleX: 1 } : undefined} transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }} />
      </div>
      {steps.map((s, i) => (
        <FadeUp key={s.title} index={i} className="relative flex flex-col items-center text-center md:px-4">
          <motion.span className="relative z-10 grid h-14 w-14 place-items-center rounded-full border-2 border-ink-line bg-accent text-on-accent" initial={reduce ? false : { scale: 0.6 }} animate={inView ? { scale: 1 } : undefined} transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.3 + i * 0.35 }}>
            {s.icon}
          </motion.span>
          <span className="font-hand mt-4 text-[24px] leading-none text-accent-2">Step {i + 1}</span>
          <h3 className="mt-1.5 text-[20px] font-bold leading-[1.2] text-ink">{s.title}</h3>
          <p className="mt-2 max-w-xs text-[16px] leading-[1.4] text-ink-muted">{s.desc}</p>
        </FadeUp>
      ))}
    </ol>
  );
}

function PoolCarousel({ pools, usdInrRate }: { pools: PoolSummary[]; usdInrRate: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });
  return (
    <div className="relative mt-6">
      <div ref={ref} className="-mx-3 flex snap-x snap-mandatory gap-6 overflow-x-auto px-3 pb-4 pt-2 [scrollbar-width:none] md:mx-0 md:px-0">
        {pools.map((p, i) => (
          <PoolCard key={p.id} pool={p} index={i} usdInrRate={usdInrRate} />
        ))}
      </div>
      <div className="mt-2 hidden justify-end gap-2 md:flex">
        <button onClick={() => scrollBy(-1)} aria-label="Previous pools" className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border-2 border-ink-line bg-bg-card hover:bg-accent-soft">
          <ChevronLeft size={18} />
        </button>
        <button onClick={() => scrollBy(1)} aria-label="Next pools" className="grid h-11 w-11 cursor-pointer place-items-center rounded-full border-2 border-ink-line bg-bg-card hover:bg-accent-soft">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function PoolCard({ pool, index, usdInrRate }: { pool: PoolSummary; index: number; usdInrRate: number }) {
  const t = tiers[pool.tier];
  const left = pool.seats - pool.filled;
  return (
    <FadeUp index={index} className="w-[290px] shrink-0 snap-start">
      <Card3D className="h-full" bodyClassName="flex h-full flex-col gap-4 p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className={cn("text-[13px] font-bold uppercase tracking-wider", pool.tier === "pro" ? "text-accent-2" : "text-primary")}>{t.name}</p>
            <p className="mt-1 text-[18px] font-bold leading-none text-ink">{pool.city ?? "Open pool"}</p>
          </div>
          <ProgressRing value={pool.filled} max={pool.seats} size={56} stroke={6}>
            <span className="text-[13px] font-bold tabular-nums">
              {pool.filled}/{pool.seats}
            </span>
          </ProgressRing>
        </div>
        <div className="flex items-center justify-between text-[15px]">
          <span className="font-bold text-ink">{left === 1 ? "1 seat left" : `${left} seats left`}</span>
          <span className="inline-flex items-center gap-1 text-ink-muted">
            <Clock size={14} /> <Countdown to={pool.expiresAt} />
          </span>
        </div>
        <Button href={`/pool/${pool.id}`} size="md" variant={pool.tier === "pro" ? "primary" : "secondary"} className="w-full">
          Join for {formatINR(pool.seatPricePaise)}
        </Button>
        <p className="-mt-2 text-center text-[13px] text-ink-faint">{formatUSDFromPaise(pool.seatPricePaise, usdInrRate)} a seat</p>
        <Link href={`/pool/${pool.id}`} className="text-center text-[14px] font-medium text-ink-muted hover:text-ink">
          View pool →
        </Link>
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
  if (now === null) return <span className="skeleton inline-block h-4 w-14 align-middle" />;
  const ms = Math.max(0, new Date(to).getTime() - now);
  const h = Math.floor(ms / 3_600_000);
  const d = Math.floor(h / 24);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return <span className="tabular-nums">{d > 0 ? `${d}d ${h % 24}h left` : `${h}h ${m}m left`}</span>;
}
