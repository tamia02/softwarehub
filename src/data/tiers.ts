export type TierSlug = "starter" | "pro";

export interface Tier {
  slug: TierSlug;
  name: string;
  /** Price in paise (integer). ₹25,000 = 2_500_000 paise. */
  pricePaise: number;
  seatsDefault: number;
  toolCount: number;
  headline: string;
  benefits: string[];
  cta: string;
  bestValue?: boolean;
}

export const tiers: Record<TierSlug, Tier> = {
  starter: {
    slug: "starter",
    name: "Starter Pass",
    pricePaise: 25_000 * 100,
    seatsDefault: 10,
    toolCount: 22,
    headline: "The core stack, one code.",
    benefits: [
      "22 core plans, each valid 12 months",
      "Activation code issued the moment you pay",
      "Claim each tool whenever you are ready",
      "Code Works Guarantee on every claim",
      "GST invoice with your GSTIN",
    ],
    cta: "Get the Starter Pass",
  },
  pro: {
    slug: "pro",
    name: "Pro Pass",
    pricePaise: 47_000 * 100,
    seatsDefault: 10,
    toolCount: 35,
    headline: "Every plan in the catalogue.",
    benefits: [
      "All 35 plans — the 22 core plus 13 Pro-only",
      "Adds Cursor, Lovable, Replit, ElevenLabs, Runway and more",
      "Activation code issued the moment you pay",
      "Code Works Guarantee on every claim",
      "Priority support and first access to new allocations",
    ],
    cta: "Get the Pro Pass",
    bestValue: true,
  },
};

export const tierList: Tier[] = [tiers.starter, tiers.pro];
