/**
 * Marketplace seed — products sold as codes. `basePaise` is the reseller's
 * price (in paise); the platform adds `commissionPct` to get the customer
 * price. Stock is how many demo codes to generate. Written for us.
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

export const productCategories = ["AI", "Design", "Productivity", "Streaming", "Software", "Marketing"] as const;

export const productSeeds: ProductSeed[] = [
  { slug: "canva-pro-1y", name: "Canva Pro · 1 Year", vendor: "Canva", category: "Design", blurb: "Full Canva Pro access for a year — unlimited premium templates, assets and background remover.", description: "Complete Canva Pro panel with unlimited access for 12 months. Premium templates, 100M+ stock assets, Magic Studio AI, brand kits and one-click background removal.", basePaise: 1666_00, commissionPct: 20, hue: 190, badge: "POPULAR", stock: 40, warrantyDays: 30 },
  { slug: "chatgpt-plus-1m", name: "ChatGPT Plus · 1 Month", vendor: "OpenAI", category: "AI", blurb: "Private ChatGPT Plus account for a month — GPT-5, image generation and priority access.", basePaise: 749_00, hue: 160, badge: "HOT", stock: 60 },
  { slug: "claude-pro-1m", name: "Claude Pro · 1 Month", vendor: "Anthropic", category: "AI", blurb: "Claude Pro for a month — higher limits, priority access and the latest models.", basePaise: 832_00, hue: 25, stock: 35 },
  { slug: "perplexity-1y", name: "Perplexity Pro · 1 Year", vendor: "Perplexity", category: "AI", blurb: "A full year of Perplexity Pro — unlimited Pro search and file analysis.", basePaise: 291_00, hue: 200, badge: "DEAL", stock: 80 },
  { slug: "midjourney-1m", name: "Midjourney Standard · 1 Month", vendor: "Midjourney", category: "AI", blurb: "Midjourney Standard plan for a month — fast generations and full commercial use.", basePaise: 1249_00, hue: 280, stock: 20 },
  { slug: "adobe-cc-1m", name: "Adobe Creative Cloud · 1 Month", vendor: "Adobe", category: "Design", blurb: "All-apps Adobe Creative Cloud for a month — Photoshop, Illustrator, Premiere and more.", basePaise: 665_00, hue: 330, stock: 25 },
  { slug: "notion-plus-1y", name: "Notion Plus · 1 Year", vendor: "Notion", category: "Productivity", blurb: "A year of Notion Plus — unlimited blocks, file uploads and Notion AI add-on ready.", basePaise: 499_00, hue: 35, stock: 50 },
  { slug: "framer-pro-1y", name: "Framer Pro · 1 Year", vendor: "Framer", category: "Design", blurb: "Framer Pro for a year — publish production sites with custom domains and CMS.", basePaise: 799_00, hue: 215, stock: 30 },
  { slug: "netflix-4k-1m", name: "Netflix Premium 4K · 1 Month", vendor: "Netflix", category: "Streaming", blurb: "Netflix Premium 4K Ultra HD for a month — watch on any device.", basePaise: 415_00, hue: 0, badge: "HOT", stock: 100 },
  { slug: "spotify-premium-1y", name: "Spotify Premium · 1 Year", vendor: "Spotify", category: "Streaming", blurb: "A year of Spotify Premium — ad-free, offline, high-quality audio.", basePaise: 999_00, hue: 145, stock: 70 },
  { slug: "youtube-premium-1y", name: "YouTube Premium · 1 Year", vendor: "YouTube", category: "Streaming", blurb: "YouTube Premium for a year — no ads, background play and YouTube Music.", basePaise: 899_00, hue: 5, stock: 55 },
  { slug: "windows11-pro", name: "Windows 11 Pro · Retail Key", vendor: "Microsoft", category: "Software", blurb: "Genuine Windows 11 Pro retail activation key — lifetime, one PC.", basePaise: 540_00, hue: 210, badge: "BEST", stock: 90, warrantyDays: 30 },
  { slug: "office-2021", name: "Office 2021 Pro Plus · Key", vendor: "Microsoft", category: "Software", blurb: "Office 2021 Professional Plus bind key — Word, Excel, PowerPoint, Outlook.", basePaise: 749_00, hue: 20, stock: 45, warrantyDays: 30 },
  { slug: "grammarly-1y", name: "Grammarly Premium · 1 Year", vendor: "Grammarly", category: "Productivity", blurb: "A year of Grammarly Premium — advanced grammar, tone and clarity.", basePaise: 583_00, hue: 150, stock: 40 },
  { slug: "capcut-pro-1y", name: "CapCut Pro · 1 Year", vendor: "CapCut", category: "Design", blurb: "CapCut Pro for a year — premium effects, no watermark, cloud space.", basePaise: 799_00, hue: 250, stock: 60 },
  { slug: "linkedin-premium-1m", name: "LinkedIn Premium Career · 1 Month", vendor: "LinkedIn", category: "Marketing", blurb: "LinkedIn Premium Career for a month — InMail, insights and courses.", basePaise: 665_00, hue: 220, stock: 30 },
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
    slug: "creator-pass",
    name: "Creator Pass",
    blurb: "Everything a creator needs — Canva, CapCut, Adobe, Framer and ChatGPT, one price.",
    pricePaise: 3999_00,
    badge: "BEST VALUE",
    productSlugs: ["canva-pro-1y", "capcut-pro-1y", "adobe-cc-1m", "framer-pro-1y", "chatgpt-plus-1m"],
  },
  {
    slug: "ai-power-pack",
    name: "AI Power Pack",
    blurb: "The top AI tools together — ChatGPT, Claude, Perplexity and Midjourney.",
    pricePaise: 2499_00,
    badge: "POPULAR",
    productSlugs: ["chatgpt-plus-1m", "claude-pro-1m", "perplexity-1y", "midjourney-1m"],
  },
  {
    slug: "entertainment-pass",
    name: "Entertainment Pass",
    blurb: "Stream it all for a year — Netflix 4K, Spotify and YouTube Premium.",
    pricePaise: 1999_00,
    productSlugs: ["netflix-4k-1m", "spotify-premium-1y", "youtube-premium-1y"],
  },
];

/** Customer price = reseller base + platform commission. */
export function customerPaise(basePaise: number, commissionPct = 20): number {
  return Math.round(basePaise * (1 + commissionPct / 100));
}
