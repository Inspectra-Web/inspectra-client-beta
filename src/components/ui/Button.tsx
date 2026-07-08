import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "outline" | "ghost";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium " +
  "transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none " +
  "whitespace-nowrap select-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-brand text-[#04121f] font-semibold shadow-[0_8px_20px_-8px_rgba(26,172,240,0.7)] " +
    "hover:bg-cyan hover:shadow-[0_10px_26px_-6px_rgba(26,172,240,0.8)] hover:-translate-y-0.5",
  outline:
    "border border-line bg-surface text-ink hover:border-brand/60 hover:bg-surface-2",
  ghost: "text-muted hover:text-ink hover:bg-surface-2",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

/** Shared class recipe — use on <button>, or spread onto a react-router <Link>. */
export function buttonClasses(
  variant: Variant = "primary",
  size: Size = "md",
  className?: string,
) {
  return cn(base, variants[variant], sizes[size], className);
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return <button className={buttonClasses(variant, size, className)} {...props} />;
}
