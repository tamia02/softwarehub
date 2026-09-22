"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Lock } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ToolLogo } from "@/components/brand/ToolLogo";
import type { Tool } from "@/data/tools";
import { formatINR, formatUSD } from "@/lib/format";

export type CatalogTool = Tool & { retailPaise: number };

const badgeTone = { NEW: "new", LIMITED: "limited", PRO: "pro" } as const;

/**
 * Offer card, measured: 24px padding, 14px gaps, logo row 44px, title
 * 16→20px bold, 16px description, hand-script value, pill action.
 */
export function ToolCard({ tool, index = 0 }: { tool: CatalogTool; index?: number }) {
  const reduce = useReducedMotion();
  const proOnly = tool.tierMin === "pro";

  return (
    <motion.article
      data-motion=""
      layout
      initial={reduce ? false : { opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: (index % 8) * 0.04 }}
      className="card-3d card-3d-lg h-full"
    >
      <div className="card-3d-body flex h-full flex-col gap-[14px] bg-bg-card px-6 pb-4 pt-6">
        <div className="flex min-h-[44px] items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2.5">
            <ToolLogo slug={tool.slug} name={tool.vendor} logoUrl={tool.logoUrl} size={44} className="border-line" />
            <span className="text-[18px] font-bold leading-none text-ink">{tool.vendor}</span>
          </span>
          {tool.badge && tool.badge !== "PRO" && <Badge tone={badgeTone[tool.badge]}>{tool.badge}</Badge>}
        </div>

        <div className="space-y-1">
          <p className="t-card-title text-ink">
            {tool.name} · {tool.offerTitle}
          </p>
          <p className="text-[16px] leading-[1.4] text-ink-muted">{tool.blurb}</p>
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <span className="flex flex-col" title="Listed annual retail value">
            <span className="font-hand whitespace-nowrap text-[26px] leading-[0.85] text-accent-2 md:text-[28px]">{formatINR(tool.retailPaise)} value</span>
            <span className="mt-1 text-[13px] font-medium leading-none text-ink-faint">{formatUSD(tool.valueUsd)} at list price</span>
          </span>
          {proOnly ? (
            <span className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-[100px] border-2 border-ink-line bg-accent-soft px-4 text-[16px] font-medium text-ink">
              <Lock size={14} /> Pro only
            </span>
          ) : (
            <span className="inline-flex h-10 shrink-0 items-center rounded-[100px] border-2 border-ink-line bg-bg-card px-4 text-[16px] font-medium text-ink">Included</span>
          )}
        </div>
      </div>
    </motion.article>
  );
}
