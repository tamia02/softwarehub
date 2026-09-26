import { methods } from "@/data/methods";

const tierTone: Record<string, string> = {
  Free: "bg-[#123024] text-[#34d399]",
  Pro: "bg-[#2a2410] text-[#f5c542]",
};

/** Dark, terminal-styled how-to guides for the Methods page. */
export function MethodsList() {
  return (
    <section id="playbooks" className="scroll-mt-24 border-t border-[#1f2a25] bg-[#0b0f0e] py-12 md:py-16">
      <div className="container-page">
        <h2 className="font-hack text-[30px] font-normal uppercase tracking-[0.02em] text-[#f2fbf6] text-neon md:text-[40px]">{"> "}Methods — learn, step by step</h2>
        <p className="mt-2 font-hack text-[13px] text-[#9fb6ac]">{methods.length} guides · free to read · each links the tools you need</p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {methods.map((m) => (
            <details key={m.slug} className="group rounded-[16px] border border-[#1f2a25] bg-[#111815] p-5 transition-colors duration-200 open:bg-[#141c18] hover:border-[#34d399]/40">
              <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                <div>
                  <p className="font-hack text-[11px] uppercase tracking-[0.15em] text-[#34d399]">{"//"} {m.category}</p>
                  <h3 className="mt-1 font-hack text-[17px] font-normal text-[#e7f6ef] transition-colors group-hover:text-[#34d399]">{m.title}</h3>
                  <p className="mt-1 text-[13px] leading-snug text-[#9fb6ac]">{m.summary}</p>
                  <p className="mt-2 font-hack text-[11px] text-[#7f948b]">{m.minutes} min read · {m.steps.length} steps</p>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 font-hack text-[10px] font-bold transition-transform group-open:rotate-0 group-hover:scale-105 ${tierTone[m.tier]}`}>{m.tier}</span>
              </summary>
              <ol className="mt-4 space-y-2 border-t border-[#1f2a25] pt-4">
                {m.steps.map((s, i) => (
                  <li key={i} className="flex gap-3 text-[13px] text-[#c7d6cf]">
                    <span className="font-hack text-[#34d399]">{String(i + 1).padStart(2, "0")}</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ol>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
