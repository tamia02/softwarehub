import { ActionButton } from "@/components/dashboard/ActionButton";
import { Panel, Table } from "@/components/dashboard/Shell";
import { listIssues } from "@/lib/admin.server";
import { resolveIssueAction } from "../actions";

export const metadata = { title: "Guarantee claims" };

export default async function AdminIssuesPage() {
  const rows = await listIssues();
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-black">Code Works Guarantee claims</h1><p className="text-sm text-ink-muted">Replace resets the claim so the member gets a fresh vendor reference; refunds are handled from the order.</p></div>
      <Panel>
        {rows.length === 0 ? <p className="text-sm text-ink-muted">No open claims.</p> : (
          <Table head={["Member", "Tool", "Pass", "Note", "Actions"]}>
            {rows.map(({ claim, tool, pass, user }) => (
              <tr key={claim.id}>
                <td className="px-4 py-2.5 text-xs">{user.name ?? "—"}<span className="block text-ink-faint">{user.email ?? user.phone}</span></td>
                <td className="px-4 py-2.5 font-semibold">{tool.name}</td>
                <td className="px-4 py-2.5 text-xs capitalize">{pass.tierId} · exp {pass.expiresAt.toLocaleDateString("en-IN", { dateStyle: "medium" })}</td>
                <td className="max-w-[320px] px-4 py-2.5 text-xs text-ink-muted">{claim.issueNote}</td>
                <td className="px-4 py-2.5"><div className="flex gap-1"><ActionButton action={resolveIssueAction.bind(null, claim.id, "replace")} label="Replace" size="sm" /><ActionButton action={resolveIssueAction.bind(null, claim.id, "dismiss")} label="Dismiss" size="sm" variant="ghost" /></div></td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>
    </div>
  );
}
