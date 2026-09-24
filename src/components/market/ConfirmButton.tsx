"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export function ConfirmButton({ marketOrderId }: { marketOrderId: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  async function confirm() {
    setBusy(true); setErr(null);
    try {
      const res = await fetch("/api/market/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ marketOrderId }) });
      const d = await res.json();
      if (!res.ok || !d.ok) throw new Error(d.error ?? "Could not confirm.");
      router.refresh();
    } catch (e) { setErr(e instanceof Error ? e.message : "Error"); setBusy(false); }
  }
  return (
    <div>
      <button onClick={confirm} disabled={busy} className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink-line bg-accent px-4 py-1.5 text-[13px] font-bold text-on-accent disabled:opacity-60">
        {busy && <Loader2 size={13} className="animate-spin" />} Confirm it works
      </button>
      {err && <p className="mt-1 text-xs text-rose-600">{err}</p>}
    </div>
  );
}
