import "server-only";
import { and, desc, eq, gte, inArray, sql } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { User } from "@/db/schema";
import { audit } from "./audit.server";
import { notifyPayout } from "./notify.server";
import { retryAwaitingInventory } from "./orders.server";
import { setSetting, type RuntimeSettings } from "./settings.server";
import { bust } from "./cache.server";

export async function adminOverview() {
  const db = await getDb();
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [orders, pools, codes, payouts, users, claims] = await Promise.all([
    db.select().from(schema.orders).where(gte(schema.orders.createdAt, monthStart)),
    db.select().from(schema.pools),
    db.select({ tierId: schema.bundleCodes.tierId, status: schema.bundleCodes.status, owner: schema.bundleCodes.ownerResellerId, n: sql<number>`count(*)::int` }).from(schema.bundleCodes).groupBy(schema.bundleCodes.tierId, schema.bundleCodes.status, schema.bundleCodes.ownerResellerId),
    db.select().from(schema.payouts).where(eq(schema.payouts.status, "requested")),
    db.select({ n: sql<number>`count(*)::int` }).from(schema.users),
    db.select({ n: sql<number>`count(*)::int` }).from(schema.toolClaims).where(eq(schema.toolClaims.status, "issue")),
  ]);

  const paid = orders.filter((o) => o.status === "paid" || o.status === "fulfilled");
  const inventory = { starter: 0, pro: 0 };
  for (const c of codes) if (c.status === "unassigned" && !c.owner) inventory[c.tierId as "starter" | "pro"] += c.n;

  return {
    revenueMonthPaise: paid.reduce((s, o) => s + o.amountPaise, 0),
    ordersMonth: paid.length,
    awaitingInventory: orders.filter((o) => o.status === "awaiting_inventory").length,
    openPools: pools.filter((p) => p.status === "open").length,
    fulfilledPools: pools.filter((p) => p.status === "fulfilled").length,
    inventory,
    pendingPayouts: payouts.length,
    pendingPayoutPaise: payouts.reduce((s, p) => s + p.amountPaise, 0),
    users: users[0]?.n ?? 0,
    openIssues: claims[0]?.n ?? 0,
  };
}

export async function listOrders(limit = 100) {
  const db = await getDb();
  const rows = await db.select({ order: schema.orders, user: schema.users }).from(schema.orders).innerJoin(schema.users, eq(schema.users.id, schema.orders.userId)).orderBy(desc(schema.orders.createdAt)).limit(limit);
  return rows;
}

export async function listBundleCodes(limit = 200) {
  const db = await getDb();
  return db.select().from(schema.bundleCodes).orderBy(desc(schema.bundleCodes.createdAt)).limit(limit);
}

export async function listGateCodes() {
  const db = await getDb();
  return db.select().from(schema.gateCodes).orderBy(desc(schema.gateCodes.createdAt));
}

export async function voidBundleCode(actor: User, id: string) {
  const db = await getDb();
  const [c] = await db.select().from(schema.bundleCodes).where(eq(schema.bundleCodes.id, id));
  if (!c || c.status === "redeemed") return false;
  await db.update(schema.bundleCodes).set({ status: "void", codeEnc: null }).where(eq(schema.bundleCodes.id, id));
  await audit({ actorId: actor.id, entity: "bundle_code", entityId: id, from: c.status, to: "void" }, db);
  return true;
}

export async function setGateCodeStatus(actor: User, id: string, status: "active" | "void") {
  const db = await getDb();
  const [c] = await db.select().from(schema.gateCodes).where(eq(schema.gateCodes.id, id));
  if (!c) return;
  await db.update(schema.gateCodes).set({ status, failedAttempts: status === "active" ? 0 : c.failedAttempts }).where(eq(schema.gateCodes.id, id));
  await audit({ actorId: actor.id, entity: "gate_code", entityId: id, from: c.status, to: status }, db);
}

export async function listTools() {
  const db = await getDb();
  return db.select().from(schema.tools).orderBy(schema.tools.sort);
}

export async function updateTool(actor: User, id: string, data: Partial<{ active: boolean; valueUsd: number; badge: string | null; offerTitle: string; blurb: string; tierMin: string }>) {
  const db = await getDb();
  await db.update(schema.tools).set(data).where(eq(schema.tools.id, id));
  await audit({ actorId: actor.id, entity: "tool", entityId: id, to: "updated", meta: data }, db);
  bust("catalog");
}

export async function listVendors() {
  const db = await getDb();
  return db.select().from(schema.vendors).orderBy(schema.vendors.name);
}

export async function updateVendor(actor: User, id: string, data: Partial<{ claimUrlTemplate: string | null; couponMode: string; contractRef: string | null; eligibilityNote: string | null }>) {
  const db = await getDb();
  await db.update(schema.vendors).set(data).where(eq(schema.vendors.id, id));
  await audit({ actorId: actor.id, entity: "vendor", entityId: id, to: "updated", meta: data }, db);
}

