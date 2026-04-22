import type { ReactNode } from "react";

import { cx } from "@/lib/utils";

type PanelProps = {
  children: ReactNode;
  className?: string;
};

export function Panel({ children, className }: PanelProps) {
  return (
    <section
      className={cx(
        "rounded-md border border-ink/8 bg-cream p-5 shadow-card",
        className,
      )}
    >
      {children}
    </section>
  );
}
