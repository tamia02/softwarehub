"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Zap } from "lucide-react";

type Role = "customer" | "reseller" | "admin";
const ROLES: { role: Role; label: string }[] = [
  { role: "customer", label: "Customer" },
  { role: "reseller", label: "Reseller" },
  { role: "admin", label: "Admin" },
];

/** One-click demo sign-in from the header — no gate code, no OTP. Only shows
 *  when demo mode is on and nobody is signed in. */
export function DemoQuickLogin({ className }: { className?: string }) {
  const router = useRouter();
  const [show, setShow] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<Role | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => alive && d && setShow(!!d.demo && !d.signedIn))
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  if (!show) return null;

  async function signIn(role: Role) {
    setBusy(role);
    try {
      const res = await fetch("/api/auth/demo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ role }) });
      const d = await res.json();
      if (res.ok && d.ok) { router.push(d.redirect); router.refresh(); }
      else setBusy(null);
    } catch { setBusy(null); }
  }

  return (
    <div className={`relative ${className ?? ""}`}>
      <button onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink-line bg-bg-card px-3.5 py-1.5 text-[14px] font-bold text-ink hover:bg-primary-soft">
        <Zap size={14} className="text-accent-2" /> Demo login
      </button>
      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-48 rounded-2xl border-2 border-ink-line bg-bg-card p-2 shadow-[4px_4px_0_var(--offset-card)]">
          <p className="px-2 pb-1 pt-1 text-[11px] font-bold uppercase tracking-wider text-ink-faint">Enter as</p>
          {ROLES.map((r) => (
            <button key={r.role} onClick={() => signIn(r.role)} disabled={busy !== null} className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left text-[14px] font-semibold text-ink hover:bg-primary-soft disabled:opacity-60">
              {busy === r.role ? <Loader2 size={14} className="animate-spin" /> : <span className="h-1.5 w-1.5 rounded-full bg-accent-2" />} {r.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
