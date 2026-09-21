import { eq, inArray } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { requireApiUser } from "@/lib/auth.server";
import { fail, unauthorized } from "@/lib/api";
import { splitToCsv, type SplitResult } from "@/lib/split";

export const runtime = "nodejs";

/** GET /api/reseller/pools/:id/statement → CSV revenue statement */
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireApiUser(["reseller", "admin"]);
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const db = await getDb();
  const [pool] = await db.select().from(schema.pools).where(eq(schema.pools.id, id));
  if (!pool) return fail("Pool not found.", 404);
  if (user.role !== "admin" && pool.resellerId !== user.id) return fail("Not your pool.", 403);
  const s = pool.settlementJson as SplitResult | null;
  if (!s || !("memberShares" in s)) return fail("No statement yet — the pool is not fulfilled.", 404);
  const ids = s.memberShares.map((m) => m.userId);
  const users = ids.length ? await db.select().from(schema.users).where(inArray(schema.users.id, ids)) : [];
  const names = Object.fromEntries(users.map((u) => [u.id, u.name ?? u.email ?? u.phone ?? u.id]));
  return new Response(splitToCsv(s, names), {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="pool-${id}-statement.csv"` },
  });
}
