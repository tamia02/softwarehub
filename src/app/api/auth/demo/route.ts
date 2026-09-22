import { z } from "zod";
import { demoLoginAllowed, establishDemoSession } from "@/lib/auth.server";
import { fail, json, parseBody } from "@/lib/api";

export const runtime = "nodejs";

/** POST /api/auth/demo {role} → one-click demo sign-in (no OTP). Demo/dev only. */
export async function POST(req: Request) {
  if (!demoLoginAllowed()) return fail("Demo sign-in is disabled.", 403);
  const parsed = await parseBody(req, z.object({ role: z.enum(["customer", "reseller", "admin"]) }));
  if ("error" in parsed) return parsed.error;
  const user = await establishDemoSession(parsed.data.role);
  const home = user.role === "admin" ? "/admin" : user.role === "reseller" ? "/reseller" : "/account";
  return json({ ok: true, role: user.role, redirect: home });
}
