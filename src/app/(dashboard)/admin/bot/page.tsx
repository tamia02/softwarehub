import { Panel, StatCard } from "@/components/dashboard/Shell";
import { vendingGet, type VHealth, type VProduct, type VReseller, type VLink, type VOrder } from "@/lib/vending.server";
import { formatINR } from "@/lib/format";
import { AddReseller, ApproveButton, BulkUpload, TopUp, UnlockButton } from "./Controls";

export const metadata = { title: "WhatsApp Bot" };
export const dynamic = "force-dynamic";

const rupees = (n?: number) => (typeof n === "number" ? formatINR(Math.round(n * 100)) : "—");

export default async function BotPage() {
  const [health, products, resellers, inventory, orders] = await Promise.all([
    vendingGet<VHealth>("/api/health"),
    vendingGet<VProduct[]>("/api/admin/products"),
    vendingGet<VReseller[]>("/api/admin/resellers"),
    vendingGet<VLink[]>("/api/admin/inventory"),
    vendingGet<VOrder[]>("/api/admin/orders"),
  ]);

  if (!health.ok && !products.ok) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-black">WhatsApp Bot</h1>
        <Panel title="Not connected">
          <p className="text-sm text-ink-muted">
            The site couldn&apos;t reach the bot. Check that <code>VENDING_ADMIN_TOKEN</code> is set and that the app is
            on the bot&apos;s Docker network.
          </p>
          <p className="mt-2 rounded-lg bg-rose-50 p-3 font-code text-xs text-rose-700">{products.error || health.error}</p>
        </Panel>
      </div>
    );
  }

  const h = health.ok ? health.data : undefined;
  const prods = products.ok ? products.data : [];
  const resl = resellers.ok ? resellers.data : [];
  const links = inventory.ok ? inventory.data : [];
  const ords = orders.ok ? orders.data : [];
  const unused = links.filter((l) => l.is_used === false || l.status === "available" || l.status === "unused").length;
  const pending = ords.filter((o) => (o.status ?? "").toLowerCase().includes("pending") || (o.status ?? "").toLowerCase().includes("await"));
  const isLocked = (r: VReseller) => Boolean(r.locked_until) || (r.failed_attempts ?? 0) >= 5;
  const bal = (r: VReseller) => r.balance_display ?? (typeof r.wallet_balance === "number" ? `${r.currency ?? "INR"} ${r.wallet_balance}` : "—");

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black">WhatsApp Bot</h1>
        <span className={`inline-flex items-center gap-2 rounded-full border-2 border-ink-line px-3 py-1 text-xs font-bold ${h?.status === "online" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          <span className={`h-2 w-2 rounded-full ${h?.status === "online" ? "bg-emerald-500" : "bg-rose-500"}`} />
          {h?.status === "online" ? "Online" : "Unknown"}
          {h?.model ? ` · ${h.model}` : ""}
        </span>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Products" value={String(prods.length)} accent />
        <StatCard label="Resellers" value={String(resl.length)} />
        <StatCard label="Links in stock" value={String(unused)} sub={`${links.length} total`} />
        <StatCard label="Pending orders" value={String(pending.length)} sub={`${ords.length} total`} />
      </div>

      {pending.length > 0 && (
        <Panel title={`Orders awaiting approval (${pending.length})`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-faint">
                  <th className="py-2 pr-3 font-semibold">Order</th>
                  <th className="py-2 pr-3 font-semibold">Product</th>
                  <th className="py-2 pr-3 font-semibold">Amount</th>
                  <th className="py-2 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {pending.map((o) => (
                  <tr key={o.id} className="border-t border-line">
                    <td className="py-2 pr-3 font-code text-xs">{o.id}</td>
                    <td className="py-2 pr-3">{o.product_name ?? "—"}</td>
                    <td className="py-2 pr-3 tabular-nums">{rupees(o.amount ?? o.total)}</td>
                    <td className="py-2"><ApproveButton orderId={o.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}

      <Panel title="Add inventory (links / keys)">
        {prods.length === 0 ? (
          <p className="text-sm text-ink-faint">Add a product on the bot first.</p>
        ) : (
          <BulkUpload products={prods.map((p) => ({ id: p.id, name: p.name }))} />
        )}
      </Panel>

      <Panel title={`Products (${prods.length})`}>
        {prods.length === 0 ? (
          <p className="text-sm text-ink-faint">{products.ok ? "No products yet." : products.error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-faint">
                  <th className="py-2 pr-3 font-semibold">Name</th>
                  <th className="py-2 pr-3 font-semibold">Category</th>
                  <th className="py-2 pr-3 font-semibold">Customer</th>
                  <th className="py-2 font-semibold">Credits</th>
                </tr>
              </thead>
              <tbody>
                {prods.map((p) => (
                  <tr key={p.id} className="border-t border-line">
                    <td className="py-2 pr-3 font-semibold text-ink">{p.name}</td>
                    <td className="py-2 pr-3 text-ink-muted">{p.category ?? "—"}</td>
                    <td className="py-2 pr-3 tabular-nums">{rupees(p.customer_price)}</td>
                    <td className="py-2 tabular-nums">{p.credit_cost ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title="Add reseller">
        <AddReseller />
      </Panel>

      <Panel title={`Resellers (${resl.length})`}>
        {resl.length === 0 ? (
          <p className="text-sm text-ink-faint">{resellers.ok ? "No resellers yet." : resellers.error}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-ink-faint">
                  <th className="py-2 pr-3 font-semibold">Name</th>
                  <th className="py-2 pr-3 font-semibold">WhatsApp</th>
                  <th className="py-2 pr-3 font-semibold">Balance</th>
                  <th className="py-2 pr-3 font-semibold">Status</th>
                  <th className="py-2 font-semibold">Wallet</th>
                </tr>
              </thead>
              <tbody>
                {resl.map((r) => (
                  <tr key={r.id} className="border-t border-line align-middle">
                    <td className="py-2 pr-3 font-semibold text-ink">{r.name ?? `#${r.id}`}</td>
                    <td className="py-2 pr-3 font-code text-xs text-ink-muted">{r.phone ?? "—"}</td>
                    <td className="py-2 pr-3 tabular-nums">{bal(r)}</td>
                    <td className="py-2 pr-3">
                      {isLocked(r) ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700">locked</span>
                          <UnlockButton id={r.id} />
                        </span>
                      ) : (
                        <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${r.is_active === false ? "bg-ink/10 text-ink-muted" : "bg-emerald-50 text-emerald-700"}`}>
                          {r.is_active === false ? "inactive" : "active"}
                        </span>
                      )}
                    </td>
                    <td className="py-2"><TopUp id={r.id} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <p className="text-xs text-ink-faint">
        Live data from your WhatsApp bot (vending-deep-agent), read and edited securely server-side — the admin token
        never reaches the browser.
      </p>
    </div>
  );
}
