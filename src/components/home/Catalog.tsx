"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import { ArrowRight, Crown, Layers } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { categories, type ToolCategory } from "@/data/tools";
import { formatINRCompact } from "@/lib/format";
import { cn } from "@/lib/utils";
import { ToolCard, type CatalogTool } from "./ToolCard";

type Filter = "All" | ToolCategory;
const filters: Filter[] = ["All", ...categories];

export function Catalog({
  core,
  pro,
  starterRetailPaise,
  proRetailPaise,
}: {
  core: CatalogTool[];
  pro: CatalogTool[];
  starterRetailPaise: number;
  proRetailPaise: number;
}) {
  const [filter, setFilter] = useState<Filter>("All");
  const visible = (list: CatalogTool[]) => (filter === "All" ? list : list.filter((t) => t.category === filter));
  const proVisible = useMemo(() => visible(pro), [pro, filter]); // eslint-disable-line react-hooks/exhaustive-deps
  const coreVisible = useMemo(() => visible(core), [core, filter]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Section id="tools" className="bg-white">
      <SectionHeading
        eyebrow="The catalog"
        title={
          <>
            {core.length + pro.length} tools. One code. <span className="text-primary">A whole year.</span>
          </>
        }
        sub="Every tool below is a full paid plan, not a trial. Filter by what you build."
      />

      {/* Filter chips */}
      <LayoutGroup id="catalog-filters">
        <div role="tablist" aria-label="Filter tools" className="mt-8 flex flex-wrap justify-center gap-2">
          {filters.map((f) => {
            const active = f === filter;
            return (
              <button
                key={f}
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(f)}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                  active ? "text-white" : "text-ink-muted hover:bg-bg-soft hover:text-ink",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="chip-bg"
                    className="absolute inset-0 rounded-full bg-ink"
                    transition={{ type: "spring", stiffness: 400, damping: 34 }}
                  />
                )}
                <span className="relative">{f}</span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>

      {/* Pro-exclusive */}
      <CatalogGroup
        id="pro-tools"
        icon={<Crown size={16} />}
        label={`Pro-exclusive (${pro.length})`}
        note={`Adds ${formatINRCompact(proRetailPaise - starterRetailPaise)} of value`}
        tone="pro"
        items={proVisible}
      />

      {/* Upgrade banner */}
      <div className="my-10 flex flex-col items-center justify-between gap-4 rounded-[20px] border border-amber-200 bg-accent-soft px-6 py-5 sm:flex-row">
        <p className="font-display text-lg font-extrabold">
          Want every tool? <span className="text-amber-800">Upgrade to Pro Pass</span>
        </p>
        <a href="#pricing" className="inline-flex items-center gap-1.5 rounded-full bg-ink px-5 py-2.5 text-sm font-bold text-white hover:bg-black">
          See pricing <ArrowRight size={16} />
        </a>
      </div>

      {/* Core */}
      <CatalogGroup
        id="core-tools"
        icon={<Layers size={16} />}
        label={`Included in every pass (${core.length})`}
        note={`${formatINRCompact(starterRetailPaise)} of value`}
        tone="core"
        items={coreVisible}
      />
    </Section>
  );
}

function CatalogGroup({
  id,
  icon,
  label,
  note,
  tone,
  items,
}: {
  id: string;
  icon: React.ReactNode;
  label: string;
  note: string;
  tone: "pro" | "core";
  items: CatalogTool[];
}) {
  return (
    <div id={id} className="mt-10">
      <div className="sticky top-[68px] z-10 -mx-5 mb-5 bg-white/85 px-5 py-3 backdrop-blur md:mx-0 md:px-0">
        <div className="flex items-center justify-between gap-3">
          <h3 className="inline-flex items-center gap-2 text-lg font-extrabold">
            <span
              className={cn(
                "grid h-7 w-7 place-items-center rounded-lg",
                tone === "pro" ? "bg-accent text-ink" : "bg-primary-soft text-primary",
              )}
            >
              {icon}
            </span>
            {label}
          </h3>
          <span className="text-sm font-semibold text-ink-muted">{note}</span>
        </div>
      </div>

      <motion.div layout className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {items.map((t, i) => (
            <ToolCard key={t.slug} tool={t} index={i} />
          ))}
        </AnimatePresence>
      </motion.div>
      {items.length === 0 && (
        <p className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-ink-muted">
          No tools in this category here.
        </p>
      )}
    </div>
  );
}
