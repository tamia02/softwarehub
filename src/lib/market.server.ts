import "server-only";
import { and, desc, eq, sql } from "drizzle-orm";
import { getDb, schema, type Db } from "@/db";
import type { Order, User } from "@/db/schema";
import { customerPaise } from "@/data/marketplace";
import { createGatewayOrder, type GatewayOrder } from "./payments.server";
import { decrypt, encrypt } from "./crypto.server";
import { hashCode } from "./codes.server";
import { audit } from "./audit.server";
import { uuid } from "./ids";
import { bust } from "./cache.server";

/** Reserve a code and open a payment order for a product. Returns the gateway
 *  order the PayButton needs. Escrow lifecycle lives on market_orders. */
export async function createProductPurchase(user: User, slug: string): Promise<{ gateway: GatewayOrder }> {
  const db = await getDb();
  const [product] = await db.select().from(schema.products).where(and(eq(schema.products.slug, slug), eq(schema.products.active, true)));
  if (!product) throw new Error("Product not found.");

  // Reserve one available code.
  const [code] = await db
    .select()
    .from(schema.productCodes)
    .where(and(eq(schema.productCodes.productId, product.id), eq(schema.productCodes.status, "available")))
    .limit(1);
  if (!code) throw new Error("This product is out of stock.");
  const reserved = await db
    .update(schema.productCodes)
    .set({ status: "reserved", reservedForUserId: user.id })
    .where(and(eq(schema.productCodes.id, code.id), eq(schema.productCodes.status, "available")))
    .returning();
  if (reserved.length === 0) throw new Error("This product was just bought — please try again.");

  const price = customerPaise(product.basePricePaise, product.commissionPct);
  const commission = price - product.basePricePaise;
  const orderId = uuid();
  const marketOrderId = uuid();

  let gateway: GatewayOrder;
  try {
    gateway = await createGatewayOrder({ amountPaise: price, receipt: orderId, notes: { type: "product", productId: product.id, userId: user.id } });
  } catch (e) {
    await db.update(schema.productCodes).set({ status: "available", reservedForUserId: null }).where(eq(schema.productCodes.id, code.id));
    throw e;
  }

  await db.insert(schema.orders).values({
    id: orderId,
    userId: user.id,
    type: "product",
    amountPaise: price,
    gateway: gateway.gateway,
    gatewayOrderId: gateway.gatewayOrderId,
    status: "created",
    idempotencyKey: marketOrderId,
    metaJson: { productId: product.id, productCodeId: code.id, marketOrderId, resellerId: product.resellerId },
  });
  await db.insert(schema.marketOrders).values({
    id: marketOrderId,
    userId: user.id,
    productId: product.id,
    resellerId: product.resellerId,
    orderId,
    productCodeId: code.id,
    qty: 1,
    pricePaise: price,
    basePricePaise: product.basePricePaise,
    commissionPaise: commission,
    status: "pending_payment",
  });
  await audit({ actorId: user.id, entity: "market_order", entityId: marketOrderId, to: "pending_payment", meta: { productId: product.id, price } }, db);
  bust("marketplace");
  return { gateway };
}

/** Called from the capture path once payment clears. Delivers the code into
 *  escrow: code sold, market order 'held', confirm window opened. */
export async function onProductOrderPaid(db: Db, order: Order): Promise<void> {
  const meta = (order.metaJson ?? {}) as { productCodeId?: string; marketOrderId?: string };
  if (!meta.productCodeId || !meta.marketOrderId) return;
  const [mo] = await db.select().from(schema.marketOrders).where(eq(schema.marketOrders.id, meta.marketOrderId));
  if (!mo || mo.status !== "pending_payment") return;

  await db.update(schema.productCodes).set({ status: "sold", orderId: order.id, soldAt: new Date() }).where(eq(schema.productCodes.id, meta.productCodeId));
  const [product] = await db.select().from(schema.products).where(eq(schema.products.id, mo.productId!));
  const deadline = new Date(Date.now() + (product?.warrantyDays ?? 14) * 24 * 60 * 60 * 1000);
  await db.update(schema.marketOrders).set({ status: "held", deliveredAt: new Date(), confirmDeadline: deadline }).where(eq(schema.marketOrders.id, mo.id));
  await audit({ actorId: order.userId, entity: "market_order", entityId: mo.id, from: "pending_payment", to: "held" }, db);
  bust("marketplace");
}

