import { cn } from "@/lib/utils";

/**
 * Soft, slowly-floating decorative blobs for a hero backdrop. Pure CSS
 * (anim-float, already disabled under reduced-motion), sits behind content,
 * and stays on-brand using the cream accent/offset tokens at low opacity.
 * Drop it inside a `relative` section.
 */
export function FloatingDecor({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10 overflow-hidden", className)}>
      <span className="anim-float absolute left-[4%] top-[14%] h-24 w-24 rounded-full bg-accent-soft opacity-70 blur-2xl" style={{ animationDuration: "6s" }} />
      <span className="anim-float absolute right-[8%] top-[22%] h-36 w-36 rounded-[42%] bg-[var(--offset-card)] opacity-55 blur-3xl" style={{ animationDelay: "1.1s", animationDuration: "8s" }} />
      <span className="anim-float absolute bottom-[10%] left-[24%] h-20 w-20 rounded-[40%] bg-primary-soft opacity-50 blur-2xl" style={{ animationDelay: "2.2s", animationDuration: "7s" }} />
      <span className="anim-float absolute bottom-[16%] right-[22%] h-16 w-16 rounded-full bg-accent-soft opacity-60 blur-xl" style={{ animationDelay: "0.6s", animationDuration: "9s" }} />
    </div>
  );
}