export async function listPayouts() {
  const db = await getDb();
  return db
    .select({ payout: schema.payouts, user: schema.users, reseller: schema.resellers })
    .from(schema.payouts)
    .innerJoin(schema.users, eq(schema.users.id, schema.payouts.resellerId))
    .innerJoin(schema.resellers, eq(schema.resellers.userId, schema.payouts.resellerId))
    .orderBy(desc(schema.payouts.requestedAt));
}

export async function setPayoutStatus(actor: User, id: string, status: "approved" | "paid" | "rejected", note?: string) {
  const db = await getDb();
  const [p] = await db.select().from(schema.payouts).where(eq(schema.payouts.id, id));
  if (!p) return;
  await db.update(schema.payouts).set({ status, note: note ?? p.note, paidAt: status === "paid" ? new Date() : p.paidAt }).where(eq(schema.payouts.id, id));
  await audit({ actorId: actor.id, entity: "payout", entityId: id, from: p.status, to: status }, db);
  const [u] = await db.select().from(schema.users).where(eq(schema.users.id, p.resellerId));
  if (u) await notifyPayout(u, p.amountPaise, status);
}

export async function listResellers() {
  const db = await getDb();
  return db.select({ reseller: schema.resellers, user: schema.users }).from(schema.resellers).innerJoin(schema.users, eq(schema.users.id, schema.resellers.userId));
}

export async function setKycStatus(actor: User, userId: string, status: "verified" | "rejected" | "pending") {
  const db = await getDb();
  await db.update(schema.resellers).set({ kycStatus: status }).where(eq(schema.resellers.userId, userId));
  await audit({ actorId: actor.id, entity: "reseller", entityId: userId, to: `kyc:${status}` }, db);
}

export async function updateSettings(actor: User, values: Partial<Record<keyof RuntimeSettings, string | number>>, tiers?: { starter?: number; pro?: number; starterReseller?: number; proReseller?: number }) {
  const db = await getDb();
  for (const [k, v] of Object.entries(values)) {
    if (v === undefined || v === "") continue;
    await setSetting(k as keyof RuntimeSettings, v);
  }
  if (tiers) {
    if (tiers.starter) await db.update(schema.tiers).set({ pricePaise: tiers.starter }).where(eq(schema.tiers.id, "starter"));
    if (tiers.pro) await db.update(schema.tiers).set({ pricePaise: tiers.pro }).where(eq(schema.tiers.id, "pro"));
    if (tiers.starterReseller) await db.update(schema.tiers).set({ resellerPricePaise: tiers.starterReseller }).where(eq(schema.tiers.id, "starter"));
    if (tiers.proReseller) await db.update(schema.tiers).set({ resellerPricePaise: tiers.proReseller }).where(eq(schema.tiers.id, "pro"));
  }
  await audit({ actorId: actor.id, entity: "settings", entityId: "global", to: "updated", meta: { ...values, tiers } }, db);
  bust("catalog");
}

export async function listAudit(limit = 200) {
  const db = await getDb();
  return db.select().from(schema.auditLog).orderBy(desc(schema.auditLog.at)).limit(limit);
}

export async function listIssues() {
  const db = await getDb();
  return db
    .select({ claim: schema.toolClaims, tool: schema.tools, pass: schema.passes, user: schema.users })
    .from(schema.toolClaims)
    .innerJoin(schema.tools, eq(schema.tools.id, schema.toolClaims.toolId))
    .innerJoin(schema.passes, eq(schema.passes.id, schema.toolClaims.passId))
    .innerJoin(schema.users, eq(schema.users.id, schema.passes.userId))
    .where(eq(schema.toolClaims.status, "issue"));
}

export async function resolveIssue(actor: User, claimId: string, action: "replace" | "dismiss") {
  const db = await getDb();
  await db.update(schema.toolClaims).set({ status: "available", vendorRef: null, claimedAt: null, issueNote: null }).where(eq(schema.toolClaims.id, claimId));
  await audit({ actorId: actor.id, entity: "tool_claim", entityId: claimId, from: "issue", to: action === "replace" ? "available (replaced)" : "available" }, db);
}

export async function listAllPools() {
  const db = await getDb();
  const rows = await db.select().from(schema.pools).orderBy(desc(schema.pools.createdAt));
  if (!rows.length) return [];
  const members = await db.select().from(schema.poolMembers).where(inArray(schema.poolMembers.poolId, rows.map((r) => r.id)));
  return rows.map((p) => ({ ...p, filled: members.filter((m) => m.poolId === p.id && (m.paidAt || p.paymentModel === "single")).length }));
}

export async function retryInventory(actor: User) {
  return retryAwaitingInventory(actor.id);
}

export async function tierRows() {
  const db = await getDb();
  return db.select().from(schema.tiers);
}

export { and };
