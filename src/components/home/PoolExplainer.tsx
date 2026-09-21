"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight, Clock, Gift, UserPlus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FadeUp } from "@/components/motion/FadeUp";
import { ProgressRing } from "@/components/motion/ProgressRing";
import { Section, SectionHeading } from "@/components/ui/Section";
import { settings } from "@/config/site";
import { tiers } from "@/data/tiers";
import type { PoolSummary } from "@/data/pools";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

const steps = [
  { icon: <UserPlus size={22} />, title: "Open a pool, or join one", desc: "Choose a pass and a seat count, then share the link with your team, cohort or community." },
  { icon: <Wallet size={22} />, title: "Each seat pays its share", desc: `Every member pays a single seat by UPI or card. Funds are held until all ${settings.poolSeatsDefault} seats are in.` },
  { icon: <Gift size={22} />, title: "The pass is issued to everyone", desc: "The moment the last seat is paid, each member's tools appear in My Pass. If the pool doesn't fill in time, every seat is refunded." },
];

export function PoolExplainer({ pools }: { pools: PoolSummary[] }) {
  return (
    <Section id="pool" className="bg-bg-soft/50">
      <SectionHeading
        eyebrow="Pools"
        title={
          <>
            One pass, <em className="font-normal italic text-primary">ten people.</em>
          </>
        }
        sub={`Pay ${formatINR(Math.ceil(tiers.starter.pricePaise / settings.poolSeatsDefault))} or ${formatINR(
          Math.ceil(tiers.pro.pricePaise / settings.poolSeatsDefault),
        )} a seat. The same plans, the same twelve months, a tenth of the outlay.`}
      />

      <Stepper />

      <div className="mt-16 flex items-end justify-between gap-4">
        <div>
          <h3 className="font-display text-[28px] font-medium">Open pools</h3>
          <p className="mt-1 text-sm text-ink-muted">Take a seat in one that is nearly full, or start your own.</p>
        </div>
        <Button href="/checkout/pool" variant="secondary" className="hidden sm:inline-flex">
          Create a pool <ArrowRight size={16} />
        </Button>
      </div>

      <PoolCarousel pools={pools} />

      <div className="mt-6 sm:hidden">
        <Button href="/checkout/pool" variant="secondary" className="w-full">
          Create a pool <ArrowRight size={16} />
        </Button>
      </div>
    </Section>
  );
}

function Stepper() {
  const ref = useRef<HTMLOListElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();

  return (
    <ol ref={ref} className="relative mt-12 grid gap-8 md:grid-cols-3 md:gap-6">
      {/* connecting line (desktop) */}
      <div className="pointer-events-none absolute left-[16.6%] right-[16.6%] top-7 hidden h-[3px] rounded-full bg-line-strong md:block" aria-hidden>
        <motion.div
          className="h-full origin-left rounded-full bg-accent"
          initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : undefined}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        />
      </div>
      {steps.map((s, i) => (
        <FadeUp key={s.title} index={i} className="relative flex flex-col items-center text-center md:px-4">
          <motion.span
            className="relative z-10 grid h-14 w-14 place-items-center rounded-full border-4 border-bg bg-primary text-[#fff8e8] shadow-[var(--shadow-button)]"
            initial={reduce ? false : { scale: 0.6 }}
            animate={inView ? { scale: 1 } : undefined}
            transition={{ type: "spring", stiffness: 300, damping: 18, delay: 0.3 + i * 0.35 }}
          >
            {s.icon}
          </motion.span>
          <span className="font-mono-label mt-4 text-ink-faint">Step {i + 1}</span>
          <h3 className="mt-1 text-[17px]">{s.title}</h3>
          <p className="mt-2 max-w-xs text-sm text-ink-muted">{s.desc}</p>
        </FadeUp>
      ))}
    </ol>
  );
}

function PoolCarousel({ pools }: { pools: PoolSummary[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scrollBy = (dir: 1 | -1) => ref.current?.scrollBy({ left: dir * 320, behavior: "smooth" });

  return (
    <div className="relative mt-6">
      <div ref={ref} className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 [scrollbar-width:none] md:mx-0 md:px-0">
        {pools.map((p, i) => (
          <PoolCard key={p.id} pool={p} index={i} />
        ))}
      </div>
      <div className="mt-2 hidden justify-end gap-2 md:flex">
        <button onClick={() => scrollBy(-1)} aria-label="Previous pools" className="grid h-10 w-10 place-items-center rounded-full border-2 border-line-strong bg-white hover:bg-bg-soft">
          <ChevronLeft size={18} />
        </button>
        <button onClick={() => scrollBy(1)} aria-label="Next pools" className="grid h-10 w-10 place-items-center rounded-full border-2 border-line-strong bg-white hover:bg-bg-soft">
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}

function PoolCard({ pool, index }: { pool: PoolSummary; index: number }) {
  const t = tiers[pool.tier];
  const left = pool.seats - pool.filled;
  return (
    <FadeUp index={index} className="card flex w-[280px] shrink-0 snap-start flex-col gap-4 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className={cn("font-mono-label", pool.tier === "pro" ? "text-accent-2" : "text-primary")}>{t.name}</p>
          <p className="mt-0.5 text-sm text-ink-muted">{pool.city ?? "India"}</p>
        </div>
        <ProgressRing value={pool.filled} max={pool.seats} size={56} stroke={5}>
          <span className="text-xs font-semibold tabular-nums">
            {pool.filled}/{pool.seats}
          </span>
        </ProgressRing>
      </div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold">{left === 1 ? "1 seat left" : `${left} seats left`}</span>
        <span className="inline-flex items-center gap-1 text-ink-muted">
          <Clock size={14} /> <Countdown to={pool.expiresAt} />
        </span>
      </div>
      <Button href={`/pool/${pool.id}`} size="md" variant={pool.tier === "pro" ? "primary" : "dark"} className="w-full">
        Join for {formatINR(pool.seatPricePaise)}
      </Button>
      <Link href={`/pool/${pool.id}`} className="text-center text-xs font-semibold text-ink-muted hover:text-ink">
        View pool →
      </Link>
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
  if (now === null) return <span className="inline-block h-4 w-14 skeleton align-middle" />;
  const ms = Math.max(0, new Date(to).getTime() - now);
  const h = Math.floor(ms / 3_600_000);
  const d = Math.floor(h / 24);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return <span className="tabular-nums">{d > 0 ? `${d}d ${h % 24}h left` : `${h}h ${m}m left`}</span>;
}
