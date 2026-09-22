import { cn } from "@/lib/utils";

/** Plain vertical section (no panel). */
export function Section({ id, className, innerClassName, children }: { id?: string; className?: string; innerClassName?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={cn("scroll-mt-24 py-12 md:py-16", className)}>
      <div className={cn("container-page", innerClassName)}>{children}</div>
    </section>
  );
}

/** Cream rounded panel section, the reference's main framing device. */
export function Panel({ id, className, innerClassName, children }: { id?: string; className?: string; innerClassName?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 py-5 md:py-8">
      <div className={cn("panel", className)}>
        <div className={cn("panel-inner", innerClassName)}>{children}</div>
      </div>
    </section>
  );
}

/** Hand-script eyebrow/sub-line. */
export function Hand({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("font-hand text-[24px] leading-none text-accent-2 md:text-[28px]", className)}>{children}</p>;
}

export function SectionHeading({ title, sub, hand, align = "center", className }: { title: React.ReactNode; sub?: React.ReactNode; hand?: React.ReactNode; align?: "center" | "left"; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-3 md:gap-5", align === "center" ? "mx-auto items-center text-center" : "items-start", className)}>
      <h2 className="t-h2 text-balance text-ink-line">{title}</h2>
      {hand && <Hand>{hand}</Hand>}
      {sub && <p className="t-lead max-w-2xl text-ink-muted">{sub}</p>}
    </div>
  );
}

export { SectionHeading as Heading };
