import Link from "next/link";
import { Panel, StatCard } from "@/components/dashboard/Shell";
import { adminOverview } from "@/lib/admin.server";
import { formatINR } from "@/lib/format";

export const metadata = { title: "Admin" };

export default async function AdminPage() {
  const o = await adminOverview();
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black">Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Revenue this month" value={formatINR(o.revenueMonthPaise)} sub={`${o.ordersMonth} paid orders`} accent />
        <StatCard label="Platform inventory" value={`${o.inventory.starter} / ${o.inventory.pro}`} sub="starter / pro codes unassigned" />
        <StatCard label="Pools" value={`${o.openPools} open`} sub={`${o.fulfilledPools} fulfilled`} />
        <StatCard label="Users" value={String(o.users)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Panel title="Needs attention">
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between"><span>Orders awaiting inventory</span><Link href="/admin/orders" className={`font-bold ${o.awaitingInventory ? "text-rose-600" : "text-ink-faint"}`}>{o.awaitingInventory}</Link></li>
            <li className="flex justify-between"><span>Payout requests</span><Link href="/admin/payouts" className={`font-bold ${o.pendingPayouts ? "text-amber-700" : "text-ink-faint"}`}>{o.pendingPayouts} · {formatINR(o.pendingPayoutPaise)}</Link></li>
            <li className="flex justify-between"><span>Guarantee claims</span><Link href="/admin/issues" className={`font-bold ${o.openIssues ? "text-amber-700" : "text-ink-faint"}`}>{o.openIssues}</Link></li>
          </ul>
        </Panel>
        <Panel title="Quick links" className="sm:col-span-2">
          <div className="flex flex-wrap gap-2 text-sm">
            {[["/admin/codes", "Generate codes"], ["/admin/settings", "Exchange rate & fees"], ["/admin/tools", "Catalog"], ["/api/cron/pools-expire", "Run pool expiry now"], ["/api/cron/pass-reminders", "Send pass reminders"]].map(([h, l]) => (
              <Link key={h} href={h} className="rounded-full border border-line px-3 py-1.5 font-semibold hover:bg-bg-soft">{l}</Link>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}
