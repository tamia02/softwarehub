import { z } from "zod";
import { requireApiUser } from "@/lib/auth.server";
import { json, parseBody, unauthorized } from "@/lib/api";
import { tierRows, updateSettings } from "@/lib/admin.server";
import { getSettings } from "@/lib/settings.server";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireApiUser("admin");
  if (!user) return unauthorized();
  return json({ ok: true, settings: await getSettings(), tiers: await tierRows() });
}

/** PATCH /api/admin/settings {settings?, tiers?} — exchange rate, fee %, expiry, prices */
export async function PATCH(req: Request) {
  const user = await requireApiUser("admin");
  if (!user) return unauthorized();
  const parsed = await parseBody(
    req,
    z.object({
      settings: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
      tiers: z.object({ starter: z.number().int().optional(), pro: z.number().int().optional(), starterReseller: z.number().int().optional(), proReseller: z.number().int().optional() }).optional(),
    }),
  );
  if ("error" in parsed) return parsed.error;
  await updateSettings(user, (parsed.data.settings ?? {}) as Parameters<typeof updateSettings>[1], parsed.data.tiers);
  return json({ ok: true, settings: await getSettings() });
}
