import { NextResponse, type NextRequest } from "next/server";
import { settings } from "@/config/site";
import { tools, toolsForTier } from "@/data/tools";
import { toolRetailPaise } from "@/lib/pricing";

/** GET /api/tools?tier=starter|pro */
export function GET(req: NextRequest) {
  const tier = req.nextUrl.searchParams.get("tier");
  const list = tier === "starter" || tier === "pro" ? toolsForTier(tier) : tools;
  return NextResponse.json({
    usdInrRate: settings.usdInrRate,
    tools: list.map((t) => ({ ...t, retailPaise: toolRetailPaise(t) })),
  });
}
