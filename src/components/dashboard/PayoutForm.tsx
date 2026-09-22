"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { requestPayoutAction } from "@/app/(dashboard)/reseller/actions";

export function PayoutForm({ availableRupees, kycVerified }: { availableRupees: number; kycVerified: boolean }) {
  const [amount, setAmount] = useState(String(Math.floor(availableRupees)));
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await requestPayoutAction(Number(amount));
          setMsg(r.ok ? { ok: true, text: r.message ?? "Requested." } : { ok: false, text: r.error });
        });
      }}
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
    >
      <label className="text-sm font-semibold">
        Amount (₹)
        <input type="number" min={1} max={Math.floor(availableRupees)} value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 h-11 w-full rounded-xl border border-line px-3 text-sm focus:border-primary focus:outline-none sm:w-48" />
      </label>
      <Button type="submit" disabled={pending || !kycVerified || Number(amount) <= 0 || Number(amount) > availableRupees}>
        {pending ? <Loader2 size={16} className="animate-spin" /> : null} Request payout
      </Button>
      {msg && <span className={`text-xs font-medium ${msg.ok ? "text-emerald-300" : "text-rose-400"}`}>{msg.text}</span>}
      {!kycVerified && <span className="text-xs text-accent">KYC must be verified first.</span>}
    </form>
  );
}
