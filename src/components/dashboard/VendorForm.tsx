"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { updateVendorAction } from "@/app/(dashboard)/admin/actions";

type V = { id: string; name: string; claimUrlTemplate: string | null; couponMode: string; contractRef: string | null; eligibilityNote: string | null };

export function VendorForm({ vendor }: { vendor: V }) {
  const [f, setF] = useState({ claimUrlTemplate: vendor.claimUrlTemplate ?? "", couponMode: vendor.couponMode, contractRef: vendor.contractRef ?? "", eligibilityNote: vendor.eligibilityNote ?? "" });
  const [pending, start] = useTransition();
  const inp = "h-9 w-full rounded-lg border border-line bg-bg-card px-2 text-xs focus:border-primary focus:outline-none";
  return (
    <tr>
      <td className="px-4 py-2 font-semibold">{vendor.name}</td>
      <td className="px-4 py-2"><input className={inp} value={f.claimUrlTemplate} onChange={(e) => setF({ ...f, claimUrlTemplate: e.target.value })} placeholder="https://vendor.com/redeem?code={code}" /></td>
      <td className="px-4 py-2"><select className={inp} value={f.couponMode} onChange={(e) => setF({ ...f, couponMode: e.target.value })}><option value="link">Link</option><option value="coupon">Coupon</option><option value="manual">Manual</option></select></td>
      <td className="px-4 py-2"><input className={inp} value={f.contractRef} onChange={(e) => setF({ ...f, contractRef: e.target.value })} placeholder="Agreement ref" /></td>
      <td className="px-4 py-2"><input className={inp} value={f.eligibilityNote} onChange={(e) => setF({ ...f, eligibilityNote: e.target.value })} placeholder="e.g. new accounts only" /></td>
      <td className="px-4 py-2">
        <button onClick={() => start(async () => { await updateVendorAction(vendor.id, f); })} disabled={pending} className="h-8 rounded-lg bg-ink px-3 text-xs font-bold text-on-primary disabled:opacity-50">
          {pending ? <Loader2 size={12} className="animate-spin" /> : "Save"}
        </button>
      </td>
    </tr>
  );
}
