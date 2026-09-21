import { eq } from "drizzle-orm";
import { getDb, schema } from "@/db";
import { ProfileForm } from "@/components/dashboard/ProfileForm";
import { Panel } from "@/components/dashboard/Shell";
import { requireUser } from "@/lib/auth.server";

export const metadata = { title: "Business & KYC" };

export default async function ResellerSettingsPage() {
  const user = await requireUser(["reseller", "admin"]);
  const db = await getDb();
  const [r] = await db.select().from(schema.resellers).where(eq(schema.resellers.userId, user.id));
  const b = r?.bankJson ?? {};
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Business & KYC</h1>
      <Panel title="Bank details for payouts">
        <p className="mb-4 text-sm text-ink-muted">Payouts are made by bank transfer after KYC verification. Details are stored encrypted at rest by the database provider and never shown in full again.</p>
        <ProfileForm
          initial={{ businessName: r?.businessName ?? "", accountName: b.accountName ?? "", accountNumber: b.accountNumber ?? "", ifsc: b.ifsc ?? "", upi: b.upi ?? "", pan: b.pan ?? "" }}
          kycStatus={r?.kycStatus ?? "pending"}
        />
      </Panel>
    </div>
  );
}
