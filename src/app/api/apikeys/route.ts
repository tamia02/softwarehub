import { z } from "zod";
import { requireApiUser } from "@/lib/auth.server";
import { fail, json, parseBody, unauthorized } from "@/lib/api";
import { createApiKey, revokeApiKey } from "@/lib/apikeys.server";

export const runtime = "nodejs";

/** POST /api/apikeys — create a key (returns plaintext once). */
export async function POST(req: Request) {
  const user = await requireApiUser();
  if (!user) return unauthorized();
  const key = await createApiKey(user.id, "API key");
  return json({ ok: true, key });
}

/** DELETE /api/apikeys — revoke a key {id}. */
export async function DELETE(req: Request) {
  const user = await requireApiUser();
  if (!user) return unauthorized();
  const p = await parseBody(req, z.object({ id: z.string().min(1) }));
  if ("error" in p) return p.error;
  const ok = await revokeApiKey(user.id, p.data.id);
  return ok ? json({ ok: true }) : fail("Not found", 404);
}
