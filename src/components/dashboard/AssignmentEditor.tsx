"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { saveAssignmentAction } from "@/app/(dashboard)/reseller/actions";

/**
 * Assigned-distribution editor: a member × tool checkbox matrix. "Shared"
 * pools show a note instead; switching to assigned happens on first save.
 */
export function AssignmentEditor({
  poolId,
  mode,
  members,
  tools,
  initial,
}: {
  poolId: string;
  mode: "shared" | "assigned";
  members: Array<{ userId: string; label: string }>;
  tools: Array<{ id: string; name: string }>;
  initial: Record<string, string[]>;
}) {
  const [assign, setAssign] = useState<Record<string, Set<string>>>(() => Object.fromEntries(members.map((m) => [m.userId, new Set(initial[m.userId] ?? [])])));
  const [editing, setEditing] = useState(mode === "assigned");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  if (!editing) {
    return (
      <div className="flex flex-col items-start gap-3 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <p>Shared bundle: every member gets a claim page for every tool.</p>
        <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>Switch to assigned tools</Button>
      </div>
    );
  }
  if (!members.length) return <p className="text-sm text-ink-muted">Members appear here once they have paid.</p>;

  const toggle = (u: string, t: string) =>
    setAssign((prev) => {
      const next = new Set(prev[u]);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return { ...prev, [u]: next };
    });

  return (
    <div>
      <div className="max-h-[420px] overflow-auto rounded-xl border border-line">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-bg-soft">
            <tr>
              <th className="px-3 py-2 text-left">Tool</th>
              {members.map((m) => (
                <th key={m.userId} className="px-2 py-2 text-center font-semibold">{m.label.split("@")[0].slice(0, 12)}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {tools.map((t) => (
              <tr key={t.id}>
                <td className="whitespace-nowrap px-3 py-1.5 font-semibold">{t.name}</td>
                {members.map((m) => (
                  <td key={m.userId} className="px-2 py-1.5 text-center">
                    <input type="checkbox" checked={assign[m.userId]?.has(t.id) ?? false} onChange={() => toggle(m.userId, t.id)} className="h-4 w-4 accent-[var(--brand-primary)]" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center gap-3">
        <Button
          size="sm"
          disabled={pending}
          onClick={() =>
            start(async () => {
              const r = await saveAssignmentAction(poolId, Object.fromEntries(Object.entries(assign).map(([u, s]) => [u, [...s]])));
              setMsg(r.ok ? r.message ?? "Saved." : r.error);
            })
          }
        >
          {pending ? <Loader2 size={14} className="animate-spin" /> : null} Save assignment
        </Button>
        {msg && <span className="text-xs text-ink-muted">{msg}</span>}
      </div>
    </div>
  );
}
