/**
 * Marketplace seed — products sold as codes, modelled on a G2G-style catalogue:
 * game top-ups, gift cards, game accounts, plus AI & software subscriptions.
 * `basePaise` is the reseller's price (paise); the platform adds `commissionPct`
 * to get the customer price. `stock` = how many demo codes to generate.
 */
export interface ProductSeed {
  slug: string;
  name: string;
  vendor: string;
  category: string;
  blurb: string;
  description?: string;
  basePaise: number; // reseller price
  commissionPct?: number; // default 20
  hue: number;
  badge?: string;
  stock: number;
  warrantyDays?: number;
}

export const productCategories = ["Game Top-Up", "Gift Cards", "Game Accounts", "AI Tools", "Software", "Subscriptions"] as const;

const p = (
  slug: string, name: string, vendor: string, category: string, basePaise: number, hue: number, stock: number,
  blurb: string, opts: Partial<ProductSeed> = {},
): ProductSeed => ({ slug, name, vendor, category, basePaise, hue, stock, blurb, commissionPct: 20, ...opts });

export const productSeeds: ProductSeed[] = [
  // ---- Game Top-Up ----
  p("valorant-1000vp", "Valorant 1000 VP", "Valorant", "Game Top-Up", 715_00, 350, 120, "1,000 Valorant Points credited to your Riot account.", { badge: "HOT" }),
  p("pubgm-660uc", "PUBG Mobile 660 UC", "PUBG Mobile", "Game Top-Up", 799_00, 20, 150, "660 Unknown Cash for PUBG Mobile — instant top-up by player ID.", { badge: "HOT" }),
  p("freefire-530", "Free Fire 530 Diamonds", "Free Fire", "Game Top-Up", 415_00, 5, 200, "530 Diamonds topped up to your Free Fire ID."),
  p("mlbb-500", "Mobile Legends 500 Diamonds", "Mobile Legends", "Game Top-Up", 549_00, 210, 140, "500 Diamonds for Mobile Legends: Bang Bang."),
  p("genshin-980", "Genshin Impact 980 Genesis Crystals", "Genshin Impact", "Game Top-Up", 999_00, 45, 90, "980 Genesis Crystals for Genshin Impact."),
  p("codm-cp", "Call of Duty Mobile 880 CP", "Call of Duty Mobile", "Game Top-Up", 749_00, 30, 110, "880 CP topped up to your COD Mobile account."),
  p("clash-royale-gems", "Clash Royale 1200 Gems", "Clash Royale", "Game Top-Up", 665_00, 190, 80, "1,200 Gems for Clash Royale by player tag."),
  p("roblox-800robux", "Roblox 800 Robux", "Roblox", "Game Top-Up", 665_00, 0, 130, "800 Robux credited to your Roblox account.", { badge: "POPULAR" }),

  // ---- Gift Cards ----
  p("steam-500", "Steam Wallet ₹500 (India)", "Steam", "Gift Cards", 490_00, 210, 160, "₹500 Steam Wallet code, redeemable on the India store.", { badge: "BEST", warrantyDays: 30 }),
  p("googleplay-500", "Google Play ₹500 (India)", "Google Play", "Gift Cards", 485_00, 145, 150, "₹500 Google Play gift code for the India region.", { warrantyDays: 30 }),
  p("psn-1000", "PlayStation Store ₹1000 (IN)", "PlayStation", "Gift Cards", 985_00, 220, 70, "₹1,000 PSN wallet top-up for the India store.", { warrantyDays: 30 }),
  p("xbox-1000", "Xbox Gift Card ₹1000 (IN)", "Xbox", "Gift Cards", 985_00, 130, 60, "₹1,000 Xbox / Microsoft Store gift code.", { warrantyDays: 30 }),
  p("amazon-1000", "Amazon Pay ₹1000", "Amazon", "Gift Cards", 990_00, 35, 90, "₹1,000 Amazon Pay balance code.", { warrantyDays: 30 }),
  p("razer-gold-10", "Razer Gold $10 (Global)", "Razer Gold", "Gift Cards", 875_00, 145, 75, "$10 Razer Gold, usable across 42,000+ games.", { warrantyDays: 30 }),
  p("netflix-gift-500", "Netflix Gift Card ₹500", "Netflix", "Gift Cards", 495_00, 0, 60, "₹500 Netflix gift code to top up any account.", { warrantyDays: 30 }),

  // ---- Game Accounts ----
  p("valorant-fresh", "Valorant Account · Fresh (EU)", "Valorant", "Game Accounts", 165_00, 350, 50, "Fresh unranked Valorant account, EU region, email changeable.", { warrantyDays: 14 }),
  p("valorant-ranked", "Valorant Account · Silver Ready (EU)", "Valorant", "Game Accounts", 1080_00, 350, 25, "Level-20 Valorant account, rank-ready, 2 agents, full access.", { badge: "POPULAR", warrantyDays: 14 }),
  p("steam-random", "Steam Account · 5 Random Games", "Steam", "Game Accounts", 249_00, 210, 60, "Steam account with 5 random paid games, full email access.", { warrantyDays: 14 }),
  p("coc-th13", "Clash of Clans TH13 Account", "Clash of Clans", "Game Accounts", 1499_00, 190, 15, "Town Hall 13 base, maxed heroes, Supercell-ID transferable.", { warrantyDays: 14 }),

  // ---- AI Tools ----
  p("chatgpt-plus-1m", "ChatGPT Plus · 1 Month", "OpenAI", "AI Tools", 749_00, 160, 60, "Private ChatGPT Plus account — GPT-5, image generation, priority access.", { badge: "HOT" }),
  p("claude-pro-1m", "Claude Pro · 1 Month", "Anthropic", "AI Tools", 832_00, 25, 40, "Claude Pro — higher limits, priority access, latest models."),
  p("grok-super-1m", "Grok SuperGrok · 1 Month", "xAI", "AI Tools", 1165_00, 0, 30, "SuperGrok subscription — Grok's top tier for a month."),
  p("perplexity-1y", "Perplexity Pro · 1 Year", "Perplexity", "AI Tools", 291_00, 200, 80, "A full year of Perplexity Pro — unlimited Pro search.", { badge: "DEAL" }),
  p("cursor-pro-1m", "Cursor Pro · 1 Month", "Cursor", "AI Tools", 1499_00, 230, 25, "Cursor Pro — the AI code editor, a month of Pro."),
  p("gemini-pro-1m", "Google Gemini Advanced · 1 Month", "Google", "AI Tools", 799_00, 210, 45, "Gemini Advanced with 2 TB storage for a month."),
  p("midjourney-1m", "Midjourney Standard · 1 Month", "Midjourney", "AI Tools", 1249_00, 280, 20, "Midjourney Standard — fast generations, commercial use."),

  // ---- Software ----
  p("windows11-pro", "Windows 11 Pro · Retail Key", "Microsoft", "Software", 540_00, 210, 120, "Genuine Windows 11 Pro retail key — lifetime, one PC.", { badge: "BEST", warrantyDays: 30 }),
  p("office-2021", "Office 2021 Pro Plus · Key", "Microsoft", "Software", 749_00, 20, 70, "Office 2021 Professional Plus bind key.", { warrantyDays: 30 }),
  p("adobe-cc-1m", "Adobe Creative Cloud · 1 Month", "Adobe", "Software", 665_00, 330, 30, "All-apps Adobe Creative Cloud for a month."),
  p("idm-lifetime", "Internet Download Manager · Lifetime", "IDM", "Software", 299_00, 40, 80, "IDM lifetime licence, one PC.", { warrantyDays: 30 }),

  // ---- Subscriptions (design/streaming) ----
  p("canva-pro-1y", "Canva Pro · 1 Year", "Canva", "Subscriptions", 1666_00, 190, 40, "Full Canva Pro for a year — unlimited premium templates, Magic Studio AI, background remover.", { badge: "POPULAR", description: "Complete Canva Pro panel with unlimited access for 12 months. Premium templates, 100M+ stock assets, Magic Studio AI, brand kits and one-click background removal.", warrantyDays: 30 }),
  p("capcut-pro-1y", "CapCut Pro · 1 Year", "CapCut", "Subscriptions", 799_00, 250, 60, "CapCut Pro for a year — premium effects, no watermark, cloud space."),
  p("netflix-4k-1m", "Netflix Premium 4K · 1 Month", "Netflix", "Subscriptions", 415_00, 0, 100, "Netflix Premium 4K Ultra HD for a month.", { badge: "HOT" }),
  p("spotify-1y", "Spotify Premium · 1 Year", "Spotify", "Subscriptions", 999_00, 145, 70, "A year of Spotify Premium — ad-free, offline, hi-fi."),
  p("youtube-1y", "YouTube Premium · 1 Year", "YouTube", "Subscriptions", 899_00, 5, 55, "YouTube Premium for a year — no ads, background play, Music."),
  p("prime-1y", "Amazon Prime · 1 Year", "Amazon Prime", "Subscriptions", 999_00, 200, 50, "Amazon Prime for a year — video, music and free delivery."),
];

