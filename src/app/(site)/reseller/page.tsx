import { PhaseStub } from "@/components/ui/PhaseStub";

export const metadata = { title: "Reseller dashboard" };

/** Role-gated by middleware — only reachable with the reseller cookie. */
export default function ResellerPage() {
  return (
    <PhaseStub title="Reseller dashboard" phase={4}>
      <ul className="space-y-1.5 text-sm text-ink-muted">
        <li>Overview: active pools, members, code inventory, revenue, pending payout</li>
        <li>Pools: create, share payment link + QR, fulfil, revenue split</li>
        <li>Codes: self-purchase at reseller price, assign to members</li>
        <li>Revenue: per-pool statements, payouts, KYC</li>
      </ul>
    </PhaseStub>
  );
}
