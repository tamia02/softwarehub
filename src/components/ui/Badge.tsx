import { cn } from "@/lib/utils";

type Tone = "new" | "limited" | "pro" | "neutral" | "success";

const tones: Record<Tone, string> = {
  new: "bg-emerald-50 text-emerald-700 border-emerald-200",
  limited: "bg-rose-50 text-rose-700 border-rose-200",
  pro: "bg-accent-soft text-amber-800 border-amber-200",
  neutral: "bg-bg-soft text-ink-muted border-line",
  success: "bg-primary-soft text-primary border-blue-200",
};

export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
