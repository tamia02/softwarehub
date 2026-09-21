import "server-only";
import { hmacSha256Hex } from "./crypto.server";
import { shortId } from "./ids";

/**
 * Payment gateway abstraction. Razorpay when RAZORPAY_KEY_ID/SECRET are set,
 * otherwise a mock gateway that behaves the same way (orders, captures,
 * refunds) so the whole purchase → fulfilment path runs locally.
 */

export type GatewayName = "razorpay" | "mock";

export interface GatewayOrder {
  gateway: GatewayName;
  gatewayOrderId: string;
  amountPaise: number;
  keyId: string;
}

export const gatewayName = (): GatewayName => (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET ? "razorpay" : "mock");

/** The mock gateway may only capture payments outside production, or on a staging box that opts in explicitly. */
export const mockGatewayAllowed = () => gatewayName() === "mock" && (process.env.NODE_ENV !== "production" || process.env.ALLOW_MOCK_GATEWAY === "true");

let rzpClient: import("razorpay") | null = null;
async function razorpay() {
  if (!rzpClient) {
    const Razorpay = (await import("razorpay")).default;
    rzpClient = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID!, key_secret: process.env.RAZORPAY_KEY_SECRET! });
  }
  return rzpClient;
}

export async function createGatewayOrder(opts: { amountPaise: number; receipt: string; notes?: Record<string, string> }): Promise<GatewayOrder> {
  if (gatewayName() === "razorpay") {
    const rzp = await razorpay();
    const order = await rzp.orders.create({ amount: opts.amountPaise, currency: "INR", receipt: opts.receipt, notes: opts.notes });
    return { gateway: "razorpay", gatewayOrderId: order.id, amountPaise: opts.amountPaise, keyId: process.env.RAZORPAY_KEY_ID! };
  }
  return { gateway: "mock", gatewayOrderId: `order_mock_${shortId(12)}`, amountPaise: opts.amountPaise, keyId: "rzp_test_mock" };
}

/** Razorpay Checkout handler signature: HMAC(order_id|payment_id). */
export function verifyCheckoutSignature(gatewayOrderId: string, gatewayPaymentId: string, signature: string): boolean {
  if (gatewayName() === "mock") return signature === mockSignature(gatewayOrderId, gatewayPaymentId);
  return hmacSha256Hex(process.env.RAZORPAY_KEY_SECRET!, `${gatewayOrderId}|${gatewayPaymentId}`) === signature;
}

/** Webhook signature: HMAC(raw body) with the webhook secret. */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  return hmacSha256Hex(secret, rawBody) === signature;
}

export async function refundPayment(gatewayPaymentId: string, amountPaise: number, notes?: Record<string, string>) {
  if (gatewayName() === "razorpay") {
    const rzp = await razorpay();
    const refund = await rzp.payments.refund(gatewayPaymentId, { amount: amountPaise, speed: "optimum", notes });
    return { refundId: refund.id, status: refund.status };
  }
  return { refundId: `rfnd_mock_${shortId(12)}`, status: "processed" };
}

/** Mock helpers — only meaningful when the mock gateway is active. */
export function mockSignature(gatewayOrderId: string, gatewayPaymentId: string) {
  return hmacSha256Hex("mock-secret", `${gatewayOrderId}|${gatewayPaymentId}`);
}
export function mockPaymentId() {
  return `pay_mock_${shortId(12)}`;
}
