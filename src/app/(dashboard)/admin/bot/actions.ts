"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth.server";
import { vendingSend } from "@/lib/vending.server";
import type { ActionResult } from "../../reseller/actions";

/** Top up (+) or deduct (-) a reseller's wallet, in their currency. */
export async function adjustWalletAction(id: number, amount: number): Promise<ActionResult> {
  await requireUser("admin");
  if (!amount || Math.abs(amount) > 10_000_000) return { ok: false, error: "Enter a non-zero amount." };
  const r = await vendingSend<{ new_balance?: number; balance_display?: string }>(
    `/api/admin/resellers/${id}/wallet`,
    "POST",
    { amount },
  );
  revalidatePath("/admin/bot");
  return r.ok
    ? { ok: true, message: `New balance: ${r.data.balance_display ?? r.data.new_balance}` }
    : { ok: false, error: r.error };
}

/** Clear failed-attempt lock on a reseller. */
export async function unlockResellerAction(id: number): Promise<ActionResult> {
  await requireUser("admin");
  const r = await vendingSend(`/api/admin/resellers/${id}/unlock`, "POST");
  revalidatePath("/admin/bot");
  return r.ok ? { ok: true, message: "Unlocked." } : { ok: false, error: r.error };
}

/** Onboard a new reseller. phone=10 digits, secret_code=4 digits. */
export async function createResellerAction(input: {
  name: string;
  phone: string;
  secret_code: string;
  wallet_balance: number;
}): Promise<ActionResult> {
  await requireUser("admin");
  if (!/^\d{10}$/.test(input.phone)) return { ok: false, error: "Phone must be 10 digits." };
  if (!/^\d{4}$/.test(input.secret_code)) return { ok: false, error: "Secret code must be 4 digits." };
  const r = await vendingSend(`/api/admin/resellers`, "POST", {
    name: input.name,
    phone: input.phone,
    secret_code: input.secret_code,
    wallet_balance: input.wallet_balance || 0,
    currency: "INR",
  });
  revalidatePath("/admin/bot");
  return r.ok ? { ok: true, message: `Reseller "${input.name}" created.` } : { ok: false, error: r.error };
}

/** Bulk-add inventory links/keys to a product. */
export async function bulkUploadAction(productId: number, linksText: string): Promise<ActionResult> {
  await requireUser("admin");
  if (!productId) return { ok: false, error: "Pick a product." };
  if (!linksText.trim()) return { ok: false, error: "Paste at least one link or key." };
  const r = await vendingSend<{ added_count?: number; skipped_duplicates?: number; new_available_stock?: number }>(
    `/api/admin/inventory/bulk-upload`,
    "POST",
    { product_id: productId, links_text: linksText },
  );
  revalidatePath("/admin/bot");
  return r.ok
    ? {
        ok: true,
        message: `Added ${r.data.added_count}, skipped ${r.data.skipped_duplicates} duplicate(s). In stock: ${r.data.new_available_stock}.`,
      }
    : { ok: false, error: r.error };
}

/** Approve + deliver a pending customer order. */
export async function approveOrderAction(orderId: string): Promise<ActionResult> {
  await requireUser("admin");
  const r = await vendingSend<{ delivered_link?: string }>(`/api/admin/orders/${orderId}/approve`, "POST", {});
  revalidatePath("/admin/bot");
  return r.ok ? { ok: true, message: "Approved & delivered." } : { ok: false, error: r.error };
}

/** Cancel a customer order. */
export async function cancelOrderAction(orderId: string): Promise<ActionResult> {
  await requireUser("admin");
  const r = await vendingSend(`/api/admin/orders/${orderId}/cancel`, "POST", {});
  revalidatePath("/admin/bot");
  return r.ok ? { ok: true, message: "Cancelled." } : { ok: false, error: r.error };
}

/** Set / reset a reseller's 4-digit PIN (also clears any lock). */
export async function setPinAction(id: number, pin: string): Promise<ActionResult> {
  await requireUser("admin");
  if (!/^\d{4}$/.test(pin)) return { ok: false, error: "PIN must be 4 digits." };
  const r = await vendingSend(`/api/admin/resellers/${id}`, "PUT", { secret_code: pin });
  revalidatePath("/admin/bot");
  return r.ok ? { ok: true, message: "PIN updated." } : { ok: false, error: r.error };
}

/** Activate / deactivate a reseller. */
export async function setResellerActiveAction(id: number, active: boolean): Promise<ActionResult> {
  await requireUser("admin");
  const r = await vendingSend(`/api/admin/resellers/${id}`, "PUT", { is_active: active });
  revalidatePath("/admin/bot");
  return r.ok ? { ok: true, message: active ? "Activated." : "Deactivated." } : { ok: false, error: r.error };
}

/** Create a product. Customer price is derived from base_price + margin_percent. */
export async function createProductAction(input: {
  name: string;
  category: string;
  base_price: number;
  margin_percent: number;
  credit_cost: number;
}): Promise<ActionResult> {
  await requireUser("admin");
  if (!input.name.trim()) return { ok: false, error: "Name is required." };
  const r = await vendingSend(`/api/admin/products`, "POST", {
    name: input.name,
    category: input.category || "AI Tools",
    base_price: input.base_price || 0,
    margin_percent: input.margin_percent ?? 30,
    credit_cost: input.credit_cost || 1,
    is_active: true,
  });
  revalidatePath("/admin/bot");
  return r.ok ? { ok: true, message: `Product "${input.name}" created.` } : { ok: false, error: r.error };
}

/** Update a product (partial). */
export async function updateProductAction(
  id: number,
  patch: { base_price?: number; margin_percent?: number; credit_cost?: number; is_active?: boolean },
): Promise<ActionResult> {
  await requireUser("admin");
  const r = await vendingSend(`/api/admin/products/${id}`, "PUT", patch);
  revalidatePath("/admin/bot");
  return r.ok ? { ok: true, message: "Product updated." } : { ok: false, error: r.error };
}

/** Delete a product. */
export async function deleteProductAction(id: number): Promise<ActionResult> {
  await requireUser("admin");
  const r = await vendingSend(`/api/admin/products/${id}`, "DELETE");
  revalidatePath("/admin/bot");
  return r.ok ? { ok: true, message: "Product deleted." } : { ok: false, error: r.error };
}
