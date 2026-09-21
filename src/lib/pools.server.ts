import "server-only";
import { and, asc, eq, inArray, isNotNull, isNull, lt } from "drizzle-orm";
import { getDb, schema, type Db } from "@/db";
import type { TierSlug } from "@/data/tiers";
import type { Order, Payment, Pool, PoolMember, User } from "@/db/schema";
import { audit } from "./audit.server";
import { allocateBundleCode } from "./codes.server";
import { shortId, uuid } from "./ids";
import { notifyPoolEvent } from "./notify.server";
import { createOrder } from "./orders.server";
import { refundPayment } from "./payments.server";
import { getSettings } from "./settings.server";
import { computeSplit, splitTies, type SplitMode, type SplitResult } from "./split";
import { bust, memo } from "./cache.server";
import { revalidatePath } from "next/cache";

export type PoolStatus = "draft" | "open" | "filled" | "paid" | "fulfilled" | "expired";
export type DistributionMode = "shared" | "assigned";
export type PaymentModel = "escrow" | "single";

const RESERVATION_TTL_MS = 30 * 60 * 1000;

function revalidateHome() {
  try {
    revalidatePath("/home");
  } catch {
    /* outside a request scope (tests, scripts) */
  }
}

/* ------------------------------------------------------------------
   Create
   ------------------------------------------------------------------ */

export async function createPool(opts: {
  user: User;
  tier: TierSlug;
  seats: number;
  name?: string;
  distributionMode?: DistributionMode;
  paymentModel?: PaymentModel;
  splitMode?: SplitMode;
  splitJson?: Record<string, number>;
  asReseller?: boolean;
}): Promise<Pool> {
  const db = await getDb();
  const s = await getSettings();
  const seats = Math.min(s.poolSeatsMax, Math.max(s.poolSeatsMin, Math.round(opts.seats)));
  const [tier] = await db.select().from(schema.tiers).where(eq(schema.tiers.id, opts.tier));
  if (!tier || !tier.active) throw new Error("Unknown tier");

  const isReseller = !!opts.asReseller && (opts.user.role === "reseller" || opts.user.role === "admin");
  const paymentModel: PaymentModel = isReseller && opts.paymentModel === "single" ? "single" : "escrow";

  const [pool] = await db
    .insert(schema.pools)
    .values({
      id: shortId(),
      tierId: opts.tier,
      name: opts.name?.trim() || null,
      creatorUserId: opts.user.id,
      resellerId: isReseller ? opts.user.id : null,
      seats,
      seatPricePaise: Math.ceil(tier.pricePaise / seats),
      status: "open",
      paymentModel,
      distributionMode: opts.distributionMode ?? "shared",
      splitMode: isReseller ? (opts.splitMode ?? "reseller_keeps") : "share_equal",
      splitJson: opts.splitJson ?? null,
      expiresAt: new Date(Date.now() + s.poolExpiryDays * 86_400_000),
    })
    .returning();
  await audit({ actorId: opts.user.id, entity: "pool", entityId: pool.id, to: "open", meta: { seats, paymentModel } }, db);
  bust("pools:");
  revalidateHome();
  return pool;
}

/* ------------------------------------------------------------------
   Read
   ------------------------------------------------------------------ */

export async function getPool(id: string) {
  const db = await getDb();
  const [pool] = await db.select().from(schema.pools).where(eq(schema.pools.id, id));
  if (!pool) return null;
  const members = await db
    .select({
      id: schema.poolMembers.id,
      userId: schema.poolMembers.userId,
      seatNo: schema.poolMembers.seatNo,
      paidAt: schema.poolMembers.paidAt,
      refundedAt: schema.poolMembers.refundedAt,
      joinedAt: schema.poolMembers.joinedAt,
      orderId: schema.poolMembers.orderId,
      paymentId: schema.poolMembers.paymentId,
      passId: schema.poolMembers.passId,
      name: schema.users.name,
      phone: schema.users.phone,
      email: schema.users.email,
    })
    .from(schema.poolMembers)
    .innerJoin(schema.users, eq(schema.users.id, schema.poolMembers.userId))
    .where(eq(schema.poolMembers.poolId, id))
    .orderBy(asc(schema.poolMembers.seatNo));
  const [tier] = await db.select().from(schema.tiers).where(eq(schema.tiers.id, pool.tierId));
  const paid = members.filter((m) => m.paidAt || pool.paymentModel === "single").length;
  return { pool, members, tier, paidSeats: paid, seatsLeft: pool.seats - members.length };
}

