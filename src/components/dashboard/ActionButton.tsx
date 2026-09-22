"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { ActionResult } from "@/app/(dashboard)/reseller/actions";

/** Runs a server action with pending state and inline result message. */
export function ActionButton({
  action,
  label,
  confirm,
  variant = "primary",
  size = "md",
  className,
}: {
  action: () => Promise<ActionResult>;
  label: string;
  confirm?: string;
  variant?: "primary" | "secondary" | "dark" | "ghost";
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  return (
    <div className={className}>
      <Button
        variant={variant}
        size={size}
        disabled={pending}
        onClick={() => {
          if (confirm && !window.confirm(confirm)) return;
          start(async () => {
            const r = await action();
            setMsg(r.ok ? { ok: true, text: r.message ?? "Done." } : { ok: false, text: r.error });
          });
        }}
      >
        {pending ? <Loader2 size={16} className="animate-spin" /> : null} {label}
      </Button>
      {msg && <p className={`mt-2 text-xs font-medium ${msg.ok ? "text-emerald-300" : "text-rose-400"}`}>{msg.text}</p>}
    </div>
  );
}
