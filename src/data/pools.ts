import type { TierSlug } from "./tiers";

export type PoolStatus = "draft" | "open" | "filled" | "paid" | "fulfilled" | "expired";

/** Serialisable pool summary used by the marketing carousel. */
export interface PoolSummary {
  id: string;
  tier: TierSlug;
  seats: number;
  filled: number;
  seatPricePaise: number;
  status: PoolStatus;
  /** ISO timestamp */
  expiresAt: string;
  city?: string;
}
