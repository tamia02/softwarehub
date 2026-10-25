import { z } from "zod";
import { requireApiUser } from "@/lib/auth.server";
import { fail, json, parseBody, unauthorized } from "@/lib/api";
import { LuciferError, placeLuciferOrder } from "@/lib/lucifer.server";
import { clientIp, rateLimit } from "@/lib/rate-limit.server";
import { formatINRPrecise } from "@/lib/format";

export const runtime = "nodejs";

/**
 * POST /api/lucifer/order {ref, qty} — buys from the signed-in user's Lucifer
 * wallet. The Telegram id always comes from the session, never the request.
 */
export async function POST(req: Request) {
  const user = await requireApiUser();
  if (!user) return unauthorized();
  if (!user.telegramId) return fail("Connect your Telegram account to buy with your wallet.", 403);

  const rl = rateLimit(`lucifer-order:${user.id}:${clientIp(req)}`, 10, 60 * 1000);
  if (!rl.allowed) return fail("Too many orders in a minute. Please wait a moment.", 429);

  const parsed = await parseBody(req, z.object({ ref: z.string().regex(/^\d{1,20}$/), qty: z.number().int().min(1).max(100) }));
  if ("error" in parsed) return parsed.error;

  try {
    const order = await placeLuciferOrder(user.telegramId, parsed.data.ref, parsed.data.qty);
    return json({ ok: true, order });
  } catch (e) {
    if (e instanceof LuciferError) {
      if (e.status === 402) {
        const need = Math.round(Number(e.body?.needed_inr ?? 0) * 100);
        const have = Math.round(Number(e.body?.balance_inr ?? 0) * 100);
        return fail(`Not enough balance — this needs ${formatINRPrecise(need)}, your wallet has ${formatINRPrecise(have)}. Top up in the bot and try again.`, 402);
      }
      if (e.status === 409) return fail("Not enough stock for that quantity right now.", 409);
      if (e.status === 404) return fail("This product is no longer available.", 404);
      if (e.status === 503) return fail("The store is unreachable right now. Please try again shortly.", 503);
    }
    return fail("Could not place the order. Please try again.", 502);
  }
}
