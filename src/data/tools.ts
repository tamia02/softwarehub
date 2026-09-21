import type { TierSlug } from "./tiers";

export type ToolCategory = "AI coding" | "Design" | "Productivity" | "Marketing" | "Infra";
export type ToolBadge = "NEW" | "LIMITED" | "PRO";

export interface Tool {
  slug: string;
  name: string;
  vendor: string;
  category: ToolCategory;
  offerTitle: string;
  blurb: string;
  /** Listed annual retail value, USD. */
  valueUsd: number;
  /** Lowest tier that includes this tool. */
  tierMin: TierSlug;
  badge?: ToolBadge;
  /** Fallback tint for the lettered tile. */
  hue: number;
  /** Official logo asset, if uploaded via admin. */
  logoUrl?: string | null;
  sort: number;
}

export const categories: ToolCategory[] = ["AI coding", "Design", "Productivity", "Marketing", "Infra"];

type ToolSeed = Omit<Tool, "tierMin" | "sort">;

const core: ToolSeed[] = [
  { slug: "brain-fm", name: "Brain.fm", vendor: "Brain.fm", category: "Productivity", offerTitle: "1 year", blurb: "Focus music engineered to keep you in flow.", valueUsd: 100, hue: 260 },
  { slug: "customer-io", name: "Customer.io Essentials", vendor: "Customer.io", category: "Marketing", offerTitle: "1 year", blurb: "Behavioural email, push and SMS automation.", valueUsd: 1200, hue: 150 },
  { slug: "factory", name: "Factory Pro", vendor: "Factory", category: "AI coding", offerTitle: "1 year", blurb: "Agent-native software development platform.", valueUsd: 240, hue: 20 },
  { slug: "fin", name: "Fin AI Agent + Fin Advanced", vendor: "Fin", category: "Marketing", offerTitle: "1 year · 5 seats", blurb: "AI customer service agent that resolves tickets.", valueUsd: 7140, hue: 220 },
  { slug: "framer", name: "Framer Pro", vendor: "Framer", category: "Design", offerTitle: "1 year", blurb: "Design and ship production websites visually.", valueUsd: 360, hue: 215 },
  { slug: "granola", name: "Granola Business", vendor: "Granola", category: "Productivity", offerTitle: "1 year · 10 seats", blurb: "AI notepad that turns meetings into notes.", valueUsd: 1680, hue: 35 },
  { slug: "grok-bot", name: "Grok Bot", vendor: "Cursor Pro+", category: "AI coding", offerTitle: "1 month", blurb: "Grok-powered coding agent inside Cursor Pro+.", valueUsd: 60, hue: 0, badge: "LIMITED" },
  { slug: "gumloop", name: "Gumloop Pro", vendor: "Gumloop", category: "Productivity", offerTitle: "1 year", blurb: "No-code AI workflow builder for ops teams.", valueUsd: 444, hue: 290 },
  { slug: "jam", name: "Jam Team", vendor: "Jam", category: "Productivity", offerTitle: "1 year · 10 seats", blurb: "One-click bug reports with logs and replay.", valueUsd: 1920, hue: 330 },
  { slug: "linear", name: "Linear Business", vendor: "Linear", category: "Productivity", offerTitle: "1 year · 5 seats", blurb: "Issue tracking built for fast product teams.", valueUsd: 1080, hue: 240 },
  { slug: "magic-patterns", name: "Magic Patterns Starter", vendor: "Magic Patterns", category: "Design", offerTitle: "1 year", blurb: "Generate UI from prompts, export to code.", valueUsd: 240, hue: 275 },
  { slug: "manus", name: "Manus", vendor: "Manus", category: "Productivity", offerTitle: "1 year", blurb: "General-purpose AI agent that gets tasks done.", valueUsd: 240, hue: 200 },
  { slug: "mobbin", name: "Mobbin Team", vendor: "Mobbin", category: "Design", offerTitle: "1 year · 10 seats", blurb: "The largest library of real app UI patterns.", valueUsd: 1920, hue: 10 },
  { slug: "notion", name: "Notion Business", vendor: "Notion", category: "Productivity", offerTitle: "1 year", blurb: "Docs, wikis and projects in one workspace.", valueUsd: 240, hue: 0 },
  { slug: "posthog", name: "PostHog Scale", vendor: "PostHog", category: "Marketing", offerTitle: "1 year", blurb: "Product analytics, replays, flags and more.", valueUsd: 16500, hue: 25 },
  { slug: "railway", name: "Railway Hobby", vendor: "Railway", category: "Infra", offerTitle: "1 year", blurb: "Deploy apps and databases in seconds.", valueUsd: 245, hue: 280 },
  { slug: "readwise", name: "Readwise + Reader", vendor: "Readwise", category: "Productivity", offerTitle: "1 year", blurb: "Read-it-later plus spaced-repetition highlights.", valueUsd: 120, hue: 45 },
  { slug: "resend", name: "Resend Transactional Pro", vendor: "Resend", category: "Infra", offerTitle: "1 year", blurb: "Email API for developers, built on React.", valueUsd: 240, hue: 0 },
  { slug: "supercut", name: "Supercut Pro", vendor: "Supercut", category: "Marketing", offerTitle: "1 year · 10 seats", blurb: "Record and share polished product videos.", valueUsd: 1800, hue: 340 },
  { slug: "waking-up", name: "Waking Up", vendor: "Waking Up", category: "Productivity", offerTitle: "1 year", blurb: "Meditation and mindfulness course library.", valueUsd: 129, hue: 190 },
  { slug: "warp", name: "Warp Build", vendor: "Warp", category: "AI coding", offerTitle: "1 year", blurb: "Agentic terminal with built-in AI.", valueUsd: 240, hue: 180 },
  { slug: "wispr-flow", name: "Wispr Flow Pro", vendor: "Wispr", category: "Productivity", offerTitle: "1 year", blurb: "Speak instead of type, anywhere on your Mac.", valueUsd: 180, hue: 300 },
];

