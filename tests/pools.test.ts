import { eq } from "drizzle-orm";
import { beforeAll, describe, expect, it } from "vitest";
import { getDb, schema } from "@/db";
import type { Db } from "@/db";
import type { User } from "@/db/schema";
import { createOrder, onPaymentCaptured } from "@/lib/orders.server";
import { createPool, expirePools, fulfilPool, getPool, joinPool } from "@/lib/pools.server";
import { redeemBundleCode, claimTool, listPasses } from "@/lib/passes.server";
import { createBundleCodes } from "@/lib/codes.server";
import { resellerRevenue } from "@/lib/reseller.server";
import { uuid } from "@/lib/ids";

/**
 * Integration tests on an in-memory PGlite database: the whole money path
 * (order → capture → invoice → fulfilment) plus pool lifecycle and expiry.
 */
let db: Db;
let reseller: User;
const pay = (gatewayOrderId: string) => onPaymentCaptured({ gatewayOrderId, gatewayPaymentId: `pay_${uuid()}` });

async function user(role = "customer"): Promise<User> {
  const [u] = await db.insert(schema.users).values({ id: uuid(), email: `${uuid()}@test.dev`, role }).returning();
  if (role === "reseller") await db.insert(schema.resellers).values({ userId: u.id, kycStatus: "verified" });
  return u;
}

beforeAll(async () => {
  db = await getDb();
  reseller = await user("reseller");
});

describe("direct purchase", () => {
  it("creates an order, captures idempotently, issues a GST invoice and allocates a code", async () => {
    const u = await user();
    const { order, gateway } = await createOrder({ user: u, type: "direct", tier: "pro", amountPaise: 4_700_000, idempotencyKey: `t:${u.id}` });
    const again = await createOrder({ user: u, type: "direct", tier: "pro", amountPaise: 4_700_000, idempotencyKey: `t:${u.id}` });
    expect(again.order.id).toBe(order.id);

    const first = await pay(gateway.gatewayOrderId);
    expect(first.alreadyProcessed).toBe(false);
    expect(first.order.status).toBe("fulfilled");
    const dup = await onPaymentCaptured({ gatewayOrderId: gateway.gatewayOrderId, gatewayPaymentId: first.payment.gatewayPaymentId });
    expect(dup.alreadyProcessed).toBe(true);

    const [inv] = await db.select().from(schema.invoices).where(eq(schema.invoices.orderId, order.id));
    expect(inv.totalPaise).toBe(4_700_000);
    expect(inv.taxablePaise + inv.cgstPaise + inv.sgstPaise + inv.igstPaise).toBe(4_700_000);
    expect(inv.number).toMatch(/^SHP-\d{4}-\d{6}$/);

    const codeId = (first.order.metaJson as { bundleCodeId: string }).bundleCodeId;
    const [code] = await db.select().from(schema.bundleCodes).where(eq(schema.bundleCodes.id, codeId));
    expect(code.status).toBe("assigned");
    expect(code.assignedUserId).toBe(u.id);
  });

  it("rejects an amount mismatch from the gateway", async () => {
    const u = await user();
    const { gateway } = await createOrder({ user: u, type: "direct", tier: "starter", amountPaise: 2_500_000, idempotencyKey: `m:${u.id}` });
    await expect(onPaymentCaptured({ gatewayOrderId: gateway.gatewayOrderId, gatewayPaymentId: "pay_x", amountPaise: 1 })).rejects.toThrow(/Amount mismatch/);
  });

  it("parks the order when inventory is empty and fulfils after codes are generated", async () => {
    // Drain starter stock.
    await db.update(schema.bundleCodes).set({ status: "void" }).where(eq(schema.bundleCodes.tierId, "starter"));
    const u = await user();
    const { gateway } = await createOrder({ user: u, type: "direct", tier: "starter", amountPaise: 2_500_000, idempotencyKey: `inv:${u.id}` });
    const r = await pay(gateway.gatewayOrderId);
    expect(r.order.status).toBe("awaiting_inventory");
    await createBundleCodes({ tier: "starter", count: 2 });
    const { retryAwaitingInventory } = await import("@/lib/orders.server");
    expect(await retryAwaitingInventory()).toBe(1);
  });
});

