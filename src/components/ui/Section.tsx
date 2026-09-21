import { cn } from "@/lib/utils";

export function Section({ id, className, innerClassName, children }: { id?: string; className?: string; innerClassName?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={cn("section-pad scroll-mt-20", className)}>
      <div className={cn("container-page", innerClassName)}>{children}</div>
    </section>
  );
}

/** Mono, uppercase label used above headings. */
export function Eyebrow({ children, className, tone = "primary" }: { children: React.ReactNode; className?: string; tone?: "primary" | "light" }) {
  return (
    <span className={cn("font-mono-label inline-flex items-center gap-2", tone === "light" ? "text-accent" : "text-primary", className)}>
      <span className={cn("h-px w-5", tone === "light" ? "bg-accent" : "bg-primary")} aria-hidden />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  sub,
  align = "center",
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  sub?: React.ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div className={cn("max-w-2xl", align === "center" ? "mx-auto text-center" : "", className)}>
      {eyebrow && <Eyebrow className={cn("mb-5", align === "center" && "justify-center")}>{eyebrow}</Eyebrow>}
      <h2 className="text-balance text-[36px] leading-[1.05] md:text-[48px]">{title}</h2>
      {sub && <p className="mt-5 text-[17px] leading-relaxed text-ink-muted md:text-lg">{sub}</p>}
    </div>
  );
}
