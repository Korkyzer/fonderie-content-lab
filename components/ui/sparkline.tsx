type SparklineProps = {
  values: number[];
  color?: string;
  height?: number;
  strokeWidth?: number;
};

export function Sparkline({
  values,
  color = "currentColor",
  height = 28,
  strokeWidth = 2,
}: SparklineProps) {
  if (values.length < 2) return null;
  const width = 100;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  const points = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="block h-full w-full"
      style={{ height }}
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
