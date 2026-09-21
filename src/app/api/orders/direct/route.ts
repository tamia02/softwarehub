import { z } from "zod";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireApiUser } from "@/lib/auth.server";
import { fail, json, parseBody, tierSchema, unauthorized } from "@/lib/api";
import { createOrder } from "@/lib/orders.server";
import { shortId } from "@/lib/ids";

export const runtime = "nodejs";

/** POST /api/orders/direct {tier, idempotencyKey?, gstin?, name?} → gateway order for the checkout widget */
export async function POST(req: Request) {
  const user = await requireApiUser();
  if (!user) return unauthorized();
  const parsed = await parseBody(
    req,
    z.object({ tier: tierSchema, idempotencyKey: z.string().min(8).max(80).optional(), gstin: z.string().max(15).optional(), name: z.string().max(80).optional() }),
  );
  if ("error" in parsed) return parsed.error;

  const db = await getDb();
  const [tier] = await db.select().from(schema.tiers).where(eq(schema.tiers.id, parsed.data.tier));
  if (!tier || !tier.active) return fail("Tier unavailable.");
  if (parsed.data.gstin !== undefined || parsed.data.name) {
    await db
      .update(schema.users)
      .set({ gstin: parsed.data.gstin ? parsed.data.gstin.toUpperCase() : user.gstin, name: parsed.data.name || user.name })
      .where(eq(schema.users.id, user.id));
  }

  const { order, gateway } = await createOrder({
    user,
    type: "direct",
    tier: parsed.data.tier,
    amountPaise: tier.pricePaise,
    idempotencyKey: parsed.data.idempotencyKey ?? `direct:${user.id}:${shortId(10)}`,
  });
  return json({
    ok: true,
    orderId: order.id,
    gateway: gateway.gateway,
    gatewayOrderId: gateway.gatewayOrderId,
    amountPaise: gateway.amountPaise,
    keyId: gateway.keyId,
    prefill: { name: user.name, email: user.email, contact: user.phone },
  });
}
