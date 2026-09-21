import { cn } from "@/lib/utils";

/** Rounded tile with the vendor's initial, tinted by hue. Replace with real wordmarks when licensed. */
export function VendorTile({ name, hue, size = 40, className }: { name: string; hue: number; size?: number; className?: string }) {
  const initial = name.replace(/[^A-Za-z0-9]/g, "")[0]?.toUpperCase() ?? "?";
  return (
    <span
      className={cn("grid shrink-0 place-items-center rounded-[26%] font-display font-bold text-white shadow-[inset_0_-3px_0_rgba(0,0,0,0.12)]", className)}
      style={{ width: size, height: size, fontSize: size * 0.46, background: `linear-gradient(145deg, hsl(${hue} 78% 56%), hsl(${(hue + 28) % 360} 72% 42%))` }}
      aria-hidden
    >
      {initial}
    </span>
  );
}

/** Tile + vendor name. */
export function VendorMark({ name, hue, size = "md", className }: { name: string; hue: number; size?: "sm" | "md" | "lg"; className?: string }) {
  const px = size === "sm" ? 28 : size === "lg" ? 48 : 40;
  const text = size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-[15px]";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <VendorTile name={name} hue={hue} size={px} />
      <span className={cn("font-display font-semibold tracking-tight text-ink whitespace-nowrap", text)}>{name}</span>
    </span>
  );
}
