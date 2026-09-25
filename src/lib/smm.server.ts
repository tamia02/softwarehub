import "server-only";
import { and, desc, eq } from "drizzle-orm";
import { getDb, schema, type Db } from "@/db";
import type { SmmOrder } from "@/db/schema";
import { smmCatalog, type SmmService } from "@/data/smm";
import { moveWallet } from "./wallet.server";
import { uuid } from "./ids";

/** Flat service lookup from the static catalogue. */
const SERVICE_BY_ID = new Map<number, SmmService & { platform: string; category: string }>();
for (const c of smmCatalog) for (const s of c.services) SERVICE_BY_ID.set(s.id, { ...s, platform: c.platform, category: c.category });

export function smmServices() {
  return smmCatalog.flatMap((c) => c.services.map((s) => ({ service: s.id, name: s.name, category: `${c.platform} · ${c.category}`, rate: (s.ratePer1k).toFixed(2), min: s.min, max: s.max, refill: s.tags.includes("Refill"), cancel: true })));
}

export function findService(id: number) {
  return SERVICE_BY_ID.get(id) ?? null;
}

/** Charge in paise for a quantity of a service (rate is INR per 1,000). */
export function chargeFor(svc: SmmService, quantity: number): number {
  return Math.ceil((svc.ratePer1k * 100 * quantity) / 1000);
}

export type PlaceResult = { ok: true; orderId: string } | { ok: false; error: string };

/** Place an order: validate, charge the wallet, create it, dispatch to the (mock) provider. */
export async function placeSmmOrder(
  userId: string,
  serviceId: number,
  link: string,
  quantity: number,
  opts: { source?: "panel" | "api"; runs?: number; interval?: number } = {},
): Promise<PlaceResult> {
  const svc = findService(serviceId);
  if (!svc) return { ok: false, error: "Invalid service ID." };
  if (!/^https?:\/\/.+/i.test(link)) return { ok: false, error: "Provide a valid link (http/https)." };
  if (!Number.isInteger(quantity) || quantity < svc.min || quantity > svc.max) {
    return { ok: false, error: `Quantity must be between ${svc.min} and ${svc.max}.` };
  }
  const charge = chargeFor(svc, quantity);
  const db = await getDb();
  const bal = await moveWallet(db, userId, -charge, "order", undefined, `${svc.name} x${quantity}`);
  if (bal === null) return { ok: false, error: "Insufficient wallet balance. Add funds first." };

  const id = uuid();
  await db.insert(schema.smmOrders).values({
    id, userId, serviceId, serviceName: svc.name, link, quantity,
    chargePaise: charge, startCount: 0, remains: quantity, status: "pending",
    source: opts.source ?? "panel", dripRuns: opts.runs ?? null, dripIntervalMin: opts.interval ?? null,
    startedAt: new Date(),
  });
  // reference the order on the ledger row we just wrote
  return { ok: true, orderId: id };
}

/** Mock provider: advance an order's progress based on elapsed time. Orders
 *  finish over ~2 minutes so the demo shows movement. Persists changes. */
async function advance(db: Db, o: SmmOrder): Promise<SmmOrder> {
  if (o.status === "completed" || o.status === "canceled" || o.status === "refunded") return o;
  const started = (o.startedAt ?? o.createdAt).getTime();
  const elapsed = Date.now() - started;
  const DURATION = 120_000; // 2 minutes to complete
  const progress = Math.max(0, Math.min(1, elapsed / DURATION));
  const delivered = Math.floor(o.quantity * progress);
  const remains = o.quantity - delivered;
  let status = o.status;
  if (progress <= 0.02) status = "pending";
  else if (progress >= 1) status = "completed";
  else status = "in_progress";
  if (status === o.status && remains === o.remains) return o;
  const patch: Partial<SmmOrder> = { status, remains };
  if (status === "completed") patch.completedAt = new Date();
  const [updated] = await db.update(schema.smmOrders).set(patch).where(eq(schema.smmOrders.id, o.id)).returning();
  return updated ?? o;
}

export async function smmOrderStatus(userId: string, orderId: string): Promise<SmmOrder | null> {
  const db = await getDb();
  const [o] = await db.select().from(schema.smmOrders).where(and(eq(schema.smmOrders.id, orderId), eq(schema.smmOrders.userId, userId)));
  if (!o) return null;
  return advance(db, o);
}

export async function listSmmOrders(userId: string, limit = 50): Promise<SmmOrder[]> {
  const db = await getDb();
  const rows = await db.select().from(schema.smmOrders).where(eq(schema.smmOrders.userId, userId)).orderBy(desc(schema.smmOrders.createdAt)).limit(limit);
  return Promise.all(rows.map((o) => advance(db, o)));
}

/** Cancel a not-yet-completed order and refund the charge to the wallet. */
export async function cancelSmmOrder(userId: string, orderId: string): Promise<{ ok: boolean; error?: string }> {
  const db = await getDb();
  const [o] = await db.select().from(schema.smmOrders).where(and(eq(schema.smmOrders.id, orderId), eq(schema.smmOrders.userId, userId)));
  if (!o) return { ok: false, error: "Order not found." };
  const current = await advance(db, o);
  if (current.status === "completed") return { ok: false, error: "Order already completed." };
  if (current.status === "canceled" || current.status === "refunded") return { ok: true };
  await moveWallet(db, userId, current.chargePaise, "refund", orderId, "Order canceled");
  await db.update(schema.smmOrders).set({ status: "canceled", remains: 0 }).where(eq(schema.smmOrders.id, orderId));
  return { ok: true };
}

/** Request a refill (demo: re-tops a completed order back to full delivery). */
export async function refillSmmOrder(userId: string, orderId: string): Promise<{ ok: boolean; error?: string }> {
  const db = await getDb();
  const [o] = await db.select().from(schema.smmOrders).where(and(eq(schema.smmOrders.id, orderId), eq(schema.smmOrders.userId, userId)));
  if (!o) return { ok: false, error: "Order not found." };
  const svc = findService(o.serviceId);
  if (!svc?.tags.includes("Refill")) return { ok: false, error: "This service has no refill." };
  await db.update(schema.smmOrders).set({ status: "in_progress", remains: o.quantity, startedAt: new Date(), completedAt: null }).where(eq(schema.smmOrders.id, orderId));
  return { ok: true };
}
