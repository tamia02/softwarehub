import { z } from "zod";
import { requireApiUser } from "@/lib/auth.server";
import { fail, json, parseBody, unauthorized } from "@/lib/api";
import { mockGatewayAllowed } from "@/lib/payments.server";
import { creditWallet } from "@/lib/wallet.server";

export const runtime = "nodejs";

/** POST /api/wallet/topup — add funds. Demo: credits directly when the mock
 *  gateway is enabled. (Wire to Razorpay for real money.) */
export async function POST(req: Request) {
  const user = await requireApiUser();
  if (!user) return unauthorized();
  const p = await parseBody(req, z.object({ amount: z.number().int().min(10).max(100000) }));
  if ("error" in p) return p.error;
  if (!mockGatewayAllowed()) return fail("Online top-up isn't configured yet.", 400);
  const balance = await creditWallet(user.id, p.data.amount * 100, "deposit", undefined, "Wallet top-up (demo)");
  return json({ ok: true, balancePaise: balance });
}
