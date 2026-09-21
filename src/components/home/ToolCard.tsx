"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Lock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ToolLogo } from "@/components/brand/ToolLogo";
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
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      whileHover={reduce ? undefined : { y: -3, boxShadow: "var(--shadow-hover)" }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: (index % 8) * 0.05 }}
      className={cn("group card relative flex h-full flex-col gap-4 p-5", proOnly && "bg-[linear-gradient(180deg,#fdf8ee,white_40%)]")}
    >
      <div className="flex items-start justify-between gap-3">
        <ToolLogo slug={tool.slug} name={tool.vendor} logoUrl={tool.logoUrl} size={48} />
        {tool.badge && <Badge tone={badgeTone[tool.badge]}>{tool.badge}</Badge>}
      </div>

      <div className="flex-1">
        <p className="font-mono-label text-ink-faint">{tool.vendor}</p>
        <h3 className="mt-1 text-[17px] leading-snug">{tool.name}</h3>
        <p className="mt-1 text-sm font-medium text-primary">{tool.offerTitle}</p>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-muted">{tool.blurb}</p>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line pt-4">
        <span className="text-[13px] font-medium tabular-nums text-ink-muted" title="Listed annual retail value">
          {formatINR(tool.retailPaise)} <span className="text-ink-faint">retail</span>
        </span>
        {proOnly ? (
          <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-accent-2">
            <Lock size={12} /> Pro only
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-emerald-700">
            <Check size={13} strokeWidth={2.5} /> Included
          </span>
        )}
      </div>
    </motion.article>
  );
}
