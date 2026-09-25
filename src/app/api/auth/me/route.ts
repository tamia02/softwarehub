import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookieNames } from "@/config/site";
import { demoLoginAllowed, getSessionUser } from "@/lib/auth.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/auth/me — lightweight session probe for the client-rendered header. */
export async function GET() {
  const user = await getSessionUser();
  const jar = await cookies();
  const gateRole = jar.get(cookieNames.role)?.value ?? null;
  return NextResponse.json(
    { signedIn: !!user, role: user?.role ?? gateRole, name: user?.name ?? null, demo: demoLoginAllowed() },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
