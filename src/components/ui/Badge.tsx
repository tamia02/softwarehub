import { cn } from "@/lib/utils";

type Tone = "new" | "limited" | "pro" | "neutral" | "success";

const tones: Record<Tone, string> = {
  new: "bg-emerald-50 text-emerald-800 border-emerald-200",
  limited: "bg-rose-50 text-rose-800 border-rose-200",
  pro: "bg-accent-soft text-primary border-line-strong",
  neutral: "bg-bg-soft text-ink-muted border-line",
  success: "bg-primary-soft text-primary border-line-strong",
};

export function Badge({ tone = "neutral", className, children }: { tone?: Tone; className?: string; children: React.ReactNode }) {
  return <span className={cn("font-mono-label inline-flex items-center rounded-full border px-2.5 py-1", tones[tone], className)}>{children}</span>;
}
