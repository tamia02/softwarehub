import { z } from "zod";
import { requireApiUser } from "@/lib/auth.server";
import { fail, json, parseBody, tierSchema, unauthorized } from "@/lib/api";
import { createBundleCodes, createGateCodes } from "@/lib/codes.server";
import { retryAwaitingInventory } from "@/lib/orders.server";

export const runtime = "nodejs";

/**
 * POST /api/admin/codes/generate
 *   {kind:"bundle", tier, count, batch?}  |  {kind:"gate", type, count, label?, resellerId?, maxUses?}
 * Returns plaintext codes ONCE. They are never retrievable again.
 */
export async function POST(req: Request) {
  const user = await requireApiUser("admin");
  if (!user) return unauthorized();
  const parsed = await parseBody(
    req,
    z.discriminatedUnion("kind", [
      z.object({ kind: z.literal("bundle"), tier: tierSchema, count: z.number().int().min(1).max(500), batch: z.string().max(60).optional() }),
      z.object({ kind: z.literal("gate"), type: z.enum(["customer", "reseller"]), count: z.number().int().min(1).max(200), label: z.string().max(60).optional(), resellerId: z.string().optional(), maxUses: z.number().int().min(1).optional() }),
    ]),
  );
  if ("error" in parsed) return parsed.error;
  try {
    if (parsed.data.kind === "bundle") {
      const codes = await createBundleCodes({ tier: parsed.data.tier, count: parsed.data.count, batch: parsed.data.batch, actorId: user.id });
      const fulfilled = await retryAwaitingInventory(user.id);
      return json({ ok: true, codes, fulfilledWaitingOrders: fulfilled });
    }
    const codes = await createGateCodes({ ...parsed.data, actorId: user.id });
    return json({ ok: true, codes });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Generation failed.");
  }
}
