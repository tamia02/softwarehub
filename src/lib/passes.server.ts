import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import type { User } from "@/db/schema";
import { audit } from "./audit.server";
import { findBundleCode } from "./codes.server";
import { uuid } from "./ids";
import { notifyAdmin } from "./notify.server";

/* ------------------------------------------------------------------
   Redemption: bundle code → pass + one claim per tool in the tier (§5.2)
   ------------------------------------------------------------------ */

export async function redeemBundleCode(user: User, plaintext: string): Promise<{ ok: true; passId: string } | { ok: false; error: string }> {
  const db = await getDb();
  const code = await findBundleCode(db, plaintext);
  if (!code) return { ok: false, error: "We couldn't find that code." };
  if (code.status === "redeemed") return { ok: false, error: "This code has already been redeemed." };
  if (code.status === "void") return { ok: false, error: "This code has been voided. Contact support." };
  if (code.assignedUserId && code.assignedUserId !== user.id) return { ok: false, error: "This code was issued to a different account." };

  const [claimed] = await db
    .update(schema.bundleCodes)
    .set({ status: "redeemed", redeemedAt: new Date(), assignedUserId: user.id, codeEnc: null })
    .where(and(eq(schema.bundleCodes.id, code.id), inArray(schema.bundleCodes.status, ["unassigned", "assigned"])))
    .returning();
  if (!claimed) return { ok: false, error: "This code has already been redeemed." };

  const toolRows = await db.select().from(schema.tools).where(eq(schema.tools.active, true));
  const tierTools = toolRows.filter((t) => code.tierId === "pro" || t.tierMin === "starter");
  const passId = uuid();
  await db.insert(schema.passes).values({
    id: passId,
    userId: user.id,
    tierId: code.tierId,
    bundleCodeId: code.id,
    expiresAt: new Date(Date.now() + 365 * 86_400_000),
  });
  await db.insert(schema.toolClaims).values(tierTools.map((t) => ({ id: uuid(), passId, toolId: t.id, status: "available" })));
  await audit({ actorId: user.id, entity: "bundle_code", entityId: code.id, from: code.status, to: "redeemed", meta: { passId } }, db);
  await audit({ actorId: user.id, entity: "pass", entityId: passId, to: "active", meta: { tier: code.tierId, claims: tierTools.length } }, db);
  return { ok: true, passId };
}

/* ------------------------------------------------------------------
   Read
   ------------------------------------------------------------------ */

export async function listPasses(userId: string) {
  const db = await getDb();
  const passRows = await db.select().from(schema.passes).where(eq(schema.passes.userId, userId)).orderBy(desc(schema.passes.activatedAt));
  if (!passRows.length) return [];
  const claims = await db
    .select({
      id: schema.toolClaims.id,
      passId: schema.toolClaims.passId,
      status: schema.toolClaims.status,
      claimedAt: schema.toolClaims.claimedAt,
      vendorRef: schema.toolClaims.vendorRef,
      issueNote: schema.toolClaims.issueNote,
      toolId: schema.tools.id,
      toolName: schema.tools.name,
      vendorName: schema.tools.vendorName,
      offerTitle: schema.tools.offerTitle,
      category: schema.tools.category,
      hue: schema.tools.hue,
      tierMin: schema.tools.tierMin,
      sort: schema.tools.sort,
    })
    .from(schema.toolClaims)
    .innerJoin(schema.tools, eq(schema.tools.id, schema.toolClaims.toolId))
    .where(inArray(schema.toolClaims.passId, passRows.map((p) => p.id)));
  return passRows.map((p) => ({
    ...p,
    claims: claims.filter((c) => c.passId === p.id).sort((a, b) => a.sort - b.sort),
  }));
}

export type PassWithClaims = Awaited<ReturnType<typeof listPasses>>[number];

/* ------------------------------------------------------------------
   Claim → vendor link / coupon
   ------------------------------------------------------------------ */

