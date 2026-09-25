import Link from "next/link";
import { site } from "@/config/site";

export const metadata = { title: "API v2" };

const rows = [
  { action: "services", params: "key, action=services", ret: `[{ "service": 34, "name": "...", "category": "Instagram · Followers", "rate": "42.00", "min": 50, "max": 100000, "refill": true, "cancel": true }]` },
  { action: "add", params: "key, action=add, service, link, quantity, runs?, interval?", ret: `{ "order": "a1b2c3" }` },
  { action: "status", params: "key, action=status, order", ret: `{ "charge": "21.00", "start_count": 0, "status": "In progress", "remains": 500, "currency": "INR" }` },
  { action: "balance", params: "key, action=balance", ret: `{ "balance": "93.25", "currency": "INR" }` },
  { action: "refill", params: "key, action=refill, order", ret: `{ "refill": "a1b2c3" }` },
  { action: "cancel", params: "key, action=cancel, orders (comma-separated)", ret: `[{ "order": "a1b2c3", "cancel": 1 }]` },
];

export default function ApiDocsPage() {
  const base = site.url;
  return (
    <main className="container-page py-10 md:py-14">
      <Link href="/growth" className="text-[13px] font-bold text-accent-2 hover:underline">← Growth</Link>
      <h1 className="t-h1 mt-3 text-ink">API v2</h1>
      <p className="mt-3 max-w-[60ch] text-[16px] text-ink-muted">Integrate our SMM services into your own website or app. Standard SMM-panel API — one endpoint, form-encoded or JSON.</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-[var(--r-card)] border-2 border-ink-line bg-bg-card p-4"><p className="text-[12px] font-bold uppercase tracking-wider text-ink-faint">Endpoint</p><p className="mt-1 font-code text-[14px]">POST {base}/api/v2</p></div>
        <div className="rounded-[var(--r-card)] border-2 border-ink-line bg-bg-card p-4"><p className="text-[12px] font-bold uppercase tracking-wider text-ink-faint">Auth</p><p className="mt-1 font-code text-[14px]">key = your API key</p><p className="text-[12px] text-ink-faint">Generate it in your Growth panel.</p></div>
      </div>

      <div className="mt-6 space-y-4">
        {rows.map((r) => (
          <div key={r.action} className="overflow-hidden rounded-[var(--r-card)] border-2 border-ink-line bg-bg-card">
            <div className="border-b-2 border-ink-line bg-accent-soft px-4 py-2.5"><span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold text-on-accent">POST</span> <span className="ml-2 font-code text-[14px] font-bold">action = {r.action}</span></div>
            <div className="p-4">
              <p className="text-[12px] font-bold uppercase tracking-wider text-ink-faint">Parameters</p>
              <p className="mt-1 font-code text-[13px] text-ink">{r.params}</p>
              <p className="mt-3 text-[12px] font-bold uppercase tracking-wider text-ink-faint">Response</p>
              <pre className="mt-1 overflow-x-auto rounded-lg bg-bg-soft p-3 font-code text-[12px] text-ink">{r.ret}</pre>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-8 text-[13px] text-ink-faint">Rates are INR per 1,000 units. Orders are charged from your wallet balance.</p>
    </main>
  );
}
