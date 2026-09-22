"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, User, Store, ShieldCheck } from "lucide-react";

type Role = "customer" | "reseller" | "admin";

const ROLES: { role: Role; label: string; hint: string; icon: typeof User }[] = [
  { role: "customer", label: "Customer", hint: "Passes, Growth, Community, Lab", icon: User },
  { role: "reseller", label: "Reseller", hint: "Pools, Community seller, Lab", icon: Store },
  { role: "admin", label: "Admin", hint: "Full control panel", icon: ShieldCheck },
];

/** One-click demo sign-in (no OTP). Rendered only when the server says demo mode is on. */
export function DemoLogin({ next }: { next?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState<Role | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function signIn(role: Role) {
    setBusy(role);
    setError(null);
    try {
      const res = await fetch("/api/auth/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Could not sign in.");
      const safeNext = next && next.startsWith("/") && !next.startsWith("//") ? next : null;
      router.push(safeNext ?? data.redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(null);
    }
  }

  return (
    <div className="rounded-[var(--r-card)] border-2 border-dashed border-line-strong bg-bg-soft p-4">
      <p className="text-[13px] font-bold uppercase tracking-wider text-ink-faint">Demo — one click, no code</p>
      <div className="mt-3 grid gap-2.5">
        {ROLES.map(({ role, label, hint, icon: Icon }) => (
          <button
            key={role}
            onClick={() => signIn(role)}
            disabled={busy !== null}
            className="group flex items-center gap-3 rounded-2xl border-2 border-ink-line bg-bg-card px-4 py-3 text-left transition-colors hover:bg-primary-soft disabled:opacity-60"
          >
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 border-ink-line bg-accent-soft text-ink">
              {busy === role ? <Loader2 className="animate-spin" size={16} /> : <Icon size={16} />}
            </span>
            <span className="min-w-0">
              <span className="block font-bold leading-tight text-ink">Enter as {label}</span>
              <span className="block truncate text-[13px] text-ink-muted">{hint}</span>
            </span>
          </button>
        ))}
      </div>
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}
