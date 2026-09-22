"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, Check, ExternalLink, Loader2, Ticket } from "lucide-react";
import { ToolLogo } from "@/components/brand/ToolLogo";
import { Badge } from "@/components/ui/Badge";
import { track } from "@/components/analytics/track";

export interface ClaimView {
  id: string;
  status: string;
  toolId: string;
  toolName: string;
  vendorName: string;
  offerTitle: string;
  vendorRef: string | null;
  issueNote: string | null;
}

interface ClaimResult {
  ok: boolean;
  url?: string | null;
  coupon?: string | null;
  mode?: string;
  note?: string | null;
  error?: string;
}

export function ClaimCard({ claim, expired }: { claim: ClaimView; expired: boolean }) {
  const [status, setStatus] = useState(claim.status);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<ClaimResult | null>(null);
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueNote, setIssueNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function claim_() {
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/claims/${claim.id}`, { method: "POST" });
    const data = (await res.json()) as ClaimResult;
    setBusy(false);
    if (!res.ok || !data.ok) return setError(data.error ?? "Could not claim.");
    setResult(data);
    setStatus("claimed");
    track("tool_claimed", { tool: claim.toolName });
  }

  async function report() {
    setBusy(true);
    const res = await fetch(`/api/claims/${claim.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note: issueNote }) });
    const data = await res.json();
    setBusy(false);
    if (!res.ok || !data.ok) return setError(data.error ?? "Could not send.");
    setStatus("issue");
    setIssueOpen(false);
  }

  return (
    <div className={`card flex flex-col gap-3 p-4 ${status === "issue" ? "border-accent-2" : ""}`}>
      <div className="flex items-start justify-between gap-2">
        <ToolLogo slug={claim.toolId} name={claim.vendorName} size={40} />
        {status === "claimed" && <Badge tone="new">Claimed</Badge>}
        {status === "issue" && <Badge tone="limited">Issue raised</Badge>}
      </div>
      <div>
        <p className="font-bold leading-snug">{claim.toolName}</p>
        <p className="text-xs font-semibold text-primary">{claim.offerTitle}</p>
      </div>

      <AnimatePresence initial={false}>
        {(result || (status === "claimed" && !result)) && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <div className="rounded-xl bg-bg-soft p-3 text-xs">
              {result?.coupon || claim.vendorRef ? (
                <p className="inline-flex items-center gap-1.5 font-mono text-[13px] font-bold">
                  <Ticket size={14} className="text-primary" /> {result?.coupon ?? claim.vendorRef}
                </p>
              ) : null}
              {result?.url && (
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 font-bold text-primary hover:underline">
                  Open vendor page <ExternalLink size={12} />
                </a>
              )}
              {result?.note && <p className="mt-1 text-ink-muted">{result.note}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {status === "issue" && claim.issueNote && <p className="text-xs text-accent">We’re on it: “{claim.issueNote}”</p>}

      <div className="mt-auto flex items-center gap-2">
        {status === "available" ? (
          <button onClick={claim_} disabled={busy || expired} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-primary text-sm font-bold text-on-primary hover:bg-primary-600 disabled:opacity-50">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />} {expired ? "Pass expired" : "Claim"}
          </button>
        ) : status === "claimed" && !result ? (
          <button onClick={claim_} disabled={busy} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-full bg-bg-soft text-sm font-bold hover:bg-line">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />} Show link again
          </button>
        ) : null}
        {status !== "issue" && (
          <button onClick={() => setIssueOpen((v) => !v)} className="inline-flex h-9 items-center gap-1 rounded-full px-3 text-xs font-semibold text-ink-muted hover:bg-bg-soft" title="Code Works Guarantee">
            <AlertTriangle size={13} /> Problem?
          </button>
        )}
      </div>

      <AnimatePresence>
        {issueOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
            <textarea value={issueNote} onChange={(e) => setIssueNote(e.target.value)} placeholder="What happened when you tried to activate?" className="h-20 w-full rounded-xl border border-line p-2 text-xs focus:border-primary focus:outline-none" />
            <button onClick={report} disabled={busy || issueNote.trim().length < 5} className="mt-2 h-8 w-full rounded-full bg-accent text-xs font-bold text-ink hover:brightness-95 disabled:opacity-50">
              Report under Code Works Guarantee
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {error && <p className="text-xs font-medium text-rose-400">{error}</p>}
    </div>
  );
}
