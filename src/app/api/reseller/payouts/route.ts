import { z } from "zod";
import { requireApiUser } from "@/lib/auth.server";
import { fail, json, parseBody, unauthorized } from "@/lib/api";
import { requestPayout, resellerRevenue } from "@/lib/reseller.server";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireApiUser("reseller");
  if (!user) return unauthorized();
  const r = await resellerRevenue(user.id);
  return json({ ok: true, availablePaise: r.availablePaise, payouts: r.payouts });
}

/** POST /api/reseller/payouts {amountPaise} */
export async function POST(req: Request) {
  const user = await requireApiUser("reseller");
  if (!user) return unauthorized();
  const parsed = await parseBody(req, z.object({ amountPaise: z.number().int().positive() }));
  if ("error" in parsed) return parsed.error;
  const r = await requestPayout(user, parsed.data.amountPaise);
  return r.ok ? json({ ok: true, payout: r.payout }) : fail(r.error);
}