export type PoolDetail = NonNullable<Awaited<ReturnType<typeof getPool>>>;

/** Open pools for the public carousel — cached 15 s, busted on every pool state change. */
export function listOpenPools(limit = 8) {
  return memo(`pools:open:${limit}`, 15_000, () => loadOpenPools(limit).catch(() => [] as Array<Pool & { filled: number }>));
}

async function loadOpenPools(limit: number) {
  {
    const db = await getDb();
    const rows = await db.select().from(schema.pools).where(eq(schema.pools.status, "open")).orderBy(asc(schema.pools.expiresAt)).limit(limit);
    if (!rows.length) return [] as Array<Pool & { filled: number }>;
    const members = await db
      .select({ poolId: schema.poolMembers.poolId, paidAt: schema.poolMembers.paidAt })
      .from(schema.poolMembers)
      .where(inArray(schema.poolMembers.poolId, rows.map((r) => r.id)));
    return rows.map((p) => ({ ...p, filled: members.filter((m) => m.poolId === p.id && (m.paidAt || p.paymentModel === "single")).length }));
  }
}

/* ------------------------------------------------------------------
   Join
   ------------------------------------------------------------------ */

export async function joinPool(poolId: string, user: User) {
  const db = await getDb();
  const detail = await getPool(poolId);
  if (!detail) throw new Error("Pool not found");
  const { pool } = detail;
  if (pool.status !== "open") throw new Error("This pool is no longer open.");
  if (pool.expiresAt < new Date()) throw new Error("This pool has expired.");

  // Release stale unpaid reservations.
  await db
    .delete(schema.poolMembers)
    .where(and(eq(schema.poolMembers.poolId, poolId), isNull(schema.poolMembers.paidAt), lt(schema.poolMembers.joinedAt, new Date(Date.now() - RESERVATION_TTL_MS))));

  const members = await db.select().from(schema.poolMembers).where(eq(schema.poolMembers.poolId, poolId));
  const mine = members.find((m) => m.userId === user.id);
  if (mine?.paidAt) throw new Error("You already have a seat in this pool.");
  if (!mine && members.length >= pool.seats) throw new Error("This pool is full.");

  const taken = new Set(members.map((m) => m.seatNo));
  let seatNo = mine?.seatNo ?? 1;
  if (!mine) while (taken.has(seatNo)) seatNo++;

  // Single-payer pools: members reserve without paying; the payer settles off-platform.
  if (pool.paymentModel === "single") {
    if (!mine) {
      await db.insert(schema.poolMembers).values({ id: uuid(), poolId, userId: user.id, seatNo });
      await audit({ actorId: user.id, entity: "pool_member", entityId: poolId, to: `seat:${seatNo}` }, db);
      await notifyPoolEvent(user, "joined", pool);
      await maybeFillPool(db, pool.id);
    }
    return { order: null, gateway: null, seatNo };
  }

  const { order, gateway } = await createOrder({
    user,
    type: "pool_seat",
    tier: pool.tierId as TierSlug,
    amountPaise: pool.seatPricePaise,
    idempotencyKey: `pool:${poolId}:${user.id}`,
    meta: { poolId, seatNo },
  });
  if (mine) {
    await db.update(schema.poolMembers).set({ orderId: order.id }).where(eq(schema.poolMembers.id, mine.id));
  } else {
    await db.insert(schema.poolMembers).values({ id: uuid(), poolId, userId: user.id, seatNo, orderId: order.id });
  }
  return { order, gateway, seatNo };
}

