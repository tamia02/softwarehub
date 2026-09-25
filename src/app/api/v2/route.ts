import { NextResponse } from "next/server";
import { userForApiKey } from "@/lib/apikeys.server";
import { smmServices, placeSmmOrder, smmOrderStatus, listSmmOrders, cancelSmmOrder, refillSmmOrder } from "@/lib/smm.server";
import { getBalance } from "@/lib/wallet.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public SMM API v2 — the same shape SMM panels use so resellers can plug our
 * services into their own site/app. POST form-encoded or JSON.
 *   key, action = services | add | status | balance | refill | cancel
 */
export async function POST(req: Request) {
  const ct = req.headers.get("content-type") ?? "";
  let body: Record<string, string> = {};
  try {
    if (ct.includes("application/json")) body = await req.json();
    else { const fd = await req.formData(); fd.forEach((v, k) => (body[k] = String(v))); }
  } catch { return NextResponse.json({ error: "Invalid request body" }); }

  const key = String(body.key ?? "");
  const userId = await userForApiKey(key);
  if (!userId) return NextResponse.json({ error: "Invalid API key" });

  const action = String(body.action ?? "");
  const num = (v: unknown) => Math.trunc(Number(v));

  switch (action) {
    case "services":
      return NextResponse.json(smmServices());

    case "add": {
      const r = await placeSmmOrder(userId, num(body.service), String(body.link ?? ""), num(body.quantity), {
        source: "api", runs: body.runs ? num(body.runs) : undefined, interval: body.interval ? num(body.interval) : undefined,
      });
      return NextResponse.json(r.ok ? { order: r.orderId } : { error: r.error });
    }

    case "status": {
      const o = await smmOrderStatus(userId, String(body.order ?? ""));
      if (!o) return NextResponse.json({ error: "Incorrect order ID" });
      return NextResponse.json({ charge: (o.chargePaise / 100).toFixed(2), start_count: o.startCount, status: apiStatus(o.status), remains: o.remains, currency: "INR" });
    }

    case "balance":
      return NextResponse.json({ balance: (await getBalance(userId) / 100).toFixed(2), currency: "INR" });

    case "refill": {
      const r = await refillSmmOrder(userId, String(body.order ?? ""));
      return NextResponse.json(r.ok ? { refill: String(body.order) } : { error: r.error });
    }

    case "cancel": {
      const ids = String(body.orders ?? body.order ?? "").split(",").map((s) => s.trim()).filter(Boolean);
      const out = [] as { order: string; cancel: number | { error: string } }[];
      for (const id of ids) { const r = await cancelSmmOrder(userId, id); out.push({ order: id, cancel: r.ok ? 1 : { error: r.error ?? "error" } }); }
      return NextResponse.json(out);
    }

    default:
      return NextResponse.json({ error: "Invalid action" });
  }
}

function apiStatus(s: string): string {
  return ({ pending: "Pending", in_progress: "In progress", processing: "Processing", completed: "Completed", partial: "Partial", canceled: "Canceled", refunded: "Refunded" } as Record<string, string>)[s] ?? s;
}

export async function GET() {
  return NextResponse.json({ ok: true, api: "v2", methods: ["services", "add", "status", "balance", "refill", "cancel"], docs: "/growth/api" });
}
