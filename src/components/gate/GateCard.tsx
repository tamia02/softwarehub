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
    desc: "Browse the catalogue, buy a pass or take a seat in a pool.",
    icon: <ShoppingBag size={26} />,
  },
  {
    role: "reseller",
    title: "I’m a reseller",
    desc: "Run pools, manage members, buy codes and track payouts.",
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
    <motion.div layout className="anim-fade-scale relative w-full max-w-[640px] overflow-hidden rounded-[22px] border-2 border-ink-line bg-white p-6 sm:p-10 lg:rounded-[30px]" transition={spring}>
      <motion.div layout="position" className="flex flex-col items-center text-center">
        <Logo size={48} />
        <h1 className="mt-5 text-balance text-[30px] font-bold leading-[1.08] text-ink-line sm:text-[40px]">
          How will you use Software Hub Pool?
        </h1>
        <p className="mt-3 text-[16px] leading-[1.4] text-ink-muted">Choose a path. You can switch any time from the footer.</p>
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
                      "group flex cursor-pointer flex-col items-start gap-4 rounded-[22px] border-2 border-ink-line bg-accent-soft p-5 text-left",
                      "transition-[transform,background-color] duration-150 hover:-translate-y-[4px] hover:bg-white",
                      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent",
                    )}
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-ink-line bg-accent text-ink-line">
                      {t.icon}
                    </span>
                    <span>
                      <span className="block text-[20px] font-bold leading-none text-ink-line">{t.title}</span>
                      <span className="mt-2 block text-[16px] leading-[1.4] text-ink-muted">{t.desc}</span>
                    </span>
                    <span className="mt-auto inline-flex items-center gap-1 text-[16px] font-bold text-accent-2">
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
                className="rounded-[22px] border-2 border-ink-line bg-accent-soft p-5 sm:p-6"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink-line bg-accent text-ink-line">
                    {tiles.find((t) => t.role === selected)?.icon}
                  </span>
                  <div>
                    <p className="text-[18px] font-bold leading-none text-ink-line">{tiles.find((t) => t.role === selected)?.title}</p>
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
                    "mt-2 h-14 w-full rounded-[36px] border-2 bg-white px-5 font-code text-lg tracking-[0.18em] uppercase",
                    "placeholder:text-ink-faint placeholder:tracking-[0.18em] focus:bg-white focus:outline-none focus:ring-4",
                    error ? "border-rose-500 focus:ring-rose-200" : "border-ink-line focus:ring-accent/50",
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
                    className="inline-flex h-11 cursor-pointer items-center justify-center gap-1 rounded-full px-4 text-[16px] font-bold text-ink-muted hover:text-ink-line"
                  >
                    <ArrowLeft size={16} /> Back
                  </button>
                </div>

                {selected === "customer" && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void submit({ role: "customer" })}
                    className="mt-4 block w-full cursor-pointer text-center text-[16px] font-bold text-accent-2 hover:underline"
                  >
                    No code? Browse as a customer →
                  </button>
                )}
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      <p className="mt-6 text-center text-[13px] text-ink-faint">
        Codes are verified server-side and never stored in plain text.
      </p>
    </motion.div>
  );
}
