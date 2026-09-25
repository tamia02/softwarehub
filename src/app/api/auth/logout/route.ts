import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth.server";

export const runtime = "nodejs";

export async function POST() {
  await clearSession();
  return NextResponse.json({ ok: true, redirect: "/market" }, { headers: { "Cache-Control": "no-store" } });
}

export async function GET() {
  await clearSession();
  // Relative Location — the browser resolves it against the public origin, so it
  // works behind a proxy (never leaks the container's 0.0.0.0:3000 address).
  return new NextResponse(null, { status: 302, headers: { Location: "/market", "Cache-Control": "no-store" } });
}
