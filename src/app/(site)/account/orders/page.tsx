import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { FileText } from "lucide-react";
import { getDb, schema } from "@/db";
import { Badge } from "@/components/ui/Badge";
import { requireUser } from "@/lib/auth.server";
import { formatINR } from "@/lib/format";

export const metadata = { title: "Orders & invoices" };

const tone: Record<string, "neutral" | "success" | "limited" | "pro" | "new"> = { created: "neutral", paid: "pro", fulfilled: "success", awaiting_inventory: "pro", refunded: "limited", failed: "limited" };

export default async function OrdersPage() {
  const user = await requireUser();
  const db = await getDb();
  const orders = await db.select().from(schema.orders).where(eq(schema.orders.userId, user.id)).orderBy(desc(schema.orders.createdAt));
  const invoices = await db.select().from(schema.invoices).where(eq(schema.invoices.userId, user.id));

  if (!orders.length) return <p className="rounded-2xl border border-dashed border-line p-8 text-center text-sm text-ink-muted">No orders yet.</p>;

  return (
    <div className="card overflow-hidden">
      <table className="w-full text-left text-sm">
        <thead className="bg-bg-soft text-xs uppercase tracking-wider text-ink-faint">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Item</th>
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Invoice</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {orders.map((o) => {
            const inv = invoices.find((i) => i.orderId === o.id);
            return (
              <tr key={o.id}>
                <td className="px-4 py-3 whitespace-nowrap">{o.createdAt.toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
                <td className="px-4 py-3">
                  {o.type === "direct" ? `${o.tierId === "pro" ? "Pro" : "Starter"} Pass` : o.type === "pool_seat" ? `Pool seat (${o.tierId})` : `Reseller code (${o.tierId})`}
                  <span className="block text-xs text-ink-faint">{o.id.slice(0, 8)}</span>
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold">{formatINR(o.amountPaise)}</td>
                <td className="px-4 py-3"><Badge tone={tone[o.status] ?? "neutral"}>{o.status.replace("_", " ")}</Badge></td>
                <td className="px-4 py-3">
                  {inv ? (
                    <Link href={`/account/invoices/${inv.id}`} className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"><FileText size={14} /> {inv.number}</Link>
                  ) : (
                    <span className="text-ink-faint">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
