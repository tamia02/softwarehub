import "server-only";
import { randomBytes } from "node:crypto";
import { and, eq, isNull, sql } from "drizzle-orm";
import { getDb, schema, type Db } from "@/db";
import type { Role } from "@/config/site";
import type { TierSlug } from "@/data/tiers";
import { GEN_ALPHABET, checkCharIsUsable, computeCheckChar, normalizeCode, type CodeKind } from "./codes";
import { encrypt, safeEqualHex, sha256Salted } from "./crypto.server";
import { audit } from "./audit.server";
import { uuid } from "./ids";

/* ------------------------------------------------------------------
   Generation
   ------------------------------------------------------------------ */

const PREFIX: Record<Exclude<CodeKind, "unknown">, string> = {
  "gate-customer": "SHPC",
  "gate-reseller": "SHPR",
  "bundle-pro": "SHPP",
  "bundle-starter": "SHPS",
};

function randomChars(n: number): string {
  // Rejection sampling keeps the distribution uniform over the alphabet.
  const out: string[] = [];
  while (out.length < n) {
    const bytes = randomBytes(n * 2);
    for (const b of bytes) {
      if (b < 256 - (256 % GEN_ALPHABET.length)) {
        out.push(GEN_ALPHABET[b % GEN_ALPHABET.length]);
        if (out.length === n) break;
      }
    }
  }
  return out.join("");
}

/** Generate a plaintext code. Show it once; persist only `hashCode(code)`. */
export function generateCode(kind: Exclude<CodeKind, "unknown">): string {
  const totalLen = kind.startsWith("gate") ? 12 : 16;
  const prefix = PREFIX[kind];
  // 1 in 37 bodies would need the "*" check symbol; draw again instead.
  for (;;) {
    const body = prefix + randomChars(totalLen - prefix.length - 1);
    if (checkCharIsUsable(body)) return body + computeCheckChar(body);
  }
}

export function hashCode(plaintext: string): string {
  return sha256Salted(normalizeCode(plaintext));
}

/* ------------------------------------------------------------------
   Gate codes (DB-backed)
   ------------------------------------------------------------------ */

export interface VerifyResult {
  ok: boolean;
  role?: Role;
  resellerId?: string;
  gateCodeId?: string;
  redirect?: string;
  error?: string;
}

async function findGateCode(db: Db, plaintext: string) {
  const h = hashCode(plaintext);
  const [row] = await db.select().from(schema.gateCodes).where(eq(schema.gateCodes.codeHash, h));
  return row && safeEqualHex(row.codeHash, h) ? row : undefined;
}

export async function verifyGateCode(plaintext: string): Promise<VerifyResult> {
  const db = await getDb();
  const rec = await findGateCode(db, plaintext);
  if (!rec) return { ok: false, error: "We couldn't find that code." };
  if (rec.status !== "active") return { ok: false, error: "This code is no longer active." };
  if (rec.expiresAt && rec.expiresAt < new Date()) return { ok: false, error: "This code has expired." };
  if (rec.uses >= rec.maxUses) return { ok: false, error: "This code has already been used." };

  await db
    .update(schema.gateCodes)
    .set({ uses: sql`${schema.gateCodes.uses} + 1` })
    .where(eq(schema.gateCodes.id, rec.id));
  await audit({ entity: "gate_code", entityId: rec.id, from: `uses:${rec.uses}`, to: `uses:${rec.uses + 1}` }, db);

  const role: Role = rec.type === "reseller" ? "reseller" : "customer";
  return {
    ok: true,
    role,
    gateCodeId: rec.id,
    resellerId: rec.resellerId ?? undefined,
    redirect: role === "reseller" ? "/login?next=/reseller" : "/home",
  };
}

/** Lock a code after 10 failed attempts (called from the verify route on 401s). */
export async function recordGateFailure(plaintext: string) {
  const db = await getDb();
  const rec = await findGateCode(db, plaintext);
  if (!rec) return;
  const failed = rec.failedAttempts + 1;
  await db
    .update(schema.gateCodes)
    .set({ failedAttempts: failed, status: failed >= 10 ? "locked" : rec.status })
    .where(eq(schema.gateCodes.id, rec.id));
  if (failed >= 10) await audit({ entity: "gate_code", entityId: rec.id, from: "active", to: "locked" }, db);
}

export async function createGateCodes(opts: {
  type: "customer" | "reseller";
  count: number;
  label?: string;
  resellerId?: string;
  maxUses?: number;
  expiresAt?: Date | null;
  actorId?: string;
}): Promise<string[]> {
  const db = await getDb();
  const plain: string[] = [];
  const rows = [];
  for (let i = 0; i < opts.count; i++) {
    const code = generateCode(opts.type === "reseller" ? "gate-reseller" : "gate-customer");
    plain.push(code);
    rows.push({
      id: uuid(),
      codeHash: hashCode(code),
      type: opts.type,
      label: opts.label ?? null,
      resellerId: opts.resellerId ?? null,
      maxUses: opts.maxUses ?? (opts.type === "reseller" ? 1 : 1000),
      expiresAt: opts.expiresAt ?? null,
    });
  }
  await db.insert(schema.gateCodes).values(rows);
  for (const r of rows) await audit({ actorId: opts.actorId, entity: "gate_code", entityId: r.id, to: "active" }, db);
  return plain;
}

