import { NextResponse, type NextRequest } from "next/server";
import { cookieNames } from "@/config/site";

/**
 * Role gate:
 *  - "/"            → if a role is remembered (and not ?switch), skip the gate
 *  - "/reseller/*"  → requires the reseller (or admin) role
 *  - "/admin/*"     → requires the admin role
 *  - "/account/*"   → requires any role (auth proper arrives in Phase 2)
 */
export function middleware(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const role = req.cookies.get(cookieNames.role)?.value;

  if (pathname === "/") {
    if (role && !searchParams.has("switch")) {
      const to = role === "reseller" ? "/reseller" : role === "admin" ? "/admin" : "/home";
      return NextResponse.redirect(new URL(to, req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/reseller")) {
    if (role !== "reseller" && role !== "admin") {
      return NextResponse.redirect(new URL("/?switch=1&role=reseller", req.url));
    }
  }

  if (pathname.startsWith("/admin")) {
    if (role !== "admin") {
      return NextResponse.redirect(new URL("/?switch=1", req.url));
    }
  }

  if (pathname.startsWith("/account")) {
    if (!role) {
      return NextResponse.redirect(new URL("/?switch=1", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/reseller/:path*", "/admin/:path*", "/account/:path*"],
};
