import { z } from "zod";
import { requireApiUser } from "@/lib/auth.server";
import { fail, json, parseBody, tierSchema, unauthorized } from "@/lib/api";
import { shortId } from "@/lib/ids";
import { buyResellerCode } from "@/lib/reseller.server";

export const runtime = "nodejs";

/** POST /api/reseller/codes/buy {tier} → gateway order at reseller price */
export async function POST(req: Request) {
  const user = await requireApiUser("reseller");
  if (!user) return unauthorized();
  const parsed = await parseBody(req, z.object({ tier: tierSchema, idempotencyKey: z.string().min(8).max(80).optional() }));
  if ("error" in parsed) return parsed.error;
  try {
    const { order, gateway } = await buyResellerCode(user, parsed.data.tier, parsed.data.idempotencyKey ?? `rcode:${user.id}:${shortId(10)}`);
    return json({ ok: true, orderId: order.id, gateway: gateway.gateway, gatewayOrderId: gateway.gatewayOrderId, amountPaise: gateway.amountPaise, keyId: gateway.keyId, prefill: { name: user.name, email: user.email, contact: user.phone } });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Could not create order.");
  }
}