/** Called by the order state machine once a seat payment is captured. */
export async function onSeatPaid(db: Db, order: Order, payment: Payment) {
  const poolId = (order.metaJson as { poolId?: string } | null)?.poolId;
  if (!poolId) throw new Error(`pool_seat order ${order.id} has no poolId`);
  const [member] = await db.select().from(schema.poolMembers).where(and(eq(schema.poolMembers.poolId, poolId), eq(schema.poolMembers.userId, order.userId)));
  if (member) {
    await db.update(schema.poolMembers).set({ paidAt: new Date(), paymentId: payment.gatewayPaymentId, orderId: order.id }).where(eq(schema.poolMembers.id, member.id));
  } else {
    // Reservation expired while paying — re-seat them.
    const taken = new Set((await db.select({ s: schema.poolMembers.seatNo }).from(schema.poolMembers).where(eq(schema.poolMembers.poolId, poolId))).map((r) => r.s));
    let seatNo = 1;
    while (taken.has(seatNo)) seatNo++;
    await db.insert(schema.poolMembers).values({ id: uuid(), poolId, userId: order.userId, seatNo, orderId: order.id, paymentId: payment.gatewayPaymentId, paidAt: new Date() });
  }
  await audit({ actorId: order.userId, entity: "pool_member", entityId: poolId, to: "paid", meta: { orderId: order.id } }, db);
  bust("pools:");
  revalidateHome();
  const [user] = await db.select().from(schema.users).where(eq(schema.users.id, order.userId));
  const [pool] = await db.select().from(schema.pools).where(eq(schema.pools.id, poolId));
  if (user && pool) await notifyPoolEvent(user, "joined", pool);
  await maybeFillPool(db, poolId);
}

/** Single-payer pools: the payer settles the whole bundle in one order. */
export async function paySinglePool(poolId: string, user: User) {
  const detail = await getPool(poolId);
  if (!detail) throw new Error("Pool not found");
  const { pool } = detail;
  if (pool.paymentModel !== "single") throw new Error("Not a single-payer pool");
  if (pool.creatorUserId !== user.id && user.role !== "admin") throw new Error("Only the pool creator can pay");
  return createOrder({
    user,
    type: "pool_seat",
    tier: pool.tierId as TierSlug,
    amountPaise: pool.seatPricePaise * pool.seats,
    idempotencyKey: `pool-single:${poolId}`,
    meta: { poolId, single: true },
  });
}

async function maybeFillPool(db: Db, poolId: string) {
  const [pool] = await db.select().from(schema.pools).where(eq(schema.pools.id, poolId));
  if (!pool || pool.status !== "open") return;
  const members = await db.select().from(schema.poolMembers).where(eq(schema.poolMembers.poolId, poolId));
  const paid = members.filter((m) => m.paidAt || pool.paymentModel === "single").length;
  if (paid < pool.seats) return;

  const now = new Date();
  await db.update(schema.pools).set({ status: "filled", filledAt: now }).where(eq(schema.pools.id, poolId));
  await audit({ entity: "pool", entityId: poolId, from: "open", to: "filled" }, db);
  bust("pools:");
  revalidateHome();
  for (const m of members) {
    const [u] = await db.select().from(schema.users).where(eq(schema.users.id, m.userId));
    if (u) await notifyPoolEvent(u, "filled", pool);
  }

  if (pool.paymentModel === "escrow") {
    // Escrow: every seat is already captured, so the pool is paid and can fulfil immediately.
    await db.update(schema.pools).set({ status: "paid", paidAt: now }).where(eq(schema.pools.id, poolId));
    await audit({ entity: "pool", entityId: poolId, from: "filled", to: "paid" }, db);
    await fulfilPool(poolId, null);
  } else if (pool.paidAt) {
    await fulfilPool(poolId, null);
  }
}

