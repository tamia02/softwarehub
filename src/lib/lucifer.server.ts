import "server-only";
import { memo } from "./cache.server";

/**
 * Client for the Lucifer bot's internal website API (autopay_overlay/apiserver.py,
 * port 8092 on the bot container — reachable only over the shared Docker network,
 * authenticated with X-Internal-Key). The bot owns the catalog, the wallets and
 * the orders; this site is a storefront onto it. A user's Lucifer account is
 * their Telegram id, which they get by signing in with Telegram.
 *
 * Product refs exceed Number.MAX_SAFE_INTEGER, so refs are always strings here.
 */

const BASE = (process.env.LUCIFER_API_URL ?? "").replace(/\/$/, "");
const KEY = process.env.LUCIFER_INTERNAL_KEY ?? "";

export const luciferBotUsername = process.env.LUCIFER_BOT_USERNAME ?? "DevilLucifer777_bot";
export const luciferBotUrl = `https://t.me/${luciferBotUsername}`;

export function luciferConfigured(): boolean {
  return Boolean(BASE && KEY);
}

/** Catalog sections, as the bot groups them (supplier_catalog.SECTIONS). */
export const SECTIONS = [
  { id: "ai", name: "AI & Productivity" },
  { id: "creative", name: "Design & Video" },
  { id: "entertain", name: "Music & Streaming" },
  { id: "telegram", name: "Telegram Services" },
  { id: "learn", name: "Learning & Tools" },
  { id: "other", name: "More Services" },
] as const;
export type SectionId = (typeof SECTIONS)[number]["id"];
const sectionName = (id: string) => SECTIONS.find((s) => s.id === id)?.name ?? "More Services";

export interface LuciferProduct {
  ref: string;
  name: string;
  description: string;
  section: string;
  sectionName: string;
  pricePaise: number;
  stock: number | null;
  minQty: number;
  maxQty: number | null;
  /** Read from the title the way the bot does (FW / NW / warranty). */
  warranty: "warranty" | "none" | "unknown";
  logoSlug: string | null;
  /** Brand glyph from simple-icons' CDN, when the name matches a known brand. */
  logoUrl: string | null;
}

export interface LuciferOrder {
  orderId: string;
  name: string;
  ref: string;
  qty: number;
  totalPaise: number;
  status: "awaiting_payment" | "paid" | "completed" | "cancelled" | string;
  paidVia: string;
  createdAt: number; // unix seconds
  delivery?: string;
}

export interface LuciferAccount {
  uid: string;
  balancePaise: number;
  orders: LuciferOrder[];
}

export class LuciferError extends Error {
  constructor(message: string, readonly status: number, readonly body?: Record<string, unknown>) {
    super(message);
  }
}

/** JSON.parse that keeps 64-bit refs intact by quoting them first. */
function parseSafe(text: string): Record<string, unknown> {
  return JSON.parse(text.replace(/"ref"\s*:\s*(\d+)/g, '"ref":"$1"'));
}

async function call(path: string, init?: RequestInit): Promise<Record<string, unknown>> {
  if (!luciferConfigured()) throw new LuciferError("Lucifer bot is not configured", 503);
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: { "X-Internal-Key": KEY, "Content-Type": "application/json", ...(init?.headers ?? {}) },
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
  } catch {
    throw new LuciferError("Lucifer bot is unreachable", 503);
  }
  let body: Record<string, unknown> = {};
  try {
    body = parseSafe(await res.text());
  } catch {
    /* non-JSON error page */
  }
  if (!res.ok || body.ok === false) throw new LuciferError(String(body.error ?? `HTTP ${res.status}`), res.status, body);
  return body;
}

const toPaise = (inr: unknown) => Math.round(Number(inr ?? 0) * 100);

function warrantyOf(name: string): LuciferProduct["warranty"] {
  if (/\b(?:NW|non[- ]?warranty|no\s+warranty|without\s+warranty)\b/i.test(name)) return "none";
  if (/\b(?:FW|full\s+warranty|warranty)\b/i.test(name)) return "warranty";
  return "unknown";
}

