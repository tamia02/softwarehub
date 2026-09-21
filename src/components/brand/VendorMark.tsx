import { cn } from "@/lib/utils";

/**
 * Generated vendor mark: initial in a hue-tinted tile + vendor name.
 * Replace with real wordmarks (Supabase Storage / S3) when vendor
 * agreements land — the `hue` prop then becomes unused.
 */
export function VendorMark({
  name,
  hue,
  size = "md",
  className,
}: {
  name: string;
  hue: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const initial = name.replace(/[^A-Za-z0-9]/g, "")[0]?.toUpperCase() ?? "?";
  const tile = size === "sm" ? "h-7 w-7 text-[13px]" : size === "lg" ? "h-12 w-12 text-xl" : "h-10 w-10 text-base";
  const text = size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-[15px]";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        className={cn("grid shrink-0 place-items-center rounded-[10px] font-display font-extrabold text-white", tile)}
        style={{ background: `linear-gradient(135deg, hsl(${hue} 80% 52%), hsl(${(hue + 30) % 360} 75% 42%))` }}
        aria-hidden
      >
        {initial}
      </span>
      <span className={cn("font-display font-bold tracking-tight text-ink whitespace-nowrap", text)}>{name}</span>
    </span>
  );
}
