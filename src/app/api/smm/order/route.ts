import { z } from "zod";
import { requireApiUser } from "@/lib/auth.server";
import { fail, json, parseBody, unauthorized } from "@/lib/api";
import { placeSmmOrder, cancelSmmOrder, refillSmmOrder } from "@/lib/smm.server";

export const runtime = "nodejs";

/** POST /api/smm/order — place an order from the panel. */
export async function POST(req: Request) {
  const user = await requireApiUser();
  if (!user) return unauthorized();
  const p = await parseBody(req, z.object({ service: z.number().int(), link: z.string().min(4).max(500), quantity: z.number().int().positive() }));
  if ("error" in p) return p.error;
  const r = await placeSmmOrder(user.id, p.data.service, p.data.link, p.data.quantity, { source: "panel" });
  return r.ok ? json({ ok: true, orderId: r.orderId }) : fail(r.error, 400);
}

/** PATCH /api/smm/order — cancel or refill an order. */
export async function PATCH(req: Request) {
  const user = await requireApiUser();
  if (!user) return unauthorized();
  const p = await parseBody(req, z.object({ op: z.enum(["cancel", "refill"]), orderId: z.string().min(1) }));
  if ("error" in p) return p.error;
  const r = p.data.op === "cancel" ? await cancelSmmOrder(user.id, p.data.orderId) : await refillSmmOrder(user.id, p.data.orderId);
  return r.ok ? json({ ok: true }) : fail(r.error ?? "Failed", 400);
}
