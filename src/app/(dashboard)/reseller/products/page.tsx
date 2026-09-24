import { requireUser } from "@/lib/auth.server";
import { listResellerProducts, resellerSales } from "@/lib/market.server";
import { productCategories } from "@/data/marketplace";
import { Panel, StatCard } from "@/components/dashboard/Shell";
import { formatINR } from "@/lib/format";
import { addProductAction, uploadCodesAction, toggleProductAction } from "../actions";

export const metadata = { title: "My products" };
export const dynamic = "force-dynamic";

export default async function ResellerProductsPage() {
  const user = await requireUser(["reseller", "admin"]);
  const [products, sales] = await Promise.all([listResellerProducts(user.id), resellerSales(user.id)]);
  const input = "mt-1 h-11 w-full rounded-xl border border-line bg-bg-soft px-3 text-sm focus:border-primary focus:bg-bg-card focus:outline-none";

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">My products</h1>
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Live products" value={String(products.filter((p) => p.active).length)} sub={`${products.length} total`} />
        <StatCard label="In escrow (held)" value={formatINR(sales.held)} sub={`${sales.orders} orders`} />
        <StatCard label="Earned (released)" value={formatINR(sales.earned)} accent />
      </div>

      <Panel title="Add a product">
        <form action={async (fd) => { "use server"; await addProductAction(fd); }} className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-semibold">Name<input name="name" required className={input} placeholder="e.g. NordVPN · 1 Year" /></label>
          <label className="text-sm font-semibold">Brand<input name="vendor" className={input} placeholder="NordVPN" /></label>
          <label className="text-sm font-semibold">Category
            <select name="category" className={input}>{productCategories.map((c) => <option key={c}>{c}</option>)}</select>
          </label>
          <label className="text-sm font-semibold">Your price (₹)<input name="price" type="number" min="1" required className={input} placeholder="900" /></label>
          <label className="text-sm font-semibold sm:col-span-2">Short description<input name="blurb" className={input} placeholder="1 year of NordVPN — instant code." /></label>
          <div className="sm:col-span-2"><button className="rounded-full border-2 border-ink-line bg-accent px-5 py-2 text-sm font-bold text-on-accent">Add product</button>
            <span className="ml-3 text-xs text-ink-faint">We add 20% on top → shown to customers. It goes live once you add codes and activate it.</span></div>
        </form>
      </Panel>

      <Panel title="Your listings">
        {products.length === 0 ? (
          <p className="p-4 text-sm text-ink-muted">No products yet. Add one above.</p>
        ) : (
          <div className="divide-y divide-line">
            {products.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center gap-4 px-4 py-4">
                <div className="min-w-[200px] flex-1">
                  <p className="font-bold">{p.name}</p>
                  <p className="text-xs text-ink-faint">{p.category} · your {formatINR(p.basePricePaise)} → customer {formatINR(p.pricePaise)} · {p.stock} in stock · {p.sold} sold</p>
                </div>
                <form action={async (fd) => { "use server"; await uploadCodesAction(p.id, fd); }} className="flex items-end gap-2">
                  <label className="text-xs font-semibold">Add codes (one per line)
                    <textarea name="codes" rows={1} className="mt-1 block h-9 w-48 rounded-lg border border-line bg-bg-soft px-2 py-1 text-xs" placeholder="CODE-1&#10;CODE-2" />
                  </label>
                  <button className="h-9 rounded-lg border-2 border-ink-line bg-bg-card px-3 text-xs font-bold">Upload</button>
                </form>
                <form action={async () => { "use server"; await toggleProductAction(p.id, !p.active); }}>
                  <button className={`h-9 rounded-full px-3 text-xs font-bold ${p.active ? "bg-emerald-50 text-emerald-700" : "border-2 border-ink-line bg-bg-card text-ink"}`}>
                    {p.active ? "Live · click to hide" : "Hidden · click to go live"}
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
