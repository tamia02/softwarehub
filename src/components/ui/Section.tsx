import { cn } from "@/lib/utils";

export function Section({
  id,
  className,
  innerClassName,
  children,
}: {
  id?: string;
  className?: string;
  innerClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className={cn("section-pad scroll-mt-20", className)}>
      <div className={cn("container-page", innerClassName)}>{children}</div>
    </section>
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
      {eyebrow && (
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      )}
      <h2 className="text-balance text-[32px] leading-[1.1] font-extrabold md:text-[40px]">{title}</h2>
      {sub && <p className="mt-4 text-lg text-ink-muted">{sub}</p>}
    </div>
  );
}
