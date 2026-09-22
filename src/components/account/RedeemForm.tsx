"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { codeKind, hasValidCheckChar, maskCode, normalizeCode } from "@/lib/codes";
import { track } from "@/components/analytics/track";

export function RedeemForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    const n = normalizeCode(code);
    const kind = codeKind(n);
    if (kind !== "bundle-pro" && kind !== "bundle-starter") return setError("Bundle codes start with SHP-P or SHP-S.");
    if (n.length !== 16 || !hasValidCheckChar(n)) return setError("That code has a typo — please check it.");
    setBusy(true);
    setError(null);
    const res = await fetch("/api/codes/redeem", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bundle_code: n }) });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setBusy(false);
      return setError(data.error ?? "Could not redeem.");
    }
    track("code_redeemed");
    router.push("/account");
    router.refresh();
  }

  return (
    <form onSubmit={submit}>
      <label htmlFor="bundle-code" className="block text-sm font-semibold">Activation code</label>
      <input
        id="bundle-code"
        value={maskCode(code)}
        onChange={(e) => { setCode(normalizeCode(e.target.value)); setError(null); }}
        placeholder="SHPP-XXXX-XXXX-XXXX"
        autoComplete="off"
        spellCheck={false}
        className={`mt-2 h-14 w-full rounded-2xl border bg-bg-soft px-4 font-mono text-lg uppercase tracking-[0.15em] focus:bg-bg-card focus:outline-none focus:ring-4 ${error ? "border-rose-400 focus:ring-rose-200" : "border-line focus:border-primary focus:ring-primary/20"}`}
      />
      {error && <p role="alert" className="mt-2 text-sm font-medium text-rose-600">{error}</p>}
      <Button type="submit" size="lg" className="mt-5 w-full" disabled={busy || code.length < 16}>
        {busy ? <Loader2 className="animate-spin" size={18} /> : null} Redeem
      </Button>
    </form>
  );
}
