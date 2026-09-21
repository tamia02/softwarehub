import { NextResponse, type NextRequest } from "next/server";
import { clearSession } from "@/lib/auth.server";

export const runtime = "nodejs";

export async function POST() {
  await clearSession();
  return NextResponse.json({ ok: true, redirect: "/home" }, { headers: { "Cache-Control": "no-store" } });
}

export async function GET(req: NextRequest) {
  await clearSession();
  return NextResponse.redirect(new URL("/home", req.url));
}