/** One-time reveal of the purchased code for the buyer. */
export async function revealMarketCode(orderId: string, userId: string): Promise<{ code: string | null; last4: string | null }> {
  const db = await getDb();
  const [order] = await db.select().from(schema.orders).where(and(eq(schema.orders.id, orderId), eq(schema.orders.userId, userId)));
  const codeId = (order?.metaJson as { productCodeId?: string } | null)?.productCodeId;
  if (!order || !codeId) return { code: null, last4: null };
  const [code] = await db.select().from(schema.productCodes).where(eq(schema.productCodes.id, codeId));
  if (!code) return { code: null, last4: null };
  if (!code.codeEnc) return { code: null, last4: code.last4 };
  const plaintext = decrypt(code.codeEnc);
  await db.update(schema.productCodes).set({ codeEnc: null }).where(eq(schema.productCodes.id, code.id));
  return { code: plaintext, last4: code.last4 };
}

/** Buyer confirms the item works — release escrow, credit the reseller. */
export async function confirmProductPurchase(marketOrderId: string, userId: string): Promise<boolean> {
  const db = await getDb();
  const [mo] = await db.select().from(schema.marketOrders).where(and(eq(schema.marketOrders.id, marketOrderId), eq(schema.marketOrders.userId, userId)));
  if (!mo || (mo.status !== "held" && mo.status !== "delivered")) return false;
  await db.update(schema.marketOrders).set({ status: "completed", completedAt: new Date() }).where(eq(schema.marketOrders.id, mo.id));
  await audit({ actorId: userId, entity: "market_order", entityId: mo.id, from: mo.status, to: "completed" }, db);
  return true;
}

export interface Purchase {
  id: string;
  productName: string;
  productSlug: string;
  orderId: string | null;
  pricePaise: number;
  status: string;
  last4: string | null;
  confirmDeadline: Date | null;
  createdAt: Date;
}

/** The signed-in buyer's purchases, newest first. */
export async function listPurchases(userId: string): Promise<Purchase[]> {
  const db = await getDb();
  const rows = await db
    .select({
      id: schema.marketOrders.id,
      orderId: schema.marketOrders.orderId,
      pricePaise: schema.marketOrders.pricePaise,
      status: schema.marketOrders.status,
      confirmDeadline: schema.marketOrders.confirmDeadline,
      createdAt: schema.marketOrders.createdAt,
      productName: schema.products.name,
      productSlug: schema.products.slug,
      last4: schema.productCodes.last4,
    })
    .from(schema.marketOrders)
    .leftJoin(schema.products, eq(schema.marketOrders.productId, schema.products.id))
    .leftJoin(schema.productCodes, eq(schema.marketOrders.productCodeId, schema.productCodes.id))
    .where(eq(schema.marketOrders.userId, userId))
    .orderBy(desc(schema.marketOrders.createdAt));
  return rows.map((r) => ({
    id: r.id,
    productName: r.productName ?? "Product",
    productSlug: r.productSlug ?? "",
    orderId: r.orderId,
    pricePaise: r.pricePaise,
    status: r.status,
    last4: r.last4,
    confirmDeadline: r.confirmDeadline,
    createdAt: r.createdAt,
  }));
}

/** Reseller earnings summary (sum of base price on completed/held orders). */
export async function resellerSales(resellerId: string): Promise<{ held: number; earned: number; orders: number }> {
  const db = await getDb();
  const [row] = await db
    .select({
      orders: sql<number>`count(*)::int`,
      held: sql<number>`coalesce(sum(case when ${schema.marketOrders.status} = 'held' then ${schema.marketOrders.basePricePaise} else 0 end),0)::int`,
      earned: sql<number>`coalesce(sum(case when ${schema.marketOrders.status} = 'completed' then ${schema.marketOrders.basePricePaise} else 0 end),0)::int`,
    })
    .from(schema.marketOrders)
    .where(eq(schema.marketOrders.resellerId, resellerId));
  return { held: Number(row?.held ?? 0), earned: Number(row?.earned ?? 0), orders: Number(row?.orders ?? 0) };
}

