import { cx } from "@/lib/utils";

import { Icon } from "./icon";
import { Sparkline } from "./sparkline";

type DeltaDir = "up" | "down" | "flat";

type KpiCardProps = {
  label: string;
  value: string;
  delta: string;
  deltaDir?: DeltaDir;
  spark?: number[];
  accent?: string;
  className?: string;
};

const DELTA_STYLES: Record<DeltaDir, string> = {
  up: "bg-green text-ink",
  down: "bg-red text-cream",
  flat: "bg-ink/10 text-ink",
};

export function KpiCard({
  label,
  value,
  delta,
  deltaDir = "up",
  spark,
  accent,
  className,
}: KpiCardProps) {
  return (
    <div
      className={cx(
        "relative flex flex-col gap-2.5 overflow-hidden rounded-md border border-ink/6 bg-cream p-5 transition-transform duration-200 ease-brand hover:-translate-y-0.5",
        className,
      )}
    >
      {accent ? (
        <div
          className="absolute left-0 top-0 h-1 w-full"
          style={{ background: accent }}
        />
      ) : null}
      <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink/70">
        {label}
      </p>
      <p className="text-[44px] font-bold leading-none tracking-[-0.02em]">
        {value}
      </p>
      <div className="flex items-center justify-between">
        <span
          className={cx(
            "inline-flex items-center gap-1 rounded-[3px] px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.04em]",
            DELTA_STYLES[deltaDir],
          )}
        >
          <Icon
            name={deltaDir === "up" ? "up" : deltaDir === "down" ? "down" : "dot"}
            size={10}
          />
          {delta}
        </span>
      </div>
      {spark ? (
        <div className="mt-1 h-7">
          <Sparkline values={spark} color={accent ?? "var(--color-ink)"} />
        </div>
      ) : null}
    </div>
  );
}
