import { requireApiUser } from "@/lib/auth.server";
import { json, unauthorized } from "@/lib/api";
import { resellerRevenue } from "@/lib/reseller.server";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireApiUser("reseller");
  if (!user) return unauthorized();
  return json({ ok: true, ...(await resellerRevenue(user.id)) });
}
