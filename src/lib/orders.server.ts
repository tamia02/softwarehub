import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { getDb, schema, type Db } from "@/db";
import type { TierSlug } from "@/data/tiers";
import { audit } from "./audit.server";
import { allocateBundleCode, markBundleCodeDelivered, stockBundleCodeForReseller } from "./codes.server";
import { decrypt } from "./crypto.server";
import { uuid } from "./ids";
import { notifyAdmin, notifyCodeDelivery } from "./notify.server";
import { createGatewayOrder, type GatewayOrder } from "./payments.server";
import { getSettings } from "./settings.server";
import type { Order, Payment, User } from "@/db/schema";

export type OrderType = "direct" | "pool_seat" | "reseller_code";

/* ------------------------------------------------------------------
   Creation (idempotent on idempotencyKey)
   ------------------------------------------------------------------ */

export async function createOrder(opts: {
  user: User;
  type: OrderType;
  tier: TierSlug;
  amountPaise: number;
  idempotencyKey: string;
  meta?: Record<string, unknown>;
}): Promise<{ order: Order; gateway: GatewayOrder }> {
  const db = await getDb();
  const [existing] = await db.select().from(schema.orders).where(eq(schema.orders.idempotencyKey, opts.idempotencyKey));
  if (existing && existing.status === "created" && existing.gatewayOrderId) {
    return {
      order: existing,
      gateway: { gateway: existing.gateway as GatewayOrder["gateway"], gatewayOrderId: existing.gatewayOrderId, amountPaise: existing.amountPaise, keyId: process.env.RAZORPAY_KEY_ID ?? "rzp_test_mock" },
    };
  }
  if (existing) throw new Error("This order has already been processed.");

  const id = uuid();
  const gateway = await createGatewayOrder({
    amountPaise: opts.amountPaise,
    receipt: id,
    notes: { type: opts.type, tier: opts.tier, userId: opts.user.id },
  });
  const [order] = await db
    .insert(schema.orders)
    .values({
      id,
      userId: opts.user.id,
      type: opts.type,
      tierId: opts.tier,
      amountPaise: opts.amountPaise,
      gateway: gateway.gateway,
      gatewayOrderId: gateway.gatewayOrderId,
      status: "created",
      idempotencyKey: opts.idempotencyKey,
      metaJson: opts.meta ?? {},
    })
    .returning();
  await audit({ actorId: opts.user.id, entity: "order", entityId: id, to: "created", meta: { type: opts.type, amountPaise: opts.amountPaise } }, db);
  return { order, gateway };
}

/* ------------------------------------------------------------------
   Capture → fulfilment state machine
   ------------------------------------------------------------------ */

/**
 * Idempotent: called from the checkout verify route, the webhook, and the
 * mock capture endpoint. A second call with the same payment id is a no-op.
 */
export async function onPaymentCaptured(input: {
  gatewayOrderId: string;
  gatewayPaymentId: string;
  amountPaise?: number;
  raw?: unknown;
}): Promise<{ order: Order; payment: Payment; alreadyProcessed: boolean }> {
  const db = await getDb();
  const [order] = await db.select().from(schema.orders).where(eq(schema.orders.gatewayOrderId, input.gatewayOrderId));
  if (!order) throw new Error(`Unknown gateway order ${input.gatewayOrderId}`);

  const [existingPayment] = await db.select().from(schema.payments).where(eq(schema.payments.gatewayPaymentId, input.gatewayPaymentId));
  if (existingPayment) return { order, payment: existingPayment, alreadyProcessed: true };

  if (input.amountPaise !== undefined && input.amountPaise !== order.amountPaise) {
    throw new Error(`Amount mismatch for order ${order.id}: expected ${order.amountPaise}, got ${input.amountPaise}`);
  }

  const [payment] = await db
    .insert(schema.payments)
    .values({ id: uuid(), orderId: order.id, gatewayPaymentId: input.gatewayPaymentId, amountPaise: order.amountPaise, status: "captured", rawJson: input.raw ?? null })
    .returning();

  const [paid] = await db
    .update(schema.orders)
    .set({ status: "paid", paidAt: new Date() })
    .where(and(eq(schema.orders.id, order.id), eq(schema.orders.status, "created")))
    .returning();
  if (!paid) return { order, payment, alreadyProcessed: true }; // raced with another capture
  await audit({ actorId: order.userId, entity: "order", entityId: order.id, from: "created", to: "paid", meta: { paymentId: payment.id } }, db);

  await createInvoice(db, paid);
  const fulfilled = await fulfilOrder(db, paid, payment);
  return { order: fulfilled, payment, alreadyProcessed: false };
}

