import { cx } from "@/lib/utils";

type MiniCalendarProps = {
  events: Record<number, "publi" | "jpo">;
  todayDay: number;
  monthLabel: string;
  startOffset: number;
  daysInMonth: number;
  prevMonthDays: number;
};

const WEEK = ["L", "M", "M", "J", "V", "S", "D"] as const;

export function MiniCalendar({
  events,
  todayDay,
  monthLabel,
  startOffset,
  daysInMonth,
  prevMonthDays,
}: MiniCalendarProps) {
  const cells: Array<{ key: string; label: number; cls: string }> = [];

  for (let i = 0; i < startOffset; i += 1) {
    cells.push({
      key: `prev-${i}`,
      label: prevMonthDays - startOffset + i + 1,
      cls: "text-ink/20",
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const event = events[day];
    let cls = "text-ink/80";
    if (day === todayDay) {
      cls = "bg-ink text-cream";
    } else if (event === "jpo") {
      cls = "bg-purple text-ink font-bold";
    } else if (event === "publi") {
      cls = "bg-purple-soft text-ink";
    }
    cells.push({ key: `day-${day}`, label: day, cls });
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-[13px] font-bold tracking-wide">{monthLabel}</p>
        <div className="flex items-center gap-1 text-[11px] text-ink/50">
          <button
            type="button"
            aria-label="Mois précédent"
            className="grid h-6 w-6 place-items-center rounded-sm border border-ink/10 hover:border-ink/30"
          >
            ‹
          </button>
          <button
            type="button"
            aria-label="Mois suivant"
            className="grid h-6 w-6 place-items-center rounded-sm border border-ink/10 hover:border-ink/30"
          >
            ›
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[10px]">
        {WEEK.map((letter, index) => (
          <div
            key={`${letter}-${index}`}
            className="pb-1 font-bold uppercase tracking-[0.08em] text-ink/40"
          >
            {letter}
          </div>
        ))}
        {cells.map((cell) => (
          <div
            key={cell.key}
            className={cx(
              "grid h-8 place-items-center rounded-sm text-[11px] font-bold",
              cell.cls,
            )}
          >
            {cell.label}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-[10px] font-bold uppercase tracking-[0.08em] text-ink/60">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-[2px] bg-purple" />
          JPO
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-[2px] bg-purple-soft" />
          Publi
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-[2px] bg-ink" />
          Aujourd’hui
        </span>
      </div>
    </div>
  );
}
