import type { HTMLAttributes, ReactNode } from "react";

import { cx } from "@/lib/utils";

export type PlaceholderTone =
  | "default"
  | "purple"
  | "sky"
  | "ink"
  | "orange"
  | "yellow"
  | "green"
  | "pink";

type PlaceholderProps = HTMLAttributes<HTMLDivElement> & {
  tone?: PlaceholderTone;
  label?: string;
  children?: ReactNode;
};

const TONES: Record<PlaceholderTone, string> = {
  default:
    "text-ink/55 [background-image:repeating-linear-gradient(135deg,rgb(29_29_27_/_0.06)_0_8px,rgb(29_29_27_/_0.10)_8px_16px)] bg-ink/4",
  purple:
    "text-placeholder-sky [background-image:repeating-linear-gradient(135deg,rgb(174_100_222_/_0.2)_0_8px,rgb(174_100_222_/_0.35)_8px_16px)] bg-purple/15",
  sky: "text-placeholder-sky [background-image:repeating-linear-gradient(135deg,rgb(128_211_255_/_0.25)_0_8px,rgb(128_211_255_/_0.45)_8px_16px)] bg-sky/20",
  ink: "text-cream/60 [background-image:repeating-linear-gradient(135deg,rgb(250_247_241_/_0.05)_0_8px,rgb(250_247_241_/_0.12)_8px_16px)] bg-ink",
  orange:
    "text-placeholder-orange [background-image:repeating-linear-gradient(135deg,rgb(255_141_40_/_0.25)_0_8px,rgb(255_141_40_/_0.45)_8px_16px)] bg-orange/20",
  yellow:
    "text-placeholder-yellow [background-image:repeating-linear-gradient(135deg,rgb(255_237_0_/_0.3)_0_8px,rgb(255_237_0_/_0.55)_8px_16px)] bg-yellow/25",
  green:
    "text-placeholder-green [background-image:repeating-linear-gradient(135deg,rgb(0_185_90_/_0.2)_0_8px,rgb(0_185_90_/_0.35)_8px_16px)] bg-green/12",
  pink: "text-placeholder-pink [background-image:repeating-linear-gradient(135deg,rgb(255_111_165_/_0.25)_0_8px,rgb(255_111_165_/_0.45)_8px_16px)] bg-pink/20",
};

export function Placeholder({
  tone = "default",
  label,
  className,
  children,
  ...rest
}: PlaceholderProps) {
  return (
    <div
      className={cx(
        "grid place-items-center overflow-hidden font-mono text-[10px] uppercase tracking-[0.1em]",
        TONES[tone],
        className,
      )}
      {...rest}
    >
      {children ?? (label ? <span>{label}</span> : null)}
    </div>
  );
}