describe("redeem + claim", () => {
  it("turns a bundle code into a pass with one claim per tool, once", async () => {
    const u = await user();
    const [plain] = await createBundleCodes({ tier: "starter", count: 1 });
    const r = await redeemBundleCode(u, plain);
    expect(r.ok).toBe(true);
    expect((await redeemBundleCode(u, plain)).ok).toBe(false);
    const passes = await listPasses(u.id);
    expect(passes[0].claims.length).toBe(22);
    const c = await claimTool(u, passes[0].claims[0].id);
    expect(c.ok && c.url).toBeTruthy();
    const other = await user();
    expect((await claimTool(other, passes[0].claims[0].id)).ok).toBe(false);
  });
});

describe("pool lifecycle (escrow)", () => {
  it("fills, auto-fulfils, creates passes and freezes a settlement", async () => {
    const pool = await createPool({ user: reseller, tier: "pro", seats: 5, asReseller: true, splitMode: "reseller_keeps" });
    expect(pool.seatPricePaise).toBe(940_000);
    const members: User[] = [];
    for (let i = 0; i < 5; i++) {
      const m = await user();
      members.push(m);
      const j = await joinPool(pool.id, m);
      expect(j.gateway).not.toBeNull();
      await pay(j.gateway!.gatewayOrderId);
    }
    const d = await getPool(pool.id);
    expect(d?.pool.status).toBe("fulfilled");
    expect(d?.pool.bundleCodeId).toBeTruthy();
    const s = d?.pool.settlementJson as { grossPaise: number; resellerSharePaise: number; platformFeePaise: number };
    expect(s.grossPaise).toBe(4_700_000);
    expect(s.platformFeePaise).toBe(94_000);
    expect(s.resellerSharePaise).toBe(4_700_000 - 94_000 - 3_800_000);
    for (const m of members) expect((await listPasses(m.id))[0].claims.length).toBe(35);
    expect((await resellerRevenue(reseller.id)).earnedPaise).toBeGreaterThan(0);
    await expect(joinPool(pool.id, await user())).rejects.toThrow(/no longer open/);
  });

  it("uses the reseller's own inventory first and books its cost", async () => {
    // Give the reseller a pre-bought pro code at a discounted cost.
    const [plain] = await createBundleCodes({ tier: "pro", count: 1 });
    await db.update(schema.bundleCodes).set({ ownerResellerId: reseller.id, costPaise: 3_500_000 }).where(eq(schema.bundleCodes.last4, plain.slice(-4)));
    const pool = await createPool({ user: reseller, tier: "pro", seats: 5, asReseller: true });
    for (let i = 0; i < 5; i++) {
      const j = await joinPool(pool.id, await user());
      await pay(j.gateway!.gatewayOrderId);
    }
    const d = await getPool(pool.id);
    expect((d?.pool.settlementJson as { resellerCostPaise: number }).resellerCostPaise).toBe(3_500_000);
  });

  it("refuses manual fulfilment before the pool is paid", async () => {
    const pool = await createPool({ user: reseller, tier: "starter", seats: 5, asReseller: true });
    const r = await fulfilPool(pool.id, reseller.id);
    expect(r.ok).toBe(false);
  });

  it("expires unfilled pools past the deadline and refunds every paid seat", async () => {
    const pool = await createPool({ user: await user(), tier: "starter", seats: 5 });
    const m = await user();
    const j = await joinPool(pool.id, m);
    await pay(j.gateway!.gatewayOrderId);
    await db.update(schema.pools).set({ expiresAt: new Date(Date.now() - 1000) }).where(eq(schema.pools.id, pool.id));

    const r = await expirePools();
    expect(r.expired).toBe(1);
    expect(r.refunded).toBe(1);
    const d = await getPool(pool.id);
    expect(d?.pool.status).toBe("expired");
    expect(d?.members[0].refundedAt).toBeTruthy();
    const [order] = await db.select().from(schema.orders).where(eq(schema.orders.id, d!.members[0].orderId!));
    expect(order.status).toBe("refunded");
    // Idempotent: nothing left to expire.
    expect((await expirePools()).expired).toBe(0);
  });

  it("releases stale unpaid reservations so the seat can be taken", async () => {
    const pool = await createPool({ user: await user(), tier: "starter", seats: 5 });
    const ghost = await user();
    await joinPool(pool.id, ghost); // reserved, never paid
    await db.update(schema.poolMembers).set({ joinedAt: new Date(Date.now() - 60 * 60 * 1000) }).where(eq(schema.poolMembers.userId, ghost.id));
    const j = await joinPool(pool.id, await user());
    expect(j.seatNo).toBe(1);
  });
});
