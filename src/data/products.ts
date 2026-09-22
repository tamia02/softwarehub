/**
 * The four product areas of Software Hub Pool. Each has its own landing page
 * with a proper hero; the customer/reseller can move between them from the
 * header. Copy is written for us — not lifted from any reference site.
 */
export type ProductSlug = "passes" | "growth" | "community" | "lab";

export interface Product {
  slug: ProductSlug;
  href: string;
  nav: string; // short header label
  name: string;
  eyebrow: string;
  headline: string;
  highlight: string[]; // words in the headline rendered in accent
  hand: string; // hand-script accent under the headline
  sub: string;
  primary: { label: string; href: string };
  secondary: { label: string; href: string };
  dark?: boolean;
  stats: { value: string; label: string }[];
  features: { title: string; body: string }[];
  how: { step: string; title: string; body: string }[];
}

export const products: Product[] = [
  {
    slug: "passes",
    href: "/home",
    nav: "Passes",
    name: "Software Passes",
    eyebrow: "Software Hub Pool",
    headline: "35 premium AI and product tools for a full year, on one pass.",
    highlight: ["35", "premium", "AI"],
    hand: "one code!",
    sub: "Buy the Starter or Pro Pass outright, or split it across a pool of ten. Every plan is included for a full year and new tools join through the year.",
    primary: { label: "Get the Pro Pass", href: "/checkout/direct?tier=pro" },
    secondary: { label: "See all tools", href: "/home#tools" },
    stats: [
      { value: "35", label: "premium tools" },
      { value: "1 year", label: "of access" },
      { value: "₹25k+", label: "value from ₹2.5k a seat" },
      { value: "10", label: "seats per pool" },
    ],
    features: [
      { title: "One activation code", body: "Redeem a single code and unlock the whole bundle — no juggling logins across 35 dashboards." },
      { title: "Buy or pool", body: "Pay for the full pass yourself, or share one across ten builders and split the cost." },
      { title: "New tools all year", body: "The pass keeps growing. When a tool joins the bundle you're notified and it's yours." },
    ],
    how: [
      { step: "01", title: "Pick a pass", body: "Starter or Pro — see exactly which tools each includes." },
      { step: "02", title: "Pay once", body: "UPI, cards or net-banking. Your code appears instantly and by email." },
      { step: "03", title: "Redeem & build", body: "Enter the code, unlock everything, and get a full year of access." },
    ],
  },
  {
    slug: "growth",
    href: "/growth",
    nav: "Growth",
    name: "Growth Panel",
    eyebrow: "Social growth, wholesale",
    headline: "Grow every platform at wholesale rates, delivered automatically.",
    highlight: ["wholesale", "automatically"],
    hand: "instant start!",
    sub: "Followers, views, likes and watch-time across Instagram, YouTube, TikTok and more — dispatched to real servers in seconds and tracked live from one dashboard.",
    primary: { label: "Browse services", href: "/growth#services" },
    secondary: { label: "Become a reseller", href: "/growth#reseller" },
    stats: [
      { value: "1,400+", label: "services" },
      { value: "0–5 min", label: "typical start" },
      { value: "99.9%", label: "order success" },
      { value: "30–55%", label: "reseller margin" },
    ],
    features: [
      { title: "Real, non-drop growth", body: "High-quality engagement with automatic refill so your counts hold, not evaporate." },
      { title: "Instant auto-dispatch", body: "Orders go straight to provider nodes — most begin within minutes, tracked in real time." },
      { title: "Wallet + API", body: "Top up once, order from the dashboard or plug our API v2 straight into your own panel." },
    ],
    how: [
      { step: "01", title: "Add funds", body: "Deposit by UPI, QR, cards or crypto — credited to your panel wallet instantly." },
      { step: "02", title: "Pick a service", body: "Choose a platform and service, paste your link, set the quantity." },
      { step: "03", title: "Order & track", body: "Automated delivery starts and you watch progress live, 24/7." },
    ],
  },
  {
    slug: "community",
    href: "/community",
    nav: "Community",
    name: "Community Market",
    eyebrow: "Buy & sell digital goods",
    headline: "A protected marketplace for subscriptions, keys and digital goods.",
    highlight: ["protected", "digital goods"],
    hand: "every trade covered",
    sub: "Verified sellers list subscriptions, activation codes, gift cards and services. Every payment is held in escrow and only released after you confirm — with a 14-day window on account products.",
    primary: { label: "Explore the market", href: "/community#categories" },
    secondary: { label: "Start selling", href: "/community#sell" },
    stats: [
      { value: "Escrow", label: "on every order" },
      { value: "14-day", label: "account cover" },
      { value: "KYC", label: "verified sellers" },
      { value: "24/7", label: "dispute support" },
    ],
    features: [
      { title: "Payment held in escrow", body: "Your money is held until you confirm delivery — released to the seller only when you're satisfied." },
      { title: "Verified sellers", body: "Sellers pass identity verification before they can list, and carry a rating and rank you can see." },
      { title: "Real dispute cover", body: "Non-delivery, mismatch and partial orders are covered. Report, escalate, and a specialist reviews." },
    ],
    how: [
      { step: "01", title: "Find an offer", body: "Browse by category and brand, compare sellers and prices, pick the one you trust." },
      { step: "02", title: "Pay into escrow", body: "Checkout securely; your payment is held, not sent straight to the seller." },
      { step: "03", title: "Confirm & release", body: "Inspect what you received, confirm, and the funds release — or open a dispute." },
    ],
  },
  {
    slug: "lab",
    href: "/lab",
    nav: "Lab",
    name: "The Lab",
    dark: true,
    eyebrow: "root@softwarehub:~$",
    headline: "A toolkit and playbook library for builders and security folk.",
    highlight: ["toolkit", "playbook"],
    hand: "// runs in your browser",
    sub: "Decoders, network and security utilities that run right in your browser, plus tier-gated playbooks and a community forum. No fluff, no sign-up for the free tools.",
    primary: { label: "Open the toolkit", href: "/lab#tools" },
    secondary: { label: "Read playbooks", href: "/lab#playbooks" },
    stats: [
      { value: "60+", label: "tools" },
      { value: "3 tiers", label: "Free · Pro · VIP" },
      { value: "0", label: "data leaves the tab" },
      { value: "⌘K", label: "command palette" },
    ],
    features: [
      { title: "Decode & convert", body: "JWT, Base64, hex, JSON, timestamps, regex — the everyday developer bench, all client-side." },
      { title: "Network & security", body: "DNS, WHOIS, header graders, SSL checks, breach lookups and hash tools against public data only." },
      { title: "Playbooks & forum", body: "Long-form growth, hardening and automation guides, plus a community with reputation and streaks." },
    ],
    how: [
      { step: "01", title: "Pick a tool", body: "Search or hit ⌘K. Free tools open instantly, no account needed." },
      { step: "02", title: "Run it locally", body: "Everything computes in your browser — your input never leaves the tab." },
      { step: "03", title: "Go deeper", body: "Unlock Pro/VIP playbooks and the vault when you want the advanced material." },
    ],
  },
];

export const productBySlug = Object.fromEntries(products.map((p) => [p.slug, p])) as Record<ProductSlug, Product>;
