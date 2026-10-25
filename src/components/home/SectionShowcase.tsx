import Link from "next/link";
import { ArrowRight, RefreshCw, Terminal, TrendingUp, Wallet, Zap } from "lucide-react";
import { smmPlatforms, smmStats } from "@/data/smm";
import { methods } from "@/data/methods";

const growPoints = [
  { icon: RefreshCw, text: "Non-drop growth with auto-refill" },
  { icon: Zap, text: "Orders dispatch in minutes, tracked live" },
  { icon: Wallet, text: "Top up once — order from the panel or API" },
];

/**
 * Home showcase for the two non-marketplace sections: Grow (SMM panel) and
 * Methods (playbooks + browser tools). Counts come from the real catalogues.
 */
export function SectionShowcase() {
  const preview = methods.slice(0, 4);
  return (
    <section className="container-page pt-4" aria-label="Grow and Methods">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Grow */}
        <Link
          href="/growth"
          className="group relative flex flex-col overflow-hidden rounded-[var(--r-card-lg)] border border-ink-line bg-bg-card p-6 shadow-[var(--shadow-card)] transition-[box-shadow,border-color] duration-200 hover:border-line-strong hover:shadow-[var(--shadow-hover)] md:p-7"
        >
          <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,rgba(239,65,54,0.14),transparent)]" />
          <div className="relative flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-accent text-white">
              <TrendingUp size={21} />
            </span>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-accent-2">Grow · SMM panel</p>
              <h2 className="text-[20px] font-extrabold leading-tight text-ink md:text-[22px]">Grow every platform at wholesale rates</h2>
            </div>
          </div>

          <div className="relative mt-5 flex flex-wrap gap-1.5">
            {smmPlatforms.map((p) => (
              <span key={p} className="rounded-[6px] border border-line bg-bg px-2 py-1 text-[12px] font-medium text-ink-muted">
                {p}
              </span>
            ))}
          </div>

          <ul className="relative mb-6 mt-5 space-y-2.5">
            {growPoints.map((g) => (
              <li key={g.text} className="flex items-center gap-2.5 text-[14px] text-ink-muted">
                <g.icon size={15} className="shrink-0 text-accent-2" /> {g.text}
              </li>
            ))}
          </ul>

          <div className="relative mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
            <p className="text-[13px] text-ink-faint">
              <span className="font-semibold text-ink">{smmStats.services}+ services</span> across {smmStats.platforms} platforms
            </p>
            <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[8px] bg-accent px-4 py-2.5 text-[14px] font-semibold text-white transition-colors group-hover:bg-accent-2">
              Open Grow <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>

        {/* Methods */}
        <Link
          href="/methods"
          className="group relative flex flex-col overflow-hidden rounded-[var(--r-card-lg)] bg-primary p-6 text-on-primary transition-shadow duration-200 hover:shadow-[var(--shadow-hover)] md:p-7"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_70%_at_100%_0%,rgba(239,65,54,0.28),transparent_60%)]" />
          <div className="relative flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-[12px] bg-white/10 text-accent ring-1 ring-inset ring-white/15">
              <Terminal size={21} />
            </span>
            <div>
              <p className="text-[12px] font-semibold uppercase tracking-[0.1em] text-accent">Methods · free playbooks</p>
              <h2 className="text-[20px] font-extrabold leading-tight text-white md:text-[22px]">Learn the method, then run the tools</h2>
            </div>
          </div>

          <ul className="relative mb-6 mt-5 divide-y divide-white/10 rounded-[10px] bg-white/[0.05] ring-1 ring-inset ring-white/10">
            {preview.map((m) => (
              <li key={m.slug} className="flex items-center justify-between gap-3 px-3.5 py-2.5">
                <span className="truncate text-[13.5px] text-white/85">{m.title}</span>
                <span className={`shrink-0 rounded-[5px] px-1.5 py-0.5 text-[11px] font-semibold ${m.tier === "Free" ? "bg-emerald-400/15 text-emerald-300" : "bg-amber-400/15 text-amber-300"}`}>{m.tier}</span>
              </li>
            ))}
          </ul>

          <div className="relative mt-auto flex items-center justify-between gap-3 border-t border-white/10 pt-4">
            <p className="text-[13px] text-white/55">
              <span className="font-semibold text-white">{methods.length} guides</span> · step by step · free tools
            </p>
            <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[8px] bg-accent px-4 py-2.5 text-[14px] font-semibold text-white transition-colors group-hover:bg-accent-2">
              Explore <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
