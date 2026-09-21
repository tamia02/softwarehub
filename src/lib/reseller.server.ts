import "server-only";
import { and, desc, eq, gte, inArray, or } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { TierSlug } from "@/data/tiers";
import type { User } from "@/db/schema";
import { audit } from "./audit.server";
import { decrypt } from "./crypto.server";
import { uuid } from "./ids";
import { notifyCodeDelivery, notifyPayout } from "./notify.server";
import { createOrder } from "./orders.server";
import { normalizeIdentifier } from "./auth.server";
import type { SplitResult } from "./split";

/* ------------------------------------------------------------------
   Overview
   ------------------------------------------------------------------ */

export async function resellerOverview(resellerId: string) {
  const db = await getDb();
  const pools = await db.select().from(schema.pools).where(eq(schema.pools.resellerId, resellerId));
  const poolIds = pools.map((p) => p.id);
  const members = poolIds.length ? await db.select().from(schema.poolMembers).where(inArray(schema.poolMembers.poolId, poolIds)) : [];
  const codes = await db.select().from(schema.bundleCodes).where(eq(schema.bundleCodes.ownerResellerId, resellerId));
  const revenue = await resellerRevenue(resellerId);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const revenueThisMonth = revenue.statements.filter((s) => s.fulfilledAt && s.fulfilledAt >= monthStart).reduce((s, x) => s + x.resellerSharePaise, 0);

  // Revenue by week over the last 12 weeks for the chart.
  const weeks: Array<{ label: string; revenuePaise: number; pools: number }> = [];
  for (let i = 11; i >= 0; i--) {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay() - i * 7);
    const end = new Date(start.getTime() + 7 * 86_400_000);
    const inWeek = revenue.statements.filter((s) => s.fulfilledAt && s.fulfilledAt >= start && s.fulfilledAt < end);
    weeks.push({
      label: start.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      revenuePaise: inWeek.reduce((s, x) => s + x.resellerSharePaise, 0),
      pools: inWeek.length,
    });
  }

  return {
    activePools: pools.filter((p) => p.status === "open" || p.status === "filled" || p.status === "paid").length,
    totalPools: pools.length,
    members: new Set(members.filter((m) => m.paidAt).map((m) => m.userId)).size,
    codesInInventory: codes.filter((c) => c.status === "unassigned").length,
    revenueThisMonthPaise: revenueThisMonth,
    pendingPayoutPaise: revenue.pendingPayoutPaise,
    availablePaise: revenue.availablePaise,
    weeks,
    latestPools: pools
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 6)
      .map((p) => ({ ...p, filled: members.filter((m) => m.poolId === p.id && (m.paidAt || p.paymentModel === "single")).length })),
  };
}

/* ------------------------------------------------------------------
   Revenue + payouts
   ------------------------------------------------------------------ */

export async function resellerRevenue(resellerId: string) {
  const db = await getDb();
  const pools = await db.select().from(schema.pools).where(and(eq(schema.pools.resellerId, resellerId), eq(schema.pools.status, "fulfilled")));
  const statements = pools
    .filter((p) => p.settlementJson && (p.settlementJson as SplitResult).mode !== undefined)
    .map((p) => {
      const s = p.settlementJson as SplitResult;
      return {
        poolId: p.id,
        poolName: p.name,
        tierId: p.tierId,
        fulfilledAt: p.fulfilledAt,
        grossPaise: s.grossPaise,
        platformFeePaise: s.platformFeePaise,
        resellerCostPaise: s.resellerCostPaise,
        marginPaise: s.marginPaise,
        resellerSharePaise: s.resellerSharePaise,
        memberSharesPaise: s.memberShares.reduce((a, m) => a + m.sharePaise, 0),
        mode: s.mode,
      };
    });
  const earnedPaise = statements.reduce((s, x) => s + x.resellerSharePaise, 0);
  const payoutRows = await db.select().from(schema.payouts).where(eq(schema.payouts.resellerId, resellerId)).orderBy(desc(schema.payouts.requestedAt));
  const pendingPayoutPaise = payoutRows.filter((p) => p.status === "requested" || p.status === "approved").reduce((s, p) => s + p.amountPaise, 0);
  const paidOutPaise = payoutRows.filter((p) => p.status === "paid").reduce((s, p) => s + p.amountPaise, 0);
  return { statements, earnedPaise, pendingPayoutPaise, paidOutPaise, availablePaise: earnedPaise - pendingPayoutPaise - paidOutPaise, payouts: payoutRows };
}

export async function requestPayout(user: User, amountPaise: number) {
  const db = await getDb();
  const [r] = await db.select().from(schema.resellers).where(eq(schema.resellers.userId, user.id));
  if (!r) return { ok: false as const, error: "Reseller profile missing." };
  if (r.kycStatus !== "verified") return { ok: false as const, error: "Complete KYC (bank details) before requesting a payout." };
  const rev = await resellerRevenue(user.id);
  if (amountPaise <= 0 || amountPaise > rev.availablePaise) return { ok: false as const, error: "Amount exceeds your available balance." };
  const [row] = await db.insert(schema.payouts).values({ id: uuid(), resellerId: user.id, amountPaise, status: "requested" }).returning();
  await audit({ actorId: user.id, entity: "payout", entityId: row.id, to: "requested", meta: { amountPaise } }, db);
  await notifyPayout(user, amountPaise, "requested");
  return { ok: true as const, payout: row };
}

