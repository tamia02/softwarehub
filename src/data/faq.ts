import { settings } from "@/config/site";

export interface FaqItem {
  q: string;
  a: string;
}

export const faq: FaqItem[] = [
  {
    q: "How does activation work?",
    a: "After payment you receive one activation code by email and SMS. Redeem it on your My Pass page — it unlocks a claim page for every tool in your tier. Click Claim on a tool to get the vendor link or coupon and follow the vendor's steps. You can claim tools whenever you like during the year.",
  },
  {
    q: "Do I need to be a new user of each tool?",
    a: "Most vendors require a fresh account or an account that has never been on a paid plan. Each tool's claim page states the exact rule before you claim, so nothing is wasted on an account that will not qualify.",
  },
  {
    q: "What is the difference between Starter and Pro?",
    a: "Starter Pass includes the 22 core tools. Pro Pass includes those 22 plus 13 Pro-exclusive tools such as Cursor, Lovable, Replit, ElevenLabs and Runway. Both are valid for one year from activation.",
  },
  {
    q: "What if a code doesn't work?",
    a: `Our Code Works Guarantee covers you: if a code fails to activate, we replace it, and if we cannot replace it within ${settings.guaranteeDays} days we refund that tool's share. Raise it from My Pass with one click.`,
  },
  {
    q: "How do pools work?",
    a: `A pool is ${settings.poolSeatsDefault} people buying one bundle together. Each member pays one seat — a tenth of the price — which is held in escrow. When all seats are paid we buy the bundle and every member gets access to the tools from their own My Pass page.`,
  },
  {
    q: "What if a pool doesn't fill?",
    a: `Pools stay open for ${settings.poolExpiryDays} days. If the last seat is not paid by then, the pool expires and every member is refunded automatically to the original payment method. You can also move to another open pool instead.`,
  },
  {
    q: "Does the pass renew?",
    a: "No. A pass is a one-time purchase valid for one year from activation. We will email you before it expires so you can decide whether to buy again.",
  },
  {
    q: "How does the reseller program work?",
    a: "Resellers get a dashboard to create and manage pools, buy codes at reseller pricing, and track revenue splits and payouts. Ask us for a reseller activation code to get started.",
  },
  {
    q: "Which payment methods do you accept?",
    a: "UPI, credit and debit cards, net banking and popular wallets via Razorpay. All prices are in INR.",
  },
  {
    q: "Can I get a GST invoice?",
    a: "Yes. Add your GSTIN at checkout or later from My Pass and we will issue a GST invoice for the purchase.",
  },
];
