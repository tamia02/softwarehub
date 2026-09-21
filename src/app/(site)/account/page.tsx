import { PhaseStub } from "@/components/ui/PhaseStub";

export const metadata = { title: "My Pass" };

export default function AccountPage() {
  return (
    <PhaseStub title="My Pass" phase={2}>
      <p className="text-sm text-ink-muted">
        Redeem a bundle code, see your tool claims, download invoices and track pools you have joined.
      </p>
    </PhaseStub>
  );
}
