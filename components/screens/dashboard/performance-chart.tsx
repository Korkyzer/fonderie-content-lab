import { cx } from "@/lib/utils";

type PerformanceChartProps = {
  values: number[];
  max?: number;
  highlightFromIndex?: number;
};

export function PerformanceChart({
  values,
  max,
  highlightFromIndex = 25,
}: PerformanceChartProps) {
  const ceiling = max ?? Math.max(...values);
  return (
    <div className="flex h-40 items-end gap-[3px]">
      {values.map((value, index) => {
        const height = Math.max(4, (value / ceiling) * 100);
        return (
          <span
            key={index}
            className={cx(
              "flex-1 rounded-t-[2px] transition-colors",
              index >= highlightFromIndex ? "bg-purple" : "bg-ink/15",
            )}
            style={{ height: `${height}%` }}
          />
        );
      })}
    </div>
  );
}
