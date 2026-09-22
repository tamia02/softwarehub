import { cn } from "@/lib/utils";

/**
 * Brand mark: an outlined access-pass ticket — punched hole, tear line, two
 * content lines and an amber stripe — drawn in the site's 2px outline style.
 */
export function Logo({ className, size = 36, tone = "brand" }: { className?: string; size?: number; tone?: "brand" | "light" }) {
  const fill = tone === "light" ? "#fffbeb" : "var(--brand-accent)";
  const stroke = tone === "light" ? "#fffbeb" : "var(--ink-line)";
  const ink = tone === "light" ? "var(--brand-primary)" : "var(--ink-line)";
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden className={cn("shrink-0", className)}>
      <path d="M10 4h20a5 5 0 0 1 5 5v22a5 5 0 0 1-5 5H10a5 5 0 0 1-5-5V9a5 5 0 0 1 5-5Z" fill={fill} stroke={stroke} strokeWidth="2.4" />
      <circle cx="20" cy="10.5" r="2.6" fill={ink} />
      <path d="M9.5 17.5h21" stroke={ink} strokeWidth="1.8" strokeDasharray="2.4 2.6" strokeLinecap="round" />
      <rect x="10" y="22" width="13" height="3.2" rx="1.6" fill={ink} />
      <rect x="10" y="28" width="8" height="3.2" rx="1.6" fill={ink} />
      <rect x="26" y="22" width="4.2" height="9.2" rx="2.1" fill={ink} />
    </svg>
  );
}

export function Wordmark({ className, tone = "ink" }: { className?: string; tone?: "ink" | "light" }) {
  return <span className={cn("font-display text-[22px] font-bold leading-none tracking-[-0.01em]", tone === "light" ? "text-[#fffbeb]" : "text-ink-line", className)}>Software Hub Pool</span>;
}

export function LogoLockup({ className, tone = "ink" }: { className?: string; tone?: "ink" | "light" }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Logo size={34} tone={tone === "light" ? "light" : "brand"} />
      <Wordmark tone={tone} />
    </span>
  );
}
