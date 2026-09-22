import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Outlined pill button with a dark offset layer behind it. On hover the face
 * lifts (−6px on desktop) and the layer stays put — the reference's signature
 * button. Sizes follow the measured scale: 18–20px bold labels.
 */
type Variant = "primary" | "secondary" | "dark" | "ghost";
type Size = "sm" | "md" | "lg";

const face: Record<Variant, string> = {
  primary: "bg-accent text-on-accent border-ink-line",
  secondary: "bg-bg-card text-ink border-ink-line",
  dark: "bg-primary text-on-primary border-ink-line",
  ghost: "bg-transparent text-ink border-transparent",
};
const layer: Record<Variant, string> = {
  primary: "bg-primary border-ink-line",
  secondary: "bg-[var(--offset-card)] border-ink-line",
  dark: "bg-ink-line border-ink-line",
  ghost: "hidden",
};
const sizes: Record<Size, string> = {
  sm: "h-[42px] px-5 text-[16px]",
  md: "h-12 px-6 text-[18px]",
  lg: "h-14 px-8 text-[20px]",
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  children: ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", href, className, children, ...rest },
  ref,
) {
  const wrap = cn(
    "group relative inline-flex cursor-pointer select-none rounded-[100px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
    className,
  );
  const inner = (
    <>
      {variant !== "ghost" && (
        <span aria-hidden className={cn("pointer-events-none absolute inset-0 translate-y-[4px] rounded-[100px] border-2 md:translate-y-[6px]", layer[variant])} />
      )}
      <span
        className={cn(
          "relative z-10 inline-flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-[100px] border-2 font-bold leading-none transition-transform duration-150 ease-out group-hover:-translate-y-[3px] md:group-hover:-translate-y-[5px] group-active:translate-y-0",
          face[variant],
          sizes[size],
        )}
      >
        {children}
      </span>
    </>
  );
  if (href) {
    return (
      <Link href={href} className={wrap}>
        {inner}
      </Link>
    );
  }
  return (
    <button ref={ref} className={wrap} {...rest}>
      {inner}
    </button>
  );
});
