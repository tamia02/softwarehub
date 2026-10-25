import { ChevronDown, Clock } from "lucide-react";
import { methods } from "@/data/methods";
import { cn } from "@/lib/utils";

const tierTone: Record<string, string> = {
  Free: "bg-emerald-50 text-emerald-700",
  Pro: "bg-amber-50 text-amber-700",
};

const categoryTone: Record<string, string> = {
  Growth: "text-accent-2",
  Reselling: "text-[#3b5bdb]",
  Automation: "text-[#7c3aed]",
  Security: "text-emerald-700",
};

/** Step-by-step playbooks, as expandable cards. */
export function MethodsList() {
  return (
    <section id="playbooks" className="container-page scroll-mt-32 pt-10">
      <div className="mb-4">
        <h2 className="t-h2 text-ink">Playbooks</h2>
        <p className="mt-1 text-[14px] text-ink-muted">{methods.length} guides · free to read · tap one to see the steps</p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {methods.map((m) => (
          <details key={m.slug} className="group card overflow-hidden p-0 [&_summary::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-3 p-4 sm:p-5">
              <div className="min-w-0">
                <p className={cn("text-[12px] font-semibold uppercase tracking-[0.08em]", categoryTone[m.category] ?? "text-ink-faint")}>{m.category}</p>
                <h3 className="mt-1 text-[16px] font-bold leading-snug text-ink group-hover:text-accent-2">{m.title}</h3>
                <p className="mt-1 text-[13.5px] leading-snug text-ink-muted">{m.summary}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-ink-faint">
                  <Clock size={12} /> {m.minutes} min read · {m.steps.length} steps
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className={cn("rounded-[6px] px-2 py-0.5 text-[11px] font-semibold", tierTone[m.tier])}>{m.tier}</span>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-bg text-ink-muted transition-transform group-open:rotate-180">
                  <ChevronDown size={16} />
                </span>
              </div>
            </summary>
            <ol className="space-y-2.5 border-t border-line bg-bg/60 px-4 py-4 sm:px-5">
              {m.steps.map((s, i) => (
                <li key={i} className="flex gap-3 text-[14px] leading-snug text-ink">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary text-[11.5px] font-bold text-white">{i + 1}</span>
                  <span className="pt-0.5">{s}</span>
                </li>
              ))}
            </ol>
          </details>
        ))}
      </div>
    </section>
  );
}