/** Binds a reseller gate code to the account that first signs in with it. */
export async function bindResellerGateCode(gateCodeId: string, userId: string) {
  const db = await getDb();
  await db.update(schema.gateCodes).set({ boundUserId: userId }).where(eq(schema.gateCodes.id, gateCodeId));
}

/* ------------------------------------------------------------------
   Bundle codes
   ------------------------------------------------------------------ */

export async function createBundleCodes(opts: {
  tier: TierSlug;
  count: number;
  batch?: string;
  actorId?: string;
  costPaise?: number;
}): Promise<string[]> {
  const db = await getDb();
  const plain: string[] = [];
  const rows = [];
  for (let i = 0; i < opts.count; i++) {
    const code = generateCode(opts.tier === "pro" ? "bundle-pro" : "bundle-starter");
    plain.push(code);
    rows.push({
      id: uuid(),
      codeHash: hashCode(code),
      codeEnc: encrypt(code),
      last4: code.slice(-4),
      tierId: opts.tier,
      batch: opts.batch ?? null,
      costPaise: opts.costPaise ?? 0,
    });
  }
  await db.insert(schema.bundleCodes).values(rows);
  for (const r of rows) await audit({ actorId: opts.actorId, entity: "bundle_code", entityId: r.id, to: "unassigned" }, db);
  return plain;
}

/**
 * Take one unassigned code for a tier. Prefers the reseller's own inventory
 * when `ownerResellerId` is given, then platform stock. Returns null when
 * there is no inventory (caller marks the order awaiting_inventory).
 */
export async function allocateBundleCode(
  db: Db,
  tier: TierSlug,
  target: { userId?: string; poolId?: string; orderId?: string; ownerResellerId?: string | null; setOwner?: string },
) {
  const pick = async (owner: string | null) => {
    const [row] = await db
      .select()
      .from(schema.bundleCodes)
      .where(
        and(
          eq(schema.bundleCodes.tierId, tier),
          eq(schema.bundleCodes.status, "unassigned"),
          owner ? eq(schema.bundleCodes.ownerResellerId, owner) : isNull(schema.bundleCodes.ownerResellerId),
        ),
      )
      .limit(1);
    return row;
  };

  const row = (target.ownerResellerId ? await pick(target.ownerResellerId) : undefined) ?? (await pick(null));
  if (!row) return null;

  const [updated] = await db
    .update(schema.bundleCodes)
    .set({
      status: "assigned",
      assignedUserId: target.userId ?? null,
      poolId: target.poolId ?? null,
      orderId: target.orderId ?? null,
      ownerResellerId: target.setOwner ?? row.ownerResellerId,
    })
    .where(and(eq(schema.bundleCodes.id, row.id), eq(schema.bundleCodes.status, "unassigned")))
    .returning();
  if (!updated) return allocateBundleCode(db, tier, target); // lost a race; try the next one
  await audit({ entity: "bundle_code", entityId: row.id, from: "unassigned", to: "assigned", meta: { orderId: target.orderId } }, db);
  return updated;
}

/** Moves a code into a reseller's inventory (self-purchase) without assigning it to a customer. */
export async function stockBundleCodeForReseller(db: Db, tier: TierSlug, resellerId: string, orderId: string, costPaise: number) {
  const [row] = await db
    .select()
    .from(schema.bundleCodes)
    .where(and(eq(schema.bundleCodes.tierId, tier), eq(schema.bundleCodes.status, "unassigned"), isNull(schema.bundleCodes.ownerResellerId)))
    .limit(1);
  if (!row) return null;
  const [updated] = await db
    .update(schema.bundleCodes)
    .set({ ownerResellerId: resellerId, orderId, costPaise })
    .where(and(eq(schema.bundleCodes.id, row.id), eq(schema.bundleCodes.status, "unassigned"), isNull(schema.bundleCodes.ownerResellerId)))
    .returning();
  if (!updated) return stockBundleCodeForReseller(db, tier, resellerId, orderId, costPaise);
  await audit({ entity: "bundle_code", entityId: row.id, from: "platform", to: `reseller:${resellerId}`, meta: { orderId } }, db);
  return updated;
}

/** Wipe the encrypted copy once the plaintext has been shown/sent. */
export async function markBundleCodeDelivered(db: Db, id: string) {
  await db.update(schema.bundleCodes).set({ codeEnc: null, deliveredAt: new Date() }).where(eq(schema.bundleCodes.id, id));
}

export async function findBundleCode(db: Db, plaintext: string) {
  const h = hashCode(plaintext);
  const [row] = await db.select().from(schema.bundleCodes).where(eq(schema.bundleCodes.codeHash, h));
  return row && safeEqualHex(row.codeHash, h) ? row : undefined;
}
