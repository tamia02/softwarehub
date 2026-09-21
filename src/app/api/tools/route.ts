import { NextResponse, type NextRequest } from "next/server";
import { getCatalog } from "@/lib/catalog.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/tools?tier=starter|pro — active catalog with INR retail */
export async function GET(req: NextRequest) {
  const tier = req.nextUrl.searchParams.get("tier");
  const c = await getCatalog();
  const list = tier === "starter" ? c.core : c.tools;
  return NextResponse.json({ usdInrRate: c.usdInrRate, tools: list });
}
