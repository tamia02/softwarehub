import { json, fail } from "@/lib/api";
import { getPool } from "@/lib/pools.server";

export const runtime = "nodejs";

/** GET /api/pools/:id — public pool state (no member PII) */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const d = await getPool(id);
  if (!d) return fail("Pool not found.", 404);
  return json({
    ok: true,
    pool: {
      id: d.pool.id,
      tier: d.pool.tierId,
      name: d.pool.name,
      status: d.pool.status,
      seats: d.pool.seats,
      paidSeats: d.paidSeats,
      seatsLeft: d.seatsLeft,
      seatPricePaise: d.pool.seatPricePaise,
      expiresAt: d.pool.expiresAt,
      paymentModel: d.pool.paymentModel,
      distributionMode: d.pool.distributionMode,
    },
  });
}
