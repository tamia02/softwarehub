/**
 * Community Market catalogue — categories, brands and sample seller listings for
 * the marketplace. Written for us; realistic digital-goods pricing in INR.
 * Bulk third-party account sales are intentionally excluded (see feature list).
 */
export interface MarketListing {
  id: number;
  title: string;
  brand: string;
  category: string;
  fromInr: number;
  sold: number;
  delivery: "Instant code" | "Manual" | "Account handover";
  seller: string;
  sellerRank: "Normal" | "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  rating: number; // %
}
export interface MarketCategory {
  key: string;
  name: string;
  blurb: string;
  brands: string[];
}

export const marketCategories: MarketCategory[] = [
  { key: "subscriptions", name: "Subscriptions", blurb: "AI, design and productivity plans at a discount.", brands: ["ChatGPT Plus", "Claude Pro", "Perplexity", "Midjourney", "Canva Pro", "Adobe CC"] },
  { key: "keys", name: "Activation Keys", blurb: "Genuine one-time software licence keys.", brands: ["Windows 11", "Office 2021", "IDM", "Malwarebytes"] },
  { key: "giftcards", name: "Gift Cards & Top-ups", blurb: "Store credit and in-app top-ups, delivered instantly.", brands: ["Steam", "Google Play", "PlayStation", "Amazon", "Razer Gold"] },
  { key: "digital", name: "Digital Products", blurb: "Templates, e-books, presets and courses.", brands: ["Notion", "Framer", "Lightroom", "Figma"] },
  { key: "services", name: "Services & Coaching", blurb: "Freelance help and one-to-one sessions.", brands: ["Design", "Dev", "SEO", "Editing"] },
];

let _id = 5000;
const l = (
  title: string,
  brand: string,
  category: string,
  fromInr: number,
  sold: number,
  delivery: MarketListing["delivery"],
  seller: string,
  sellerRank: MarketListing["sellerRank"],
  rating: number,
): MarketListing => ({ id: _id++, title, brand, category, fromInr, sold, delivery, seller, sellerRank, rating });

export const marketListings: MarketListing[] = [
  l("ChatGPT Plus · 1 Month · Private", "ChatGPT Plus", "subscriptions", 899, 1284, "Account handover", "AtlasKeys", "Legendary", 99.4),
  l("Claude Pro · 1 Month · Private", "Claude Pro", "subscriptions", 999, 642, "Account handover", "AtlasKeys", "Legendary", 99.1),
  l("Perplexity Pro · 1 Year · Voucher", "Perplexity", "subscriptions", 349, 3140, "Instant code", "NovaDeals", "Epic", 98.8),
  l("Midjourney Standard · 1 Month", "Midjourney", "subscriptions", 1499, 410, "Account handover", "PixelVault", "Rare", 98.2),
  l("Canva Pro · 1 Year · Invite", "Canva Pro", "subscriptions", 599, 5820, "Instant code", "NovaDeals", "Epic", 99.6),
  l("Adobe Creative Cloud · 1 Month · Key", "Adobe CC", "subscriptions", 799, 1356, "Instant code", "StudioKeys", "Rare", 97.9),
  l("Windows 11 Pro · Retail Key", "Windows 11", "keys", 649, 8940, "Instant code", "KeyForge", "Legendary", 99.8),
  l("Office 2021 Pro Plus · Bind Key", "Office 2021", "keys", 899, 4210, "Instant code", "KeyForge", "Legendary", 99.7),
  l("IDM · Lifetime Licence", "IDM", "keys", 299, 2680, "Instant code", "KeyForge", "Legendary", 99.5),
  l("Malwarebytes Premium · 1 Year", "Malwarebytes", "keys", 549, 990, "Instant code", "SecureKeys", "Rare", 98.4),
  l("Steam Wallet ₹500 · India", "Steam", "giftcards", 505, 12400, "Instant code", "TopUpHub", "Legendary", 99.9),
  l("Google Play ₹500 · India", "Google Play", "giftcards", 498, 9870, "Instant code", "TopUpHub", "Legendary", 99.9),
  l("PlayStation ₹1000 · IN", "PlayStation", "giftcards", 1010, 3120, "Instant code", "TopUpHub", "Epic", 99.6),
  l("Amazon Pay ₹1000", "Amazon", "giftcards", 995, 6410, "Instant code", "GiftBazaar", "Epic", 99.5),
  l("Razer Gold $10 · Global", "Razer Gold", "giftcards", 899, 1780, "Instant code", "GiftBazaar", "Rare", 98.9),
  l("Notion Productivity OS · Template", "Notion", "digital", 199, 4560, "Instant code", "TemplateCo", "Epic", 99.3),
  l("Framer Portfolio Kit · 12 Pages", "Framer", "digital", 349, 1230, "Instant code", "TemplateCo", "Rare", 98.7),
  l("Lightroom Presets · 200 Pack", "Lightroom", "digital", 149, 7890, "Instant code", "PresetLab", "Legendary", 99.4),
  l("Figma UI Kit · 500 Components", "Figma", "digital", 499, 2010, "Instant code", "TemplateCo", "Epic", 99.1),
  l("Logo & Brand Kit Design", "Design", "services", 1999, 340, "Manual", "StudioNine", "Rare", 98.0),
  l("Landing Page Development", "Dev", "services", 4999, 128, "Manual", "BuildWorks", "Uncommon", 97.5),
  l("SEO Audit + Fix · 20 Pages", "SEO", "services", 2499, 210, "Manual", "RankLab", "Rare", 98.3),
  l("Short-Form Video Editing · 5 Reels", "Editing", "services", 1499, 560, "Manual", "CutStudio", "Epic", 98.9),
];

export const marketStats = {
  listings: marketListings.length,
  categories: marketCategories.length,
  brands: [...new Set(marketListings.map((x) => x.brand))].length,
  sellers: [...new Set(marketListings.map((x) => x.seller))].length,
};
