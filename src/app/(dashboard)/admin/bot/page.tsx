import { Panel, StatCard } from "@/components/dashboard/Shell";
import { vendingGet, type VHealth, type VProduct, type VReseller, type VLink } from "@/lib/vending.server";
import { formatINR } from "@/lib/format";

export const metadata = { title: "WhatsApp Bot" };
export const dynamic = "force-dynamic";

const rupees = (n?: number) => (typeof n === "number" ? formatINR(Math.round(n * 100)) : "—");

export default async function BotPage() {
  const [health, products, resellers, inventory] = await Promise.all([
    vendingGet<VHealth>("/api/health"),
    vendingGet<VProduct[]>("/api/admin/products"),
    vendingGet<VReseller[]>("/api/admin/resellers"),
    vendingGet<VLink[]>("/api/admin/inventory"),
  ]);

  // If we can't even reach the bot, show why.
  if (!health.ok && !products.ok) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-black">WhatsApp Bot</h1>
        <Panel title="Not connected">
          <p className="text-sm text-ink-muted">
            The site couldn&apos;t reach the bot. Check that <code>VENDING_ADMIN_TOKEN</code> is set and that
            the app is on the bot&apos;s Docker network.
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
  const unused = links.filter((l) => l.is_used === false || l.status === "unused" || l.status === "active").length;
  const walletOf = (r: VReseller) => r.wallet_balance ?? r.wallet ?? r.credits;
  const lockedOf = (r: VReseller) => r.is_locked ?? r.locked ?? false;

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
        <StatCard label="Engine" value={h?.engine ?? "—"} sub={h?.database ? `db ${h.database}` : undefined} />
      </div>

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
                  <th className="py-2 pr-3 font-semibold">Credits</th>
                  <th className="py-2 font-semibold">Stock</th>
                </tr>
              </thead>
              <tbody>
                {prods.map((p) => (
                  <tr key={p.id} className="border-t border-line">
                    <td className="py-2 pr-3 font-semibold text-ink">{p.name}</td>
                    <td className="py-2 pr-3 text-ink-muted">{p.category ?? "—"}</td>
                    <td className="py-2 pr-3 tabular-nums">{rupees(p.customer_price)}</td>
                    <td className="py-2 pr-3 tabular-nums">{p.credit_cost ?? "—"}</td>
                    <td className="py-2">
                      {typeof p.stock === "number" ? p.stock : p.in_stock ? "in stock" : "out"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
                  <th className="py-2 pr-3 font-semibold">Credits / wallet</th>
                  <th className="py-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {resl.map((r) => (
                  <tr key={r.id} className="border-t border-line">
                    <td className="py-2 pr-3 font-semibold text-ink">{r.name ?? `#${r.id}`}</td>
                    <td className="py-2 pr-3 font-code text-xs text-ink-muted">{r.whatsapp ?? r.phone ?? "—"}</td>
                    <td className="py-2 pr-3 tabular-nums">{walletOf(r) ?? "—"}</td>
                    <td className="py-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${lockedOf(r) ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
                        {lockedOf(r) ? "locked" : "active"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <p className="text-xs text-ink-faint">
        Live data from your WhatsApp bot (vending-deep-agent), read securely server-side. Editing (credits, inventory
        upload, product changes) can be added next.
      </p>
    </div>
  );
}
