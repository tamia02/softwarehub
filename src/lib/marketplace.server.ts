import "server-only";
import { and, asc, eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { customerPaise } from "@/data/marketplace";
import { memo } from "./cache.server";

export interface MarketProduct {
  id: string;
  slug: string;
  name: string;
  vendor: string;
  category: string;
  blurb: string;
  description: string | null;
  basePricePaise: number;
  commissionPct: number;
  pricePaise: number; // customer price (base + commission)
  warrantyDays: number;
  hue: number;
  badge: string | null;
  stock: number;
}

export interface MarketBundle {
  id: string;
  slug: string;
  name: string;
  blurb: string;
  pricePaise: number;
  badge: string | null;
  items: { name: string; vendor: string }[];
  valuePaise: number; // sum of member product customer prices
}

export interface Marketplace {
  products: MarketProduct[];
  bundles: MarketBundle[];
  categories: string[];
}

/** Cached 60 s; product/code/admin writes should call bust("marketplace"). */
export function getMarketplace(): Promise<Marketplace> {
  return memo("marketplace", 60_000, loadMarketplace);
}

async function loadMarketplace(): Promise<Marketplace> {
  const db = await getDb();
  const rows = await db.select().from(schema.products).where(eq(schema.products.active, true)).orderBy(asc(schema.products.sort));

  // Available-stock counts per product in one grouped query.
  const stockRows = await db
    .select({ productId: schema.productCodes.productId, n: sql<number>`count(*)::int` })
    .from(schema.productCodes)
    .where(eq(schema.productCodes.status, "available"))
    .groupBy(schema.productCodes.productId);
  const stockBy = new Map(stockRows.map((r) => [r.productId, Number(r.n)]));

  const products: MarketProduct[] = rows.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    vendor: p.vendor,
    category: p.category,
    blurb: p.blurb,
    description: p.description,
    basePricePaise: p.basePricePaise,
    commissionPct: p.commissionPct,
    pricePaise: customerPaise(p.basePricePaise, p.commissionPct),
    warrantyDays: p.warrantyDays,
    hue: p.hue,
    badge: p.badge,
    stock: stockBy.get(p.id) ?? 0,
  }));
  const byId = new Map(products.map((p) => [p.id, p]));

  const bundleRows = await db.select().from(schema.bundles).where(eq(schema.bundles.active, true)).orderBy(asc(schema.bundles.sort));
  const itemRows = await db.select().from(schema.bundleItems);
  const itemsByBundle = new Map<string, { name: string; vendor: string }[]>();
  const valueByBundle = new Map<string, number>();
  for (const it of itemRows) {
    const p = byId.get(it.productId);
    if (!p) continue;
    if (!itemsByBundle.has(it.bundleId)) itemsByBundle.set(it.bundleId, []);
    itemsByBundle.get(it.bundleId)!.push({ name: p.name, vendor: p.vendor });
    valueByBundle.set(it.bundleId, (valueByBundle.get(it.bundleId) ?? 0) + p.pricePaise);
  }
  const bundles: MarketBundle[] = bundleRows.map((b) => ({
    id: b.id,
    slug: b.slug,
    name: b.name,
    blurb: b.blurb,
    pricePaise: b.pricePaise,
    badge: b.badge,
    items: itemsByBundle.get(b.id) ?? [],
    valuePaise: valueByBundle.get(b.id) ?? 0,
  }));

  const categories = [...new Set(products.map((p) => p.category))];
  return { products, bundles, categories };
}

/** One product by slug, with live stock and customer price. */
export async function getProduct(slug: string): Promise<MarketProduct | null> {
  const db = await getDb();
  const [p] = await db.select().from(schema.products).where(and(eq(schema.products.slug, slug), eq(schema.products.active, true)));
  if (!p) return null;
  const [{ n }] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(schema.productCodes)
    .where(and(eq(schema.productCodes.productId, p.id), eq(schema.productCodes.status, "available")));
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    vendor: p.vendor,
    category: p.category,
    blurb: p.blurb,
    description: p.description,
    basePricePaise: p.basePricePaise,
    commissionPct: p.commissionPct,
    pricePaise: customerPaise(p.basePricePaise, p.commissionPct),
    warrantyDays: p.warrantyDays,
    hue: p.hue,
    badge: p.badge,
    stock: Number(n),
  };
}
