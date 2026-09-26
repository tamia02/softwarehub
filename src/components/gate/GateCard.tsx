"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Loader2, ShoppingBag, Store } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { maskCode, normalizeCode, preflightGateCode } from "@/lib/codes";
import { cn } from "@/lib/utils";
import { site } from "@/config/site";

type RoleChoice = "customer" | "reseller";

const tiles: Array<{ role: RoleChoice; title: string; desc: string; icon: React.ReactNode }> = [
  {
    role: "customer",
    title: "I’m a customer",
    desc: "Browse the marketplace, grab a pass, order growth services.",
    icon: <ShoppingBag size={26} />,
  },
  {
    role: "reseller",
    title: "I’m a reseller",
    desc: "List products, upload codes, connect the API, get paid.",
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
    <motion.div layout className="anim-fade-scale relative w-full max-w-[640px] overflow-hidden rounded-[22px] border-2 border-ink-line bg-bg-card p-6 sm:p-10 lg:rounded-[30px]" transition={spring}>
      <motion.div layout="position" className="flex flex-col items-center text-center">
        <Logo size={48} />
        <h1 className="mt-5 text-balance text-[30px] font-bold leading-[1.08] text-ink sm:text-[40px]">
          How will you use Software Hub?
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
                      "transition-[transform,background-color] duration-150 hover:-translate-y-[4px] hover:bg-bg-card",
                      "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent",
                    )}
                  >
                    <span className="grid h-12 w-12 place-items-center rounded-full border-2 border-ink-line bg-accent text-on-accent">
                      {t.icon}
                    </span>
                    <span>
                      <span className="block text-[20px] font-bold leading-none text-ink">{t.title}</span>
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
                  <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-ink-line bg-accent text-on-accent">
                    {tiles.find((t) => t.role === selected)?.icon}
                  </span>
                  <div>
                    <p className="text-[18px] font-bold leading-none text-ink">{tiles.find((t) => t.role === selected)?.title}</p>
                    <p className="text-xs text-ink-muted">
                      {selected === "reseller" ? "Enter your reseller code — or apply below" : "Enter your customer activation code"}
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
                    "mt-2 h-14 w-full rounded-[36px] border-2 bg-bg-card px-5 font-code text-lg tracking-[0.18em] uppercase",
                    "placeholder:text-ink-faint placeholder:tracking-[0.18em] focus:bg-bg-card focus:outline-none focus:ring-4",
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
                    className="inline-flex h-11 cursor-pointer items-center justify-center gap-1 rounded-full px-4 text-[16px] font-bold text-ink-muted hover:text-ink"
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

                {selected === "reseller" && (
                  <div className="mt-5 rounded-2xl border-2 border-dashed border-line-strong bg-bg-soft p-4 text-left">
                    <p className="text-sm font-bold text-ink">New here? Become a reseller</p>
                    <p className="mt-1 text-[13px] leading-snug text-ink-muted">Don&apos;t have a code yet? Apply on WhatsApp — send your website and company details, we verify you, and add you to the platform.</p>
                    <a
                      href={`https://wa.me/${site.whatsapp}?text=${encodeURIComponent("Hi Software Hub, I'd like to become a reseller. Website: ___  Company: ___  What I sell: ___")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 inline-flex items-center gap-2 rounded-full border-2 border-ink-line bg-[#25D366] px-4 py-2 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M17.47 14.38c-.3-.15-1.74-.86-2-.96-.27-.1-.46-.15-.65.15-.2.3-.75.96-.92 1.15-.17.2-.34.22-.63.08-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.75-1.64-2.05-.17-.3-.02-.46.13-.6.13-.14.3-.34.44-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.65-1.58-.9-2.16-.24-.57-.48-.5-.65-.5h-.56c-.2 0-.5.07-.77.37-.26.3-1 1-1 2.42 0 1.43 1.04 2.8 1.18 3 .15.2 2.05 3.13 4.96 4.39.69.3 1.23.48 1.65.61.69.22 1.32.19 1.82.12.56-.09 1.74-.71 1.98-1.4.24-.68.24-1.27.17-1.4-.07-.13-.26-.2-.56-.35zM12.05 21.5h-.01a9.4 9.4 0 01-4.79-1.31l-.34-.2-3.56.93.95-3.47-.22-.36a9.38 9.38 0 01-1.44-5A9.43 9.43 0 0118.7 5.35a9.36 9.36 0 012.76 6.65c0 5.2-4.24 9.43-9.42 9.43zM20.52 3.48A11.76 11.76 0 0012.05 0C5.5 0 .18 5.32.17 11.86c0 2.09.55 4.13 1.6 5.93L.07 24l6.35-1.66a11.85 11.85 0 005.62 1.43h.01c6.55 0 11.87-5.32 11.88-11.86a11.8 11.8 0 00-3.4-8.43z"/></svg>
                      Apply on WhatsApp
                    </a>
                  </div>
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
