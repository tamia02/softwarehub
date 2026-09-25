/**
 * Methods = step-by-step how-to guides a visitor can learn from. Legitimate
 * playbooks only (growth, reselling, automation, security hardening) — no
 * fraud/abuse content. Written for us.
 */
export type MethodTier = "Free" | "Pro";
export interface Method {
  slug: string;
  title: string;
  category: "Growth" | "Reselling" | "Automation" | "Security";
  summary: string;
  minutes: number;
  tier: MethodTier;
  steps: string[];
}

export const methodCategories = ["Growth", "Reselling", "Automation", "Security"] as const;

export const methods: Method[] = [
  {
    slug: "first-smm-campaign",
    title: "Run your first SMM growth campaign",
    category: "Growth",
    summary: "Pick the right services, warm up an account, and stack refills so the numbers actually stick.",
    minutes: 8,
    tier: "Free",
    steps: [
      "Set one clear goal for the account (reach, followers, or watch-time).",
      "Start with views/reach before followers — it warms the account and looks natural.",
      "Choose non-drop, refill-guaranteed services and space orders a day apart.",
      "Top up your wallet once, then drip-feed the order over several runs.",
      "Track the order live and re-order the winners; drop anything that dips.",
    ],
  },
  {
    slug: "grow-youtube-watchtime",
    title: "Hit YouTube watch-time the safe way",
    category: "Growth",
    summary: "Combine high-retention views with real subscribers to move toward monetisation limits.",
    minutes: 10,
    tier: "Free",
    steps: [
      "Publish 3–4 videos first so growth looks organic, not sudden.",
      "Order high-retention views on your best video, not the channel page.",
      "Add a small, steady batch of real subscribers over a week.",
      "Never mix cheap bot views with retention views on the same video.",
    ],
  },
  {
    slug: "start-reselling",
    title: "Start reselling codes with real margin",
    category: "Reselling",
    summary: "Source stock, price with a markup, and turn a listing into repeat sales on the marketplace.",
    minutes: 12,
    tier: "Free",
    steps: [
      "Pick 2–3 products with steady demand (subscriptions, gift cards, top-ups).",
      "Source genuine codes in bulk and keep proof of purchase for warranty.",
      "List each product, set your price — the platform adds commission on top.",
      "Upload your code stock; the listing shows in-stock automatically.",
      "Deliver fast, keep proof, and confirm-rate high to climb seller rank.",
    ],
  },
  {
    slug: "price-for-profit",
    title: "Price your listings for profit, not just volume",
    category: "Reselling",
    summary: "A simple way to set prices that cover cost, fees and commission and still undercut the market.",
    minutes: 6,
    tier: "Pro",
    steps: [
      "Add up cost + payment fee + platform commission = your floor.",
      "Check the three cheapest live listings for the same product.",
      "Price just under the median, never below your floor.",
      "Raise price as your seller rank and reviews grow.",
    ],
  },
  {
    slug: "automate-store",
    title: "Automate the boring parts of your store",
    category: "Automation",
    summary: "Wire up delivery, restock alerts and reporting so the shop runs while you sleep.",
    minutes: 15,
    tier: "Pro",
    steps: [
      "Use instant-code delivery so orders fulfil without you.",
      "Set a low-stock threshold and a restock reminder.",
      "Export orders weekly and track margin per product.",
      "Template your customer replies for the top 5 questions.",
    ],
  },
  {
    slug: "harden-accounts",
    title: "Harden the accounts and payments you rely on",
    category: "Security",
    summary: "Lock down the logins, keys and payouts your business runs on before something breaks.",
    minutes: 9,
    tier: "Free",
    steps: [
      "Turn on 2-factor auth everywhere and store backup codes offline.",
      "Use a unique strong password per service (a manager makes this easy).",
      "Rotate any secret that was ever shared in a chat or screenshot.",
      "Separate the email that receives payouts from your public contact.",
      "Review login alerts and remove old devices monthly.",
    ],
  },
];
