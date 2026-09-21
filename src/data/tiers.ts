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
    headline: "The core stack for builders",
    benefits: [
      "22 core tools, 1 year each",
      "One activation code, instant delivery",
      "Claim tools at your own pace",
      "Code Works Guarantee",
      "GST invoice on request",
    ],
    cta: "Get Starter Pass",
  },
  pro: {
    slug: "pro",
    name: "Pro Pass",
    pricePaise: 47_000 * 100,
    seatsDefault: 10,
    toolCount: 35,
    headline: "Every tool. Nothing held back.",
    benefits: [
      "All 35 tools — 22 core + 13 Pro-exclusive",
      "Cursor, Lovable, Replit, ElevenLabs, Runway and more",
      "One activation code, instant delivery",
      "Code Works Guarantee",
      "Priority support",
    ],
    cta: "Get Pro Pass",
    bestValue: true,
  },
};

export const tierList: Tier[] = [tiers.starter, tiers.pro];
