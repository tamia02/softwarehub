"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, ShoppingBag, Store } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { maskCode, normalizeCode, preflightGateCode } from "@/lib/codes";
import { cn } from "@/lib/utils";

type RoleChoice = "customer" | "reseller";

const tiles: Array<{ role: RoleChoice; title: string; desc: string; icon: React.ReactNode }> = [
  {
    role: "customer",
    title: "I’m a customer",
    desc: "Browse the catalog, buy a pass or join a pool.",
    icon: <ShoppingBag size={26} />,
  },
  {
    role: "reseller",
    title: "I’m a reseller",
    desc: "Run pools, manage members and track payouts.",
    icon: <Store size={26} />,
  },
];

const spring = { type: "spring", stiffness: 380, damping: 34 } as const;

export function GateCard({ initialRole }: { initialRole?: RoleChoice }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [selected, setSelected] = useState<RoleChoice | null>(initialRole ?? null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (selected) {
      const t = setTimeout(() => inputRef.current?.focus(), 250);
      return () => clearTimeout(t);
    }
  }, [selected]);

  async function submit(payload: { code?: string; role: RoleChoice }) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/gate/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok: boolean; redirect?: string; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Something went wrong. Please try again.");
        setBusy(false);
        return;
      }
      router.push(data.redirect ?? "/home");
    } catch {
      setError("Network error. Please try again.");
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    const pre = preflightGateCode(code);
    if (pre) {
      setError(pre);
      return;
    }
    void submit({ code: normalizeCode(code), role: selected });
  }

  return (
    <motion.div
      layout
      className="card relative w-full max-w-[640px] overflow-hidden p-6 sm:p-10"
      transition={spring}
      initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
    >
      <motion.div layout="position" className="flex flex-col items-center text-center">
        <Logo size={48} />
        <h1 className="mt-5 text-balance text-[26px] font-extrabold leading-tight sm:text-[32px]">
          How will you be using Software Hub Pool?
        </h1>
        <p className="mt-2 text-[15px] text-ink-muted">Pick a path — you can switch later from the footer.</p>
      </motion.div>

      <LayoutGroup>
        <motion.div layout className="mt-8">
          <AnimatePresence mode="popLayout" initial={false}>
            {selected === null ? (
              <motion.div
                key="tiles"
                className="grid gap-4 sm:grid-cols-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.15 } }}
              >
                {tiles.map((t) => (
                  <motion.button
                    key={t.role}
                    layoutId={`tile-${t.role}`}
                    type="button"
                    onClick={() => {
                      setSelected(t.role);
                      setError(null);
                    }}
                    whileHover={reduce ? undefined : { y: -4 }}
                    whileTap={{ scale: 0.98 }}
                    transition={spring}
                    className={cn(
                      "group flex flex-col items-start gap-4 rounded-[20px] border border-line bg-white p-5 text-left",
                      "transition-[box-shadow,border-color] duration-200 hover:border-primary/40",
                      "hover:shadow-[0_16px_48px_rgba(0,87,255,0.18)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30",
                    )}
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                      {t.icon}
                    </span>
                    <span>
                      <span className="block font-display text-lg font-extrabold">{t.title}</span>
                      <span className="mt-1 block text-sm text-ink-muted">{t.desc}</span>
                    </span>
                    <span className="mt-auto inline-flex items-center gap-1 text-sm font-bold text-primary">
                      Continue <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </motion.button>
                ))}
              </motion.div>
            ) : (
              <motion.form
                key="form"
                layoutId={`tile-${selected}`}
                onSubmit={onSubmit}
                transition={spring}
                className="rounded-[20px] border border-primary/30 bg-white p-5 shadow-[0_16px_48px_rgba(0,87,255,0.12)] sm:p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-white">
                    {tiles.find((t) => t.role === selected)?.icon}
                  </span>
                  <div>
                    <p className="font-display text-base font-extrabold">{tiles.find((t) => t.role === selected)?.title}</p>
                    <p className="text-xs text-ink-muted">
                      {selected === "reseller" ? "Enter your reseller activation code" : "Enter your customer activation code"}
                    </p>
                  </div>
                </div>

                <label htmlFor="gate-code" className="mt-5 block text-sm font-semibold">
                  Activation code
                </label>
                <input
                  id="gate-code"
                  ref={inputRef}
                  value={maskCode(code)}
                  onChange={(e) => {
                    setCode(normalizeCode(e.target.value));
                    if (error) setError(null);
                  }}
                  placeholder="XXXX-XXXX-XXXX"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  inputMode="text"
                  aria-invalid={!!error}
                  aria-describedby={error ? "gate-error" : undefined}
                  className={cn(
                    "mt-2 h-14 w-full rounded-2xl border bg-bg-soft px-4 font-mono text-lg tracking-[0.18em] uppercase",
                    "placeholder:text-ink-faint placeholder:tracking-[0.18em] focus:bg-white focus:outline-none focus:ring-4",
                    error ? "border-rose-400 focus:ring-rose-200" : "border-line focus:border-primary focus:ring-primary/20",
                  )}
                />
                <AnimatePresence>
                  {error && (
                    <motion.p
                      id="gate-error"
                      role="alert"
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-2 text-sm font-medium text-rose-600"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <Button type="submit" size="lg" disabled={busy || code.length < 8} className="sm:flex-1">
                    {busy ? <Loader2 className="animate-spin" size={18} /> : null}
                    Continue
                  </Button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(null);
                      setError(null);
                    }}
                    className="inline-flex h-11 items-center justify-center gap-1 rounded-full px-4 text-sm font-semibold text-ink-muted hover:bg-bg-soft"
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                </div>

                {selected === "customer" && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void submit({ role: "customer" })}
                    className="mt-4 block w-full text-center text-sm font-semibold text-primary hover:underline"
                  >
                    No code? Browse as a customer →
                  </button>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      <p className="mt-6 text-center text-xs text-ink-faint">
        Codes are verified server-side and never stored in plain text.
      </p>
    </motion.div>
  );
}