export async function claimTool(user: User, claimId: string): Promise<{ ok: true; url: string | null; coupon: string | null; mode: string; note: string | null } | { ok: false; error: string }> {
  const db = await getDb();
  const [row] = await db
    .select({ claim: schema.toolClaims, pass: schema.passes, tool: schema.tools, vendor: schema.vendors })
    .from(schema.toolClaims)
    .innerJoin(schema.passes, eq(schema.passes.id, schema.toolClaims.passId))
    .innerJoin(schema.tools, eq(schema.tools.id, schema.toolClaims.toolId))
    .leftJoin(schema.vendors, eq(schema.vendors.id, schema.tools.vendorId))
    .where(eq(schema.toolClaims.id, claimId));
  if (!row || row.pass.userId !== user.id) return { ok: false, error: "Claim not found." };
  if (row.pass.expiresAt < new Date()) return { ok: false, error: "This pass has expired." };

  // Vendor reference: in production this is the per-seat coupon / invite pulled
  // from the vendor allocation. Until vendor APIs are wired, a deterministic ref is issued.
  const vendorRef = row.claim.vendorRef ?? `SHP-${row.tool.id.toUpperCase().slice(0, 6)}-${row.pass.id.slice(0, 8).toUpperCase()}`;
  if (row.claim.status !== "claimed") {
    await db.update(schema.toolClaims).set({ status: "claimed", claimedAt: new Date(), vendorRef }).where(eq(schema.toolClaims.id, claimId));
    await audit({ actorId: user.id, entity: "tool_claim", entityId: claimId, from: row.claim.status, to: "claimed" }, db);
  }
  const mode = row.vendor?.couponMode ?? "link";
  const url = row.vendor?.claimUrlTemplate ? row.vendor.claimUrlTemplate.replace("{code}", encodeURIComponent(vendorRef)) : null;
  return { ok: true, url, coupon: mode === "coupon" || mode === "manual" ? vendorRef : null, mode, note: row.vendor?.eligibilityNote ?? null };
}

export async function reportClaimIssue(user: User, claimId: string, note: string) {
  const db = await getDb();
  const [row] = await db
    .select({ claim: schema.toolClaims, pass: schema.passes, tool: schema.tools })
    .from(schema.toolClaims)
    .innerJoin(schema.passes, eq(schema.passes.id, schema.toolClaims.passId))
    .innerJoin(schema.tools, eq(schema.tools.id, schema.toolClaims.toolId))
    .where(eq(schema.toolClaims.id, claimId));
  if (!row || row.pass.userId !== user.id) return { ok: false, error: "Claim not found." };
  await db.update(schema.toolClaims).set({ status: "issue", issueNote: note.slice(0, 500) }).where(eq(schema.toolClaims.id, claimId));
  await audit({ actorId: user.id, entity: "tool_claim", entityId: claimId, from: row.claim.status, to: "issue" }, db);
  await notifyAdmin("Code Works Guarantee claim", `${user.email ?? user.phone} reports an issue with ${row.tool.name} (claim ${claimId}): ${note}`);
  return { ok: true };
}

/* ------------------------------------------------------------------
   Expiry reminders (cron)
   ------------------------------------------------------------------ */

export async function sendPassReminders(daysBefore: number): Promise<number> {
  const db = await getDb();
  const { notifyPassExpiring } = await import("./notify.server");
  const soon = new Date(Date.now() + daysBefore * 86_400_000);
  const rows = await db.select().from(schema.passes);
  let n = 0;
  for (const p of rows) {
    if (p.reminderSentAt || p.expiresAt > soon || p.expiresAt < new Date()) continue;
    const [u] = await db.select().from(schema.users).where(eq(schema.users.id, p.userId));
    if (!u) continue;
    await notifyPassExpiring(u, p.tierId === "pro" ? "Pro Pass" : "Starter Pass", p.expiresAt);
    await db.update(schema.passes).set({ reminderSentAt: new Date() }).where(eq(schema.passes.id, p.id));
    n++;
  }
  return n;
}
