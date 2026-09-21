import { Panel, Table } from "@/components/dashboard/Shell";
import { ToolRow } from "@/components/dashboard/ToolRow";
import { listTools } from "@/lib/admin.server";

export const metadata = { title: "Tools" };

export default async function AdminToolsPage() {
  const tools = await listTools();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Tools</h1>
        <p className="text-sm text-ink-muted">Untick any tool you do not have a vendor agreement for — it disappears from the catalogue and from new passes. Paste the official logo URL once the partner supplies brand assets; until then the vendor&apos;s public icon is shown.</p>
      </div>
      <Panel>
        <Table head={["Active", "Tool", "Tier", "Value (USD)", "Badge", "Logo", ""]}>
          {tools.map((t) => <ToolRow key={t.id} tool={t} />)}
        </Table>
      </Panel>
    </div>
  );
}
