import { cn } from "@/lib/utils";

/**
 * LOGO placeholder — replace the SVG paths with the real brand mark.
 * Keep the viewBox square so it works as a favicon too.
 */
export function Logo({ className, size = 36 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <rect width="40" height="40" rx="12" fill="var(--brand-primary)" />
      <circle cx="14" cy="16" r="5" fill="white" />
      <circle cx="26" cy="16" r="5" fill="white" fillOpacity="0.85" />
      <circle cx="20" cy="26" r="5" fill="var(--brand-accent)" />
    </svg>
  );
}

/** WORDMARK placeholder — swap for the real wordmark SVG. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display text-[19px] font-extrabold tracking-tight text-ink", className)}>
      Software Hub <span className="text-primary">Pool</span>
    </span>
  );
}

export function LogoLockup({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Logo size={32} />
      <Wordmark />
    </span>
  );
}
