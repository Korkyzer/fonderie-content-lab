import type { ReactNode } from "react";

type IconProps = {
  name: "sparkle" | "plus" | "search" | "arrow" | "bookmark";
  size?: number;
};

const icons: Record<IconProps["name"], (size: number) => ReactNode> = {
  sparkle: (size) => <span style={{ fontSize: size }}>✦</span>,
  plus: (size) => <span style={{ fontSize: size }}>+</span>,
  search: (size) => <span style={{ fontSize: size }}>⌕</span>,
  arrow: (size) => <span style={{ fontSize: size }}>→</span>,
  bookmark: (size) => <span style={{ fontSize: size }}>⌂</span>,
};

export function Icon({ name, size = 14 }: IconProps) {
  return <span aria-hidden="true">{icons[name](size)}</span>;
}
