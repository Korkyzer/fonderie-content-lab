import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/utils";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "light" | "dark";
  size?: "sm" | "md";
  icon?: ReactNode;
  iconRight?: ReactNode;
};

const variantClass: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary: "bg-[var(--brand)] text-white shadow-[0_16px_30px_rgba(185,76,44,0.2)]",
  light: "border border-ink/10 bg-white text-ink",
  dark: "bg-ink text-white",
};

const sizeClass: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-2 text-[11px]",
  md: "px-4 py-3 text-sm",
};

export function Button({
  children,
  className,
  icon,
  iconRight,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-full font-semibold uppercase tracking-[0.08em] transition hover:-translate-y-0.5",
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    >
      {icon}
      <span>{children}</span>
      {iconRight}
    </button>
  );
}
