import { cn } from "@/lib/utils";

type Tone = "new" | "limited" | "pro" | "neutral" | "success";

const tones: Record<Tone, string> = {
  new: "bg-emerald-100 text-emerald-900",
  limited: "bg-rose-100 text-rose-900",
  pro: "bg-accent text-on-accent",
  neutral: "bg-bg-soft text-ink-muted",
  success: "bg-primary-soft text-primary",
};

/** Hand-script tag like the reference's "NEW" / "LIMITED" call-outs. */
export function Badge({ tone = "neutral", className, children, hand = true }: { tone?: Tone; className?: string; children: React.ReactNode; hand?: boolean }) {
  return (
    <span className={cn("inline-flex items-center rounded-[100px] border-2 border-ink-line px-2.5 leading-none", hand ? "font-hand py-0.5 text-[20px]" : "py-1 text-[12px] font-bold uppercase tracking-wider", tones[tone], className)}>
      {children}
    </span>
  );
}