export interface BundleSeed {
  slug: string;
  name: string;
  blurb: string;
  pricePaise: number;
  badge?: string;
  productSlugs: string[];
}

export const bundleSeeds: BundleSeed[] = [
  {
    slug: "gamer-pack",
    name: "Gamer Starter Pack",
    blurb: "Jump in fast — Steam credit, Valorant VP and a fresh Valorant account.",
    pricePaise: 1499_00,
    badge: "BEST VALUE",
    productSlugs: ["steam-500", "valorant-1000vp", "valorant-fresh"],
  },
  {
    slug: "ai-power-pack",
    name: "AI Power Pack",
    blurb: "The top AI tools together — ChatGPT, Claude, Perplexity and Cursor.",
    pricePaise: 2999_00,
    badge: "POPULAR",
    productSlugs: ["chatgpt-plus-1m", "claude-pro-1m", "perplexity-1y", "cursor-pro-1m"],
  },
  {
    slug: "creator-pass",
    name: "Creator Pass",
    blurb: "Everything a creator needs — Canva, CapCut, Adobe and ChatGPT.",
    pricePaise: 3499_00,
    productSlugs: ["canva-pro-1y", "capcut-pro-1y", "adobe-cc-1m", "chatgpt-plus-1m"],
  },
  {
    slug: "entertainment-pass",
    name: "Entertainment Pass",
    blurb: "Stream it all — Netflix 4K, Spotify, YouTube and Prime.",
    pricePaise: 2499_00,
    productSlugs: ["netflix-4k-1m", "spotify-1y", "youtube-1y", "prime-1y"],
  },
];

/** Customer price = reseller base + platform commission. */
export function customerPaise(basePaise: number, commissionPct = 20): number {
  return Math.round(basePaise * (1 + commissionPct / 100));
}

/** simple-icons brand slug per product (for real logos via cdn.simpleicons.org).
 *  Unmapped products fall back to a lettered tile. */
export const brandIcon: Record<string, string> = {
  "valorant-1000vp": "valorant", "valorant-fresh": "valorant", "valorant-ranked": "valorant",
  "roblox-800robux": "roblox", "steam-500": "steam", "steam-random": "steam",
  "googleplay-500": "googleplay", "psn-1000": "playstation", "netflix-gift-500": "netflix", "netflix-4k-1m": "netflix",
  "claude-pro-1m": "claude", "perplexity-1y": "perplexity", "gemini-pro-1m": "googlegemini",
  "spotify-1y": "spotify", "youtube-1y": "youtube", "razer-gold-10": "razer",
};

export function brandLogoUrl(slug: string): string | null {
  const b = brandIcon[slug];
  return b ? `https://cdn.simpleicons.org/${b}` : null;
}