/** Single-payer: the whole-bundle order was captured. */
export async function onSinglePoolPaid(db: Db, poolId: string) {
  const [pool] = await db.select().from(schema.pools).where(eq(schema.pools.id, poolId));
  if (!pool) return;
  const now = new Date();
  const next = pool.status === "filled" ? "paid" : pool.status;
  await db.update(schema.pools).set({ paidAt: now, status: next }).where(eq(schema.pools.id, poolId));
  await audit({ entity: "pool", entityId: poolId, from: pool.status, to: `${next} (paid)` }, db);
  if (pool.status === "filled") await fulfilPool(poolId, null);
}

/* ------------------------------------------------------------------
   Fulfil
   ------------------------------------------------------------------ */

export async function fulfilPool(poolId: string, actorId: string | null): Promise<{ ok: boolean; error?: string }> {
  const db = await getDb();
  const detail = await getPool(poolId);
  if (!detail) return { ok: false, error: "Pool not found" };
  const { pool, members, tier } = detail;
  if (pool.status === "fulfilled") return { ok: true };
  if (pool.status !== "paid" && !(pool.status === "filled" && pool.paymentModel === "single" && pool.paidAt)) {
    return { ok: false, error: `Pool is ${pool.status}; it must be paid before fulfilment.` };
  }
  const eligible = members.filter((m) => m.paidAt || pool.paymentModel === "single");
  if (eligible.length === 0) return { ok: false, error: "No members to fulfil." };

  const code = await allocateBundleCode(db, pool.tierId as TierSlug, { poolId, ownerResellerId: pool.resellerId });
  if (!code) return { ok: false, error: "No bundle code in inventory for this tier. Generate or buy codes first." };
  await db.update(schema.bundleCodes).set({ status: "redeemed", redeemedAt: new Date(), codeEnc: null }).where(eq(schema.bundleCodes.id, code.id));

  const toolRows = await db.select().from(schema.tools).where(eq(schema.tools.active, true));
  const tierTools = toolRows.filter((t) => pool.tierId === "pro" || t.tierMin === "starter");
  const expiresAt = new Date(Date.now() + 365 * 86_400_000);

  for (const m of eligible) {
    const passId = uuid();
    await db.insert(schema.passes).values({ id: passId, userId: m.userId, tierId: pool.tierId, bundleCodeId: code.id, poolId, expiresAt });
    const assigned = pool.distributionMode === "assigned" ? new Set(pool.assignmentJson?.[m.userId] ?? []) : null;
    const claimTools = assigned ? tierTools.filter((t) => assigned.has(t.id)) : tierTools;
    if (claimTools.length) {
      await db.insert(schema.toolClaims).values(claimTools.map((t) => ({ id: uuid(), passId, toolId: t.id, status: "available" })));
    }
    await db.update(schema.poolMembers).set({ passId }).where(eq(schema.poolMembers.id, m.id));
  }

  // Revenue split — only reseller pools have a margin to distribute.
  let settlement: SplitResult | { mode: "platform"; grossPaise: number } | null = null;
  if (pool.resellerId) {
    const s = await getSettings();
    const resellerCost = code.ownerResellerId === pool.resellerId && code.costPaise > 0 ? code.costPaise : tier.resellerPricePaise;
    settlement = computeSplit({
      members: eligible.map((m) => ({ userId: m.userId, paidPaise: pool.seatPricePaise })),
      resellerCostPaise: resellerCost,
      feePct: s.platformFeePct,
      mode: pool.splitMode as SplitMode,
      customPct: pool.splitJson ?? undefined,
    });
    if (!splitTies(settlement)) throw new Error("Settlement does not tie");
    // Member credits are paid back as partial refunds on their seat payment (escrow pools).
    if (pool.paymentModel === "escrow") {
      for (const share of settlement.memberShares) {
        if (share.sharePaise <= 0) continue;
        const m = eligible.find((x) => x.userId === share.userId);
        if (!m?.paymentId) continue;
        try {
          await refundPayment(m.paymentId, share.sharePaise, { reason: "pool_margin_share", poolId });
        } catch (err) {
          console.error("[pool] member share refund failed", poolId, share.userId, err);
        }
      }
    }
  } else {
    settlement = { mode: "platform", grossPaise: pool.seatPricePaise * eligible.length };
  }

  await db
    .update(schema.pools)
    .set({ status: "fulfilled", fulfilledAt: new Date(), bundleCodeId: code.id, settlementJson: settlement })
    .where(eq(schema.pools.id, poolId));
  await audit({ actorId, entity: "pool", entityId: poolId, from: pool.status, to: "fulfilled", meta: { bundleCodeId: code.id, members: eligible.length } }, db);

  for (const m of eligible) {
    const [u] = await db.select().from(schema.users).where(eq(schema.users.id, m.userId));
    if (u) await notifyPoolEvent(u, "fulfilled", pool);
  }
  return { ok: true };
}

