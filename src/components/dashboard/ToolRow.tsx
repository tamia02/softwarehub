"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { updateToolAction } from "@/app/(dashboard)/admin/actions";
import { ToolLogo } from "@/components/brand/ToolLogo";

export function ToolRow({ tool }: { tool: { id: string; name: string; vendorName: string; category: string; valueUsd: number; tierMin: string; badge: string | null; active: boolean; logoUrl: string | null } }) {
  const [t, setT] = useState(tool);
  const [pending, start] = useTransition();
  const save = (data: Partial<typeof t>) => {
    const next = { ...t, ...data };
    setT(next);
    start(async () => {
      await updateToolAction(t.id, { active: next.active, valueUsd: next.valueUsd, badge: (next.badge as "NEW" | "LIMITED" | "PRO" | null) ?? null, tierMin: next.tierMin as "starter" | "pro", logoUrl: next.logoUrl || null });
    });
  };
  const sel = "h-8 rounded-lg border border-line bg-white px-2 text-xs";
  return (
    <tr className={t.active ? "" : "opacity-50"}>
      <td className="px-4 py-2"><input type="checkbox" checked={t.active} onChange={(e) => save({ active: e.target.checked })} className="h-4 w-4 accent-[var(--brand-primary)]" title="Active — untick tools without a vendor agreement" /></td>
      <td className="px-4 py-2"><span className="flex items-center gap-2.5"><ToolLogo slug={t.id} name={t.vendorName} logoUrl={t.logoUrl} size={30} /><span className="font-semibold">{t.name}<span className="block text-[11px] font-normal text-ink-faint">{t.vendorName} · {t.category}</span></span></span></td>
      <td className="px-4 py-2"><select className={sel} value={t.tierMin} onChange={(e) => save({ tierMin: e.target.value })}><option value="starter">Starter (core)</option><option value="pro">Pro only</option></select></td>
      <td className="px-4 py-2"><input type="number" className={`${sel} w-24`} value={t.valueUsd} onChange={(e) => setT({ ...t, valueUsd: Number(e.target.value) })} onBlur={() => save({})} /></td>
      <td className="px-4 py-2"><select className={sel} value={t.badge ?? ""} onChange={(e) => save({ badge: e.target.value || null })}><option value="">—</option><option>NEW</option><option>LIMITED</option><option>PRO</option></select></td>
      <td className="px-4 py-2"><input className={`${sel} w-48`} placeholder="Official logo URL (SVG/PNG)" value={t.logoUrl ?? ""} onChange={(e) => setT({ ...t, logoUrl: e.target.value })} onBlur={() => save({})} /></td>
      <td className="px-4 py-2 text-xs text-ink-faint">{pending ? <Loader2 size={12} className="animate-spin" /> : "saved"}</td>
    </tr>
  );
}
