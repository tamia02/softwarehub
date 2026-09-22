import "server-only";
import { asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { TierSlug } from "@/data/tiers";
import { coreTools, proTools, tools as staticTools, type Tool, type ToolCategory, type ToolBadge } from "@/data/tools";
import { allPricing, toolRetailPaise } from "./pricing";
import type { CatalogTool } from "@/components/home/ToolCard";
import { usdToPaise, type TierPricing } from "./pricing";
import { getSettings } from "./settings.server";
import { memo } from "./cache.server";

/**
 * Live catalog: active tools + tier prices from the database, retail INR from
 * the configured exchange rate. Same shapes as the static data so the
 * marketing components don't care where the data came from.
 */
export interface CatalogData {
  tools: CatalogTool[];
  core: CatalogTool[];
  pro: CatalogTool[];
  pricing: Record<TierSlug, TierPricing>;
  usdInrRate: number;
}

/** Cached for 60 s; admin writes call `bust("catalog")`. */
export function getCatalog(): Promise<CatalogData> {
  return memo("catalog", 60_000, () =>
    loadCatalog().catch((err) => {
      // Build machines and cold starts without a DB still get a correct page.
      console.warn("[catalog] falling back to static data:", err instanceof Error ? err.message : err);
      const withRetail = (list: Tool[]): CatalogTool[] => list.map((t) => ({ ...t, retailPaise: toolRetailPaise(t) }));
      const pricing = allPricing();
      return { tools: withRetail(staticTools), core: withRetail(coreTools), pro: withRetail(proTools), pricing, usdInrRate: pricing.pro.usdInrRate };
    }),
  );
}

async function loadCatalog(): Promise<CatalogData> {
  const db = await getDb();
  const s = await getSettings();
  const [rows, tierRows] = await Promise.all([
    db.select().from(schema.tools).where(eq(schema.tools.active, true)).orderBy(asc(schema.tools.sort)),
    db.select().from(schema.tiers),
  ]);

  const staticBySlug = new Map(staticTools.map((t) => [t.slug, t]));
  const tools: CatalogTool[] = rows.map((t) => {
    // Guard against a bad/zero value_usd in the DB — fall back to the code value.
    const value = Number(t.valueUsd) > 0 ? Number(t.valueUsd) : staticBySlug.get(t.id)?.valueUsd ?? 0;
    return {
      slug: t.id,
      name: t.name,
      vendor: t.vendorName,
      category: t.category as ToolCategory,
      offerTitle: t.offerTitle,
      blurb: t.blurb,
      valueUsd: value,
      tierMin: t.tierMin as TierSlug,
      badge: (t.badge as ToolBadge | null) ?? undefined,
      hue: t.hue,
      logoUrl: t.logoUrl,
      sort: t.sort,
      retailPaise: usdToPaise(value, s.usdInrRate),
    };
  });
  const core = tools.filter((t) => t.tierMin === "starter");
  const pro = tools.filter((t) => t.tierMin === "pro");

  const pricingFor = (slug: TierSlug): TierPricing => {
    const row = tierRows.find((r) => r.id === slug);
    const list = slug === "pro" ? tools : core;
    const retailPaise = list.reduce((sum, t) => sum + t.retailPaise, 0);
    const pricePaise = row?.pricePaise ?? 0;
    const seats = row?.seatsDefault ?? s.poolSeatsDefault;
    const savings = retailPaise - pricePaise;
    return {
      tier: slug,
      name: row?.name ?? slug,
      toolCount: list.length,
      pricePaise,
      seatPricePaise: Math.ceil(pricePaise / seats),
      seats,
      retailUsd: list.reduce((sum, t) => sum + t.valueUsd, 0),
      retailPaise,
      savingsPaise: savings,
      savingsPct: retailPaise ? Math.round((savings / retailPaise) * 1000) / 10 : 0,
      usdInrRate: s.usdInrRate,
    };
  };

  return { tools, core, pro, pricing: { starter: pricingFor("starter"), pro: pricingFor("pro") }, usdInrRate: s.usdInrRate };
}

export type { Tool };
