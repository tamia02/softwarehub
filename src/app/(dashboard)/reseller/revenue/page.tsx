import Link from "next/link";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { PayoutForm } from "@/components/dashboard/PayoutForm";
import { Panel, StatCard, Table } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/Badge";
import { requireUser } from "@/lib/auth.server";
import { formatINR } from "@/lib/format";
import { resellerRevenue } from "@/lib/reseller.server";

export const metadata = { title: "Revenue & payouts" };

export default async function ResellerRevenuePage() {
  const user = await requireUser(["reseller", "admin"]);
  const rev = await resellerRevenue(user.id);
  const db = await getDb();
  const [profile] = await db.select().from(schema.resellers).where(eq(schema.resellers.userId, user.id));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Revenue & payouts</h1>
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Earned" value={formatINR(rev.earnedPaise)} sub="your share of fulfilled pools" />
        <StatCard label="Paid out" value={formatINR(rev.paidOutPaise)} />
        <StatCard label="Pending" value={formatINR(rev.pendingPayoutPaise)} />
        <StatCard label="Available" value={formatINR(rev.availablePaise)} accent />
      </div>

      <Panel title="Request a payout">
        <PayoutForm availableRupees={rev.availablePaise / 100} kycVerified={profile?.kycStatus === "verified"} />
      </Panel>

      <Panel title="Per-pool statements">
        {rev.statements.length === 0 ? (
          <p className="text-sm text-ink-muted">No fulfilled pools yet.</p>
        ) : (
          <Table head={["Pool", "Fulfilled", "Gross", "Fee", "Code cost", "Margin", "Your share", "Member credits", ""]}>
            {rev.statements.map((s) => (
              <tr key={s.poolId}>
                <td className="px-4 py-2.5"><Link href={`/reseller/pools/${s.poolId}`} className="font-semibold hover:text-primary">{s.poolName ?? s.poolId}</Link><span className="block text-xs text-ink-faint">{s.mode.replace("_", " ")}</span></td>
                <td className="px-4 py-2.5 whitespace-nowrap text-xs">{s.fulfilledAt?.toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
                <td className="px-4 py-2.5 tabular-nums">{formatINR(s.grossPaise)}</td>
                <td className="px-4 py-2.5 tabular-nums text-rose-600">−{formatINR(s.platformFeePaise)}</td>
                <td className="px-4 py-2.5 tabular-nums text-rose-600">−{formatINR(s.resellerCostPaise)}</td>
                <td className="px-4 py-2.5 tabular-nums">{formatINR(s.marginPaise)}</td>
                <td className="px-4 py-2.5 tabular-nums font-bold">{formatINR(s.resellerSharePaise)}</td>
                <td className="px-4 py-2.5 tabular-nums">{formatINR(s.memberSharesPaise)}</td>
                <td className="px-4 py-2.5"><a href={`/api/reseller/pools/${s.poolId}/statement`} className="text-xs font-bold text-primary">CSV</a></td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>

      <Panel title="Payout history">
        {rev.payouts.length === 0 ? (
          <p className="text-sm text-ink-muted">No payouts yet.</p>
        ) : (
          <Table head={["Requested", "Amount", "Status", "Paid", "Note"]}>
            {rev.payouts.map((p) => (
              <tr key={p.id}>
                <td className="px-4 py-2.5 whitespace-nowrap text-xs">{p.requestedAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
                <td className="px-4 py-2.5 tabular-nums font-semibold">{formatINR(p.amountPaise)}</td>
                <td className="px-4 py-2.5"><Badge tone={p.status === "paid" ? "new" : p.status === "rejected" ? "limited" : "pro"}>{p.status}</Badge></td>
                <td className="px-4 py-2.5 text-xs">{p.paidAt?.toLocaleDateString("en-IN", { dateStyle: "medium" }) ?? "—"}</td>
                <td className="px-4 py-2.5 text-xs text-ink-muted">{p.note ?? ""}</td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>
    </div>
  );
}
