import { ActionButton } from "@/components/dashboard/ActionButton";
import { Panel, Table } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/Badge";
import { listOrders } from "@/lib/admin.server";
import { formatINR } from "@/lib/format";
import { retryInventoryAction } from "../actions";

export const metadata = { title: "Orders" };

const tone: Record<string, "neutral" | "pro" | "success" | "limited" | "new"> = { created: "neutral", paid: "pro", fulfilled: "success", awaiting_inventory: "limited", refunded: "limited" };

export default async function AdminOrdersPage() {
  const rows = await listOrders(200);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Orders</h1>
        <ActionButton action={retryInventoryAction} label="Retry awaiting-inventory orders" variant="secondary" size="sm" />
      </div>
      <Panel>
        <Table head={["Date", "Customer", "Type", "Tier", "Amount", "Gateway", "Status"]}>
          {rows.map(({ order: o, user: u }) => (
            <tr key={o.id}>
              <td className="px-4 py-2.5 whitespace-nowrap text-xs">{o.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
              <td className="px-4 py-2.5 text-xs">{u.name ?? "—"}<span className="block text-ink-faint">{u.email ?? u.phone}</span></td>
              <td className="px-4 py-2.5">{o.type.replace("_", " ")}</td>
              <td className="px-4 py-2.5 capitalize">{o.tierId}</td>
              <td className="px-4 py-2.5 tabular-nums font-semibold">{formatINR(o.amountPaise)}</td>
              <td className="px-4 py-2.5 text-xs">{o.gateway}<span className="block font-mono text-ink-faint">{o.gatewayOrderId?.slice(0, 18)}</span></td>
              <td className="px-4 py-2.5"><Badge tone={tone[o.status] ?? "neutral"}>{o.status.replace("_", " ")}</Badge></td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
