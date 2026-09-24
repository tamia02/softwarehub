import { requireUser } from "@/lib/auth.server";
import { adminListProducts, marketOverview } from "@/lib/market.server";
import { Panel, StatCard, Table } from "@/components/dashboard/Shell";
import { formatINR } from "@/lib/format";
import { setCommissionAction, setProductActiveAction } from "../actions";

export const metadata = { title: "Products" };
export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireUser("admin");
  const [products, ov] = await Promise.all([adminListProducts(), marketOverview()]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Products & marketplace</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Products" value={String(ov.products)} sub={`${ov.live} live`} />
        <StatCard label="Orders" value={String(ov.orders)} sub={`${formatINR(ov.gmvPaise)} GMV`} />
        <StatCard label="In escrow" value={formatINR(ov.heldPaise)} />
        <StatCard label="Commission earned" value={formatINR(ov.commissionPaise)} accent />
      </div>

      <Panel title={`All products (${products.length})`}>
        <Table head={["Product", "Reseller", "Base → customer", "Commission", "Stock / sold", "Live"]}>
          {products.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-2.5"><span className="font-semibold">{p.name}</span><span className="block text-xs text-ink-faint">{p.category}</span></td>
              <td className="px-4 py-2.5 text-sm text-ink-muted">{p.resellerName ?? "—"}</td>
              <td className="px-4 py-2.5 tabular-nums text-sm">{formatINR(p.basePricePaise)} → <b>{formatINR(p.pricePaise)}</b></td>
              <td className="px-4 py-2.5">
                <form action={async (fd) => { "use server"; await setCommissionAction(p.id, Number(fd.get("pct"))); }} className="flex items-center gap-1">
                  <input name="pct" type="number" min="0" max="90" defaultValue={p.commissionPct} className="h-8 w-16 rounded-lg border border-line bg-bg-soft px-2 text-sm" />
                  <button className="h-8 rounded-lg border-2 border-ink-line bg-bg-card px-2 text-xs font-bold">Set</button>
                </form>
              </td>
              <td className="px-4 py-2.5 tabular-nums text-sm">{p.stock} / {p.sold}</td>
              <td className="px-4 py-2.5">
                <form action={async () => { "use server"; await setProductActiveAction(p.id, !p.active); }}>
                  <button className={`rounded-full px-2.5 py-1 text-xs font-bold ${p.active ? "bg-emerald-50 text-emerald-700" : "border-2 border-ink-line bg-bg-card"}`}>{p.active ? "Live" : "Hidden"}</button>
                </form>
              </td>
            </tr>
          ))}
        </Table>
      </Panel>
    </div>
  );
}
