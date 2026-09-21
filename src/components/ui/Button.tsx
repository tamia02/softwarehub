import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "dark" | "accent";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-display font-semibold rounded-full whitespace-nowrap select-none " +
  "transition-[transform,box-shadow,background-color,color,border-color] duration-200 ease-[var(--ease-spring)] " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/40 " +
  "active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-[#fff8e8] hover:bg-primary-600 shadow-[var(--shadow-button)] hover:-translate-y-0.5",
  secondary: "bg-white text-ink border-2 border-line-strong hover:border-primary/60 hover:-translate-y-0.5 shadow-sm",
  ghost: "bg-transparent text-ink hover:bg-bg-soft",
  dark: "bg-ink text-[#fff8e8] hover:bg-black hover:-translate-y-0.5 shadow-[0_10px_24px_rgba(42,20,8,0.25)]",
  accent: "bg-accent text-ink hover:brightness-95 hover:-translate-y-0.5 shadow-[0_10px_24px_rgba(245,158,11,0.35)]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-[15px]",
  lg: "h-14 px-8 text-[17px]",
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
