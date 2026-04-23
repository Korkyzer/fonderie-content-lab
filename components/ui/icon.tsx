import type { SVGProps } from "react";

export const ICON_NAMES = [
  "dashboard",
  "generate",
  "shield",
  "kanban",
  "calendar",
  "eye",
  "bookmark",
  "users",
  "search",
  "plus",
  "arrow",
  "chevron",
  "chevron-down",
  "bell",
  "sparkle",
  "check",
  "warn",
  "close",
  "filter",
  "more",
  "play",
  "up",
  "down",
  "heart",
  "instagram",
  "tiktok",
  "linkedin",
  "youtube",
  "dot",
  "robot",
  "drag",
] as const;

export type IconName = (typeof ICON_NAMES)[number];

const PATHS: Record<IconName, React.ReactNode> = {
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </>
  ),
  generate: (
    <>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v6c0 4.5-3 8-7 9-4-1-7-4.5-7-9V6l7-3z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  kanban: (
    <>
      <rect x="3" y="3" width="5" height="14" rx="1" />
      <rect x="10" y="3" width="5" height="10" rx="1" />
      <rect x="17" y="3" width="4" height="18" rx="1" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" />
    </>
  ),
  eye: (
    <>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  bookmark: (
    <>
      <path d="M7 4h10a1 1 0 0 1 1 1v16l-6-4-6 4V5a1 1 0 0 1 1-1z" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <circle cx="17" cy="9" r="2.5" />
      <path d="M3 20c0-3 2.5-5 6-5s6 2 6 5M15 20c0-2 1.5-3.5 4-3.5 1.8 0 3 0.8 3 2" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3-3" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  arrow: <path d="M5 12h14M13 5l7 7-7 7" />,
  chevron: <path d="m9 6 6 6-6 6" />,
  "chevron-down": <path d="m6 9 6 6 6-6" />,
  bell: (
    <>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 7 3 9H3c0-2 3-2 3-9z" />
      <path d="M10 21h4" />
    </>
  ),
  sparkle: (
    <path d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l3 3M15 15l3 3M6 18l3-3M15 9l3-3" />
  ),
  check: <path d="m5 13 5 5L20 6" />,
  warn: (
    <>
      <path d="M12 3 2 20h20L12 3z" />
      <path d="M12 10v4M12 17v.5" />
    </>
  ),
  close: <path d="M6 6l12 12M18 6 6 18" />,
  filter: <path d="M4 5h16M7 12h10M10 19h4" />,
  more: (
    <>
      <circle cx="6" cy="12" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="18" cy="12" r="1.5" fill="currentColor" />
    </>
  ),
  play: <path d="M6 4v16l14-8L6 4z" />,
  up: <path d="M12 19V5M5 12l7-7 7 7" />,
  down: <path d="M12 5v14M5 12l7 7 7-7" />,
  heart: <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z" />,
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.5" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </>
  ),
  tiktok: (
    <>
      <path d="M14 4v10a3 3 0 1 1-3-3" />
      <path d="M14 4c0 3 2 5 5 5" />
    </>
  ),
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M7 10v7M7 7v.5M11 17v-7M11 13c0-2 1.5-3 3-3s3 1 3 3v4" />
    </>
  ),
  youtube: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="3" />
      <path d="m10 9 6 3-6 3V9z" fill="currentColor" />
    </>
  ),
  dot: <circle cx="12" cy="12" r="3" fill="currentColor" />,
  robot: (
    <>
      <rect x="4" y="7" width="16" height="13" rx="3" />
      <circle cx="9" cy="13" r="1.3" fill="currentColor" />
      <circle cx="15" cy="13" r="1.3" fill="currentColor" />
      <path d="M12 4v3M9 17h6" />
    </>
  ),
  drag: (
    <>
      <circle cx="9" cy="6" r="1" fill="currentColor" />
      <circle cx="9" cy="12" r="1" fill="currentColor" />
      <circle cx="9" cy="18" r="1" fill="currentColor" />
      <circle cx="15" cy="6" r="1" fill="currentColor" />
      <circle cx="15" cy="12" r="1" fill="currentColor" />
      <circle cx="15" cy="18" r="1" fill="currentColor" />
    </>
  ),
};

type IconProps = Omit<SVGProps<SVGSVGElement>, "name"> & {
  name: IconName;
  size?: number;
  strokeWidth?: number;
};

export function Icon({
  name,
  size = 18,
  strokeWidth = 1.75,
  fill = "none",
  ...rest
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...rest}
    >
      {PATHS[name] ?? null}
    </svg>
  );
}
