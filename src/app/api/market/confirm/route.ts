import { z } from "zod";
import { requireApiUser } from "@/lib/auth.server";
import { fail, json, parseBody, unauthorized } from "@/lib/api";
import { confirmProductPurchase } from "@/lib/market.server";

export const runtime = "nodejs";

/** POST /api/market/confirm {marketOrderId} → release escrow to the reseller */
export async function POST(req: Request) {
  const user = await requireApiUser();
  if (!user) return unauthorized();
  const parsed = await parseBody(req, z.object({ marketOrderId: z.string().min(1).max(80) }));
  if ("error" in parsed) return parsed.error;
  const ok = await confirmProductPurchase(parsed.data.marketOrderId, user.id);
  return ok ? json({ ok: true }) : fail("Could not confirm this order.", 400);
}
