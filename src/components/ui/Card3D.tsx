import { cn } from "@/lib/utils";

/** Outlined card with an offset layer behind it that reveals as it lifts on hover. */
export function Card3D({ className, bodyClassName, children }: { className?: string; bodyClassName?: string; children: React.ReactNode }) {
  return (
    <div className={cn("card-3d card-3d-lg", className)}>
      <div className={cn("card-3d-body bg-bg-card", bodyClassName)}>{children}</div>
    </div>
  );
}
