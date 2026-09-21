import { cn } from "@/lib/utils";

/**
 * Brand mark: a rounded pass/ticket silhouette with a punched hole and an
 * amber "active" stripe — reads as an access pass at any size, including as a
 * favicon. Placeholder until the final identity is supplied.
 */
export function Logo({ className, size = 36, tone = "brand" }: { className?: string; size?: number; tone?: "brand" | "light" }) {
  const fill = tone === "light" ? "#fbf6ec" : "var(--brand-primary)";
  const cut = tone === "light" ? "var(--brand-primary)" : "#fbf6ec";
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden className={cn("shrink-0", className)}>
      {/* ticket body */}
      <path
        d="M10 4h20a5 5 0 0 1 5 5v22a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V9a5 5 0 0 1 5-5Z"
        fill={fill}
      />
      {/* punched hole */}
      <circle cx="20" cy="10.5" r="2.6" fill={cut} />
      {/* tear line */}
      <path d="M9 17.5h22" stroke={cut} strokeWidth="1.6" strokeDasharray="2.2 2.6" strokeLinecap="round" opacity="0.7" />
      {/* content lines */}
      <rect x="10" y="22" width="14" height="3" rx="1.5" fill={cut} />
      <rect x="10" y="28" width="9" height="3" rx="1.5" fill={cut} opacity="0.75" />
      {/* active stripe */}
      <rect x="26" y="22" width="4" height="9" rx="2" fill="var(--brand-accent)" />
    </svg>
  );
}

export function Wordmark({ className, tone = "ink" }: { className?: string; tone?: "ink" | "light" }) {
  return (
    <span className={cn("font-display text-[19px] font-extrabold tracking-[-0.03em]", tone === "light" ? "text-[#fbf6ec]" : "text-ink", className)}>
      Software Hub Pool
    </span>
  );
}

export function LogoLockup({ className, tone = "ink" }: { className?: string; tone?: "ink" | "light" }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Logo size={30} tone={tone === "light" ? "light" : "brand"} />
      <Wordmark tone={tone} />
    </span>
  );
}
