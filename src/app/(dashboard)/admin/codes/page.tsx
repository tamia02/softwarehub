import { ActionButton } from "@/components/dashboard/ActionButton";
import { GenerateCodes } from "@/components/dashboard/GenerateCodes";
import { Panel, Table } from "@/components/dashboard/Shell";
import { Badge } from "@/components/ui/Badge";
import { listBundleCodes, listGateCodes } from "@/lib/admin.server";
import { formatINR } from "@/lib/format";
import { gateCodeStatusAction, voidCodeAction } from "../actions";

export const metadata = { title: "Codes" };

const tone: Record<string, "neutral" | "pro" | "new" | "limited" | "success"> = { unassigned: "neutral", assigned: "pro", redeemed: "new", void: "limited", active: "success", locked: "limited" };

export default async function AdminCodesPage() {
  const [bundle, gate] = await Promise.all([listBundleCodes(300), listGateCodes()]);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Codes</h1>
      <Panel title="Generate"><GenerateCodes /></Panel>

      <Panel title={`Gate codes (${gate.length})`}>
        <Table head={["Label", "Type", "Uses", "Failed", "Status", "Created", ""]}>
          {gate.map((g) => (
            <tr key={g.id}>
              <td className="px-4 py-2.5 font-semibold">{g.label ?? "—"}<span className="block font-mono text-[11px] text-ink-faint">{g.id.slice(0, 8)}</span></td>
              <td className="px-4 py-2.5 capitalize">{g.type}</td>
              <td className="px-4 py-2.5 tabular-nums">{g.uses}/{g.maxUses >= 1000 ? "∞" : g.maxUses}</td>
              <td className="px-4 py-2.5 tabular-nums">{g.failedAttempts}</td>
              <td className="px-4 py-2.5"><Badge tone={tone[g.status] ?? "neutral"}>{g.status}</Badge></td>
              <td className="px-4 py-2.5 text-xs">{g.createdAt.toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
              <td className="px-4 py-2.5">
                {g.status === "active" ? (
                  <ActionButton action={gateCodeStatusAction.bind(null, g.id, "void")} label="Void" size="sm" variant="ghost" />
                ) : (
                  <ActionButton action={gateCodeStatusAction.bind(null, g.id, "active")} label="Reactivate" size="sm" variant="ghost" />
                )}
              </td>
            </tr>
          ))}
        </Table>
      </Panel>

      <Panel title={`Bundle codes (latest ${bundle.length})`}>
        <Table head={["Code", "Tier", "Batch", "Status", "Owner", "Cost", "Created", ""]}>
          {bundle.map((c) => (
            <tr key={c.id}>
              <td className="px-4 py-2.5 font-mono text-xs">••••-{c.last4}</td>
              <td className="px-4 py-2.5 capitalize">{c.tierId}</td>
              <td className="px-4 py-2.5 text-xs">{c.batch ?? "—"}</td>
              <td className="px-4 py-2.5"><Badge tone={tone[c.status] ?? "neutral"}>{c.status}</Badge></td>
              <td className="px-4 py-2.5 text-xs">{c.ownerResellerId ? `reseller ${c.ownerResellerId.slice(0, 8)}` : "platform"}{c.poolId ? ` · pool ${c.poolId}` : ""}</td>
              <td className="px-4 py-2.5 tabular-nums">{c.costPaise ? formatINR(c.costPaise) : "—"}</td>
              <td className="px-4 py-2.5 text-xs">{c.createdAt.toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
              <td className="px-4 py-2.5">{c.status !== "redeemed" && c.status !== "void" && <ActionButton action={voidCodeAction.bind(null, c.id)} label="Void" size="sm" variant="ghost" confirm="Void this code? This cannot be undone." />}</td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
