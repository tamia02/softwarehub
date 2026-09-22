"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Panel } from "@/components/ui/Section";
import { categories, type ToolCategory } from "@/data/tools";
import { cn } from "@/lib/utils";
import { ToolCard, type CatalogTool } from "./ToolCard";

type Filter = "All" | ToolCategory;
const filters: Filter[] = ["All", ...categories];

/**
 * Two cream panels, measured from the reference: a 26→64px heading, a 4-up
 * grid of outlined offer cards (24px gap), and an upgrade banner between.
 */
export function Catalog({ core, pro }: { core: CatalogTool[]; pro: CatalogTool[]; starterRetailPaise: number; proRetailPaise: number }) {
  const [filter, setFilter] = useState<Filter>("All");
  const visible = (list: CatalogTool[]) => (filter === "All" ? list : list.filter((t) => t.category === filter));
  const proVisible = useMemo(() => visible(pro), [pro, filter]); // eslint-disable-line react-hooks/exhaustive-deps
  const coreVisible = useMemo(() => visible(core), [core, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  const chips = (
    <LayoutGroup id="catalog-filters">
      <div role="tablist" aria-label="Filter tools" className="mx-auto mt-6 flex flex-wrap justify-center gap-2 md:mt-8">
        {filters.map((f) => {
          const active = f === filter;
          return (
            <button
              key={f}
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(f)}
              className={cn("relative h-10 cursor-pointer rounded-[100px] border-2 border-ink-line px-4 text-[16px] font-medium leading-none transition-colors", active ? "text-on-primary" : "bg-bg-card text-ink hover:bg-accent-soft")}
            >
              {active && <motion.span layoutId="chip-bg" className="absolute inset-[-2px] rounded-[100px] bg-primary" transition={{ type: "spring", stiffness: 400, damping: 34 }} />}
              <span className="relative">{f}</span>
            </button>
          );
        })}
      </div>
    </LayoutGroup>
  );

  return (
    <>
      <Panel id="tools">
        <h2 className="t-h2 mx-auto w-full text-center text-ink">Pro-exclusive tools</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-[16px] leading-[1.4] text-ink-muted md:mt-4 md:text-[20px]">
          {pro.length} plans only the Pro Pass unlocks. Every one is the vendor&apos;s real paid tier, not a trial.
        </p>
        {chips}
        <Grid items={proVisible} />
        <div className="mt-12 flex flex-col items-center justify-center gap-6 text-center md:mt-16">
          <p className="text-[28px] font-bold leading-[1.1] text-ink md:text-[36px] xl:text-[40px]">Want every tool?</p>
          <a href="#pricing" className="group inline-flex items-center gap-1.5 text-[20px] font-medium text-ink transition-colors hover:text-accent-2 md:text-[24px]">
            Upgrade to the Pro Pass <ArrowRight size={22} className="transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </Panel>

      <Panel id="core-tools">
        <h2 className="t-h2 mx-auto w-full text-center text-ink">In every pass</h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-[16px] leading-[1.4] text-ink-muted md:mt-4 md:text-[20px]">
          {core.length} plans included with both the Starter and the Pro Pass.
        </p>
        <Grid items={coreVisible} />
      </Panel>
    </>
  );
}

function Grid({ items }: { items: CatalogTool[] }) {
  return (
    <>
      <motion.div layout className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:mt-10">
        <AnimatePresence mode="popLayout">
          {items.map((t, i) => (
            <ToolCard key={t.slug} tool={t} index={i} />
          ))}
        </AnimatePresence>
      </motion.div>
      {items.length === 0 && <p className="mt-8 rounded-[22px] border-2 border-dashed border-line-strong p-8 text-center text-[16px] text-ink-muted">No tools in this category here.</p>}
    </>
  );
}