async function fulfilOrder(db: Db, order: Order, payment: Payment): Promise<Order> {
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, order.userId));
  const tier = order.tierId as TierSlug;

  if (order.type === "direct") {
    const code = await allocateBundleCode(db, tier, { userId: order.userId, orderId: order.id });
    if (!code) {
      await setOrderStatus(db, order, "awaiting_inventory");
      await notifyAdmin("Order awaiting inventory", `Order ${order.id} (${tier}) is paid but no bundle code is in stock.`);
      return { ...order, status: "awaiting_inventory" };
    }
    if (code.codeEnc) {
      const plaintext = decrypt(code.codeEnc);
      await notifyCodeDelivery(user, tier === "pro" ? "Pro Pass" : "Starter Pass", plaintext, order.id);
      // Plaintext stays retrievable on the success page until the buyer views it once.
    }
    return setOrderStatus(db, order, "fulfilled", { bundleCodeId: code.id });
  }

  if (order.type === "reseller_code") {
    const settingsTier = await db.select().from(schema.tiers).where(eq(schema.tiers.id, tier));
    const cost = settingsTier[0]?.resellerPricePaise ?? order.amountPaise;
    const code = await stockBundleCodeForReseller(db, tier, order.userId, order.id, cost);
    if (!code) {
      await setOrderStatus(db, order, "awaiting_inventory");
      await notifyAdmin("Reseller order awaiting inventory", `Order ${order.id} (${tier}) is paid but no bundle code is in stock.`);
      return { ...order, status: "awaiting_inventory" };
    }
    return setOrderStatus(db, order, "fulfilled", { bundleCodeId: code.id });
  }

  if (order.type === "pool_seat") {
    const meta = (order.metaJson ?? {}) as { poolId?: string; single?: boolean };
    const pools = await import("./pools.server");
    if (meta.single && meta.poolId) await pools.onSinglePoolPaid(db, meta.poolId);
    else await pools.onSeatPaid(db, order, payment);
    return setOrderStatus(db, order, "fulfilled");
  }

  return order;
}

async function setOrderStatus(db: Db, order: Order, status: string, meta?: Record<string, unknown>): Promise<Order> {
  const [updated] = await db
    .update(schema.orders)
    .set({ status, metaJson: { ...(order.metaJson ?? {}), ...(meta ?? {}) } })
    .where(eq(schema.orders.id, order.id))
    .returning();
  await audit({ actorId: order.userId, entity: "order", entityId: order.id, from: order.status, to: status, meta }, db);
  return updated;
}

/** Retry allocation for orders that were paid while inventory was empty (admin action / after generating codes). */
export async function retryAwaitingInventory(actorId?: string): Promise<number> {
  const db = await getDb();
  const waiting = await db.select().from(schema.orders).where(eq(schema.orders.status, "awaiting_inventory"));
  let n = 0;
  for (const order of waiting) {
    const [payment] = await db.select().from(schema.payments).where(eq(schema.payments.orderId, order.id));
    if (!payment) continue;
    const result = await fulfilOrder(db, order, payment);
    if (result.status === "fulfilled") n++;
  }
  if (n) await audit({ actorId, entity: "order", entityId: "batch", to: "fulfilled", meta: { retried: n } });
  return n;
}

/* ------------------------------------------------------------------
   One-time code reveal for the success page
   ------------------------------------------------------------------ */

