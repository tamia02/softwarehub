import { settings } from "@/config/site";
import { tiers, type TierSlug } from "@/data/tiers";
import { tools, toolsForTier, type Tool } from "@/data/tools";

/**
 * All money math is done in paise (integers). Only format at the edge.
 */

export function usdToPaise(usd: number, rate = settings.usdInrRate): number {
  return Math.round(usd * rate * 100);
}

export function toolRetailPaise(tool: Tool, rate?: number): number {
  return usdToPaise(tool.valueUsd, rate);
}

export function tierRetailUsd(tier: TierSlug): number {
  return toolsForTier(tier).reduce((sum, t) => sum + t.valueUsd, 0);
}

export function tierRetailPaise(tier: TierSlug, rate?: number): number {
  return toolsForTier(tier).reduce((sum, t) => sum + toolRetailPaise(t, rate), 0);
}

export function seatPricePaise(tier: TierSlug, seats = settings.poolSeatsDefault): number {
  // Round up so 10 seats never under-collect by a paisa.
  return Math.ceil(tiers[tier].pricePaise / seats);
}

export interface TierPricing {
  tier: TierSlug;
  name: string;
  toolCount: number;
  pricePaise: number;
  seatPricePaise: number;
  seats: number;
  retailUsd: number;
  retailPaise: number;
  savingsPaise: number;
  savingsPct: number;
  usdInrRate: number;
}

export function tierPricing(tier: TierSlug, rate = settings.usdInrRate): TierPricing {
  const t = tiers[tier];
  const retailPaise = tierRetailPaise(tier, rate);
  const savingsPaise = retailPaise - t.pricePaise;
  return {
    tier,
    name: t.name,
    toolCount: t.toolCount,
    pricePaise: t.pricePaise,
    seatPricePaise: seatPricePaise(tier),
    seats: settings.poolSeatsDefault,
    retailUsd: tierRetailUsd(tier),
    retailPaise,
    savingsPaise,
    savingsPct: Math.round((savingsPaise / retailPaise) * 1000) / 10,
    usdInrRate: rate,
  };
}

export function allPricing(rate?: number) {
  return { starter: tierPricing("starter", rate), pro: tierPricing("pro", rate) };
}

export const grandTotalUsd = tools.reduce((s, t) => s + t.valueUsd, 0);
