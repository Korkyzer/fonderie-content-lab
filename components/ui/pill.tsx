"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cx } from "@/lib/utils";

type PillProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  tone?: "default" | "purple";
  children: ReactNode;
};

export function Pill({
  active = false,
  tone = "default",
  className,
  children,
  ...rest
}: PillProps) {
  const activeStyle =
    tone === "purple"
      ? "bg-purple text-ink border-ink"
      : "bg-ink text-cream border-ink";

  return (
    <button
      type="button"
      className={cx(
        "inline-flex cursor-pointer items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.05em] transition-colors",
        active ? activeStyle : "border-ink/15 text-ink hover:border-ink",
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
