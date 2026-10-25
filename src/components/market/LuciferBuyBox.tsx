"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Minus, Plus, Send, Wallet } from "lucide-react";
import { formatINRPrecise } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Placed {
  orderId: string;
  totalPaise: number;
  balancePaise: number;
  delivery?: string;
}

/**
 * Wallet checkout against the Lucifer bot. States: signed out → Telegram login;
 * signed in without Telegram → link it; otherwise qty + pay from wallet.
 */
export function LuciferBuyBox({
  productRef,
  unitPaise,
  minQty,
  maxQty,
  stock,
  signedIn,
  hasTelegram,
  balancePaise,
  botUrl,
}: {
  productRef: string;
  unitPaise: number;
  minQty: number;
  maxQty: number | null;
  stock: number | null;
  signedIn: boolean;
  hasTelegram: boolean;
  balancePaise: number | null;
  botUrl: string;
}) {
  const cap = Math.max(minQty, Math.min(maxQty ?? 100, stock ?? 100, 100));
  const out = stock !== null && stock <= 0;
  const [qty, setQty] = useState(minQty);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lowBalance, setLowBalance] = useState(false);
  const [placed, setPlaced] = useState<Placed | null>(null);
  const total = unitPaise * qty;
  const next = `/market/${productRef}`;

  async function buy() {
    setBusy(true);
    setError(null);
    setLowBalance(false);
    try {
      const res = await fetch("/api/lucifer/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ref: productRef, qty }),
      });
      const d = await res.json().catch(() => ({}));
      if (res.ok && d.ok) {
        setPlaced(d.order);
      } else {
        if (res.status === 402) setLowBalance(true);
        setError(d.error ?? "Could not place the order. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (placed) {
    return (
      <div className="card p-5">
        <div className="flex items-center gap-2 text-emerald-700">
          <CheckCircle2 size={20} />
          <p className="text-[16px] font-bold">Order paid</p>
        </div>
        <dl className="mt-3 space-y-1.5 text-[13.5px]">
          <div className="flex justify-between"><dt className="text-ink-faint">Order</dt><dd className="font-code text-[12.5px] text-ink">{placed.orderId}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-faint">Paid</dt><dd className="font-semibold text-ink">{formatINRPrecise(placed.totalPaise)}</dd></div>
          <div className="flex justify-between"><dt className="text-ink-faint">Wallet left</dt><dd className="text-ink">{formatINRPrecise(placed.balancePaise)}</dd></div>
        </dl>
        <a href={placed.delivery ?? botUrl} target="_blank" rel="noreferrer" className="mt-5 flex h-12 items-center justify-center gap-2 rounded-[8px] bg-[#229ED9] text-[15px] font-semibold text-white hover:bg-[#1c8cc2]">
          <Send size={17} /> Get delivery on Telegram
        </a>
        <p className="mt-3 text-center text-[12px] text-ink-faint">We&apos;ve also messaged you on Telegram. Your order is in <Link href="/account" className="font-semibold text-accent-2 hover:underline">My account</Link>.</p>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <p className="text-[12px] text-ink-faint">Price</p>
      <div className="flex items-end justify-between gap-3">
        <span className="font-display text-[32px] font-extrabold leading-tight text-ink">{formatINRPrecise(unitPaise)}</span>
        <span className={cn("mb-1.5 inline-flex items-center gap-1.5 text-[13px] font-medium", out ? "text-rose-600" : "text-emerald-600")}>
          <span className={cn("h-1.5 w-1.5 rounded-full", out ? "bg-rose-500" : "bg-emerald-500")} />
          {out ? "Sold out" : stock === null ? "Available" : `${stock} in stock`}
        </span>
      </div>

      {!out && (
        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-[13px] text-ink-muted">Quantity</span>
          <div className="flex items-center rounded-[8px] border border-line-strong">
            <button type="button" aria-label="Decrease quantity" disabled={qty <= minQty} onClick={() => setQty((n) => Math.max(minQty, n - 1))} className="grid h-9 w-9 place-items-center text-ink-muted hover:text-ink disabled:opacity-40">
              <Minus size={15} />
            </button>
            <span className="w-10 text-center text-[14px] font-semibold tabular-nums text-ink">{qty}</span>
            <button type="button" aria-label="Increase quantity" disabled={qty >= cap} onClick={() => setQty((n) => Math.min(cap, n + 1))} className="grid h-9 w-9 place-items-center text-ink-muted hover:text-ink disabled:opacity-40">
              <Plus size={15} />
            </button>
          </div>
        </div>
      )}
      {qty > 1 && (
        <div className="mt-3 flex justify-between border-t border-line pt-3 text-[14px]">
          <span className="text-ink-muted">Total</span>
          <span className="font-bold text-ink">{formatINRPrecise(total)}</span>
        </div>
      )}

      <div className="mt-5">
        {out ? (
          <a href={botUrl} target="_blank" rel="noreferrer" className="flex h-12 items-center justify-center rounded-[8px] border border-line-strong text-[15px] font-semibold text-ink hover:bg-bg">
            Ask for restock on Telegram
          </a>
        ) : !signedIn ? (
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="flex h-12 items-center justify-center gap-2 rounded-[8px] bg-[#229ED9] text-[15px] font-semibold text-white hover:bg-[#1c8cc2]">
            <Send size={17} /> Log in with Telegram to buy
          </Link>
        ) : !hasTelegram ? (
          <Link href={`/login?next=${encodeURIComponent(next)}`} className="flex h-12 items-center justify-center gap-2 rounded-[8px] bg-[#229ED9] text-[15px] font-semibold text-white hover:bg-[#1c8cc2]">
            <Send size={17} /> Connect Telegram to buy
          </Link>
        ) : (
          <button onClick={buy} disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-[8px] bg-accent text-[15px] font-semibold text-white hover:bg-accent-2 disabled:opacity-60">
            {busy ? <Loader2 size={17} className="animate-spin" /> : <Wallet size={17} />} Pay {formatINRPrecise(total)} from wallet
          </button>
        )}
      </div>

      {hasTelegram && balancePaise !== null && (
        <p className="mt-3 flex items-center justify-center gap-1.5 text-[12.5px] text-ink-muted">
          <Wallet size={13} /> Wallet balance: <span className="font-semibold text-ink">{formatINRPrecise(balancePaise)}</span>
        </p>
      )}
      {error && <p role="alert" className="mt-3 rounded-[8px] bg-rose-50 px-3 py-2 text-[13px] text-rose-700">{error}</p>}
      {lowBalance && (
        <a href={botUrl} target="_blank" rel="noreferrer" className="mt-2 flex h-10 items-center justify-center gap-2 rounded-[8px] border border-line-strong text-[13.5px] font-semibold text-ink hover:bg-bg">
          <Wallet size={15} /> Top up wallet in the bot
        </a>
      )}
    </div>
  );
}
