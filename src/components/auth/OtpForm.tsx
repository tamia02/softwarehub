"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { track } from "@/components/analytics/track";

export function OtpForm({ next, initialIdentifier = "" }: { next?: string; initialIdentifier?: string }) {
  const router = useRouter();
  const [step, setStep] = useState<"identifier" | "code">("identifier");
  const [identifier, setIdentifier] = useState(initialIdentifier);
  const [channel, setChannel] = useState<"email" | "sms">("email");
  const [code, setCode] = useState("");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function request(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/request-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier }) });
    const data = await res.json();
    setBusy(false);
    if (!res.ok || !data.ok) return setError(data.error ?? "Could not send code.");
    setChannel(data.channel);
    setIdentifier(data.identifier);
    setDevCode(data.devCode ?? null);
    setStep("code");
    track("otp_requested", { channel: data.channel });
  }

  async function verify(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/auth/verify-otp", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ identifier, code, next }) });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      setBusy(false);
      return setError(data.error ?? "Could not verify.");
    }
    track("signed_in", { role: data.role });
    router.push(data.redirect ?? "/account");
    router.refresh();
  }

  const input = "mt-2 h-14 w-full rounded-2xl border border-line bg-bg-soft px-4 text-lg focus:border-primary focus:bg-bg-card focus:outline-none focus:ring-4 focus:ring-primary/20";

  return (
    <AnimatePresence mode="wait" initial={false}>
      {step === "identifier" ? (
        <motion.form key="id" onSubmit={request} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }}>
          <label htmlFor="identifier" className="block text-sm font-semibold">Email or mobile number</label>
          <input id="identifier" className={input} value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="you@company.com or 98765 43210" autoComplete="username" autoFocus required />
          {error && <p role="alert" className="mt-2 text-sm font-medium text-rose-400">{error}</p>}
          <Button type="submit" size="lg" className="mt-5 w-full" disabled={busy || identifier.trim().length < 3}>
            {busy ? <Loader2 className="animate-spin" size={18} /> : null} Send code
          </Button>
          <p className="mt-4 text-center text-xs text-ink-faint">We’ll send a 6-digit code. No passwords.</p>
        </motion.form>
      ) : (
        <motion.form key="code" onSubmit={verify} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }}>
          <p className="text-sm text-ink-muted">
            Code sent by {channel === "sms" ? "SMS" : "email"} to <strong className="text-ink">{identifier}</strong>
          </p>
          <label htmlFor="otp" className="mt-4 block text-sm font-semibold">6-digit code</label>
          <input id="otp" className={`${input} font-mono tracking-[0.5em]`} value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" placeholder="••••••" autoFocus required />
          {devCode && (
            <p className="mt-2 rounded-xl bg-primary-soft px-3 py-2 text-xs text-accent">
              Dev mode — no email/SMS provider configured. Your code is <strong className="font-mono">{devCode}</strong>.
            </p>
          )}
          {error && <p role="alert" className="mt-2 text-sm font-medium text-rose-400">{error}</p>}
          <Button type="submit" size="lg" className="mt-5 w-full" disabled={busy || code.length !== 6}>
            {busy ? <Loader2 className="animate-spin" size={18} /> : null} Verify & continue
          </Button>
          <button type="button" onClick={() => { setStep("identifier"); setCode(""); setError(null); }} className="mt-4 inline-flex w-full items-center justify-center gap-1 text-sm font-semibold text-ink-muted hover:text-ink">
            <ArrowLeft size={14} /> Use a different email or number
          </button>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
