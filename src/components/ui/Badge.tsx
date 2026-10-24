import { cn } from "@/lib/utils";

type Tone = "new" | "limited" | "pro" | "neutral" | "success";

const tones: Record<Tone, string> = {
  new: "bg-emerald-50 text-emerald-700 ring-emerald-600/15",
  limited: "bg-rose-50 text-rose-700 ring-rose-600/15",
  pro: "bg-accent text-on-accent ring-transparent",
  neutral: "bg-bg-soft text-ink-muted ring-line-strong/60",
  success: "bg-primary-soft text-primary ring-primary/10",
};

/** Small status tag ("NEW" / "LIMITED"). `hand` is kept for call-site compatibility and no longer changes the face. */
export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: React.ReactNode; hand?: boolean }) {
  return (
    <span className={cn("inline-flex items-center rounded-[6px] px-2 py-1 text-[11px] font-semibold uppercase leading-none tracking-wide ring-1 ring-inset", tones[tone], className)}>
      {children}
    </span>
  );
}
