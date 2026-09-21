"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth.server";
import { resolveIssue, retryInventory, setGateCodeStatus, setKycStatus, setPayoutStatus, updateSettings, updateTool, updateVendor, voidBundleCode } from "@/lib/admin.server";
import { createBundleCodes, createGateCodes } from "@/lib/codes.server";
import { fulfilPool } from "@/lib/pools.server";
import type { ActionResult } from "../reseller/actions";

export async function generateCodesAction(input: { kind: "bundle"; tier: "starter" | "pro"; count: number; batch?: string } | { kind: "gate"; type: "customer" | "reseller"; count: number; label?: string; maxUses?: number }): Promise<ActionResult & { codes?: string[] }> {
  const user = await requireUser("admin");
  const count = Math.min(500, Math.max(1, Math.round(input.count)));
  const codes =
    input.kind === "bundle"
      ? await createBundleCodes({ tier: input.tier, count, batch: input.batch, actorId: user.id })
      : await createGateCodes({ type: input.type, count, label: input.label, maxUses: input.maxUses, actorId: user.id });
  const fulfilled = input.kind === "bundle" ? await retryInventory(user) : 0;
  revalidatePath("/admin/codes");
  revalidatePath("/admin");
  return { ok: true, codes, message: fulfilled ? `Generated ${codes.length}; fulfilled ${fulfilled} waiting order(s).` : `Generated ${codes.length}.` };
}

export async function voidCodeAction(id: string): Promise<ActionResult> {
  const user = await requireUser("admin");
  const ok = await voidBundleCode(user, id);
  revalidatePath("/admin/codes");
  return ok ? { ok: true, message: "Voided." } : { ok: false, error: "Cannot void a redeemed code." };
}

export async function gateCodeStatusAction(id: string, status: "active" | "void"): Promise<ActionResult> {
  const user = await requireUser("admin");
  await setGateCodeStatus(user, id, status);
  revalidatePath("/admin/codes");
  return { ok: true, message: status === "active" ? "Reactivated." : "Voided." };
}

export async function updateToolAction(id: string, data: { active?: boolean; valueUsd?: number; badge?: "NEW" | "LIMITED" | "PRO" | null; tierMin?: "starter" | "pro" }): Promise<ActionResult> {
  const user = await requireUser("admin");
  await updateTool(user, id, data);
  revalidatePath("/admin/tools");
  revalidatePath("/home");
  return { ok: true, message: "Saved." };
}

export async function updateVendorAction(id: string, data: { claimUrlTemplate: string; couponMode: string; contractRef: string; eligibilityNote: string }): Promise<ActionResult> {
  const user = await requireUser("admin");
  await updateVendor(user, id, { claimUrlTemplate: data.claimUrlTemplate || null, couponMode: data.couponMode, contractRef: data.contractRef || null, eligibilityNote: data.eligibilityNote || null });
  revalidatePath("/admin/vendors");
  return { ok: true, message: "Saved." };
}

export async function payoutStatusAction(id: string, status: "approved" | "paid" | "rejected"): Promise<ActionResult> {
  const user = await requireUser("admin");
  await setPayoutStatus(user, id, status);
  revalidatePath("/admin/payouts");
  return { ok: true, message: `Marked ${status}.` };
}

export async function kycAction(userId: string, status: "verified" | "rejected"): Promise<ActionResult> {
  const user = await requireUser("admin");
  await setKycStatus(user, userId, status);
  revalidatePath("/admin/payouts");
  return { ok: true, message: `KYC ${status}.` };
}

export async function settingsAction(values: Record<string, string | number>, tiers: { starter?: number; pro?: number; starterReseller?: number; proReseller?: number }): Promise<ActionResult> {
  const user = await requireUser("admin");
  await updateSettings(user, values as Parameters<typeof updateSettings>[1], tiers);
  revalidatePath("/admin/settings");
  revalidatePath("/home");
  return { ok: true, message: "Settings saved." };
}

export async function resolveIssueAction(claimId: string, action: "replace" | "dismiss"): Promise<ActionResult> {
  const user = await requireUser("admin");
  await resolveIssue(user, claimId, action);
  revalidatePath("/admin/issues");
  return { ok: true, message: action === "replace" ? "Claim reset — member can claim a fresh code." : "Dismissed." };
}

export async function adminFulfilPoolAction(poolId: string): Promise<ActionResult> {
  const user = await requireUser("admin");
  const r = await fulfilPool(poolId, user.id);
  revalidatePath("/admin/pools");
  return r.ok ? { ok: true, message: "Fulfilled." } : { ok: false, error: r.error ?? "Failed." };
}

export async function retryInventoryAction(): Promise<ActionResult> {
  const user = await requireUser("admin");
  const n = await retryInventory(user);
  revalidatePath("/admin/orders");
  return { ok: true, message: `Fulfilled ${n} order(s).` };
}
