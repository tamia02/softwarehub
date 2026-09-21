import { z } from "zod";
import { requireApiUser } from "@/lib/auth.server";
import { fail, json, parseBody, unauthorized } from "@/lib/api";
import { onPaymentCaptured } from "@/lib/orders.server";
import { verifyCheckoutSignature } from "@/lib/payments.server";

export const runtime = "nodejs";

/** POST /api/payments/verify — Razorpay Checkout success handler (signature-verified). */
export async function POST(req: Request) {
  const user = await requireApiUser();
  if (!user) return unauthorized();
  const parsed = await parseBody(req, z.object({ razorpay_order_id: z.string(), razorpay_payment_id: z.string(), razorpay_signature: z.string() }));
  if ("error" in parsed) return parsed.error;
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;
  if (!verifyCheckoutSignature(razorpay_order_id, razorpay_payment_id, razorpay_signature)) return fail("Payment signature invalid.", 400);
  try {
    const { order } = await onPaymentCaptured({ gatewayOrderId: razorpay_order_id, gatewayPaymentId: razorpay_payment_id, raw: { source: "checkout" } });
    if (order.userId !== user.id && user.role !== "admin") return fail("Order does not belong to you.", 403);
    return json({ ok: true, orderId: order.id, status: order.status, meta: order.metaJson });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Could not verify payment.", 400);
  }
}
