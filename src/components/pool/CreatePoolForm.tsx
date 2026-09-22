"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { formatINR } from "@/lib/format";
import { track } from "@/components/analytics/track";

interface Props {
  prices: Record<"starter" | "pro", { name: string; pricePaise: number }>;
  defaultTier: "starter" | "pro";
  seatsMin: number;
  seatsMax: number;
  seatsDefault: number;
  expiryDays: number;
  reseller: boolean;
  signedIn: boolean;
}

type Opt<T extends string> = readonly [T, string, string];

function Choice<T extends string>({ legend, value, onChange, options }: { legend: string; value: T; onChange: (v: T) => void; options: readonly Opt<T>[] }) {
  return (
    <fieldset>
      <legend className="text-sm font-semibold">{legend}</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {options.map(([v, t, d]) => (
          <label key={v} className={`cursor-pointer rounded-xl border p-3 text-sm ${value === v ? "border-primary bg-primary-soft" : "border-line"}`}>
            <input type="radio" className="sr-only" checked={value === v} onChange={() => onChange(v)} />
            <span className="block font-bold">{t}</span>
            <span className="text-ink-muted">{d}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function CreatePoolForm(p: Props) {
  const router = useRouter();
  const [tier, setTier] = useState<"starter" | "pro">(p.defaultTier);
  const [seats, setSeats] = useState(p.seatsDefault);
  const [name, setName] = useState("");
  const [distribution, setDistribution] = useState<"shared" | "assigned">("shared");
  const [paymentModel, setPaymentModel] = useState<"escrow" | "single">("escrow");
  const [splitMode, setSplitMode] = useState<"reseller_keeps" | "share_equal">("reseller_keeps");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seatPrice = Math.ceil(p.prices[tier].pricePaise / seats);
  const input = "mt-1 h-11 w-full rounded-xl border border-line bg-bg-soft px-3 text-sm focus:border-primary focus:bg-bg-card focus:outline-none focus:ring-4 focus:ring-primary/20";

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!p.signedIn) return router.push(`/login?next=${encodeURIComponent(`/checkout/pool?tier=${tier}`)}`);
    setBusy(true);
    setError(null);
    const res = await fetch("/api/pools", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tier, seats, name: name || undefined, distributionMode: distribution, paymentModel, splitMode, asReseller: p.reseller }),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setBusy(false);
      return setError(data.error ?? "Could not create pool.");
    }
    track("pool_created", { tier, seats, reseller: p.reseller });
    router.push(`/pool/${data.pool.id}`);
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        {(["starter", "pro"] as const).map((t) => (
          <button type="button" key={t} onClick={() => setTier(t)} className={`rounded-2xl border p-4 text-left ${tier === t ? "border-primary bg-primary-soft" : "border-line hover:border-ink/30"}`}>
            <p className="font-bold">{p.prices[t].name}</p>
            <p className="text-sm text-ink-muted">{formatINR(p.prices[t].pricePaise)} bundle</p>
          </button>
        ))}
      </div>

      <label className="block text-sm font-semibold">
        Pool name <span className="font-normal text-ink-muted">(shown on the share page)</span>
        <input className={input} value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="e.g. Bengaluru builders" />
      </label>

      <label className="block text-sm font-semibold">
        Seats: {seats} · {formatINR(seatPrice)} each
        <input type="range" min={p.seatsMin} max={p.seatsMax} value={seats} onChange={(e) => setSeats(Number(e.target.value))} className="mt-2 w-full accent-[var(--brand-primary)]" />
      </label>

      <Choice
        legend="Tool distribution"
        value={distribution}
        onChange={setDistribution}
        options={[
          ["shared", "Shared bundle", "Every member can claim every tool."],
          ["assigned", "Assigned tools", "Organiser assigns specific tools to each member."],
        ]}
      />

      {p.reseller && (
        <>
          <Choice
            legend="Payment model"
            value={paymentModel}
            onChange={setPaymentModel}
            options={[
              ["escrow", "Escrow (default)", "Each member pays their seat on the platform; auto-refund on expiry."],
              ["single", "Single payer", "You pay the whole bundle; collect from members off-platform."],
            ]}
          />
          <Choice
            legend="Margin split"
            value={splitMode}
            onChange={setSplitMode}
            options={[
              ["reseller_keeps", "I keep the margin", "Gross − code cost − platform fee stays with you."],
              ["share_equal", "Share with members", "Margin is split equally and credited back to members."],
            ]}
          />
        </>
      )}

      <p className="text-xs text-ink-muted">Pools stay open for {p.expiryDays} days. If not every seat is paid by then, everyone is refunded automatically.</p>
      {error && (
        <p role="alert" className="text-sm font-medium text-rose-400">
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={busy}>
        {busy ? <Loader2 className="animate-spin" size={18} /> : null} {p.signedIn ? "Create pool" : "Sign in to create a pool"}
      </Button>
    </form>
  );
}
