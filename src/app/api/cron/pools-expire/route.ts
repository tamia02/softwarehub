import { fail, json } from "@/lib/api";
import { cronAuthorized } from "@/lib/cron.server";
import { expirePools } from "@/lib/pools.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/cron/pools-expire — expires unfilled pools past their deadline and refunds every paid seat. */
export async function GET(req: Request) {
  if (!cronAuthorized(req)) return fail("Unauthorized", 401);
  const r = await expirePools();
  return json({ ok: true, ...r });
}
