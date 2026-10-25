import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { GOOGLE_STATE_COOKIE, googleAuthUrl, googleConfigured } from "@/lib/google-auth.server";

export const runtime = "nodejs";

/** GET /api/auth/google?next=/path — start "Continue with Google". */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? url.origin;
  if (!googleConfigured()) return NextResponse.redirect(new URL("/login?error=google-off", origin));

  const next = url.searchParams.get("next");
  const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/account";
  const state = randomBytes(24).toString("hex");

  const res = NextResponse.redirect(googleAuthUrl(origin, state));
  // state guards against CSRF; next rides along so we can return the user where they were.
  res.cookies.set(GOOGLE_STATE_COOKIE, `${state}|${safeNext}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 10 * 60,
  });
  return res;
}
