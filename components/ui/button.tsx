import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cx } from "@/lib/utils";

type Variant = "primary" | "dark" | "light" | "ghost" | "outline" | "sky";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  icon?: ReactNode;
  iconRight?: ReactNode;
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-sm font-bold uppercase tracking-[0.06em] border transition-all duration-150 ease-brand whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple disabled:opacity-50 disabled:pointer-events-none";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-purple text-ink border-ink shadow-hard hover:bg-hover-primary hover:-translate-x-px hover:-translate-y-px hover:shadow-hard-lg",
  dark: "bg-ink text-cream border-ink hover:bg-hover-dark hover:-translate-x-px hover:-translate-y-px",
  light:
    "bg-cream text-ink border-ink/15 hover:bg-white hover:border-ink hover:-translate-x-px hover:-translate-y-px",
  ghost:
    "bg-transparent text-ink border-transparent hover:bg-ink/6",
  outline:
    "bg-transparent text-ink border-ink hover:bg-ink hover:text-cream",
  sky: "bg-sky text-ink border-ink shadow-hard hover:-translate-x-px hover:-translate-y-px hover:shadow-hard-lg",
};

const SIZES: Record<Size, string> = {
  sm: "px-2.5 py-1.5 text-[11px]",
  md: "px-3.5 py-2.5 text-[12px]",
  lg: "px-4 py-3 text-[13px]",
};

export function Button({
  variant = "primary",
  size = "md",
  icon,
  iconRight,
  className,
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(BASE, VARIANTS[variant], SIZES[size], className)}
      {...rest}
    >
      {icon ? <span className="[&_svg]:h-3.5 [&_svg]:w-3.5">{icon}</span> : null}
      {children}
      {iconRight ? (
        <span className="[&_svg]:h-3.5 [&_svg]:w-3.5">{iconRight}</span>
      ) : null}
    </button>
  );
}
