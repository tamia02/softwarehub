import Link from "next/link";
import { requireUser } from "@/lib/auth.server";
import { listPurchases } from "@/lib/market.server";
import { ConfirmButton } from "@/components/market/ConfirmButton";
import { formatINR } from "@/lib/format";

export const metadata = { title: "My purchases" };
export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  pending_payment: "Awaiting payment", held: "Delivered · confirm to release", delivered: "Delivered", completed: "Completed", disputed: "In dispute", refunded: "Refunded", cancelled: "Cancelled",
};

export default async function PurchasesPage() {
  const user = await requireUser();
  const purchases = await listPurchases(user.id);

  return (
    <div className="container-page py-10 md:py-14">
      <h1 className="text-[26px] font-black">My purchases</h1>
      <p className="mt-1 text-ink-muted">Your codes and orders. Confirm an order once it works so the seller gets paid.</p>

      {purchases.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-bg-soft p-8 text-center">
          <p className="text-ink-muted">No purchases yet.</p>
          <Link href="/market" className="mt-3 inline-block font-bold text-accent-2">Browse the marketplace →</Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {purchases.map((p) => (
            <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border-2 border-ink-line bg-bg-card p-4">
              <div>
                <p className="font-bold text-ink">{p.productName}</p>
                <p className="text-[12px] text-ink-faint">{formatINR(p.pricePaise)} · code ending {p.last4 ?? "—"} · {new Date(p.createdAt).toLocaleDateString("en-IN")}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`rounded-full px-2.5 py-1 text-[12px] font-bold ${p.status === "completed" ? "bg-emerald-50 text-emerald-700" : p.status === "held" ? "bg-primary-soft text-primary" : "bg-bg-soft text-ink-muted"}`}>{statusLabel[p.status] ?? p.status}</span>
                {(p.status === "held" || p.status === "delivered") && <ConfirmButton marketOrderId={p.id} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
