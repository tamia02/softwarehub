import { z } from "zod";
import { requireApiUser } from "@/lib/auth.server";
import { fail, json, parseBody, unauthorized } from "@/lib/api";
import { onPaymentCaptured } from "@/lib/orders.server";
import { mockGatewayAllowed, mockPaymentId } from "@/lib/payments.server";

export const runtime = "nodejs";

/**
 * POST /api/payments/mock-capture {gatewayOrderId}
 * Dev-only stand-in for the Razorpay Checkout widget: simulates a captured
 * payment through the exact same code path. Disabled when real keys exist.
 */
export async function POST(req: Request) {
  if (!mockGatewayAllowed()) return fail("Mock gateway disabled.", 404);
  const user = await requireApiUser();
  if (!user) return unauthorized();
  const parsed = await parseBody(req, z.object({ gatewayOrderId: z.string() }));
  if ("error" in parsed) return parsed.error;
  const paymentId = mockPaymentId();
  try {
    const { order } = await onPaymentCaptured({ gatewayOrderId: parsed.data.gatewayOrderId, gatewayPaymentId: paymentId, raw: { source: "mock" } });
    if (order.userId !== user.id && user.role !== "admin") return fail("Order does not belong to you.", 403);
    return json({ ok: true, orderId: order.id, status: order.status, paymentId, meta: order.metaJson });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Capture failed.", 400);
  }
}
