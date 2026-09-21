import { json, fail } from "@/lib/api";
import { onPaymentCaptured, onRefundProcessed } from "@/lib/orders.server";
import { verifyWebhookSignature } from "@/lib/payments.server";

export const runtime = "nodejs";

interface RzpEvent {
  event?: string;
  payload?: {
    payment?: { entity?: { id: string; order_id: string; amount: number } };
    refund?: { entity?: { id: string; payment_id: string } };
  };
}

/**
 * POST /api/webhooks/razorpay — payment.captured / refund.processed.
 * Signature is verified over the raw body; handlers are idempotent.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  if (!verifyWebhookSignature(raw, req.headers.get("x-razorpay-signature"))) return fail("Invalid signature.", 401);

  let event: RzpEvent;
  try {
    event = JSON.parse(raw);
  } catch {
    return fail("Invalid payload.");
  }

  try {
    if (event.event === "payment.captured" && event.payload?.payment?.entity) {
      const p = event.payload.payment.entity;
      await onPaymentCaptured({ gatewayOrderId: p.order_id, gatewayPaymentId: p.id, amountPaise: p.amount, raw: { source: "webhook", event } });
    } else if (event.event === "refund.processed" && event.payload?.refund?.entity) {
      const r = event.payload.refund.entity;
      await onRefundProcessed(r.payment_id, r.id);
    }
  } catch (err) {
    // 200 so Razorpay does not retry a permanent failure; the audit log has the detail.
    console.error("[webhook]", err);
  }
  return json({ ok: true });
}
