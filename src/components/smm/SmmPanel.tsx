"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Wallet, Send, KeyRound, RefreshCw, Plus } from "lucide-react";
import { formatINR } from "@/lib/format";

interface ServiceGroup { label: string; options: { id: number; name: string; rate: number; min: number; max: number }[] }
interface Order { id: string; service: string; link: string; quantity: number; chargePaise: number; remains: number; status: string; createdAt: string }
interface KeyRow { id: string; last4: string; lastUsedAt: string | null }

const statusTone: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700", in_progress: "bg-primary-soft text-primary", processing: "bg-primary-soft text-primary",
  pending: "bg-bg-soft text-ink-muted", canceled: "bg-rose-50 text-rose-700", refunded: "bg-bg-soft text-ink-faint", partial: "bg-amber-50 text-amber-700",
};
const statusLabel: Record<string, string> = { completed: "Completed", in_progress: "In progress", processing: "Processing", pending: "Pending", canceled: "Canceled", refunded: "Refunded", partial: "Partial" };

export function SmmPanel({ balancePaise, services, orders, apiKeys }: { balancePaise: number; services: ServiceGroup[]; orders: Order[]; apiKeys: KeyRow[] }) {
  const router = useRouter();
  const allServices = useMemo(() => services.flatMap((g) => g.options), [services]);
  const [serviceId, setServiceId] = useState(allServices[0]?.id ?? 0);
  const [link, setLink] = useState("");
  const [qty, setQty] = useState(allServices[0]?.min ?? 100);
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [newKey, setNewKey] = useState<string | null>(null);

  const svc = allServices.find((s) => s.id === serviceId);
  const charge = svc ? Math.ceil((svc.rate * 100 * qty) / 1000) : 0;

  async function call(url: string, opts: RequestInit, tag: string, ok: string) {
    setBusy(tag); setMsg(null);
    try {
      const res = await fetch(url, { headers: { "Content-Type": "application/json" }, ...opts });
      const d = await res.json();
      if (!res.ok || !d.ok) throw new Error(d.error ?? "Failed");
      setMsg({ ok: true, text: ok });
      if (d.key) setNewKey(d.key);
      router.refresh();
    } catch (e) { setMsg({ ok: false, text: e instanceof Error ? e.message : "Error" }); }
    finally { setBusy(null); }
  }

  const input = "mt-1 h-11 w-full rounded-xl border border-line bg-bg-soft px-3 text-sm focus:border-primary focus:bg-bg-card focus:outline-none";

  return (
    <div className="container-page py-8 md:py-12">
      <h1 className="text-[26px] font-black">Growth panel</h1>
      <p className="mt-1 text-ink-muted">Order social growth from your wallet, or connect our API to your own app.</p>

      {msg && <p className={`mt-4 rounded-xl px-4 py-2 text-sm font-semibold ${msg.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>{msg.text}</p>}

      <div className="mt-6 grid gap-5 lg:grid-cols-[1fr_1.2fr]">
        {/* Wallet + new order */}
        <div className="space-y-5">
          <div className="rounded-[var(--r-card)] border-2 border-ink-line bg-bg-card p-5 shadow-[4px_4px_0_var(--offset-card)]">
            <p className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-ink-faint"><Wallet size={15} /> Wallet</p>
            <p className="mt-2 font-display text-[32px] font-black text-ink">{formatINR(balancePaise)}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {[100, 500, 1000].map((a) => (
                <button key={a} disabled={busy !== null} onClick={() => call("/api/wallet/topup", { method: "POST", body: JSON.stringify({ amount: a }) }, `topup-${a}`, `Added ${formatINR(a * 100)} to your wallet.`)}
                  className="inline-flex items-center gap-1 rounded-full border-2 border-ink-line bg-bg-card px-3 py-1.5 text-[13px] font-bold hover:bg-primary-soft disabled:opacity-60">
                  {busy === `topup-${a}` ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />} ₹{a}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[var(--r-card)] border-2 border-ink-line bg-bg-card p-5 shadow-[4px_4px_0_var(--offset-card)]">
            <p className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-ink-faint"><Send size={15} /> New order</p>
            <label className="mt-3 block text-sm font-semibold">Service
              <select className={input} value={serviceId} onChange={(e) => { const id = Number(e.target.value); setServiceId(id); const s = allServices.find((x) => x.id === id); if (s) setQty(s.min); }}>
                {services.map((g) => (
                  <optgroup key={g.label} label={g.label}>
                    {g.options.map((o) => <option key={o.id} value={o.id}>{o.name} — ₹{o.rate}/1K</option>)}
                  </optgroup>
                ))}
              </select>
            </label>
            <label className="mt-3 block text-sm font-semibold">Link
              <input className={input} value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://instagram.com/yourpost" />
            </label>
            <label className="mt-3 block text-sm font-semibold">Quantity {svc && <span className="font-normal text-ink-faint">({svc.min}–{svc.max})</span>}
              <input type="number" className={input} value={qty} min={svc?.min} max={svc?.max} onChange={(e) => setQty(Number(e.target.value))} />
            </label>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-ink-muted">Charge <b className="text-ink">{formatINR(charge)}</b></span>
              <button disabled={busy !== null || !link} onClick={() => call("/api/smm/order", { method: "POST", body: JSON.stringify({ service: serviceId, link, quantity: qty }) }, "order", "Order placed — watch it progress below.")}
                className="inline-flex items-center gap-2 rounded-full border-2 border-ink-line bg-accent px-5 py-2 text-sm font-bold text-on-accent disabled:opacity-60">
                {busy === "order" ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Place order
              </button>
            </div>
          </div>
        </div>

        {/* Orders + API */}
        <div className="space-y-5">
          <div className="overflow-hidden rounded-[var(--r-card)] border-2 border-ink-line bg-bg-card">
            <div className="flex items-center justify-between border-b-2 border-ink-line bg-accent-soft px-4 py-2.5">
              <h2 className="text-[15px] font-black text-ink">Your orders</h2>
              <button onClick={() => router.refresh()} className="inline-flex items-center gap-1 text-[12px] font-bold text-ink-muted hover:text-ink"><RefreshCw size={12} /> Refresh</button>
            </div>
            {orders.length === 0 ? <p className="p-4 text-sm text-ink-muted">No orders yet.</p> : (
              <div className="divide-y divide-line">
                {orders.map((o) => (
                  <div key={o.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[13px] font-semibold text-ink">{o.service}</p>
                      <p className="truncate text-[11px] text-ink-faint">{o.quantity.toLocaleString("en-IN")} · {formatINR(o.chargePaise)} · remains {o.remains.toLocaleString("en-IN")}</p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold ${statusTone[o.status] ?? "bg-bg-soft"}`}>{statusLabel[o.status] ?? o.status}</span>
                    {(o.status === "pending" || o.status === "in_progress" || o.status === "processing") && (
                      <button disabled={busy !== null} onClick={() => call("/api/smm/order", { method: "PATCH", body: JSON.stringify({ op: "cancel", orderId: o.id }) }, `c-${o.id}`, "Order canceled and refunded.")}
                        className="shrink-0 rounded-full border border-ink-line px-2.5 py-1 text-[11px] font-bold text-ink-muted hover:bg-bg-soft">Cancel</button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-[var(--r-card)] border-2 border-ink-line bg-bg-card p-5 shadow-[4px_4px_0_var(--offset-card)]">
            <p className="inline-flex items-center gap-2 text-[13px] font-bold uppercase tracking-wider text-ink-faint"><KeyRound size={15} /> API access</p>
            <p className="mt-2 text-[13px] text-ink-muted">Connect our services to your own panel or app. Endpoint: <code className="font-code text-[12px]">POST /api/v2</code> · <a href="/growth/api" className="font-bold text-accent-2 hover:underline">read the docs</a></p>
            {newKey && <p className="mt-3 break-all rounded-xl bg-bg-soft p-3 font-code text-[12px]">Your new key (shown once): <b>{newKey}</b></p>}
            <div className="mt-3 space-y-2">
              {apiKeys.map((k) => (
                <div key={k.id} className="flex items-center justify-between rounded-xl border border-line px-3 py-2 text-[13px]">
                  <span className="font-code">shp-…{k.last4}</span>
                  <button disabled={busy !== null} onClick={() => call("/api/apikeys", { method: "DELETE", body: JSON.stringify({ id: k.id }) }, `k-${k.id}`, "Key revoked.")} className="text-[12px] font-bold text-rose-600 hover:underline">Revoke</button>
                </div>
              ))}
            </div>
            <button disabled={busy !== null} onClick={() => call("/api/apikeys", { method: "POST", body: "{}" }, "newkey", "New API key created.")}
              className="mt-3 inline-flex items-center gap-1.5 rounded-full border-2 border-ink-line bg-bg-card px-4 py-2 text-sm font-bold hover:bg-primary-soft disabled:opacity-60">
              {busy === "newkey" ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />} Generate API key
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
