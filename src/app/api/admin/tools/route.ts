import { z } from "zod";
import { requireApiUser } from "@/lib/auth.server";
import { json, parseBody, unauthorized } from "@/lib/api";
import { listTools, updateTool } from "@/lib/admin.server";

export const runtime = "nodejs";

export async function GET() {
  const user = await requireApiUser("admin");
  if (!user) return unauthorized();
  return json({ ok: true, tools: await listTools() });
}

/** PATCH /api/admin/tools {id, active?, valueUsd?, badge?, offerTitle?, blurb?, tierMin?} */
export async function PATCH(req: Request) {
  const user = await requireApiUser("admin");
  if (!user) return unauthorized();
  const parsed = await parseBody(
    req,
    z.object({
      id: z.string(),
      active: z.boolean().optional(),
      valueUsd: z.number().int().min(0).optional(),
      badge: z.enum(["NEW", "LIMITED", "PRO"]).nullable().optional(),
      offerTitle: z.string().max(60).optional(),
      blurb: z.string().max(160).optional(),
      tierMin: z.enum(["starter", "pro"]).optional(),
    }),
  );
  if ("error" in parsed) return parsed.error;
  const { id, ...data } = parsed.data;
  await updateTool(user, id, data);
  return json({ ok: true });
}
