import Link from "next/link";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { Panel, StatCard, Table } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/Badge";
import { requireUser } from "@/lib/auth.server";
import { formatINR } from "@/lib/format";
import { resellerOverview } from "@/lib/reseller.server";

export const metadata = { title: "Reseller overview" };

export default async function ResellerOverviewPage() {
  const user = await requireUser(["reseller", "admin"]);
  const o = await resellerOverview(user.id);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label="Active pools" value={String(o.activePools)} sub={`${o.totalPools} total`} />
        <StatCard label="Members" value={String(o.members)} sub="paid seats" />
        <StatCard label="Codes in inventory" value={String(o.codesInInventory)} sub="unassigned" />
        <StatCard label="Revenue this month" value={formatINR(o.revenueThisMonthPaise)} accent />
        <StatCard label="Pending payout" value={formatINR(o.pendingPayoutPaise)} sub={`${formatINR(o.availablePaise)} available`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel title="Revenue — last 12 weeks">
          <RevenueChart data={o.weeks} />
        </Panel>
        <Panel title="Latest pools" action={<Link href="/reseller/pools" className="text-xs font-bold text-primary">All pools →</Link>}>
          {o.latestPools.length === 0 ? (
            <p className="text-sm text-ink-muted">No pools yet. <Link href="/checkout/pool" className="font-bold text-primary">Create one →</Link></p>
          ) : (
            <Table head={["Pool", "Seats", "Status"]}>
              {o.latestPools.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-2.5"><Link href={`/reseller/pools/${p.id}`} className="font-semibold hover:text-primary">{p.name ?? p.id}</Link><span className="block text-xs text-ink-faint">{p.tierId}</span></td>
                  <td className="px-4 py-2.5 tabular-nums">{p.filled}/{p.seats}</td>
                  <td className="px-4 py-2.5"><Badge tone={p.status === "fulfilled" ? "new" : p.status === "expired" ? "limited" : "success"}>{p.status}</Badge></td>
                </tr>
              ))}
            </Table>
          )}
        </Panel>
      </div>
    </div>
  );
}
