import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Flat marketplace button: solid fill, 8px radius, semibold label. Primary is
 * the red-coral action colour, dark is navy, secondary is a bordered white
 * surface, ghost is text-only.
 */
type Variant = "primary" | "secondary" | "dark" | "ghost";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent-2 shadow-[0_1px_2px_rgba(16,24,40,0.08)]",
  secondary: "border border-line-strong bg-bg-card text-ink hover:border-ink-faint hover:bg-bg",
  dark: "bg-primary text-on-primary hover:bg-[#1c2436]",
  ghost: "bg-transparent text-ink hover:bg-bg-soft",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[14px]",
  md: "h-11 px-5 text-[15px]",
  lg: "h-12 px-6 text-[16px]",
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
  const cls = cn(
    "inline-flex cursor-pointer select-none items-center justify-center gap-2 whitespace-nowrap rounded-[8px] font-semibold leading-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/25 active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    sizes[size],
    className,
  );
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button ref={ref} className={cls} {...rest}>
      {children}
    </button>
  );
});