/* ------------------------------------------------------------------
   Reseller product & code management (Stage 4)
   ------------------------------------------------------------------ */
export interface ResellerProduct {
  id: string;
  slug: string;
  name: string;
  vendor: string;
  category: string;
  basePricePaise: number;
  commissionPct: number;
  pricePaise: number;
  active: boolean;
  stock: number;
  sold: number;
}

export async function listResellerProducts(resellerId: string): Promise<ResellerProduct[]> {
  const db = await getDb();
  const rows = await db.select().from(schema.products).where(eq(schema.products.resellerId, resellerId)).orderBy(desc(schema.products.createdAt));
  const out: ResellerProduct[] = [];
  for (const p of rows) {
    const [stock] = await db.select({ n: sql<number>`count(*)::int` }).from(schema.productCodes).where(and(eq(schema.productCodes.productId, p.id), eq(schema.productCodes.status, "available")));
    const [sold] = await db.select({ n: sql<number>`count(*)::int` }).from(schema.productCodes).where(and(eq(schema.productCodes.productId, p.id), eq(schema.productCodes.status, "sold")));
    out.push({
      id: p.id, slug: p.slug, name: p.name, vendor: p.vendor, category: p.category,
      basePricePaise: p.basePricePaise, commissionPct: p.commissionPct, pricePaise: customerPaise(p.basePricePaise, p.commissionPct),
      active: p.active, stock: Number(stock?.n ?? 0), sold: Number(sold?.n ?? 0),
    });
  }
  return out;
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);
}

export async function createResellerProduct(resellerId: string, data: { name: string; vendor: string; category: string; blurb: string; basePricePaise: number }): Promise<string> {
  const db = await getDb();
  const id = uuid();
  const slug = `${slugify(data.name)}-${id.slice(0, 4)}`;
  await db.insert(schema.products).values({
    id, slug, name: data.name, vendor: data.vendor, category: data.category, blurb: data.blurb,
    resellerId, basePricePaise: data.basePricePaise, commissionPct: 20, hue: 220, active: false, sort: 500,
  });
  await audit({ actorId: resellerId, entity: "product", entityId: id, to: "created", meta: { name: data.name } }, db);
  bust("marketplace");
  return id;
}

async function ownProduct(db: Db, productId: string, resellerId: string) {
  const [p] = await db.select().from(schema.products).where(and(eq(schema.products.id, productId), eq(schema.products.resellerId, resellerId)));
  return p ?? null;
}

export async function updateResellerProduct(productId: string, resellerId: string, data: { name?: string; vendor?: string; category?: string; blurb?: string; basePricePaise?: number }): Promise<boolean> {
  const db = await getDb();
  if (!(await ownProduct(db, productId, resellerId))) return false;
  await db.update(schema.products).set({ ...data }).where(eq(schema.products.id, productId));
  bust("marketplace");
  return true;
}

export async function setProductActive(productId: string, resellerId: string, active: boolean): Promise<boolean> {
  const db = await getDb();
  if (!(await ownProduct(db, productId, resellerId))) return false;
  await db.update(schema.products).set({ active }).where(eq(schema.products.id, productId));
  bust("marketplace");
  return true;
}

/** Bulk-add codes (one per line) as available stock. Returns how many added. */
export async function addProductCodes(productId: string, resellerId: string, codesRaw: string): Promise<number> {
  const db = await getDb();
  if (!(await ownProduct(db, productId, resellerId))) return 0;
  const codes = codesRaw.split(/[\r\n]+/).map((c) => c.trim()).filter(Boolean).slice(0, 2000);
  if (codes.length === 0) return 0;
  await db.insert(schema.productCodes).values(
    codes.map((c) => ({ id: uuid(), productId, codeHash: hashCode(c), codeEnc: encrypt(c), last4: c.slice(-4), batch: "reseller" })),
  );
  await audit({ actorId: resellerId, entity: "product", entityId: productId, to: "codes_added", meta: { count: codes.length } }, db);
  bust("marketplace");
  return codes.length;
}

