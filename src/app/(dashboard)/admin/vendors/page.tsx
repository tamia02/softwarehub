import { Panel, Table } from "@/components/dashboard/Shell";
import { VendorForm } from "@/components/dashboard/VendorForm";
import { listVendors } from "@/lib/admin.server";

export const metadata = { title: "Vendors" };

export default async function AdminVendorsPage() {
  const vendors = await listVendors();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black">Vendors</h1>
        <p className="text-sm text-ink-muted">Claim URL template receives the member’s vendor reference as <code>{"{code}"}</code>. Record the agreement reference for each partner.</p>
      </div>
      <Panel>
        <Table head={["Vendor", "Claim URL template", "Mode", "Contract ref", "Eligibility note", ""]}>
          {vendors.map((v) => <VendorForm key={v.id} vendor={v} />)}
        </Table>
      </Panel>
    </div>
  );
}
