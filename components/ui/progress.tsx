import { cx } from "@/lib/utils";

type ProgressProps = {
  value: number;
  max?: number;
  tone?: "purple" | "sky" | "green" | "orange" | "ink";
  size?: "sm" | "md";
  label?: string;
  showValue?: boolean;
  className?: string;
};

const TONES = {
  purple: "bg-purple",
  sky: "bg-sky",
  green: "bg-green",
  orange: "bg-orange",
  ink: "bg-ink",
} as const;

const SIZES = {
  sm: "h-1",
  md: "h-1.5",
} as const;

export function Progress({
  value,
  max = 100,
  tone = "sky",
  size = "md",
  label,
  showValue,
  className,
}: ProgressProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));

  return (
    <div className={cx("flex flex-col gap-1.5", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.1em] text-ink/60">
          {label ? <span>{label}</span> : <span />}
          {showValue ? (
            <span>
              {value}/{max}
            </span>
          ) : null}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={value}
        aria-valuemax={max}
        className={cx("overflow-hidden rounded-sm bg-ink/10", SIZES[size])}
      >
        <div
          className={cx("h-full transition-[width] duration-500", TONES[tone])}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
