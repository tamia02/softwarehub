import { ActionButton } from "@/components/dashboard/ActionButton";
import { Panel, Table } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/Badge";
import { listPayouts, listResellers } from "@/lib/admin.server";
import { formatINR } from "@/lib/format";
import { kycAction, payoutStatusAction } from "../actions";

export const metadata = { title: "Resellers & payouts" };

export default async function AdminPayoutsPage() {
  const [payouts, resellers] = await Promise.all([listPayouts(), listResellers()]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Resellers & payouts</h1>
      <Panel title="Payout requests">
        {payouts.length === 0 ? <p className="text-sm text-ink-muted">None.</p> : (
          <Table head={["Requested", "Reseller", "Bank", "Amount", "Status", "Actions"]}>
            {payouts.map(({ payout: p, user: u, reseller: r }) => (
              <tr key={p.id}>
                <td className="px-4 py-2.5 whitespace-nowrap text-xs">{p.requestedAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</td>
                <td className="px-4 py-2.5 text-xs">{r.businessName ?? u.name ?? "—"}<span className="block text-ink-faint">{u.email ?? u.phone}</span></td>
                <td className="px-4 py-2.5 font-mono text-[11px]">{r.bankJson?.accountNumber ? `${r.bankJson.accountNumber.slice(-4).padStart(8, "•")} · ${r.bankJson.ifsc}` : "—"}</td>
                <td className="px-4 py-2.5 tabular-nums font-semibold">{formatINR(p.amountPaise)}</td>
                <td className="px-4 py-2.5"><Badge tone={p.status === "paid" ? "new" : p.status === "rejected" ? "limited" : "pro"}>{p.status}</Badge></td>
                <td className="px-4 py-2.5">
                  <div className="flex gap-1">
                    {p.status === "requested" && <ActionButton action={payoutStatusAction.bind(null, p.id, "approved")} label="Approve" size="sm" variant="secondary" />}
                    {(p.status === "requested" || p.status === "approved") && <ActionButton action={payoutStatusAction.bind(null, p.id, "paid")} label="Mark paid" size="sm" />}
                    {p.status !== "paid" && p.status !== "rejected" && <ActionButton action={payoutStatusAction.bind(null, p.id, "rejected")} label="Reject" size="sm" variant="ghost" />}
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>
      <Panel title="Resellers & KYC">
        <Table head={["Reseller", "Business", "KYC", "PAN", "Actions"]}>
          {resellers.map(({ reseller: r, user: u }) => (
            <tr key={r.userId}>
              <td className="px-4 py-2.5 text-xs">{u.name ?? "—"}<span className="block text-ink-faint">{u.email ?? u.phone}</span></td>
              <td className="px-4 py-2.5">{r.businessName ?? "—"}</td>
              <td className="px-4 py-2.5"><Badge tone={r.kycStatus === "verified" ? "new" : r.kycStatus === "rejected" ? "limited" : "pro"}>{r.kycStatus}</Badge></td>
              <td className="px-4 py-2.5 font-mono text-xs">{r.bankJson?.pan ?? "—"}</td>
              <td className="px-4 py-2.5"><div className="flex gap-1">
                {r.kycStatus !== "verified" && <ActionButton action={kycAction.bind(null, r.userId, "verified")} label="Verify" size="sm" variant="secondary" />}
                {r.kycStatus !== "rejected" && <ActionButton action={kycAction.bind(null, r.userId, "rejected")} label="Reject" size="sm" variant="ghost" />}
              </div></td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
