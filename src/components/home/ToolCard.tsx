"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { VendorTile } from "@/components/brand/VendorMark";
import type { Tool } from "@/data/tools";
import { formatINR } from "@/lib/format";
import { cn } from "@/lib/utils";

export type CatalogTool = Tool & { retailPaise: number };

const badgeTone = { NEW: "new", LIMITED: "limited", PRO: "pro" } as const;

export function ToolCard({ tool, index = 0 }: { tool: CatalogTool; index?: number }) {
  const reduce = useReducedMotion();
  const proOnly = tool.tierMin === "pro";

  return (
    <motion.article
      data-motion=""
      layout
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      whileHover={reduce ? undefined : { y: -4, boxShadow: "var(--shadow-hover)" }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1], delay: (index % 8) * 0.06 }}
      className={cn(
        "group card relative flex h-full flex-col gap-4 p-5 transition-colors",
        proOnly && "border-line-strong bg-[linear-gradient(180deg,#fff7e3,white_45%)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="mark-gray">
          <VendorTile name={tool.vendor} hue={tool.hue} size={52} />
        </div>
        {tool.badge && <Badge tone={badgeTone[tool.badge]}>{tool.badge}</Badge>}
      </div>

      <div className="flex-1">
        <p className="font-display text-[12px] font-semibold uppercase tracking-[0.14em] text-ink-faint">{tool.vendor}</p>
        <h3 className="mt-0.5 text-[19px] font-semibold leading-snug">{tool.name}</h3>
        <p className="mt-1 font-display text-sm font-medium text-primary">{tool.offerTitle}</p>
        <p className="mt-2 text-sm text-ink-muted">{tool.blurb}</p>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-dashed border-line-strong pt-4">
        <span className="rounded-full bg-accent-soft px-2.5 py-1 font-display text-xs font-semibold text-primary" title="Listed annual retail value">
          {formatINR(tool.retailPaise)} value
        </span>
        {proOnly ? (
          <span className="inline-flex items-center gap-1 font-display text-xs font-semibold text-accent-2">
            <Lock size={13} /> Pro only
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 font-display text-xs font-semibold text-emerald-700">
            <Check size={14} /> Included
          </span>
        )}
      </div>
    </motion.article>
  );
}
