import Link from "next/link";
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "dark" | "accent";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap select-none " +
  "transition-[transform,box-shadow,background-color,color,border-color] duration-200 ease-[var(--ease-spring)] " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/35 " +
  "active:scale-[0.985] disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-[#fbf6ec] hover:bg-primary-600 shadow-[var(--shadow-button)] hover:-translate-y-px",
  secondary: "bg-white text-ink border border-line-strong hover:border-ink/40 hover:-translate-y-px shadow-[var(--shadow-card)]",
  ghost: "bg-transparent text-ink hover:bg-bg-soft",
  dark: "bg-ink text-[#fbf6ec] hover:bg-black hover:-translate-y-px shadow-[0_8px_20px_rgba(27,20,16,0.22)]",
  accent: "bg-accent text-ink hover:brightness-95 hover:-translate-y-px shadow-[0_8px_20px_rgba(232,163,23,0.3)]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-[13.5px]",
  md: "h-11 px-6 text-[15px]",
  lg: "h-[52px] px-7 text-[16px]",
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
