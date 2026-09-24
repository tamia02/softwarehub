import { z } from "zod";
import { requireApiUser } from "@/lib/auth.server";
import { fail, json, parseBody, unauthorized } from "@/lib/api";
import { createProductPurchase } from "@/lib/market.server";

export const runtime = "nodejs";

/** POST /api/market/buy {slug} → gateway order for a product purchase */
export async function POST(req: Request) {
  const user = await requireApiUser();
  if (!user) return unauthorized();
  const parsed = await parseBody(req, z.object({ slug: z.string().min(1).max(80) }));
  if ("error" in parsed) return parsed.error;
  try {
    const { gateway } = await createProductPurchase(user, parsed.data.slug);
    return json({ ok: true, gateway: gateway.gateway, gatewayOrderId: gateway.gatewayOrderId, amountPaise: gateway.amountPaise, keyId: gateway.keyId, prefill: { name: user.name, email: user.email, contact: user.phone } });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Could not start the purchase.");
  }
}
