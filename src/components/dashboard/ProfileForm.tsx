"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { updateProfileAction } from "@/app/(dashboard)/reseller/actions";

type Form = { businessName: string; accountName: string; accountNumber: string; ifsc: string; upi: string; pan: string };

export function ProfileForm({ initial, kycStatus }: { initial: Form; kycStatus: string }) {
  const [f, setF] = useState<Form>(initial);
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const field = (k: keyof Form, label: string, placeholder?: string) => (
    <label className="block text-sm font-semibold">
      {label}
      <input value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} placeholder={placeholder} className="mt-1 h-11 w-full rounded-xl border border-line bg-bg-soft px-3 text-sm focus:border-primary focus:bg-bg-card focus:outline-none focus:ring-4 focus:ring-primary/20" />
    </label>
  );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await updateProfileAction(f);
          setMsg(r.ok ? r.message ?? "Saved." : r.error);
        });
      }}
      className="grid gap-4 sm:grid-cols-2"
    >
      <div className="sm:col-span-2">{field("businessName", "Business name", "Your trading name")}</div>
      {field("accountName", "Account holder name")}
      {field("accountNumber", "Bank account number")}
      {field("ifsc", "IFSC", "HDFC0000001")}
      {field("upi", "UPI ID (optional)", "name@bank")}
      {field("pan", "PAN", "ABCDE1234F")}
      <div className="flex items-end gap-3">
        <Button type="submit" disabled={pending}>{pending ? <Loader2 size={16} className="animate-spin" /> : null} Save</Button>
        <span className="text-xs text-ink-muted">KYC: <strong className="capitalize text-ink">{kycStatus}</strong>{msg ? ` · ${msg}` : ""}</span>
      </div>
    </form>
  );
}
