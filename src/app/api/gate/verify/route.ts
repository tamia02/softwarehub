import { NextResponse, type NextRequest } from "next/server";
import { cookieNames } from "@/config/site";
import { PENDING_RESELLER_COOKIE } from "@/lib/auth.server";
import { normalizeCode, preflightGateCode } from "@/lib/codes";
import { recordGateFailure, verifyGateCode } from "@/lib/codes.server";
import { clearRateLimit, clientIp, rateLimit } from "@/lib/rate-limit.server";
import { roleCookieOptions } from "@/lib/role.server";

export const runtime = "nodejs";

/**
 * POST /api/gate/verify  {code, role?}
 *  - role "customer" with no code → browse as customer (no attribution)
 *  - customer code → role cookie + reseller attribution cookie
 *  - reseller code → role cookie + pending-reseller cookie, then OTP sign-in binds it
 */
export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  const rl = rateLimit(`gate:${ip}`, 5, 10 * 60 * 1000);
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

  if (!code && requested === "customer") {
    const res = NextResponse.json({ ok: true, role: "customer", redirect: "/market" });
    res.cookies.set(cookieNames.role, "customer", roleCookieOptions());
    res.cookies.delete(cookieNames.ref);
    return res;
  }

  const pre = preflightGateCode(code);
  if (pre) return NextResponse.json({ ok: false, error: pre }, { status: 400 });

  const result = await verifyGateCode(code);
  if (!result.ok || !result.role) {
    await recordGateFailure(code);
    return NextResponse.json({ ok: false, error: result.error ?? "Invalid code." }, { status: 401 });
  }

  if (result.role !== requested) {
    const msg =
      requested === "reseller"
        ? "That is a customer code. Choose “I’m a customer” to continue."
        : "That is a reseller code. Choose “I’m a reseller” to continue.";
    return NextResponse.json({ ok: false, error: msg }, { status: 400 });
  }

  clearRateLimit(`gate:${ip}`);
  const res = NextResponse.json({ ok: true, role: result.role, redirect: result.redirect });
  res.cookies.set(cookieNames.role, result.role, roleCookieOptions());
  if (result.role === "reseller" && result.gateCodeId) {
    res.cookies.set(PENDING_RESELLER_COOKIE, result.gateCodeId, { ...roleCookieOptions(), maxAge: 60 * 60 });
  }
  if (result.resellerId) {
    res.cookies.set(cookieNames.ref, result.resellerId, roleCookieOptions());
  }
  return res;
}
