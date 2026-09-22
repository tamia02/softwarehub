import { labCatalog, labStats } from "@/data/labtools";

const tierTone: Record<string, string> = {
  Free: "bg-[#123024] text-[#34d399]",
  Pro: "bg-[#2a2410] text-[#f5c542]",
  VIP: "bg-[#2a1030] text-[#e879f9]",
};

/** Dark, terminal-styled tool grid for The Lab landing page. */
export function LabCatalogue() {
  return (
    <section id="tools" className="scroll-mt-24 border-t border-[#1f2a25] bg-[#0b0f0e] py-12 md:py-16">
      <div className="container-page">
        <h2 className="t-h2 text-[#f2fbf6]">The toolkit</h2>
        <p className="mt-2 font-code text-[13px] text-[#9fb6ac]">
          {labStats.total} tools · {labStats.free} free · {labStats.pro} pro · {labStats.vip} vip — all run in your browser
        </p>

        <div className="mt-8 space-y-8">
          {labCatalog.map((g) => (
            <div key={g.group}>
              <h3 className="font-code text-[13px] uppercase tracking-[0.15em] text-[#34d399]">// {g.group}</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {g.tools.map((tool) => (
                  <div key={tool.name} className="flex items-start justify-between gap-3 rounded-[14px] border border-[#1f2a25] bg-[#111815] p-3.5">
                    <div>
                      <p className="text-[14px] font-bold text-[#e7f6ef]">{tool.name}</p>
                      <p className="mt-0.5 text-[12px] leading-snug text-[#9fb6ac]">{tool.desc}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${tierTone[tool.tier]}`}>{tool.tier}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
