import type { HTMLAttributes } from "react";
import { cx } from "@/lib/utils";

type TagTone =
  | "caramel"
  | "sky"
  | "green"
  | "pink"
  | "purple"
  | "outline"
  | "ink";

const toneClass: Record<TagTone, string> = {
  caramel: "bg-[rgba(222,107,72,0.14)] text-[var(--brand-ink)]",
  sky: "bg-sky text-ink",
  green: "bg-green text-ink",
  pink: "bg-pink text-ink",
  purple: "bg-purple text-ink",
  outline: "border border-ink/12 bg-white text-ink/75",
  ink: "bg-ink text-white",
};

export function Tag({
  children,
  className,
  tone = "outline",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: TagTone }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em]",
        toneClass[tone],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
