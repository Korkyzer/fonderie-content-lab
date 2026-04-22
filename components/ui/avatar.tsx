import { cx } from "@/lib/utils";

type AvatarTone =
  | "purple"
  | "sky"
  | "yellow"
  | "green"
  | "orange"
  | "pink"
  | "caramel"
  | "ink";

type AvatarProps = {
  name: string;
  tone?: AvatarTone;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const TONES: Record<AvatarTone, string> = {
  purple: "bg-purple text-ink",
  sky: "bg-sky text-ink",
  yellow: "bg-yellow text-ink",
  green: "bg-green text-ink",
  orange: "bg-orange text-ink",
  pink: "bg-pink text-ink",
  caramel: "bg-caramel text-cream",
  ink: "bg-ink text-cream",
};

const SIZES = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-[11px]",
  lg: "h-12 w-12 text-[14px]",
} as const;

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function Avatar({
  name,
  tone = "purple",
  size = "md",
  className,
}: AvatarProps) {
  return (
    <span
      aria-label={name}
      title={name}
      className={cx(
        "inline-grid place-items-center rounded-full font-bold uppercase leading-none",
        TONES[tone],
        SIZES[size],
        className,
      )}
    >
      {initials(name) || "?"}
    </span>
  );
}
