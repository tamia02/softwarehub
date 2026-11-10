import { z } from "zod";
import { demoLoginAllowed, establishDemoSession } from "@/lib/auth.server";
import { fail, json, parseBody } from "@/lib/api";
import { clientIp, rateLimit } from "@/lib/rate-limit.server";

export const runtime = "nodejs";

/** Demo sign-in in dev, or private access to the existing admin in production. */
export async function POST(req: Request) {
  const parsed = await parseBody(req, z.object({
    role: z.enum(["customer", "reseller", "admin"]),
    adminKey: z.string().min(1).max(128).optional(),
  }));
  if ("error" in parsed) return parsed.error;
  if (!demoLoginAllowed()) {
    if (parsed.data.role !== "admin" || !parsed.data.adminKey) return fail("Demo sign-in is disabled.", 403);
    if (!rateLimit(`admin-access:${clientIp(req)}`, 10, 15 * 60 * 1000).allowed) {
      return fail("Too many attempts. Try again in a few minutes.", 429);
    }
  }
  const user = await establishDemoSession(parsed.data.role, parsed.data.adminKey);
  if (!user) return fail("The admin access key is incorrect.", 403);
  const home = user.role === "admin" ? "/admin" : user.role === "reseller" ? "/reseller" : "/account";
  return json({ ok: true, role: user.role, redirect: home });
}
