"use client";

import { useState, useTransition } from "react";
import { Copy, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { generateCodesAction } from "@/app/(dashboard)/admin/actions";
import { displayCode } from "@/lib/codes";

/** Admin code generator. Plaintext is shown exactly once and never stored. */
export function GenerateCodes() {
  const [kind, setKind] = useState<"bundle" | "gate">("bundle");
  const [tier, setTier] = useState<"starter" | "pro">("pro");
  const [type, setType] = useState<"customer" | "reseller">("customer");
  const [count, setCount] = useState(10);
  const [label, setLabel] = useState("");
  const [pending, start] = useTransition();
  const [result, setResult] = useState<{ codes: string[]; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const sel = "h-10 rounded-xl border border-line bg-bg-card px-3 text-sm";

  function run() {
    start(async () => {
      setError(null);
      const r = await generateCodesAction(
        kind === "bundle" ? { kind, tier, count, batch: label || undefined } : { kind, type, count, label: label || undefined, maxUses: type === "reseller" ? 1 : 1000 },
      );
      if (!r.ok) return setError(r.error);
      setResult({ codes: r.codes ?? [], message: r.message ?? "" });
    });
  }

  const text = result?.codes.map(displayCode).join("\n") ?? "";
  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
    a.download = `shp-codes-${kind}-${Date.now()}.txt`;
    a.click();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-xs font-semibold">Kind<br /><select className={sel} value={kind} onChange={(e) => setKind(e.target.value as "bundle" | "gate")}><option value="bundle">Bundle (activation)</option><option value="gate">Gate (site access)</option></select></label>
        {kind === "bundle" ? (
          <label className="text-xs font-semibold">Tier<br /><select className={sel} value={tier} onChange={(e) => setTier(e.target.value as "starter" | "pro")}><option value="starter">Starter</option><option value="pro">Pro</option></select></label>
        ) : (
          <label className="text-xs font-semibold">Type<br /><select className={sel} value={type} onChange={(e) => setType(e.target.value as "customer" | "reseller")}><option value="customer">Customer (multi-use)</option><option value="reseller">Reseller (single-use)</option></select></label>
        )}
        <label className="text-xs font-semibold">Count<br /><input type="number" min={1} max={500} value={count} onChange={(e) => setCount(Number(e.target.value))} className={`${sel} w-24`} /></label>
        <label className="text-xs font-semibold">{kind === "bundle" ? "Batch / vendor allocation ref" : "Label"}<br /><input value={label} onChange={(e) => setLabel(e.target.value)} className={`${sel} w-56`} placeholder={kind === "bundle" ? "e.g. vendor-alloc-2026-09" : "e.g. Instagram campaign"} /></label>
        <Button onClick={run} disabled={pending}>{pending ? <Loader2 size={16} className="animate-spin" /> : null} Generate</Button>
      </div>
      {error && <p className="text-sm text-rose-600">{error}</p>}
      {result && (
        <div className="rounded-2xl border border-accent-2 bg-primary-soft p-4">
          <p className="text-sm font-bold text-on-accent">{result.message} These codes are shown once — copy or download them now.</p>
          <textarea readOnly value={text} className="mt-3 h-40 w-full rounded-xl border border-accent-2 bg-bg-card p-3 font-mono text-xs" />
          <div className="mt-2 flex gap-2">
            <Button size="sm" variant="secondary" onClick={() => navigator.clipboard.writeText(text)}><Copy size={14} /> Copy</Button>
            <Button size="sm" variant="secondary" onClick={download}><Download size={14} /> Download .txt</Button>
          </div>
        </div>
      )}
    </div>
  );
}
