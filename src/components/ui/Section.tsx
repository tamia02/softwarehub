import { cn } from "@/lib/utils";

/** Plain vertical section (no panel). */
export function Section({ id, className, innerClassName, children }: { id?: string; className?: string; innerClassName?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={cn("scroll-mt-24 py-12 md:py-16", className)}>
      <div className={cn("container-page", innerClassName)}>{children}</div>
    </section>
  );
}

/** White bordered panel section inside the page container. */
export function Panel({ id, className, innerClassName, children }: { id?: string; className?: string; innerClassName?: string; children: React.ReactNode }) {
  return (
    <section id={id} className="container-page scroll-mt-24 py-3 md:py-4">
      <div className={cn("panel", className)}>
        <div className={cn("panel-inner", innerClassName)}>{children}</div>
      </div>
    </section>
  );
}

/** Accent eyebrow/sub-line (formerly hand-script). */
export function Hand({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-[13px] font-semibold uppercase tracking-[0.08em] text-accent-2", className)}>{children}</p>;
}

export function SectionHeading({ title, sub, hand, align = "center", className }: { title: React.ReactNode; sub?: React.ReactNode; hand?: React.ReactNode; align?: "center" | "left"; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-2 md:gap-3", align === "center" ? "mx-auto items-center text-center" : "items-start", className)}>
      {hand && <Hand>{hand}</Hand>}
      <h2 className="t-h2 text-balance text-ink">{title}</h2>
      {sub && <p className="t-lead max-w-2xl text-ink-muted">{sub}</p>}
    </div>
  );
}

export { SectionHeading as Heading };
