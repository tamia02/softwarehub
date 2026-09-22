"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Badge } from "@/components/ui/Badge";
import { ToolLogo } from "@/components/brand/ToolLogo";
import type { Tool } from "@/data/tools";
import { formatINR } from "@/lib/format";

export type CatalogTool = Tool & { retailPaise: number };

const badgeTone = { NEW: "new", LIMITED: "limited", PRO: "pro" } as const;

/** Offer card: logo, title, one line, value. Four things, like the reference. */
export function ToolCard({ tool, index = 0 }: { tool: CatalogTool; index?: number }) {
  const reduce = useReducedMotion();
  const proOnly = tool.tierMin === "pro";
  return (
    <motion.article
      data-motion=""
      initial={reduce ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: (index % 8) * 0.04 }}
      className="card-3d card-3d-lg h-full"
    >
      <div className="card-3d-body flex h-full flex-col gap-[14px] bg-white p-6 pb-5">
        <div className="flex min-h-[44px] items-center justify-between">
          <ToolLogo slug={tool.slug} name={tool.vendor} logoUrl={tool.logoUrl} size={44} className="border-line" />
          {tool.badge && tool.badge !== "PRO" && <Badge tone={badgeTone[tool.badge]}>{tool.badge}</Badge>}
        </div>
        <div className="space-y-1.5">
          <p className="t-card-title text-ink-line">
            {tool.name} · {tool.offerTitle}
          </p>
          <p className="text-[15px] leading-[1.4] text-ink-muted">{tool.blurb}</p>
        </div>
        <div className="mt-auto flex items-end justify-between gap-3 pt-1">
          <span className="font-hand whitespace-nowrap text-[26px] leading-[0.8] text-accent-2" title="Listed annual retail value">
            {formatINR(tool.retailPaise)} value
          </span>
          <span className="text-[13px] font-bold uppercase tracking-wider text-ink-faint">{proOnly ? "Pro only" : "Included"}</span>
        </div>
      </div>
    </motion.article>
  );
}
