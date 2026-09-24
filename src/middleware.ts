import { NextResponse, type NextRequest } from "next/server";
import { cookieNames } from "@/config/site";
import { SESSION_COOKIE, verifySession } from "@/lib/session-edge";

/**
 * RBAC at the edge (§11 security):
 *  - "/"            → if a role is remembered (and not ?switch), skip the gate
 *  - "/account/*"   → any signed-in user
 *  - "/reseller/*"  → reseller or admin session
 *  - "/admin/*"     → admin session
 * Route handlers re-check the session server-side; this is the first line only.
 */
export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const roleCookie = req.cookies.get(cookieNames.role)?.value;

  if (pathname === "/") {
    if (roleCookie && !searchParams.has("switch")) {
      const to = roleCookie === "reseller" ? "/reseller" : roleCookie === "admin" ? "/admin" : "/market";
      return NextResponse.redirect(new URL(to, req.url));
    }
    return NextResponse.next();
  }

  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  const login = (next: string) => NextResponse.redirect(new URL(`/login?next=${encodeURIComponent(next)}`, req.url));

  if (pathname.startsWith("/admin")) {
    if (!session) return login(pathname);
    if (session.role !== "admin") return NextResponse.redirect(new URL("/market", req.url));
  } else if (pathname.startsWith("/reseller")) {
    if (!session) {
      // Came through the reseller gate but not signed in yet → OTP, then back here.
      return login(pathname);
    }
    if (session.role !== "reseller" && session.role !== "admin") return NextResponse.redirect(new URL("/?switch=1&role=reseller", req.url));
  } else if (pathname.startsWith("/account")) {
    if (!session) return login(pathname + req.nextUrl.search);
  }

  const res = NextResponse.next();
  res.headers.set("X-Frame-Options", "DENY");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return res;
}

export const config = {
  matcher: ["/", "/reseller/:path*", "/admin/:path*", "/account/:path*"],
};
