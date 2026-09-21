import { cn } from "@/lib/utils";

/**
 * Brand mark: a rounded "pool" — three concentric ripples in amber on a
 * deep-brown tile, with a small sun-spark. Placeholder until the final logo
 * arrives; keep the square viewBox so it doubles as the favicon.
 */
export function Logo({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden className={cn("shrink-0", className)}>
      <rect width="40" height="40" rx="12" fill="var(--brand-primary)" />
      <circle cx="20" cy="22" r="12" stroke="var(--brand-accent)" strokeWidth="2.4" opacity="0.55" />
      <circle cx="20" cy="22" r="7.5" stroke="var(--brand-accent)" strokeWidth="2.6" opacity="0.8" />
      <circle cx="20" cy="22" r="3" fill="#fffbeb" />
      <path d="M31 6.5l1 2.6 2.6 1-2.6 1-1 2.6-1-2.6-2.6-1 2.6-1z" fill="var(--brand-accent)" />
    </svg>
  );
}

/** Wordmark — two lines like a badge: brand name + product. */
export function Wordmark({ className, stacked = false }: { className?: string; stacked?: boolean }) {
  if (stacked) {
    return (
      <span className={cn("flex flex-col leading-none", className)}>
        <span className="font-display text-[12px] font-semibold uppercase tracking-[0.22em] text-ink-muted">Software Hub</span>
        <span className="font-display text-[22px] font-bold tracking-tight text-primary">Pool Pass</span>
      </span>
    );
  }
  return (
    <span className={cn("font-display text-[20px] font-bold tracking-tight text-ink", className)}>
      Software Hub <span className="text-primary">Pool</span>
    </span>
  );
}

export function LogoLockup({ className, stacked = false }: { className?: string; stacked?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Logo size={stacked ? 40 : 32} />
      <Wordmark stacked={stacked} />
    </span>
  );
}
