import "server-only";
import fs from "node:fs";
import path from "node:path";
import { eq } from "drizzle-orm";
import type { Db } from "./index";
import * as schema from "./schema";
import { tiers as tierData } from "@/data/tiers";
import { tools as toolData } from "@/data/tools";
import { checkCharIsUsable, computeCheckChar } from "@/lib/codes";
import { hashCode, generateCode } from "@/lib/codes.server";
import { encrypt } from "@/lib/crypto.server";
import { uuid, shortId } from "@/lib/ids";

/**
 * Idempotent seed. Runs automatically on an empty PGlite database (dev) and
 * via `npm run db:seed` elsewhere. Demo credentials are written to
 * .data/demo-codes.txt (git-ignored) — REPLACE BEFORE LAUNCH.
 */
export async function seedIfEmpty(db: Db) {
  const [existing] = await db.select().from(schema.tiers).limit(1);
  if (existing) return;
  await seed(db);
}

/** Fixed demo bodies: bump the last letter until the check character is usable. */
function demoCode(body: string) {
  let b = body;
  while (!checkCharIsUsable(b)) b = b.slice(0, -1) + String.fromCharCode(b.charCodeAt(b.length - 1) + 1);
  return b + computeCheckChar(b);
}

export async function seed(db: Db) {
  const now = new Date();
  const day = 86_400_000;
  const lines: string[] = ["Software Hub Pool — demo credentials (dev only)", ""];

  // Tiers — reseller prices are the §13 defaults; edit in /admin/settings.
  await db.insert(schema.tiers).values([
    { id: "starter", name: tierData.starter.name, pricePaise: tierData.starter.pricePaise, resellerPricePaise: 20_000 * 100, seatsDefault: 10 },
    { id: "pro", name: tierData.pro.name, pricePaise: tierData.pro.pricePaise, resellerPricePaise: 38_000 * 100, seatsDefault: 10 },
  ]);

  // Vendors + tools
  const vendorNames = [...new Set(toolData.map((t) => t.vendor))];
  const vendorRows = vendorNames.map((name) => ({
    id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    name,
    claimUrlTemplate: `https://example.com/redeem/${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}?code={code}`,
    couponMode: "link",
    eligibilityNote: "New accounts or accounts never on a paid plan.",
  }));
  await db.insert(schema.vendors).values(vendorRows);
  await db.insert(schema.tools).values(
    toolData.map((t) => ({
      id: t.slug,
      name: t.name,
      vendorName: t.vendor,
      vendorId: t.vendor.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category: t.category,
      offerTitle: t.offerTitle,
      blurb: t.blurb,
      valueUsd: t.valueUsd,
      tierMin: t.tierMin,
      badge: t.badge ?? null,
      hue: t.hue,
      sort: t.sort,
    })),
  );

  // Users
  const admin = { id: uuid(), name: "Admin", email: "admin@softwarehubpool.example", role: "admin" };
  const reseller = { id: uuid(), name: "Demo Reseller", email: "reseller@softwarehubpool.example", phone: "+919800000001", role: "reseller" };
  const customer = { id: uuid(), name: "Demo Customer", email: "customer@softwarehubpool.example", phone: "+919800000002", role: "customer" };
  const members = Array.from({ length: 12 }).map((_, i) => ({
    id: uuid(),
    name: `Member ${i + 1}`,
    email: `member${i + 1}@softwarehubpool.example`,
    role: "customer",
  }));
  await db.insert(schema.users).values([admin, reseller, customer, ...members]);
  await db.insert(schema.resellers).values({ userId: reseller.id, businessName: "Demo Reseller Co", kycStatus: "verified", defaultMarkupPct: 0 });
  lines.push("Sign-in (OTP is printed to the server console in dev):");
  lines.push(`  admin     ${admin.email}`);
  lines.push(`  reseller  ${reseller.email}  /  ${reseller.phone}`);
  lines.push(`  customer  ${customer.email}  /  ${customer.phone}`, "");

  // Gate codes — demo (§1.3) + one generated batch each
  await db.insert(schema.gateCodes).values([
    { id: uuid(), codeHash: hashCode("CUST-DEMO-2026"), type: "customer", label: "Demo customer code", resellerId: reseller.id, maxUses: 1_000_000 },
    { id: uuid(), codeHash: hashCode("RESL-DEMO-2026"), type: "reseller", label: "Demo reseller code", maxUses: 1_000_000 },
  ]);
  lines.push("Gate codes:", "  customer  CUST-DEMO-2026", "  reseller  RESL-DEMO-2026", "");

  // Bundle code inventory: 2 known demo codes + random stock
  const demoStarter = demoCode("SHPSDEMO2026AAA");
  const demoPro = demoCode("SHPPDEMO2026AAA");
  const stock = [
    { code: demoStarter, tier: "starter" },
    { code: demoPro, tier: "pro" },
    ...Array.from({ length: 15 }, () => ({ code: generateCode("bundle-starter"), tier: "starter" })),
    ...Array.from({ length: 15 }, () => ({ code: generateCode("bundle-pro"), tier: "pro" })),
  ];
  await db.insert(schema.bundleCodes).values(
    stock.map((s) => ({ id: uuid(), codeHash: hashCode(s.code), codeEnc: encrypt(s.code), last4: s.code.slice(-4), tierId: s.tier, batch: "seed" })),
  );
  lines.push("Bundle codes (redeem in My Pass):", `  starter  ${demoStarter}`, `  pro      ${demoPro}`, "");

  // Reseller inventory: 3 pro codes already bought at reseller price
  const resellerStock = Array.from({ length: 3 }, () => generateCode("bundle-pro"));
  await db.insert(schema.bundleCodes).values(
    resellerStock.map((c) => ({
      id: uuid(),
      codeHash: hashCode(c),
      codeEnc: encrypt(c),
      last4: c.slice(-4),
      tierId: "pro",
      ownerResellerId: reseller.id,
      costPaise: 38_000 * 100,
      batch: "seed-reseller",
    })),
  );

  // Demo open pools with paid members
  const poolSpecs = [
    { tier: "pro", filled: 7, days: 2.3, name: "Bengaluru builders", reseller: true },
    { tier: "starter", filled: 9, days: 0.6, name: "Mumbai indie hackers", reseller: false },
    { tier: "pro", filled: 4, days: 5.1, name: "Delhi design club", reseller: true },
    { tier: "starter", filled: 6, days: 3.8, name: "Hyderabad devs", reseller: false },
    { tier: "pro", filled: 2, days: 6.4, name: "Pune product folks", reseller: false },
  ];
  let m = 0;
  for (const p of poolSpecs) {
    const seatPrice = Math.ceil((p.tier === "pro" ? tierData.pro.pricePaise : tierData.starter.pricePaise) / 10);
    const poolId = shortId();
    await db.insert(schema.pools).values({
      id: poolId,
      tierId: p.tier,
      name: p.name,
      creatorUserId: p.reseller ? reseller.id : members[m % members.length].id,
      resellerId: p.reseller ? reseller.id : null,
      seats: 10,
      seatPricePaise: seatPrice,
      status: "open",
      paymentModel: "escrow",
      distributionMode: "shared",
      splitMode: p.reseller ? "reseller_keeps" : "share_equal",
      expiresAt: new Date(now.getTime() + p.days * day),
    });
    for (let s = 1; s <= p.filled; s++) {
      const u = members[(m + s) % members.length];
      const orderId = uuid();
      await db.insert(schema.orders).values({
        id: orderId,
        userId: u.id,
        type: "pool_seat",
        tierId: p.tier,
        amountPaise: seatPrice,
        gateway: "mock",
        gatewayOrderId: `order_seed_${shortId(10)}`,
        status: "paid",
        idempotencyKey: `seed:${poolId}:${s}`,
        metaJson: { poolId },
        paidAt: now,
      });
      const paymentId = `pay_seed_${shortId(10)}`;
      await db.insert(schema.payments).values({ id: uuid(), orderId, gatewayPaymentId: paymentId, amountPaise: seatPrice, status: "captured" });
      await db.insert(schema.poolMembers).values({ id: uuid(), poolId, userId: u.id, seatNo: s, orderId, paymentId, paidAt: now });
    }
    m += 3;
  }

  // Redeemed pass for the demo customer so My Pass has content
  const passId = uuid();
  await db.insert(schema.passes).values({
    id: passId,
    userId: customer.id,
    tierId: "starter",
    activatedAt: now,
    expiresAt: new Date(now.getTime() + 365 * day),
  });
  await db.insert(schema.toolClaims).values(
    toolData.filter((t) => t.tierMin === "starter").map((t) => ({ id: uuid(), passId, toolId: t.slug, status: "available" })),
  );

  try {
    // Skip on serverless hosts (read-only filesystem, and nobody can read the file there).
    if (process.env.VERCEL) throw new Error("serverless");
    const dir = path.join(process.cwd(), ".data");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "demo-codes.txt"), lines.join("\n"));
  } catch {
    /* read-only FS (serverless) — fine */
  }
  if (process.env.NODE_ENV !== "test") console.info(process.env.VERCEL ? "[seed] in-memory demo database seeded" : "[seed] database seeded — demo credentials in .data/demo-codes.txt");
}

export async function resetAndSeed(db: Db) {
  for (const t of [
    schema.auditLog, schema.payouts, schema.invoices, schema.payments, schema.poolMembers, schema.orders, schema.toolClaims,
    schema.passes, schema.pools, schema.bundleCodes, schema.gateCodes, schema.otpCodes, schema.resellers, schema.users,
    schema.tools, schema.vendors, schema.tiers, schema.settings,
  ]) {
    await db.delete(t);
  }
  await seed(db);
}

export { eq };
