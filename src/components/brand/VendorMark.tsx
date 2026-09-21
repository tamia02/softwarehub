import { ToolLogo } from "./ToolLogo";
import { cn } from "@/lib/utils";

/** Logo + vendor name, used in the marquee and hero. */
export function VendorMark({ slug, name, logoUrl, size = "md", mono, className }: { slug: string; name: string; logoUrl?: string | null; size?: "sm" | "md" | "lg"; mono?: boolean; className?: string }) {
  const px = size === "sm" ? 28 : size === "lg" ? 48 : 40;
  const text = size === "sm" ? "text-sm" : size === "lg" ? "text-xl" : "text-[15px]";
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <ToolLogo slug={slug} name={name} logoUrl={logoUrl} size={px} mono={mono} />
      <span className={cn("font-semibold tracking-tight text-ink whitespace-nowrap", text)}>{name}</span>
    </span>
  );
}
