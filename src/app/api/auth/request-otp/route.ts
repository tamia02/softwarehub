import { z } from "zod";
import { requestOtp } from "@/lib/auth.server";
import { fail, json, parseBody } from "@/lib/api";
import { clientIp } from "@/lib/rate-limit.server";

export const runtime = "nodejs";

/** POST /api/auth/request-otp {identifier} → {channel, identifier, devCode?} */
export async function POST(req: Request) {
  const parsed = await parseBody(req, z.object({ identifier: z.string().min(3).max(120) }));
  if ("error" in parsed) return parsed.error;
  const r = await requestOtp(parsed.data.identifier, clientIp(req));
  if (!r.ok) return fail(r.error, 429);
  return json({ ok: true, channel: r.channel, identifier: r.identifier, devCode: r.devCode });
}
