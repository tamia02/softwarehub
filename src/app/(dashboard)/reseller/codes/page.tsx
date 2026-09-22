import { PayButton } from "@/components/checkout/PayButton";
import { AssignCodeForm } from "@/components/dashboard/AssignCodeForm";
import { Panel, StatCard, Table } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/Badge";
import { requireUser } from "@/lib/auth.server";
import { formatINR } from "@/lib/format";
import { listResellerCodes } from "@/lib/reseller.server";
import { tierRows } from "@/lib/admin.server";

export const metadata = { title: "Codes" };

const tone: Record<string, "neutral" | "pro" | "new" | "limited"> = { unassigned: "neutral", assigned: "pro", redeemed: "new", void: "limited" };

export default async function ResellerCodesPage() {
  const user = await requireUser(["reseller", "admin"]);
  const [codes, tiers] = await Promise.all([listResellerCodes(user.id), tierRows()]);
  const counts = { unassigned: 0, assigned: 0, redeemed: 0, void: 0 } as Record<string, number>;
  for (const c of codes) counts[c.status] = (counts[c.status] ?? 0) + 1;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Codes</h1>
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Unassigned" value={String(counts.unassigned)} />
        <StatCard label="Assigned" value={String(counts.assigned)} />
        <StatCard label="Redeemed" value={String(counts.redeemed)} />
        <StatCard label="Total bought" value={String(codes.length)} />
      </div>

      <Panel title="Buy codes at reseller price" className="scroll-mt-24">
        <div id="buy" className="grid gap-4 sm:grid-cols-2">
          {tiers.map((t) => (
            <div key={t.id} className="rounded-2xl border border-line p-4">
              <p className="font-bold">{t.name}</p>
              <p className="text-sm text-ink-muted">
                Reseller price <strong className="text-ink">{formatINR(t.resellerPricePaise)}</strong> · sells for {formatINR(t.pricePaise)} · margin {formatINR(t.pricePaise - t.resellerPricePaise)}
              </p>
              <PayButton createUrl="/api/reseller/codes/buy" body={{ tier: t.id }} label={`Buy 1 ${t.name} code`} successHref="/checkout/success?order={orderId}" size="md" variant="dark" className="mt-3" event="reseller_code_purchase" />
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Inventory">
        {codes.length === 0 ? (
          <p className="text-sm text-ink-muted">No codes yet. Buy one above.</p>
        ) : (
          <Table head={["Code", "Tier", "Status", "Cost", "Assigned to", "Action"]}>
            {codes.map((c) => (
              <tr key={c.id}>
                <td className="px-4 py-2.5 font-mono text-xs">••••-{c.last4}</td>
                <td className="px-4 py-2.5 capitalize">{c.tierId}</td>
                <td className="px-4 py-2.5"><Badge tone={tone[c.status] ?? "neutral"}>{c.status}</Badge></td>
                <td className="px-4 py-2.5 tabular-nums">{formatINR(c.costPaise)}</td>
                <td className="px-4 py-2.5 text-xs">{c.assignedTo ? c.assignedTo.name ?? c.assignedTo.email ?? c.assignedTo.phone : c.poolId ? `pool ${c.poolId}` : "—"}</td>
                <td className="px-4 py-2.5">{c.status === "unassigned" && c.codeEnc ? <AssignCodeForm codeId={c.id} /> : <span className="text-xs text-ink-faint">—</span>}</td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>
    </div>
  );
}