/* ------------------------------------------------------------------
   Admin: all products, commission, marketplace overview (Stage 5)
   ------------------------------------------------------------------ */
export interface AdminProduct {
  id: string;
  name: string;
  vendor: string;
  category: string;
  resellerName: string | null;
  basePricePaise: number;
  commissionPct: number;
  pricePaise: number;
  active: boolean;
  stock: number;
  sold: number;
}

export async function adminListProducts(): Promise<AdminProduct[]> {
  const db = await getDb();
  const rows = await db
    .select({ p: schema.products, resellerName: schema.users.name, resellerEmail: schema.users.email })
    .from(schema.products)
    .leftJoin(schema.users, eq(schema.products.resellerId, schema.users.id))
    .orderBy(desc(schema.products.createdAt));
  const stock = await db
    .select({ productId: schema.productCodes.productId, status: schema.productCodes.status, n: sql<number>`count(*)::int` })
    .from(schema.productCodes)
    .groupBy(schema.productCodes.productId, schema.productCodes.status);
  const avail = new Map<string, number>();
  const sold = new Map<string, number>();
  for (const s of stock) {
    if (s.status === "available") avail.set(s.productId, Number(s.n));
    if (s.status === "sold") sold.set(s.productId, Number(s.n));
  }
  return rows.map(({ p, resellerName, resellerEmail }) => ({
    id: p.id, name: p.name, vendor: p.vendor, category: p.category,
    resellerName: resellerName ?? resellerEmail ?? null,
    basePricePaise: p.basePricePaise, commissionPct: p.commissionPct, pricePaise: customerPaise(p.basePricePaise, p.commissionPct),
    active: p.active, stock: avail.get(p.id) ?? 0, sold: sold.get(p.id) ?? 0,
  }));
}

export async function adminSetCommission(productId: string, pct: number): Promise<void> {
  const db = await getDb();
  const clamped = Math.max(0, Math.min(90, Math.round(pct)));
  await db.update(schema.products).set({ commissionPct: clamped }).where(eq(schema.products.id, productId));
  bust("marketplace");
}

export async function adminSetProductActive(productId: string, active: boolean): Promise<void> {
  const db = await getDb();
  await db.update(schema.products).set({ active }).where(eq(schema.products.id, productId));
  bust("marketplace");
}

export async function marketOverview(): Promise<{ products: number; live: number; orders: number; gmvPaise: number; heldPaise: number; commissionPaise: number }> {
  const db = await getDb();
  const [p] = await db.select({ n: sql<number>`count(*)::int`, live: sql<number>`coalesce(sum(case when ${schema.products.active} then 1 else 0 end),0)::int` }).from(schema.products);
  const [o] = await db.select({
    orders: sql<number>`count(*)::int`,
    gmv: sql<number>`coalesce(sum(case when ${schema.marketOrders.status} in ('held','completed') then ${schema.marketOrders.pricePaise} else 0 end),0)::int`,
    held: sql<number>`coalesce(sum(case when ${schema.marketOrders.status} = 'held' then ${schema.marketOrders.pricePaise} else 0 end),0)::int`,
    commission: sql<number>`coalesce(sum(case when ${schema.marketOrders.status} in ('held','completed') then ${schema.marketOrders.commissionPaise} else 0 end),0)::int`,
  }).from(schema.marketOrders);
  return { products: Number(p?.n ?? 0), live: Number(p?.live ?? 0), orders: Number(o?.orders ?? 0), gmvPaise: Number(o?.gmv ?? 0), heldPaise: Number(o?.held ?? 0), commissionPaise: Number(o?.commission ?? 0) };
}
