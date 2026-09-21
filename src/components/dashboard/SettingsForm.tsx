"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { settingsAction } from "@/app/(dashboard)/admin/actions";

type Values = Record<string, string | number>;

export function SettingsForm({ settings, tiers }: { settings: Values; tiers: { starter: number; pro: number; starterReseller: number; proReseller: number } }) {
  const [v, setV] = useState<Values>(settings);
  const [t, setT] = useState(tiers);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const inp = "mt-1 h-10 w-full rounded-xl border border-line bg-bg-soft px-3 text-sm focus:border-primary focus:bg-white focus:outline-none";
  const num = (k: string, label: string, hint?: string) => (
    <label className="block text-sm font-semibold">{label}<input type="number" step="any" className={inp} value={v[k] ?? ""} onChange={(e) => setV({ ...v, [k]: Number(e.target.value) })} />{hint && <span className="text-xs font-normal text-ink-muted">{hint}</span>}</label>
  );
  const str = (k: string, label: string) => (
    <label className="block text-sm font-semibold">{label}<input className={inp} value={String(v[k] ?? "")} onChange={(e) => setV({ ...v, [k]: e.target.value })} /></label>
  );
  const rupees = (k: keyof typeof t, label: string) => (
    <label className="block text-sm font-semibold">{label} (₹)<input type="number" className={inp} value={t[k] / 100} onChange={(e) => setT({ ...t, [k]: Math.round(Number(e.target.value) * 100) })} /></label>
  );

  return (
    <form onSubmit={(e) => { e.preventDefault(); start(async () => { const r = await settingsAction(v, t); setMsg(r.ok ? r.message ?? "Saved." : r.error); }); }} className="space-y-8">
      <section><h3 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-ink-faint">Pricing</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{rupees("starter", "Starter Pass price")}{rupees("pro", "Pro Pass price")}{rupees("starterReseller", "Starter reseller price")}{rupees("proReseller", "Pro reseller price")}</div>
      </section>
      <section><h3 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-ink-faint">Rates & pools</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{num("usdInrRate", "USD → INR rate", "Drives retail values on the site")}{num("platformFeePct", "Platform fee % (reseller pools)")}{num("poolExpiryDays", "Pool expiry (days)")}{num("poolSeatsDefault", "Default seats")}{num("poolSeatsMin", "Min seats")}{num("poolSeatsMax", "Max seats")}{num("guaranteeDays", "Guarantee window (days)")}{num("passReminderDays", "Pass reminder (days before)")}</div>
      </section>
      <section><h3 className="mb-3 text-sm font-extrabold uppercase tracking-wider text-ink-faint">Invoicing</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{num("gstPct", "GST %")}{str("sellerGstin", "Seller GSTIN")}{str("sellerStateCode", "Seller state code")}{str("sellerLegalName", "Legal name")}{str("sellerAddress", "Address")}{str("invoicePrefix", "Invoice prefix")}</div>
      </section>
      <div className="flex items-center gap-3"><Button type="submit" disabled={pending}>{pending ? <Loader2 size={16} className="animate-spin" /> : null} Save settings</Button>{msg && <span className="text-xs text-ink-muted">{msg}</span>}</div>
    </form>
  );
}
