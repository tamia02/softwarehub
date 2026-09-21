import { RedeemForm } from "@/components/account/RedeemForm";

export const metadata = { title: "Redeem a code" };

export default function RedeemPage() {
  return (
    <div className="card mx-auto max-w-lg p-8">
      <h2 className="text-xl font-extrabold">Redeem an activation code</h2>
      <p className="mt-1 text-sm text-ink-muted">Enter the 16-character bundle code from your purchase email. It unlocks a claim page for every tool in your tier.</p>
      <div className="mt-6">
        <RedeemForm />
      </div>
    </div>
  );
}
