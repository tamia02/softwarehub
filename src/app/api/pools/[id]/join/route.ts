import { requireApiUser } from "@/lib/auth.server";
import { fail, json, unauthorized } from "@/lib/api";
import { joinPool } from "@/lib/pools.server";

export const runtime = "nodejs";

/** POST /api/pools/:id/join → seat order + gateway order (escrow) or seat reservation (single-payer) */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireApiUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  try {
    const r = await joinPool(id, user);
    return json({
      ok: true,
      seatNo: r.seatNo,
      orderId: r.order?.id ?? null,
      gateway: r.gateway?.gateway ?? null,
      gatewayOrderId: r.gateway?.gatewayOrderId ?? null,
      amountPaise: r.gateway?.amountPaise ?? 0,
      keyId: r.gateway?.keyId ?? null,
      prefill: { name: user.name, email: user.email, contact: user.phone },
    });
  } catch (err) {
    return fail(err instanceof Error ? err.message : "Could not join pool.");
  }
}
