import { NextResponse, type NextRequest } from "next/server";
import { cookieNames } from "@/config/site";

/** GET /api/gate/switch — clears the role cookie and returns to the gate. */
export async function GET(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/?switch=1", req.url));
  res.cookies.delete(cookieNames.role);
  res.cookies.delete(cookieNames.ref);
  return res;
}
