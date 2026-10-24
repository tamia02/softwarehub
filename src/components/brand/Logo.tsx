import { cn } from "@/lib/utils";

/**
 * Brand mark: a red-coral rounded tile holding a white hub glyph (a centre
 * node joined to three satellites). `tone` only changes the wordmark beside it.
 */
export function Logo({ className, size = 36 }: { className?: string; size?: number; tone?: "brand" | "light" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden className={cn("shrink-0", className)}>
      <rect width="40" height="40" rx="10" fill="var(--brand-accent)" />
      <path d="M20 20 11.5 13M20 20l8.5-7M20 20v10" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="20" cy="20" r="4.6" fill="#fff" />
      <circle cx="11.5" cy="13" r="3" fill="#fff" />
      <circle cx="28.5" cy="13" r="3" fill="#fff" />
      <circle cx="20" cy="30.5" r="3" fill="#fff" />
    </svg>
  );
}

export function Wordmark({ className, tone = "ink" }: { className?: string; tone?: "ink" | "light" }) {
  return (
    <span className={cn("whitespace-nowrap font-display text-[19px] font-extrabold leading-none tracking-[-0.03em]", tone === "light" ? "text-on-primary" : "text-ink", className)}>
      Online <span className="text-accent">Sallutions</span>
    </span>
  );
}

export function LogoLockup({ className, tone = "ink" }: { className?: string; tone?: "ink" | "light" }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Logo size={30} />
      <Wordmark tone={tone} />
    </span>
  );
}
