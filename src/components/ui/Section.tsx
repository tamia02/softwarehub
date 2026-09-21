import { cn } from "@/lib/utils";

export function Section({ id, className, innerClassName, children }: { id?: string; className?: string; innerClassName?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={cn("section-pad scroll-mt-20", className)}>
      <div className={cn("container-page", innerClassName)}>{children}</div>
    </section>
  );
}

/** Small amber pill above a heading. */
export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-line-strong bg-accent-soft px-3 py-1 font-display text-[12px] font-semibold uppercase tracking-[0.16em] text-primary", className)}>
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
      {eyebrow && <Eyebrow className="mb-4">{eyebrow}</Eyebrow>}
      <h2 className="text-balance text-[34px] leading-[1.08] font-bold md:text-[44px]">{title}</h2>
      {sub && <p className="mt-4 text-lg text-ink-muted">{sub}</p>}
    </div>
  );
}