/** Brand keyword → simple-icons CDN slug. Only slugs verified to exist on cdn.simpleicons.org (2026-10-25); others fall back to a letter tile. */
const LOGO_HINTS: [RegExp, string][] = [
  [/gemini|google\s*ai|google\s*one/i, "googlegemini"],
  [/claude|anthropic/i, "anthropic"],
  [/perplexity/i, "perplexity"],
  [/grok|x\.ai|xai/i, "x"],
  [/cursor/i, "cursor"],
  [/notion/i, "notion"],
  [/figma/i, "figma"],
  [/netflix/i, "netflix"],
  [/spotify/i, "spotify"],
  [/youtube/i, "youtube"],
  [/telegram|stars/i, "telegram"],
  [/duolingo/i, "duolingo"],
  [/coursera/i, "coursera"],
  [/udemy/i, "udemy"],
  [/elevenlabs|eleven\s*labs/i, "elevenlabs"],
  [/quizlet/i, "quizlet"],
  [/nord\s*vpn/i, "nordvpn"],
  [/express\s*vpn/i, "expressvpn"],
  [/github/i, "github"],
  [/replit/i, "replit"],
  [/suno/i, "suno"],
];

function logoFor(name: string): string | null {
  for (const [re, slug] of LOGO_HINTS) if (re.test(name)) return slug;
  return null;
}

function toProduct(p: Record<string, unknown>): LuciferProduct {
  const name = String(p.name ?? "").trim();
  const section = String(p.section ?? "other");
  return {
    ref: String(p.ref),
    name,
    description: String(p.description ?? ""),
    section,
    sectionName: sectionName(section),
    pricePaise: toPaise(p.price_inr),
    stock: typeof p.stock === "number" ? p.stock : null,
    minQty: Math.max(1, Number(p.min_qty ?? 1) || 1),
    maxQty: typeof p.max_qty === "number" ? p.max_qty : null,
    warranty: warrantyOf(name),
    logoSlug: logoFor(name),
    logoUrl: (() => {
      const slug = logoFor(name);
      return slug ? `https://cdn.simpleicons.org/${slug}` : null;
    })(),
  };
}

function toOrder(o: Record<string, unknown>): LuciferOrder {
  return {
    orderId: String(o.order_id),
    name: String(o.name ?? ""),
    ref: String(o.ref ?? ""),
    qty: Number(o.qty ?? 1),
    totalPaise: toPaise(o.total_inr),
    status: String(o.status ?? ""),
    paidVia: String(o.paid_via ?? ""),
    createdAt: Number(o.created_at ?? 0),
    delivery: typeof o.delivery === "string" ? o.delivery : undefined,
  };
}

/** Full purchasable catalog (bot already hides invisible/zero-price items). Cached 60 s. */
export function getLuciferCatalog(): Promise<LuciferProduct[]> {
  return memo("lucifer:catalog", 60_000, async () => {
    const d = await call("/internal/v1/products");
    const list = Array.isArray(d.products) ? (d.products as Record<string, unknown>[]) : [];
    return list.map(toProduct).filter((p) => p.name && p.pricePaise > 0);
  });
}

/** Catalog that never throws — the storefront still renders if the bot is down. */
export async function getLuciferCatalogSafe(): Promise<{ products: LuciferProduct[]; error: string | null }> {
  try {
    return { products: await getLuciferCatalog(), error: null };
  } catch (e) {
    return { products: [], error: e instanceof Error ? e.message : "unavailable" };
  }
}

export async function getLuciferProduct(ref: string): Promise<LuciferProduct | null> {
  if (!/^\d{1,20}$/.test(ref)) return null;
  const list = await getLuciferCatalog();
  return list.find((p) => p.ref === ref) ?? null;
}

export async function getLuciferAccount(telegramId: string): Promise<LuciferAccount> {
  const d = await call(`/internal/v1/users/${encodeURIComponent(telegramId)}`);
  return {
    uid: String(d.uid),
    balancePaise: Number(d.balance_paise ?? 0),
    orders: Array.isArray(d.orders) ? (d.orders as Record<string, unknown>[]).map(toOrder) : [],
  };
}

export async function placeLuciferOrder(telegramId: string, ref: string, qty: number): Promise<LuciferOrder & { balancePaise: number }> {
  const d = await call(`/internal/v1/users/${encodeURIComponent(telegramId)}/orders`, {
    method: "POST",
    body: JSON.stringify({ ref, qty }),
  });
  const o = d.order as Record<string, unknown>;
  return { ...toOrder(o), balancePaise: toPaise(o.balance_inr) };
}