const pro: ToolSeed[] = [
  { slug: "cursor", name: "Cursor Pro", vendor: "Cursor", category: "AI coding", offerTitle: "1 year", blurb: "The AI code editor, unlocked for a year.", valueUsd: 240, hue: 0 },
  { slug: "elevenlabs", name: "ElevenLabs Creator", vendor: "ElevenLabs", category: "Marketing", offerTitle: "1 year", blurb: "Studio-quality AI voices and dubbing.", valueUsd: 264, hue: 0 },
  { slug: "gamma", name: "Gamma Pro", vendor: "Gamma", category: "Design", offerTitle: "1 year", blurb: "AI-generated decks, docs and one-pagers.", valueUsd: 216, hue: 320 },
  { slug: "google-ai-pro", name: "Google AI Pro", vendor: "Google", category: "Productivity", offerTitle: "1 year", blurb: "Gemini Advanced, Veo and 2 TB of storage.", valueUsd: 240, hue: 210 },
  { slug: "higgsfield", name: "Higgsfield Pro", vendor: "Higgsfield", category: "Marketing", offerTitle: "1 year", blurb: "Cinematic AI video generation.", valueUsd: 348, hue: 250, badge: "NEW" },
  { slug: "lovable", name: "Lovable Pro", vendor: "Lovable", category: "AI coding", offerTitle: "1 year", blurb: "Build full-stack apps from a prompt.", valueUsd: 252, hue: 350, badge: "NEW" },
  { slug: "mercury", name: "Mercury Personal", vendor: "Mercury", category: "Infra", offerTitle: "2 years", blurb: "Modern banking for founders and operators.", valueUsd: 480, hue: 230 },
  { slug: "n8n", name: "n8n Cloud Starter", vendor: "n8n", category: "Infra", offerTitle: "1 year", blurb: "Open workflow automation, hosted for you.", valueUsd: 240, hue: 10 },
  { slug: "pangram", name: "Pangram Professional", vendor: "Pangram", category: "Marketing", offerTitle: "1 year", blurb: "Industry-leading AI content detection.", valueUsd: 540, hue: 160 },
  { slug: "replit", name: "Replit Core", vendor: "Replit", category: "AI coding", offerTitle: "1 year", blurb: "Build and deploy from your browser with Agent.", valueUsd: 240, hue: 30 },
  { slug: "runway", name: "Runway Pro", vendor: "Runway", category: "Design", offerTitle: "1 year", blurb: "Generative video and image tools for creators.", valueUsd: 336, hue: 120 },
  { slug: "stripe-atlas", name: "Stripe Atlas", vendor: "Stripe", category: "Infra", offerTitle: "40% off", blurb: "Incorporate a US company from anywhere.", valueUsd: 200, hue: 255, badge: "LIMITED" },
  { slug: "supabase", name: "Supabase Pro (credits)", vendor: "Supabase", category: "Infra", offerTitle: "1 year", blurb: "Postgres, auth, storage and edge functions.", valueUsd: 300, hue: 155 },
];

export const tools: Tool[] = [
  ...core.map((t, i): Tool => ({ ...t, tierMin: "starter", sort: i + 1 })),
  ...pro.map((t, i): Tool => ({ ...t, tierMin: "pro", badge: t.badge ?? "PRO", sort: core.length + i + 1 })),
];

export const coreTools = tools.filter((t) => t.tierMin === "starter");
export const proTools = tools.filter((t) => t.tierMin === "pro");

export function toolsForTier(tier: TierSlug): Tool[] {
  return tier === "pro" ? tools : coreTools;
}

export function toolBySlug(slug: string): Tool | undefined {
  return tools.find((t) => t.slug === slug);
}
