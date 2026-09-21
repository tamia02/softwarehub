import { NextResponse } from "next/server";
import { getCatalog } from "@/lib/catalog.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/pricing — tiers + computed INR retail from settings */
export async function GET() {
  const c = await getCatalog();
  return NextResponse.json(c.pricing);
}
