import type { HTMLAttributes, ReactNode } from "react";

import { cx } from "@/lib/utils";

export type BadgeTone =
  | "ink"
  | "purple"
  | "sky"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "green-sapin"
  | "turquoise"
  | "lila"
  | "pink"
  | "caramel"
  | "outline";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  children: ReactNode;
};

const TONES: Record<BadgeTone, string> = {
  ink: "bg-ink text-cream",
  purple: "bg-purple text-ink",
  sky: "bg-sky text-ink",
  red: "bg-red text-cream",
  orange: "bg-orange text-ink",
  yellow: "bg-yellow text-ink",
  green: "bg-green text-ink",
  "green-sapin": "bg-green-sapin text-cream",
  turquoise: "bg-turquoise text-ink",
  lila: "bg-lila text-ink",
  pink: "bg-pink text-ink",
  caramel: "bg-caramel text-cream",
  outline: "bg-transparent text-ink border border-ink/20",
};

export function Badge({ tone = "ink", className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-[3px] px-2 py-0.5 text-[11px] font-bold uppercase leading-tight tracking-[0.05em]",
        TONES[tone],
        className,
      )}
      {...rest}
    >
      {children}
    </span>
  );
}
