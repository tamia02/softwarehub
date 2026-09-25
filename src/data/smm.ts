/**
 * Growth Panel catalogue — social-media marketing services, grouped by platform
 * and category, each with an INR rate per 1,000 units. Written for us; realistic
 * wholesale-panel pricing. Later this moves to the DB + admin; for now it powers
 * the /growth services catalogue directly.
 */
export interface SmmService {
  id: number;
  name: string;
  ratePer1k: number; // INR per 1,000
  min: number;
  max: number;
  avgTime: string;
  tags: ("Instant" | "High quality" | "Refill" | "Non-drop" | "Drip-feed")[];
}
export interface SmmCategory {
  platform: string;
  category: string;
  services: SmmService[];
}

let _id = 1000;
const s = (name: string, rate: number, min: number, max: number, avgTime: string, tags: SmmService["tags"]): SmmService => ({
  id: _id++,
  name,
  ratePer1k: rate,
  min,
  max,
  avgTime,
  tags,
});

export const smmPlatforms = [
  "Instagram",
  "YouTube",
  "TikTok",
  "Telegram",
  "Facebook",
  "Twitter / X",
  "Spotify",
  "Website Traffic",
] as const;

export const smmCatalog: SmmCategory[] = [
  {
    platform: "Instagram",
    category: "Followers",
    services: [
      s("Instagram Followers · Indian · Real", 42, 50, 100_000, "0–1 hr", ["Instant", "High quality", "Refill"]),
      s("Instagram Followers · Global · HQ", 24, 50, 500_000, "0–2 hr", ["Instant", "Refill", "Non-drop"]),
      s("Instagram Followers · Cheap Mix", 14.5, 100, 300_000, "1–3 hr", ["High quality"]),
      s("Instagram Followers · 365-Day Refill", 58, 50, 200_000, "0–1 hr", ["Instant", "Refill", "Non-drop"]),
    ],
  },
  {
    platform: "Instagram",
    category: "Likes",
    services: [
      s("Instagram Likes · Real · Non-drop", 4.8, 10, 300_000, "0–30 min", ["Instant", "High quality", "Non-drop"]),
      s("Instagram Likes · Indian", 7, 10, 100_000, "0–1 hr", ["Instant", "High quality"]),
      s("Instagram Likes · Cheap", 3.5, 20, 500_000, "0–1 hr", ["Instant"]),
    ],
  },
  {
    platform: "Instagram",
    category: "Views & Reach",
    services: [
      s("Instagram Reel Views", 0.99, 100, 5_000_000, "0–30 min", ["Instant", "Refill"]),
      s("Instagram Video Views · Fast", 1.3, 100, 100_000_000, "0–1 hr", ["Instant", "High quality"]),
      s("Instagram Story Views", 6, 50, 50_000, "0–1 hr", ["Instant"]),
      s("Instagram Reach + Impressions", 4.5, 100, 5_000_000, "0–2 hr", ["Instant"]),
    ],
  },
  {
    platform: "YouTube",
    category: "Views & Watch-time",
    services: [
      s("YouTube Views · High Retention", 48, 100, 1_000_000, "12–48 hr", ["High quality", "Refill", "Non-drop"]),
      s("YouTube Views · Fast Start", 62, 500, 5_000_000, "1–6 hr", ["Instant", "Refill"]),
      s("YouTube 4,000 Hours Watch-time", 650, 100, 4_000, "5–15 days", ["High quality", "Non-drop"]),
      s("YouTube Live Stream Viewers · 60 min", 180, 50, 20_000, "0–15 min", ["Instant"]),
    ],
  },
  {
    platform: "YouTube",
    category: "Subscribers & Likes",
    services: [
      s("YouTube Subscribers · Real", 140, 20, 50_000, "1–5 days", ["High quality", "Refill", "Non-drop"]),
      s("YouTube Likes", 22, 20, 200_000, "0–3 hr", ["Instant", "Non-drop"]),
      s("YouTube Comments · Custom", 240, 10, 5_000, "0–24 hr", ["High quality"]),
    ],
  },
  {
    platform: "TikTok",
    category: "Growth",
    services: [
      s("TikTok Followers · Real", 55, 20, 200_000, "0–3 hr", ["Instant", "Refill"]),
      s("TikTok Likes", 6, 20, 500_000, "0–1 hr", ["Instant", "Non-drop"]),
      s("TikTok Views", 0.6, 100, 100_000_000, "0–30 min", ["Instant"]),
      s("TikTok Live Viewers · 30 min", 160, 50, 10_000, "0–10 min", ["Instant"]),
    ],
  },
  {
    platform: "Telegram",
    category: "Channels & Groups",
    services: [
      s("Telegram Channel Members · Real", 28, 100, 200_000, "0–6 hr", ["High quality", "Refill"]),
      s("Telegram Post Views · Last 5", 1.2, 50, 1_000_000, "0–30 min", ["Instant"]),
      s("Telegram Group Members", 34, 100, 100_000, "0–12 hr", ["High quality"]),
      s("Telegram Reactions · Positive", 9, 20, 200_000, "0–1 hr", ["Instant"]),
    ],
  },
  {
    platform: "Facebook",
    category: "Pages & Posts",
    services: [
      s("Facebook Page Likes + Follows", 35, 50, 100_000, "0–6 hr", ["High quality", "Refill"]),
      s("Facebook Post Likes", 18, 20, 200_000, "0–2 hr", ["Instant", "Non-drop"]),
      s("Facebook Video Views · 3s", 3.5, 100, 10_000_000, "0–1 hr", ["Instant"]),
      s("Facebook Group Members", 60, 50, 50_000, "0–24 hr", ["High quality"]),
    ],
  },
  {
    platform: "Twitter / X",
    category: "Growth",
    services: [
      s("X Followers · HQ", 42, 50, 100_000, "0–6 hr", ["High quality", "Refill"]),
      s("X Likes", 20, 20, 200_000, "0–2 hr", ["Instant", "Non-drop"]),
      s("X Retweets", 28, 20, 100_000, "0–3 hr", ["Instant"]),
      s("X Video Views", 2.5, 100, 10_000_000, "0–1 hr", ["Instant"]),
    ],
  },
  {
    platform: "Spotify",
    category: "Plays & Followers",
    services: [
      s("Spotify Plays · Premium", 60, 1_000, 10_000_000, "0–24 hr", ["High quality", "Non-drop"]),
      s("Spotify Followers", 45, 100, 500_000, "0–12 hr", ["High quality", "Refill"]),
      s("Spotify Monthly Listeners", 90, 500, 1_000_000, "1–3 days", ["High quality"]),
    ],
  },
  {
    platform: "Website Traffic",
    category: "Traffic",
    services: [
      s("Website Traffic · Worldwide", 12, 1_000, 5_000_000, "0–6 hr", ["Instant"]),
      s("Website Traffic · India Targeted", 20, 1_000, 1_000_000, "0–12 hr", ["High quality"]),
      s("Google Search Traffic · Keyword", 40, 500, 200_000, "1–3 days", ["High quality"]),
    ],
  },
];

export const smmStats = {
  services: smmCatalog.reduce((n, c) => n + c.services.length, 0),
  categories: smmCatalog.length,
  platforms: smmPlatforms.length,
};