export async function revealOrderCode(orderId: string, userId: string): Promise<{ code: string | null; last4: string | null; revealed: boolean }> {
  const db = await getDb();
  const [order] = await db.select().from(schema.orders).where(and(eq(schema.orders.id, orderId), eq(schema.orders.userId, userId)));
  const codeId = (order?.metaJson as { bundleCodeId?: string } | null)?.bundleCodeId;
  if (!order || !codeId) return { code: null, last4: null, revealed: false };
  const [code] = await db.select().from(schema.bundleCodes).where(eq(schema.bundleCodes.id, codeId));
  if (!code) return { code: null, last4: null, revealed: false };
  if (!code.codeEnc) return { code: null, last4: code.last4, revealed: true };
  const plaintext = decrypt(code.codeEnc);
  await markBundleCodeDelivered(db, code.id);
  await audit({ actorId: userId, entity: "bundle_code", entityId: code.id, to: "delivered" }, db);
  return { code: plaintext, last4: code.last4, revealed: false };
}

/* ------------------------------------------------------------------
   Refunds
   ------------------------------------------------------------------ */

export async function onRefundProcessed(gatewayPaymentId: string, refundId: string) {
  const db = await getDb();
  const [payment] = await db.select().from(schema.payments).where(eq(schema.payments.gatewayPaymentId, gatewayPaymentId));
  if (!payment || payment.status === "refunded") return;
  await db.update(schema.payments).set({ status: "refunded", refundId, refundedAt: new Date() }).where(eq(schema.payments.id, payment.id));
  await db.update(schema.orders).set({ status: "refunded" }).where(eq(schema.orders.id, payment.orderId));
  await audit({ entity: "payment", entityId: payment.id, from: "captured", to: "refunded", meta: { refundId } }, db);
}

/* ------------------------------------------------------------------
   Invoices (GST)
   ------------------------------------------------------------------ */

function financialYear(d = new Date()) {
  const y = d.getMonth() >= 3 ? d.getFullYear() : d.getFullYear() - 1;
  return `${String(y).slice(2)}${String(y + 1).slice(2)}`;
}

export async function createInvoice(db: Db, order: Order) {
  const [existing] = await db.select().from(schema.invoices).where(eq(schema.invoices.orderId, order.id));
  if (existing) return existing;

  const s = await getSettings();
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, order.userId));

  // Prices are GST-inclusive: back out the taxable value.
  const total = order.amountPaise;
  const taxable = Math.round((total * 100) / (100 + s.gstPct));
  const tax = total - taxable;
  const buyerState = user?.gstin?.slice(0, 2);
  const interState = !!buyerState && buyerState !== s.sellerStateCode;
  const half = Math.floor(tax / 2);

  const [seqRow] = await db
    .insert(schema.settings)
    .values({ key: "invoice_seq", value: "1" })
    .onConflictDoUpdate({ target: schema.settings.key, set: { value: sql`(${schema.settings.value}::int + 1)::text` } })
    .returning();
  const number = `${s.invoicePrefix}-${financialYear()}-${String(seqRow.value).padStart(6, "0")}`;

  const desc =
    order.type === "direct"
      ? `${order.tierId === "pro" ? "Pro Pass" : "Starter Pass"} — 1 year`
      : order.type === "pool_seat"
        ? `Pool seat — ${order.tierId === "pro" ? "Pro Pass" : "Starter Pass"}`
        : `Reseller code — ${order.tierId === "pro" ? "Pro Pass" : "Starter Pass"}`;

  const [inv] = await db
    .insert(schema.invoices)
    .values({
      id: uuid(),
      number,
      orderId: order.id,
      userId: order.userId,
      buyerName: user?.name ?? null,
      buyerGstin: user?.gstin ?? null,
      description: desc,
      taxablePaise: taxable,
      cgstPaise: interState ? 0 : half,
      sgstPaise: interState ? 0 : tax - half,
      igstPaise: interState ? tax : 0,
      totalPaise: total,
    })
    .returning();
  return inv;
}
