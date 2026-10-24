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
      <div className="grid gap-4 lg:grid-cols-2">
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
            <span className="inline-flex items-center gap-1.5 rounded-[8px] bg-accent px-4 py-2 text-[14px] font-semibold text-white transition-colors group-hover:bg-accent-2">
              Open Grow <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>

        {/* Methods */}
        <Link
          href="/methods"
          className="group relative flex flex-col overflow-hidden rounded-[var(--r-card-lg)] border border-[#1c2a24] bg-[#08100d] p-6 text-[#c7d6cf] transition-[border-color,box-shadow] duration-200 hover:border-[#34d399]/50 hover:shadow-[0_12px_32px_rgba(52,211,153,0.10)] md:p-7"
        >
          <div aria-hidden className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(52,211,153,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.05)_1px,transparent_1px)] [background-size:28px_28px]" />
          <div className="relative flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-[12px] border border-[#34d399]/30 bg-[#34d399]/10 text-[#34d399]">
              <Terminal size={21} />
            </span>
            <div>
              <p className="font-term text-[12px] uppercase tracking-[0.12em] text-[#34d399]">Methods · free playbooks</p>
              <h2 className="text-[20px] font-extrabold leading-tight text-[#f2fbf6] md:text-[22px]">Learn the method, then run the tools</h2>
            </div>
          </div>

          <div className="relative mb-6 mt-5 rounded-[10px] border border-[#1c2a24] bg-black/40 p-3 font-term text-[12.5px]">
            <p className="text-[#5f746b]">
              <span className="text-[#34d399]">$</span> methods --list
            </p>
            <ul className="mt-2 space-y-1.5">
              {preview.map((m) => (
                <li key={m.slug} className="flex items-center justify-between gap-3">
                  <span className="truncate text-[#c7d6cf]">
                    <span className="text-[#3f5249]">›</span> {m.title}
                  </span>
                  <span className={`shrink-0 text-[11px] ${m.tier === "Free" ? "text-[#34d399]" : "text-[#f5c542]"}`}>{m.tier}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative mt-auto flex items-center justify-between gap-3 border-t border-[#1c2a24] pt-4">
            <p className="text-[13px] text-[#7f948b]">
              <span className="font-semibold text-[#e7f6ef]">{methods.length} guides</span> · step by step · tools run in your browser
            </p>
            <span className="inline-flex items-center gap-1.5 rounded-[8px] bg-[#34d399] px-4 py-2 text-[14px] font-semibold text-[#04120c] transition-colors group-hover:bg-[#5eead4]">
              Explore <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
