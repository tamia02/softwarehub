import { requireApiUser } from "@/lib/auth.server";
import { fail, json, unauthorized } from "@/lib/api";
import { paySinglePool } from "@/lib/pools.server";

export const runtime = "nodejs";

/** POST /api/pools/:id/pay — single-payer pools: creator pays the whole bundle */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireApiUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  try {
    const { order, gateway } = await paySinglePool(id, user);
    return json({ ok: true, orderId: order.id, gateway: gateway.gateway, gatewayOrderId: gateway.gatewayOrderId, amountPaise: gateway.amountPaise, keyId: gateway.keyId, prefill: { name: user.name, email: user.email, contact: user.phone } });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Could not create order.");
  }
}
