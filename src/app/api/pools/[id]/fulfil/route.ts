import { requireApiUser } from "@/lib/auth.server";
import { fail, json, unauthorized } from "@/lib/api";
import { fulfilPool, getPool } from "@/lib/pools.server";

export const runtime = "nodejs";

/** POST /api/pools/:id/fulfil — reseller (own pool) or admin; assigns a bundle code, creates passes */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireApiUser(["reseller", "admin"]);
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const d = await getPool(id);
  if (!d) return fail("Pool not found.", 404);
  if (user.role !== "admin" && d.pool.resellerId !== user.id) return fail("Not your pool.", 403);
  const r = await fulfilPool(id, user.id);
  return r.ok ? json({ ok: true }) : fail(r.error ?? "Could not fulfil.");
}
