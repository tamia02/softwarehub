import { ArrowRight } from "lucide-react";
import { Panel } from "@/components/ui/Section";
import { ToolCard, type CatalogTool } from "./ToolCard";

/** Two cream panels: Pro-only offers, then the offers in every pass. Heading, one line, grid. */
export function Catalog({ core, pro }: { core: CatalogTool[]; pro: CatalogTool[]; starterRetailPaise: number; proRetailPaise: number }) {
  return (
    <>
      <Panel id="tools">
        <h2 className="t-h2 mx-auto w-full text-center text-ink-line">Pro-exclusive tools</h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-[16px] leading-[1.45] text-ink-muted md:text-[18px]">{pro.length} plans only the Pro Pass unlocks.</p>
        <Grid items={pro} />
        <div className="mt-12 flex flex-col items-center gap-4 text-center md:mt-16">
          <p className="text-[26px] font-bold leading-[1.1] text-ink-line md:text-[32px]">Want every tool?</p>
          <a href="#pricing" className="group inline-flex items-center gap-1.5 text-[18px] font-medium text-ink-line transition-colors hover:text-accent-2 md:text-[20px]">
            Upgrade to the Pro Pass <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </Panel>

      <Panel id="core-tools">
        <h2 className="t-h2 mx-auto w-full text-center text-ink-line">In every pass</h2>
        <p className="mx-auto mt-3 max-w-lg text-center text-[16px] leading-[1.45] text-ink-muted md:text-[18px]">{core.length} plans included with both the Starter and the Pro Pass.</p>
        <Grid items={core} />
      </Panel>
    </>
  );
}

function Grid({ items }: { items: CatalogTool[] }) {
  return (
    <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:mt-12">
      {items.map((t, i) => (
        <ToolCard key={t.slug} tool={t} index={i} />
      ))}
    </div>
  );
}
