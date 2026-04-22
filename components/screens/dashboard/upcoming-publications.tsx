import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Placeholder, type PlaceholderTone } from "@/components/ui/placeholder";

export type UpcomingPublication = {
  id: number;
  title: string;
  persona: string;
  personaTone: BadgeTone;
  platform: string;
  thumb: PlaceholderTone;
  day: string;
  month: string;
  time: string;
};

export function UpcomingPublications({
  items,
}: {
  items: UpcomingPublication[];
}) {
  return (
    <ul className="divide-y divide-dashed divide-ink/10">
      {items.map((item) => (
        <li
          key={item.id}
          className="grid grid-cols-[48px_1fr_auto] items-center gap-3 py-3"
        >
          <Placeholder tone={item.thumb} className="h-12 w-12 rounded-sm" />
          <div>
            <p className="text-[13px] font-bold leading-tight text-ink">
              {item.title}
            </p>
            <div className="mt-1 flex items-center gap-2">
              <Badge tone={item.personaTone}>{item.persona}</Badge>
              <span className="text-[11px] text-ink/60">{item.platform}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[18px] font-bold leading-none">{item.day}</p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-ink/60">
              {item.month}
            </p>
            <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.08em] text-ink/60">
              {item.time}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
