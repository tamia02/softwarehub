"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PayButton } from "./PayButton";

/** GSTIN/name capture + pay button for the direct purchase flow. */
export function DirectCheckout({ tier, signedIn, defaultName, defaultGstin }: { tier: "starter" | "pro"; signedIn: boolean; defaultName: string; defaultGstin: string }) {
  const [name, setName] = useState(defaultName);
  const [gstin, setGstin] = useState(defaultGstin);
  const idempotencyKey = useMemo(() => `direct:${tier}:${Math.random().toString(36).slice(2)}:${Date.now()}`, [tier]);
  const gstinOk = gstin === "" || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(gstin.toUpperCase());
  const input = "mt-1 h-11 w-full rounded-xl border border-line bg-bg-soft px-3 text-sm focus:border-primary focus:bg-bg-card focus:outline-none focus:ring-4 focus:ring-primary/20";

  if (!signedIn) {
    return (
      <Button href={`/login?next=${encodeURIComponent(`/checkout/direct?tier=${tier}`)}`} size="lg" className="w-full">
        Sign in to pay
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <label className="block text-xs font-semibold text-ink-muted">
        Name on invoice
        <input className={input} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name or company" />
      </label>
      <label className="block text-xs font-semibold text-ink-muted">
        GSTIN (optional, for GST invoice)
        <input className={`${input} uppercase ${gstinOk ? "" : "border-rose-400"}`} value={gstin} onChange={(e) => setGstin(e.target.value.toUpperCase())} placeholder="27AAAAA0000A1Z5" maxLength={15} />
      </label>
      <PayButton
        createUrl="/api/orders/direct"
        body={{ tier, idempotencyKey, name: name || undefined, gstin }}
        label="Pay with Razorpay"
        successHref={(orderId) => `/checkout/success?order=${orderId}`}
        event="checkout_started_direct"
      />
      {!gstinOk && <p className="text-xs text-rose-600">That GSTIN doesn’t look right.</p>}
    </div>
  );
}
