"use client";

import { useState, useTransition } from "react";
import type { ActionResult } from "../../reseller/actions";
import { adjustWalletAction, approveOrderAction, bulkUploadAction, createResellerAction, unlockResellerAction } from "./actions";

const input = "h-9 rounded-lg border border-line bg-bg-card px-3 text-sm focus:border-ink/40 focus:outline-none";
const btn = "inline-flex h-9 items-center justify-center rounded-full border-2 border-ink-line bg-accent px-4 text-sm font-bold text-on-accent disabled:opacity-50";
const btnGhost = "inline-flex h-9 items-center justify-center rounded-full border border-line px-3 text-sm font-semibold hover:bg-bg-soft disabled:opacity-50";

function Msg({ r }: { r: ActionResult | null }) {
  if (!r) return null;
  return <span className={`ml-2 text-xs font-semibold ${r.ok ? "text-emerald-600" : "text-rose-600"}`}>{r.ok ? r.message : r.error}</span>;
}

function useRun() {
  const [pending, start] = useTransition();
  const [res, setRes] = useState<ActionResult | null>(null);
  const run = (fn: () => Promise<ActionResult>) => start(async () => setRes(await fn()));
  return { pending, res, run };
}

export function TopUp({ id }: { id: number }) {
  const { pending, res, run } = useRun();
  const [amt, setAmt] = useState("");
  return (
    <form
      className="flex items-center gap-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        const n = Number(amt);
        if (n) run(() => adjustWalletAction(id, n).then((r) => { if (r.ok) setAmt(""); return r; }));
      }}
    >
      <input className={`${input} w-24`} placeholder="±₹" inputMode="numeric" value={amt} onChange={(e) => setAmt(e.target.value)} />
      <button className={btnGhost} disabled={pending}>{pending ? "…" : "Adjust"}</button>
      <Msg r={res} />
    </form>
  );
}

export function UnlockButton({ id }: { id: number }) {
  const { pending, res, run } = useRun();
  return (
    <span className="inline-flex items-center">
      <button className={btnGhost} disabled={pending} onClick={() => run(() => unlockResellerAction(id))}>
        {pending ? "…" : "Unlock"}
      </button>
      <Msg r={res} />
    </span>
  );
}

export function ApproveButton({ orderId }: { orderId: string }) {
  const { pending, res, run } = useRun();
  return (
    <span className="inline-flex items-center">
      <button className={btn} disabled={pending} onClick={() => run(() => approveOrderAction(orderId))}>
        {pending ? "…" : "Approve & deliver"}
      </button>
      <Msg r={res} />
    </span>
  );
}

export function AddReseller() {
  const { pending, res, run } = useRun();
  const [f, setF] = useState({ name: "", phone: "", secret_code: "", wallet_balance: "" });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        run(() =>
          createResellerAction({ name: f.name, phone: f.phone, secret_code: f.secret_code, wallet_balance: Number(f.wallet_balance) || 0 }).then(
            (r) => {
              if (r.ok) setF({ name: "", phone: "", secret_code: "", wallet_balance: "" });
              return r;
            },
          ),
        );
      }}
    >
      <input className={`${input} w-40`} placeholder="Name" value={f.name} onChange={set("name")} required />
      <input className={`${input} w-40`} placeholder="Phone (10 digits)" inputMode="numeric" value={f.phone} onChange={set("phone")} required />
      <input className={`${input} w-32`} placeholder="PIN (4 digits)" inputMode="numeric" value={f.secret_code} onChange={set("secret_code")} required />
      <input className={`${input} w-28`} placeholder="Wallet ₹" inputMode="numeric" value={f.wallet_balance} onChange={set("wallet_balance")} />
      <button className={btn} disabled={pending}>{pending ? "Adding…" : "Add reseller"}</button>
      <Msg r={res} />
    </form>
  );
}

export function BulkUpload({ products }: { products: { id: number; name: string }[] }) {
  const { pending, res, run } = useRun();
  const [pid, setPid] = useState<string>(products[0] ? String(products[0].id) : "");
  const [text, setText] = useState("");
  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        run(() => bulkUploadAction(Number(pid), text).then((r) => { if (r.ok) setText(""); return r; }));
      }}
    >
      <div className="flex items-center gap-2">
        <select className={`${input} min-w-48`} value={pid} onChange={(e) => setPid(e.target.value)}>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        <button className={btn} disabled={pending || !pid}>{pending ? "Uploading…" : "Upload links"}</button>
        <Msg r={res} />
      </div>
      <textarea
        className="w-full rounded-lg border border-line bg-bg-card p-3 font-code text-xs focus:border-ink/40 focus:outline-none"
        rows={5}
        placeholder="One link or key per line…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
    </form>
  );
}
