import { Panel, Table } from "@/components/dashboard/Shell";
import { listAudit } from "@/lib/admin.server";

export const metadata = { title: "Audit log" };

export default async function AdminAuditPage() {
  const rows = await listAudit(300);
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Audit log</h1>
      <Panel>
        <Table head={["When", "Actor", "Entity", "From → To", "Meta"]}>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-2 whitespace-nowrap text-xs">{r.at.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "medium" })}</td>
              <td className="px-4 py-2 font-mono text-[11px]">{r.actorId?.slice(0, 8) ?? "system"}</td>
              <td className="px-4 py-2 text-xs">{r.entity}<span className="block font-mono text-ink-faint">{r.entityId.slice(0, 12)}</span></td>
              <td className="px-4 py-2 text-xs">{r.fromState ?? "—"} → <strong>{r.toState ?? "—"}</strong></td>
              <td className="max-w-[320px] truncate px-4 py-2 font-mono text-[11px] text-ink-muted">{r.metaJson ? JSON.stringify(r.metaJson) : ""}</td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
