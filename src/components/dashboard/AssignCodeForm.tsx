"use client";

import { useState, useTransition } from "react";
import { Loader2, Send } from "lucide-react";
import { assignCodeAction } from "@/app/(dashboard)/reseller/actions";

export function AssignCodeForm({ codeId }: { codeId: string }) {
  const [id, setId] = useState("");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  return (
    <form
      className="flex items-center gap-1.5"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await assignCodeAction(codeId, id);
          setMsg(r.ok ? "Sent" : r.error);
        });
      }}
    >
      <input value={id} onChange={(e) => setId(e.target.value)} placeholder="member email / mobile" className="h-8 w-44 rounded-lg border border-line px-2 text-xs focus:border-primary focus:outline-none" />
      <button type="submit" disabled={pending || id.length < 5} className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-white disabled:opacity-40" aria-label="Assign and send">
        {pending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
      </button>
      {msg && <span className="text-[11px] text-ink-muted">{msg}</span>}
    </form>
  );
}