export async function updateResellerProfile(user: User, data: { businessName?: string; bank?: { accountName?: string; accountNumber?: string; ifsc?: string; upi?: string; pan?: string }; defaultMarkupPct?: number }) {
  const db = await getDb();
  const [r] = await db.select().from(schema.resellers).where(eq(schema.resellers.userId, user.id));
  const bank = { ...(r?.bankJson ?? {}), ...(data.bank ?? {}) };
  const complete = !!(bank.accountNumber && bank.ifsc && bank.pan && bank.accountName);
  await db
    .insert(schema.resellers)
    .values({ userId: user.id, businessName: data.businessName ?? null, bankJson: bank, kycStatus: complete ? "submitted" : "pending", defaultMarkupPct: data.defaultMarkupPct ?? 0 })
    .onConflictDoUpdate({
      target: schema.resellers.userId,
      set: {
        businessName: data.businessName ?? r?.businessName ?? null,
        bankJson: bank,
        kycStatus: r?.kycStatus === "verified" ? "verified" : complete ? "submitted" : "pending",
        defaultMarkupPct: data.defaultMarkupPct ?? r?.defaultMarkupPct ?? 0,
      },
    });
  await audit({ actorId: user.id, entity: "reseller", entityId: user.id, to: "profile_updated" }, db);
}

/* ------------------------------------------------------------------
   Codes: self-purchase + inventory + assignment
   ------------------------------------------------------------------ */

export async function buyResellerCode(user: User, tier: TierSlug, idempotencyKey: string) {
  const db = await getDb();
  const [t] = await db.select().from(schema.tiers).where(eq(schema.tiers.id, tier));
  if (!t) throw new Error("Unknown tier");
  return createOrder({ user, type: "reseller_code", tier, amountPaise: t.resellerPricePaise, idempotencyKey, meta: { resellerId: user.id } });
}

export async function listResellerCodes(resellerId: string) {
  const db = await getDb();
  const rows = await db.select().from(schema.bundleCodes).where(eq(schema.bundleCodes.ownerResellerId, resellerId)).orderBy(desc(schema.bundleCodes.createdAt));
  const userIds = [...new Set(rows.map((r) => r.assignedUserId).filter(Boolean))] as string[];
  const users = userIds.length ? await db.select().from(schema.users).where(inArray(schema.users.id, userIds)) : [];
  return rows.map((r) => ({ ...r, assignedTo: users.find((u) => u.id === r.assignedUserId) ?? null }));
}

/** Assigns an inventory code to a member (by email/phone) and delivers it once. */
export async function assignCodeToMember(user: User, codeId: string, identifierRaw: string) {
  const db = await getDb();
  const id = normalizeIdentifier(identifierRaw);
  if (!id) return { ok: false as const, error: "Enter a valid email or mobile number." };
  const [code] = await db.select().from(schema.bundleCodes).where(and(eq(schema.bundleCodes.id, codeId), eq(schema.bundleCodes.ownerResellerId, user.id)));
  if (!code) return { ok: false as const, error: "Code not found in your inventory." };
  if (code.status !== "unassigned") return { ok: false as const, error: "This code is already assigned or redeemed." };
  if (!code.codeEnc) return { ok: false as const, error: "This code was already delivered and cannot be re-sent." };

  const where = id.channel === "email" ? eq(schema.users.email, id.identifier) : eq(schema.users.phone, id.identifier);
  let [member] = await db.select().from(schema.users).where(where);
  if (!member) {
    [member] = await db
      .insert(schema.users)
      .values({ id: uuid(), email: id.channel === "email" ? id.identifier : null, phone: id.channel === "sms" ? id.identifier : null, referredByResellerId: user.id })
      .returning();
  }
  const plaintext = decrypt(code.codeEnc);
  await db.update(schema.bundleCodes).set({ status: "assigned", assignedUserId: member.id, codeEnc: null, deliveredAt: new Date() }).where(eq(schema.bundleCodes.id, code.id));
  await notifyCodeDelivery(member, code.tierId === "pro" ? "Pro Pass" : "Starter Pass", plaintext, `reseller:${user.id.slice(0, 8)}`);
  await audit({ actorId: user.id, entity: "bundle_code", entityId: code.id, from: "unassigned", to: "assigned", meta: { memberId: member.id } }, db);
  return { ok: true as const };
}

export async function recentResellerOrders(resellerId: string, days = 30) {
  const db = await getDb();
  const since = new Date(Date.now() - days * 86_400_000);
  return db
    .select()
    .from(schema.orders)
    .where(and(eq(schema.orders.userId, resellerId), gte(schema.orders.createdAt, since), or(eq(schema.orders.type, "reseller_code"), eq(schema.orders.type, "pool_seat"))))
    .orderBy(desc(schema.orders.createdAt));
}
