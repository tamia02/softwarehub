"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth.server";
import { fulfilPool, getPool, setPoolAssignment } from "@/lib/pools.server";
import { assignCodeToMember, requestPayout, updateResellerProfile } from "@/lib/reseller.server";

export type ActionResult = { ok: true; message?: string } | { ok: false; error: string };

export async function fulfilPoolAction(poolId: string): Promise<ActionResult> {
  const user = await requireUser(["reseller", "admin"]);
  const d = await getPool(poolId);
  if (!d) return { ok: false, error: "Pool not found." };
  if (user.role !== "admin" && d.pool.resellerId !== user.id) return { ok: false, error: "Not your pool." };
  const r = await fulfilPool(poolId, user.id);
  revalidatePath(`/reseller/pools/${poolId}`);
  revalidatePath("/reseller");
  return r.ok ? { ok: true, message: "Pool fulfilled — members can claim their tools." } : { ok: false, error: r.error ?? "Failed." };
}

export async function saveAssignmentAction(poolId: string, assignment: Record<string, string[]>): Promise<ActionResult> {
  const user = await requireUser(["reseller", "admin"]);
  try {
    await setPoolAssignment(poolId, user, assignment);
    revalidatePath(`/reseller/pools/${poolId}`);
    return { ok: true, message: "Assignment saved." };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Failed." };
  }
}

export async function assignCodeAction(codeId: string, identifier: string): Promise<ActionResult> {
  const user = await requireUser(["reseller", "admin"]);
  const r = await assignCodeToMember(user, codeId, identifier);
  revalidatePath("/reseller/codes");
  return r.ok ? { ok: true, message: "Code assigned and delivered." } : { ok: false, error: r.error };
}

export async function requestPayoutAction(amountRupees: number): Promise<ActionResult> {
  const user = await requireUser(["reseller", "admin"]);
  const r = await requestPayout(user, Math.round(amountRupees * 100));
  revalidatePath("/reseller/revenue");
  revalidatePath("/reseller");
  return r.ok ? { ok: true, message: "Payout requested." } : { ok: false, error: r.error };
}

export async function updateProfileAction(form: { businessName: string; accountName: string; accountNumber: string; ifsc: string; upi: string; pan: string }): Promise<ActionResult> {
  const user = await requireUser(["reseller", "admin"]);
  await updateResellerProfile(user, {
    businessName: form.businessName,
    bank: { accountName: form.accountName, accountNumber: form.accountNumber, ifsc: form.ifsc.toUpperCase(), upi: form.upi, pan: form.pan.toUpperCase() },
  });
  revalidatePath("/reseller/settings");
  return { ok: true, message: "Saved. KYC will be reviewed by the admin team." };
}
