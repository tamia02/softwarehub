import { NextResponse, type NextRequest } from "next/server";
import { cookieNames } from "@/config/site";
import { normalizeCode, preflightGateCode } from "@/lib/codes";
import { clearRateLimit, rateLimit, verifyGateCode } from "@/lib/codes.server";
import { roleCookieOptions } from "@/lib/role.server";

export const runtime = "nodejs";

/**
 * POST /api/gate/verify  {code, role?}
 *  - role "customer" with no code → browse as customer (no attribution)
 *  - otherwise verify the code, set the role cookie, return the redirect
 */
export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  const rl = rateLimit(ip);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: `Too many attempts. Try again in ${Math.ceil(rl.retryAfterSec / 60)} min.` },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }

  let body: { code?: string; role?: string } = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const code = typeof body.code === "string" ? normalizeCode(body.code) : "";
  const requested = body.role === "reseller" ? "reseller" : "customer";

  // Customer without a code → browse & buy, no attribution.
  if (!code && requested === "customer") {
    const res = NextResponse.json({ ok: true, role: "customer", redirect: "/home" });
    res.cookies.set(cookieNames.role, "customer", roleCookieOptions());
    res.cookies.delete(cookieNames.ref);
    return res;
  }

  const pre = preflightGateCode(code);
  if (pre) return NextResponse.json({ ok: false, error: pre }, { status: 400 });

  const result = verifyGateCode(code);
  if (!result.ok || !result.role) {
    return NextResponse.json({ ok: false, error: result.error ?? "Invalid code." }, { status: 401 });
  }

  if (result.role !== requested) {
    const msg =
      requested === "reseller"
        ? "That is a customer code. Choose “I’m a customer” to continue."
        : "That is a reseller code. Choose “I’m a reseller” to continue.";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  clearRateLimit(ip);
  const res = NextResponse.json({ ok: true, role: result.role, redirect: result.redirect });
  res.cookies.set(cookieNames.role, result.role, roleCookieOptions());
  if (result.resellerId) {
    res.cookies.set(cookieNames.ref, result.resellerId, roleCookieOptions());
  }
  return res;
}
