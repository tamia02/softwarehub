import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "dark" | "accent";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-full whitespace-nowrap select-none " +
  "transition-[transform,box-shadow,background-color,color] duration-200 ease-[var(--ease-spring)] " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 " +
  "active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-600 shadow-[0_8px_24px_rgba(0,87,255,0.28)] hover:-translate-y-0.5",
  secondary: "bg-white text-ink border border-line hover:border-ink/30 hover:-translate-y-0.5 shadow-sm",
  ghost: "bg-transparent text-ink hover:bg-bg-soft",
  dark: "bg-ink text-white hover:bg-black hover:-translate-y-0.5",
  accent: "bg-accent text-ink hover:brightness-95 hover:-translate-y-0.5 shadow-[0_8px_24px_rgba(255,184,0,0.35)]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-[15px]",
  lg: "h-14 px-8 text-base",
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
  const cls = cn(base, variants[variant], sizes[size], className);
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
