import { Icon, type IconName } from "@/components/ui/icon";
import { cx } from "@/lib/utils";

export type ActivityKind = "ai" | "publish" | "review" | "brief" | "warn" | "user";

export type ActivityItem = {
  kind: ActivityKind;
  text: string;
  time: string;
};

const KIND_MAP: Record<ActivityKind, { icon: IconName; bg: string; fg: string }> = {
  ai: { icon: "sparkle", bg: "bg-purple", fg: "text-ink" },
  publish: { icon: "check", bg: "bg-green", fg: "text-ink" },
  review: { icon: "shield", bg: "bg-sky", fg: "text-ink" },
  brief: { icon: "plus", bg: "bg-yellow", fg: "text-ink" },
  warn: { icon: "warn", bg: "bg-orange", fg: "text-ink" },
  user: { icon: "users", bg: "bg-ink", fg: "text-cream" },
};

export function ActivityFeed({ items }: { items: ActivityItem[] }) {
  return (
    <ul className="flex flex-col divide-y divide-dashed divide-ink/10">
      {items.map((item, index) => {
        const style = KIND_MAP[item.kind];
        return (
          <li
            key={`${item.time}-${index}`}
            className="grid grid-cols-[28px_1fr_auto] items-start gap-3 py-3"
          >
            <span
              className={cx(
                "grid h-7 w-7 place-items-center rounded-sm",
                style.bg,
                style.fg,
              )}
            >
              <Icon name={style.icon} size={13} />
            </span>
            <p
              className="text-[12px] leading-[1.4] text-ink"
              dangerouslySetInnerHTML={{ __html: item.text }}
            />
            <span className="whitespace-nowrap text-[10px] font-bold uppercase tracking-[0.06em] text-ink/50">
              {item.time}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
