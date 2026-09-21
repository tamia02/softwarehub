import type { TierSlug } from "./tiers";

export type PoolStatus = "draft" | "open" | "filled" | "paid" | "fulfilled" | "expired";

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

const day = 24 * 60 * 60 * 1000;
const at = (d: number) => new Date(Date.now() + d).toISOString();

/**
 * Placeholder pools for the marketing carousel until /api/pools is live.
 * Ids look like real short ids so the /pool/[id] links resolve to the stub page.
 */
export const mockPools: PoolSummary[] = [
  { id: "p7k2m9", tier: "pro", seats: 10, filled: 7, seatPricePaise: 470_000, status: "open", expiresAt: at(2.3 * day), city: "Bengaluru" },
  { id: "s4h8q1", tier: "starter", seats: 10, filled: 9, seatPricePaise: 250_000, status: "open", expiresAt: at(0.6 * day), city: "Mumbai" },
  { id: "p3d6x5", tier: "pro", seats: 10, filled: 4, seatPricePaise: 470_000, status: "open", expiresAt: at(5.1 * day), city: "Delhi" },
  { id: "s9w2e7", tier: "starter", seats: 10, filled: 6, seatPricePaise: 250_000, status: "open", expiresAt: at(3.8 * day), city: "Hyderabad" },
  { id: "p1r5t8", tier: "pro", seats: 10, filled: 2, seatPricePaise: 470_000, status: "open", expiresAt: at(6.4 * day), city: "Pune" },
];
