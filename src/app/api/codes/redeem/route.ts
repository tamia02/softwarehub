import { z } from "zod";
import { requireApiUser } from "@/lib/auth.server";
import { fail, json, parseBody, unauthorized } from "@/lib/api";
import { codeKind, hasValidCheckChar, normalizeCode } from "@/lib/codes";
import { redeemBundleCode } from "@/lib/passes.server";
import { clientIp, rateLimit } from "@/lib/rate-limit.server";

export const runtime = "nodejs";

/** POST /api/codes/redeem {bundle_code} → pass */
export async function POST(req: Request) {
  const user = await requireApiUser();
  if (!user) return unauthorized();
  const rl = rateLimit(`redeem:${clientIp(req)}`, 5, 10 * 60 * 1000);
  if (!rl.allowed) return fail("Too many attempts. Try again in a few minutes.", 429);
  const parsed = await parseBody(req, z.object({ bundle_code: z.string().min(8).max(40) }));
  if ("error" in parsed) return parsed.error;
  const code = normalizeCode(parsed.data.bundle_code);
  const kind = codeKind(code);
  if (kind !== "bundle-pro" && kind !== "bundle-starter") return fail("That is not a bundle code.");
  if (code.length !== 16 || !hasValidCheckChar(code)) return fail("That code has a typo — please check it.");
  const r = await redeemBundleCode(user, code);
  return r.ok ? json({ ok: true, passId: r.passId }) : fail(r.error);
}
