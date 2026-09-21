import { cn } from "@/lib/utils";

/**
 * Brand mark: a "pool" — concentric ripples cut into a deep-brown coin, with
 * a single amber drop. Placeholder until the final logo arrives; square
 * viewBox so it doubles as the favicon.
 */
export function Logo({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden className={cn("shrink-0", className)}>
      <rect width="40" height="40" rx="11" fill="var(--brand-primary)" />
      <circle cx="20" cy="21" r="12.5" stroke="#fbf6ec" strokeOpacity="0.35" strokeWidth="1.6" />
      <circle cx="20" cy="21" r="8" stroke="#fbf6ec" strokeOpacity="0.6" strokeWidth="1.8" />
      <circle cx="20" cy="21" r="3.2" fill="#fbf6ec" />
      <circle cx="29.5" cy="10.5" r="2.4" fill="var(--brand-accent)" />
    </svg>
  );
}

export function Wordmark({ className, stacked = false }: { className?: string; stacked?: boolean }) {
  if (stacked) {
    return (
      <span className={cn("flex flex-col leading-none", className)}>
        <span className="font-mono-label text-ink-faint">Software Hub</span>
        <span className="font-display text-[22px] font-medium tracking-tight text-ink" style={{ fontVariationSettings: '"opsz" 32, "SOFT" 30' }}>
          Pool Pass
        </span>
      </span>
    );
  }
  return (
    <span className={cn("font-display text-[21px] font-medium tracking-tight text-ink", className)} style={{ fontVariationSettings: '"opsz" 32, "SOFT" 30' }}>
      Software Hub <span className="text-primary">Pool</span>
    </span>
  );
}

export function LogoLockup({ className, stacked = false }: { className?: string; stacked?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Logo size={stacked ? 38 : 32} />
      <Wordmark stacked={stacked} />
    </span>
  );
}
