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
/** Redirect using the public host (from the proxy's forwarded headers) so we
 *  never send the browser to the container's internal 0.0.0.0:3000 address. */
function redirect(req: NextRequest, to: string) {
  const url = new URL(to, req.url);
  const host = req.headers.get("x-forwarded-host");
  const proto = req.headers.get("x-forwarded-proto");
  if (host) url.host = host;
  if (proto) url.protocol = `${proto}:`;
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const roleCookie = req.cookies.get(cookieNames.role)?.value;

  if (pathname === "/") {
    if (roleCookie && !searchParams.has("switch")) {
      const to = roleCookie === "reseller" ? "/reseller" : roleCookie === "admin" ? "/admin" : "/market";
      return redirect(req, to);
    }
    return NextResponse.next();
  }

  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  const login = (next: string) => redirect(req, `/login?next=${encodeURIComponent(next)}`);

  if (pathname.startsWith("/admin")) {
    if (!session) return login(pathname);
    if (session.role !== "admin") return redirect(req, "/market");
  } else if (pathname.startsWith("/reseller")) {
    if (!session) {
      // Came through the reseller gate but not signed in yet → OTP, then back here.
      return login(pathname);
    }
    if (session.role !== "reseller" && session.role !== "admin") return redirect(req, "/?switch=1&role=reseller");
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
