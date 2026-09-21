import { z } from "zod";
import { establishSession, verifyOtp } from "@/lib/auth.server";
import { fail, json, parseBody } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rate-limit.server";

export const runtime = "nodejs";

/** POST /api/auth/verify-otp {identifier, code, next?} → {redirect} */
export async function POST(req: Request) {
  const rl = rateLimit(`otp-verify:${clientIp(req)}`, 15, 10 * 60 * 1000);
  if (!rl.allowed) return fail("Too many attempts. Try again later.", 429);
  const parsed = await parseBody(req, z.object({ identifier: z.string().min(3), code: z.string().regex(/^\d{6}$/), next: z.string().optional() }));
  if ("error" in parsed) return parsed.error;
  const r = await verifyOtp(parsed.data.identifier, parsed.data.code);
  if (!r.ok) return fail(r.error, 401);
  const user = await establishSession(r.user);
  const next = parsed.data.next && parsed.data.next.startsWith("/") && !parsed.data.next.startsWith("//") ? parsed.data.next : null;
  const home = user.role === "admin" ? "/admin" : user.role === "reseller" ? "/reseller" : "/account";
  return json({ ok: true, role: user.role, redirect: next ?? home });
}
