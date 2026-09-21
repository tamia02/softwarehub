import Link from "next/link";
import { ActionButton } from "@/components/dashboard/ActionButton";
import { Panel, Table } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/Badge";
import { listAllPools } from "@/lib/admin.server";
import { formatINR } from "@/lib/format";
import { adminFulfilPoolAction } from "../actions";

export const metadata = { title: "Pools" };
const tone: Record<string, "success" | "pro" | "new" | "limited" | "neutral"> = { open: "success", filled: "pro", paid: "pro", fulfilled: "new", expired: "limited" };

export default async function AdminPoolsPage() {
  const pools = await listAllPools();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Pools</h1>
      <Panel>
        <Table head={["Pool", "Tier", "Seats", "Seat price", "Model", "Reseller", "Expires", "Status", ""]}>
          {pools.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-2.5"><Link href={`/pool/${p.id}`} className="font-semibold hover:text-primary">{p.name ?? p.id}</Link><span className="block font-mono text-[11px] text-ink-faint">{p.id}</span></td>
              <td className="px-4 py-2.5 capitalize">{p.tierId}</td>
              <td className="px-4 py-2.5 tabular-nums">{p.filled}/{p.seats}</td>
              <td className="px-4 py-2.5 tabular-nums">{formatINR(p.seatPricePaise)}</td>
              <td className="px-4 py-2.5">{p.paymentModel}</td>
              <td className="px-4 py-2.5 text-xs">{p.resellerId ? p.resellerId.slice(0, 8) : "platform"}</td>
              <td className="px-4 py-2.5 text-xs">{p.expiresAt.toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
              <td className="px-4 py-2.5"><Badge tone={tone[p.status] ?? "neutral"}>{p.status}</Badge></td>
              <td className="px-4 py-2.5">{(p.status === "paid" || p.status === "filled") && <ActionButton action={adminFulfilPoolAction.bind(null, p.id)} label="Fulfil" size="sm" variant="secondary" />}</td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