/* ------------------------------------------------------------------
   Expiry + refunds (cron)
   ------------------------------------------------------------------ */

export async function expirePools(now = new Date()): Promise<{ expired: number; refunded: number }> {
  const db = await getDb();
  const due = await db.select().from(schema.pools).where(and(eq(schema.pools.status, "open"), lt(schema.pools.expiresAt, now)));
  let refunded = 0;
  for (const pool of due) {
    await db.update(schema.pools).set({ status: "expired", expiredAt: now }).where(eq(schema.pools.id, pool.id));
    await audit({ entity: "pool", entityId: pool.id, from: "open", to: "expired" }, db);
    bust("pools:");
    revalidateHome();
  revalidateHome();
    const members = await db.select().from(schema.poolMembers).where(and(eq(schema.poolMembers.poolId, pool.id), isNotNull(schema.poolMembers.paidAt)));
    for (const m of members) {
      if (m.paymentId && !m.refundedAt) {
        try {
          const r = await refundPayment(m.paymentId, pool.seatPricePaise, { reason: "pool_expired", poolId: pool.id });
          await db.update(schema.poolMembers).set({ refundedAt: now }).where(eq(schema.poolMembers.id, m.id));
          await db.update(schema.payments).set({ status: "refunded", refundId: r.refundId, refundedAt: now }).where(eq(schema.payments.gatewayPaymentId, m.paymentId));
          if (m.orderId) await db.update(schema.orders).set({ status: "refunded" }).where(eq(schema.orders.id, m.orderId));
          refunded++;
        } catch (err) {
          console.error("[pool] refund failed", pool.id, m.userId, err);
        }
      }
      const [u] = await db.select().from(schema.users).where(eq(schema.users.id, m.userId));
      if (u) await notifyPoolEvent(u, "expired", pool);
    }
  }
  return { expired: due.length, refunded };
}

/* ------------------------------------------------------------------
   Reseller helpers
   ------------------------------------------------------------------ */

export async function setPoolAssignment(poolId: string, actor: User, assignment: Record<string, string[]>) {
  const db = await getDb();
  const [pool] = await db.select().from(schema.pools).where(eq(schema.pools.id, poolId));
  if (!pool) throw new Error("Pool not found");
  if (pool.resellerId !== actor.id && pool.creatorUserId !== actor.id && actor.role !== "admin") throw new Error("Not allowed");
  if (pool.status === "fulfilled") throw new Error("Pool already fulfilled");
  await db.update(schema.pools).set({ distributionMode: "assigned", assignmentJson: assignment }).where(eq(schema.pools.id, poolId));
  await audit({ actorId: actor.id, entity: "pool", entityId: poolId, to: "assignment_updated" }, db);
}

export async function listPoolsForReseller(resellerId: string) {
  const db = await getDb();
  const rows = await db.select().from(schema.pools).where(eq(schema.pools.resellerId, resellerId)).orderBy(asc(schema.pools.status), asc(schema.pools.expiresAt));
  if (!rows.length) return [];
  const members = await db.select().from(schema.poolMembers).where(inArray(schema.poolMembers.poolId, rows.map((r) => r.id)));
  return rows.map((p) => ({
    ...p,
    filled: members.filter((m) => m.poolId === p.id && (m.paidAt || p.paymentModel === "single")).length,
    joined: members.filter((m) => m.poolId === p.id).length,
  }));
}

export type PoolMemberRow = PoolMember;
