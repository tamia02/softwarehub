import { ToolLogo } from "./ToolLogo";
import { cn } from "@/lib/utils";

export function VendorMark({ slug, name, logoUrl, size = "md", mono, className }: { slug: string; name: string; logoUrl?: string | null; size?: "sm" | "md" | "lg"; mono?: boolean; className?: string }) {
  const px = size === "sm" ? 32 : size === "lg" ? 48 : 40;
  const text = size === "sm" ? "text-[16px]" : size === "lg" ? "text-[22px]" : "text-[18px]";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <ToolLogo slug={slug} name={name} logoUrl={logoUrl} size={px} mono={mono} />
      <span className={cn("font-bold leading-none text-ink-line whitespace-nowrap", text)}>{name}</span>
    </span>
  );
}
