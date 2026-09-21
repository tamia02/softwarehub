import { z } from "zod";
import { requireApiUser } from "@/lib/auth.server";
import { fail, json, parseBody, tierSchema, unauthorized } from "@/lib/api";
import { createPool, listOpenPools } from "@/lib/pools.server";

export const runtime = "nodejs";

/** GET /api/pools — open pools for the carousel */
export async function GET() {
  const pools = await listOpenPools(12);
  return json({ ok: true, pools: pools.map((p) => ({ id: p.id, tier: p.tierId, name: p.name, seats: p.seats, filled: p.filled, seatPricePaise: p.seatPricePaise, expiresAt: p.expiresAt })) });
}

/** POST /api/pools {tier, seats, name?, distributionMode?, splitMode?, paymentModel?, splitJson?} (auth) */
export async function POST(req: Request) {
  const user = await requireApiUser();
  if (!user) return unauthorized();
  const parsed = await parseBody(
    req,
    z.object({
      tier: tierSchema,
      seats: z.number().int().min(2).max(50),
      name: z.string().max(60).optional(),
      distributionMode: z.enum(["shared", "assigned"]).optional(),
      splitMode: z.enum(["reseller_keeps", "share_equal", "custom"]).optional(),
      paymentModel: z.enum(["escrow", "single"]).optional(),
      splitJson: z.record(z.string(), z.number()).optional(),
      asReseller: z.boolean().optional(),
    }),
  );
  if ("error" in parsed) return parsed.error;
  try {
    const pool = await createPool({ user, ...parsed.data });
    return json({ ok: true, pool: { id: pool.id, status: pool.status, seatPricePaise: pool.seatPricePaise, expiresAt: pool.expiresAt } });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Could not create pool.");
  }
}
