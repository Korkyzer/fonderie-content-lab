import type { ReactNode } from "react";

import { cx } from "@/lib/utils";

type Tone = "purple" | "sky" | "yellow" | "green" | "pink" | "caramel" | "orange";

type TagProps = {
  children: ReactNode;
  tone?: Tone;
};

const toneClasses: Record<Tone, string> = {
  purple: "bg-purple/15 text-ink",
  sky: "bg-sky/25 text-ink",
  yellow: "bg-yellow/45 text-ink",
  green: "bg-green/15 text-ink",
  pink: "bg-pink/20 text-ink",
  caramel: "bg-caramel/20 text-ink",
  orange: "bg-orange/25 text-ink",
};

export function Tag({ children, tone = "purple" }: TagProps) {
  return (
    <span
      className={cx(
        "inline-flex rounded-[3px] px-2 py-1 text-[11px] font-bold uppercase tracking-[0.08em]",
        toneClasses[tone],
      )}
    >
      {children}
    </span>
  );
}
