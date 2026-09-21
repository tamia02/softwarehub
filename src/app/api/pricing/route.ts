import { NextResponse } from "next/server";
import { allPricing } from "@/lib/pricing";

/** GET /api/pricing — tiers + computed INR retail from settings. */
export function GET() {
  return NextResponse.json(allPricing());
}
