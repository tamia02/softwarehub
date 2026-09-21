import { z } from "zod";
import { requireApiUser } from "@/lib/auth.server";
import { fail, json, parseBody, unauthorized } from "@/lib/api";
import { claimTool, reportClaimIssue } from "@/lib/passes.server";

export const runtime = "nodejs";

/** POST /api/claims/:id — mark claimed, return vendor link / coupon */
export async function POST(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireApiUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const r = await claimTool(user, id);
  return r.ok ? json(r) : fail(r.error, 404);
}

/** PUT /api/claims/:id {note} — raise a Code Works Guarantee issue */
export async function PUT(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const user = await requireApiUser();
  if (!user) return unauthorized();
  const { id } = await ctx.params;
  const parsed = await parseBody(req, z.object({ note: z.string().min(5).max(500) }));
  if ("error" in parsed) return parsed.error;
  const r = await reportClaimIssue(user, id, parsed.data.note);
  return r.ok ? json({ ok: true }) : fail(r.error ?? "Failed", 404);
}
