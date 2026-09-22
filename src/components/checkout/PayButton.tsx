"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { track } from "@/components/analytics/track";

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void; on: (e: string, cb: (r: unknown) => void) => void };
  }
}

interface OrderResponse {
  ok: boolean;
  error?: string;
  orderId?: string | null;
  gateway?: "razorpay" | "mock" | null;
  gatewayOrderId?: string | null;
  amountPaise?: number;
  keyId?: string | null;
  prefill?: { name?: string | null; email?: string | null; contact?: string | null };
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/**
 * Creates an order via `createUrl`, then runs Razorpay Checkout (or the dev
 * mock capture when no gateway keys are configured). On success navigates to
 * `successHref(orderId)`.
 */
export function PayButton({
  createUrl,
  body,
  label,
  successHref,
  className,
  variant = "primary",
  size = "lg",
  event,
}: {
  createUrl: string;
  body?: Record<string, unknown>;
  label: string;
  successHref: (orderId: string, resp: Record<string, unknown>) => string;
  className?: string;
  variant?: "primary" | "dark" | "secondary";
  size?: "md" | "lg";
  event?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mock, setMock] = useState<OrderResponse | null>(null);

  async function start() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(createUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body ?? {}) });
      if (res.status === 401) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }
      const data = (await res.json()) as OrderResponse;
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Could not start payment.");
      track(event ?? "checkout_started", { amountPaise: data.amountPaise });

      // Single-payer pool joins return no order — the seat is simply reserved.
      if (!data.gatewayOrderId) {
        router.push(successHref("", data as unknown as Record<string, unknown>));
        router.refresh();
        return;
      }

      if (data.gateway === "mock") {
        setMock(data);
        setBusy(false);
        return;
      }

      const ok = await loadRazorpay();
      if (!ok || !window.Razorpay) throw new Error("Could not load the payment widget.");
      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amountPaise,
        currency: "INR",
        name: "Software Hub Pool",
        order_id: data.gatewayOrderId,
        prefill: data.prefill ?? {},
        theme: { color: "#92400e" },
        handler: async (r: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
          const v = await fetch("/api/payments/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(r) });
          const vd = await v.json();
          if (!v.ok || !vd.ok) {
            setError(vd.error ?? "Payment verification failed.");
            setBusy(false);
            return;
          }
          track("payment_success", { orderId: vd.orderId });
          router.push(successHref(vd.orderId, vd));
        },
        modal: { ondismiss: () => setBusy(false) },
      });
      rzp.on("payment.failed", () => {
        setError("Payment failed. You can try again.");
        setBusy(false);
      });
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  async function simulate() {
    if (!mock?.gatewayOrderId) return;
    setBusy(true);
    try {
      const res = await fetch("/api/payments/mock-capture", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ gatewayOrderId: mock.gatewayOrderId }) });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Capture failed.");
      track("payment_success", { orderId: data.orderId, mock: true });
      router.push(successHref(data.orderId, data));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      {mock ? (
        <div className="rounded-2xl border border-dashed border-accent-2 bg-primary-soft p-4 text-sm">
          <p className="font-semibold text-on-accent">Mock gateway (no Razorpay keys set)</p>
          <p className="mt-1 text-accent">
            Order {mock.gatewayOrderId} for ₹{((mock.amountPaise ?? 0) / 100).toLocaleString("en-IN")}. This button runs the same capture path a real webhook would.
          </p>
          <Button onClick={simulate} disabled={busy} variant="primary" className="mt-3 w-full">
            {busy ? <Loader2 className="animate-spin" size={16} /> : <ShieldCheck size={16} />} Simulate successful payment
          </Button>
        </div>
      ) : (
        <Button onClick={start} disabled={busy} size={size} variant={variant} className="w-full">
          {busy ? <Loader2 className="animate-spin" size={18} /> : <Lock size={16} />} {label}
        </Button>
      )}
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
