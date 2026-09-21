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
    <Section id="tools">
      <SectionHeading
        eyebrow="The catalogue"
        title={
          <>
            {core.length + pro.length} paid plans, <em className="font-normal italic text-primary">not trials.</em>
          </>
        }
        sub="Each entry is the vendor's real annual plan, claimed from your pass whenever you like during the year. Filter by the work you do."
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
                  "relative cursor-pointer rounded-full px-4 py-2 text-[13.5px] font-semibold transition-colors",
                  active ? "text-[#fbf6ec]" : "text-ink-muted hover:bg-bg-soft hover:text-ink",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="chip-bg"
                    className="absolute inset-0 rounded-full bg-primary"
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
        label={`Pro Pass only · ${pro.length} tools`}
        note={`Adds ${formatINRCompact(proRetailPaise - starterRetailPaise)} of value`}
        tone="pro"
        items={proVisible}
      />

      {/* Upgrade banner */}
      <div className="my-10 flex flex-col items-center justify-between gap-4 rounded-[20px] border border-line-strong bg-white px-6 py-5 sm:flex-row">
        <p className="text-[17px]">
          <span className="font-semibold">Want the Pro-only tools as well?</span>{" "}
          <span className="text-ink-muted">Pro Pass includes all {core.length + pro.length}.</span>
        </p>
        <a href="#pricing" className="inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-[#fbf6ec] shadow-[var(--shadow-button)] hover:bg-primary-600">
          See pricing <ArrowRight size={16} />
        </a>
      </div>

      {/* Core */}
      <CatalogGroup
        id="core-tools"
        icon={<Layers size={16} />}
        label={`In both passes · ${core.length} tools`}
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
      <div className="sticky top-[68px] z-10 -mx-5 mb-5 bg-[rgba(251,246,236,0.86)] px-5 py-3 backdrop-blur md:mx-0 md:px-0">
        <div className="flex items-center justify-between gap-3">
          <h3 className="inline-flex items-center gap-2.5 text-[17px]">
            <span
              className={cn(
                "grid h-7 w-7 place-items-center rounded-lg",
                tone === "pro" ? "bg-accent-soft text-primary" : "bg-primary text-[#fbf6ec]",
              )}
            >
              {icon}
            </span>
            {label}
          </h3>
          <span className="font-mono-label text-ink-faint">{note}</span>
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
