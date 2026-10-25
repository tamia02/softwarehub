import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { establishSession } from "@/lib/auth.server";
import { GOOGLE_STATE_COOKIE, googleConfigured, googleProfileFromCode, userForGoogle } from "@/lib/google-auth.server";
import { clientIp, rateLimit } from "@/lib/rate-limit.server";

export const runtime = "nodejs";

/** GET /api/auth/google/callback?code=…&state=… — Google sends the user back here. */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? url.origin;
  const back = (path: string) => {
    const res = NextResponse.redirect(new URL(path, origin));
    res.cookies.delete(GOOGLE_STATE_COOKIE);
    return res;
  };

  if (!googleConfigured()) return back("/login?error=google-off");
  const rl = rateLimit(`g-login:${clientIp(req)}`, 20, 10 * 60 * 1000);
  if (!rl.allowed) return back("/login?error=rate");

  const [expected = "", next = "/account"] = (req.cookies.get(GOOGLE_STATE_COOKIE)?.value ?? "").split("|");
  const state = url.searchParams.get("state") ?? "";
  const code = url.searchParams.get("code") ?? "";
  const stateOk = expected.length > 0 && expected.length === state.length && timingSafeEqual(Buffer.from(expected), Buffer.from(state));
  if (!stateOk || !code) return back("/login?error=google");

  const profile = await googleProfileFromCode(origin, code);
  if (!profile) return back("/login?error=google");

  const user = await establishSession(await userForGoogle(profile));
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  return back(user.role === "admin" ? "/admin" : user.role === "reseller" && safeNext === "/account" ? "/reseller" : safeNext);
}
