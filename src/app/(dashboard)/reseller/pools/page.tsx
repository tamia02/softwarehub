import Link from "next/link";
import { Panel, Table } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { requireUser } from "@/lib/auth.server";
import { formatINR } from "@/lib/format";
import { listPoolsForReseller } from "@/lib/pools.server";

export const metadata = { title: "Pools" };

const tone: Record<string, "success" | "pro" | "new" | "limited" | "neutral"> = { open: "success", filled: "pro", paid: "pro", fulfilled: "new", expired: "limited", draft: "neutral" };

export default async function ResellerPoolsPage() {
  const user = await requireUser(["reseller", "admin"]);
  const pools = await listPoolsForReseller(user.id);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">Pools</h1>
        <Button href="/checkout/pool" size="sm">Create pool</Button>
      </div>
      <Panel>
        {pools.length === 0 ? (
          <p className="text-sm text-ink-muted">No pools yet.</p>
        ) : (
          <Table head={["Pool", "Tier", "Seat price", "Progress", "Model", "Expires", "Status"]}>
            {pools.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2.5"><Link href={`/reseller/pools/${p.id}`} className="font-semibold hover:text-primary">{p.name ?? p.id}</Link><span className="block font-mono text-[11px] text-ink-faint">{p.id}</span></td>
                <td className="px-4 py-2.5 capitalize">{p.tierId}</td>
                <td className="px-4 py-2.5 tabular-nums">{formatINR(p.seatPricePaise)}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 overflow-hidden rounded-full bg-bg-soft"><div className="h-full rounded-full bg-primary" style={{ width: `${(p.filled / p.seats) * 100}%` }} /></div>
                    <span className="text-xs tabular-nums">{p.filled}/{p.seats}</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 capitalize">{p.paymentModel}</td>
                <td className="px-4 py-2.5 whitespace-nowrap text-xs">{p.expiresAt.toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
                <td className="px-4 py-2.5"><Badge tone={tone[p.status] ?? "neutral"}>{p.status}</Badge></td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>
    </div>
  );
}
