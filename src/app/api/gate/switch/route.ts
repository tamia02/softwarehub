import { NextResponse, type NextRequest } from "next/server";
import { cookieNames } from "@/config/site";

/** GET /api/gate/switch — clears the role cookie and returns to the gate. */
export async function GET(req: NextRequest) {
  const url = new URL("/?switch=1", req.url);
  const host = req.headers.get("x-forwarded-host");
  const proto = req.headers.get("x-forwarded-proto");
  if (host) url.host = host;
  if (proto) url.protocol = `${proto}:`;
  const res = NextResponse.redirect(url);
  res.cookies.delete(cookieNames.role);
  res.cookies.delete(cookieNames.ref);
  return res;
}
