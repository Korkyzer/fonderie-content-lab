"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  endOfMonth,
  format,
  getDay,
  startOfMonth,
} from "date-fns";
import { fr } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Pill } from "@/components/ui/pill";
import { cx } from "@/lib/utils";

import {
  AI_SUGGESTIONS,
  AI_SUGGESTION_TAGS,
  BALANCE_SEGMENTS,
  CALENDAR_ENTRIES,
  CHANNEL_FILTERS,
  MONTH_INDEX,
  MONTH_YEAR,
  STATUS_LABELS,
  TONE_BG,
  type CalendarChannel,
  type CalendarEntry,
} from "./calendar-data";

type CampaignEvent = {
  id: number;
  title: string;
  campaign: string;
  startDate: string;
  endDate: string;
  eventType: string;
  location: string | null;
  aiSuggestion: string | null;
};

type CalendarViewProps = {
  campaignEvents: CampaignEvent[];
  scheduledCount: number;
};

const CAMPAIGN_TAGS: Array<{ label: string; tone: "purple" | "pink" | "caramel" }> = [
  { label: "JPO 17 mai", tone: "purple" },
  { label: "Partenariats", tone: "pink" },
  { label: "Alumni", tone: "caramel" },
];

const DAY_HEADERS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const SUGGESTION_ACCENT: Record<string, string> = {
  yellow: "border-l-yellow",
  pink: "border-l-pink",
  turquoise: "border-l-turquoise",
  green: "border-l-green",
};

const BALANCE_TONE: Record<string, string> = {
  yellow: "bg-yellow",
  purple: "bg-purple",
  sky: "bg-sky",
  caramel: "bg-caramel",
  pink: "bg-pink",
};

function getMondayIndex(date: Date) {
  return (getDay(date) + 6) % 7;
}

export function CalendarView({
  campaignEvents,
  scheduledCount,
}: CalendarViewProps) {
  const baseDate = useMemo(
    () => new Date(MONTH_YEAR, MONTH_INDEX, 1),
    [],
  );
  const [cursor, setCursor] = useState<Date>(baseDate);
  const [channel, setChannel] = useState<CalendarChannel | "Toutes">("Toutes");
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);

  const isReferenceMonth =
    cursor.getFullYear() === MONTH_YEAR && cursor.getMonth() === MONTH_INDEX;

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const startOffset = getMondayIndex(monthStart);
  const totalDays = monthEnd.getDate();

  const filteredEntries = useMemo(
    () =>
      CALENDAR_ENTRIES.filter(
        (entry) => channel === "Toutes" || entry.channel === channel,
      ),
    [channel],
  );

  const entriesByDay = useMemo(() => {
    if (!isReferenceMonth) return new Map<number, CalendarEntry[]>();
    const map = new Map<number, CalendarEntry[]>();
    filteredEntries.forEach((entry) => {
      const list = map.get(entry.day) ?? [];
      list.push(entry);
      map.set(entry.day, list);
    });
    return map;
  }, [filteredEntries, isReferenceMonth]);

  const aiByDay = useMemo(() => {
    if (!isReferenceMonth) return new Map<number, string>();
    return new Map(AI_SUGGESTION_TAGS.map(({ day, text }) => [day, text]));
  }, [isReferenceMonth]);

  const cells: Array<
    | { key: string; type: "pad"; num: number }
    | { key: string; type: "day"; num: number; date: Date }
  > = [];
  const prevMonthEnd = new Date(monthStart);
  prevMonthEnd.setDate(0);
  const prevDays = prevMonthEnd.getDate();
  for (let i = 0; i < startOffset; i++) {
    cells.push({
      key: `pad-start-${i}`,
      type: "pad",
      num: prevDays - startOffset + i + 1,
    });
  }
  for (let d = 1; d <= totalDays; d++) {
    cells.push({
      key: `day-${d}`,
      type: "day",
      num: d,
      date: new Date(monthStart.getFullYear(), monthStart.getMonth(), d),
    });
  }
  let tail = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ key: `pad-end-${tail}`, type: "pad", num: tail });
    tail += 1;
  }

  const monthLabel = format(cursor, "MMMM yyyy", { locale: fr });
  const prev = addMonths(cursor, -1);
  const next = addMonths(cursor, 1);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 border-b border-ink/10 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink/55">
            Calendrier éditorial
          </p>
          <h1 className="mt-2 text-h1 font-display uppercase">
            {monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
            <span className="text-ink/55"> · {scheduledCount} publications planifiées</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="light" size="sm" onClick={() => setCursor(prev)}>
            {format(prev, "MMM", { locale: fr })}
          </Button>
          <Button variant="dark" size="sm" className="pointer-events-none">
            {format(cursor, "MMM", { locale: fr })}
          </Button>
          <Button variant="light" size="sm" onClick={() => setCursor(next)}>
            {format(next, "MMM", { locale: fr })}
          </Button>
          <Button variant="primary" icon={<Icon name="plus" size={14} />}>
            Programmer
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        {CHANNEL_FILTERS.map((filter) => (
          <Pill
            key={filter}
            active={channel === filter}
            onClick={() => setChannel(filter)}
          >
            {filter === "Instagram" ? (
              <Icon name="instagram" size={12} />
            ) : filter === "TikTok" ? (
              <Icon name="tiktok" size={12} />
            ) : filter === "LinkedIn" ? (
              <Icon name="linkedin" size={12} />
            ) : filter === "YouTube" ? (
              <Icon name="youtube" size={12} />
            ) : null}
            {filter === "Toutes" ? "Toutes plateformes" : filter}
          </Pill>
        ))}
        <span className="mx-1 h-4 w-px bg-ink/15" />
        {CAMPAIGN_TAGS.map((tag) => (
          <Badge key={tag.label} tone={tag.tone}>
            {tag.label}
          </Badge>
        ))}
      </div>

      <div className="relative">
        <div className="overflow-hidden rounded-md border border-ink/8 bg-cream shadow-card">
          <div className="grid grid-cols-7 border-b border-ink/8 bg-cream">
            {DAY_HEADERS.map((day) => (
              <div
                key={day}
                className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-ink/55"
              >
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((cell, index) => {
              const col = index % 7;
              const isSat = col === 5;
              const isSun = col === 6;
              const isPad = cell.type === "pad";
              const isJpo =
                !isPad && isReferenceMonth && cell.num === 17;
              const isToday =
                !isPad && isReferenceMonth && cell.num === 7;
              const aiText = !isPad ? aiByDay.get(cell.num) : undefined;
              const entries = !isPad ? entriesByDay.get(cell.num) ?? [] : [];

              return (
                <div
                  key={cell.key}
                  className={cx(
                    "flex min-h-[108px] flex-col gap-1 border-b border-r border-ink/8 p-2 last:border-r-0",
                    isPad && "bg-page/60",
                    isToday && "bg-sky/15",
                  )}
                >
                  <div className="flex items-start justify-between gap-1">
                    <span
                      className={cx(
                        "inline-flex h-6 min-w-6 items-center justify-center text-[12px] font-bold",
                        isPad && "text-ink/30",
                        !isPad && isSat && "text-ink/60",
                        !isPad && isSun && "text-red",
                        isToday &&
                          "rounded-full bg-ink text-cream px-1.5",
                      )}
                    >
                      {cell.num}
                    </span>
                    <div className="flex items-center gap-1">
                      {isJpo ? <Badge tone="purple">JPO</Badge> : null}
                      {aiText ? (
                        <span
                          title={aiText}
                          className="grid h-4 w-4 place-items-center rounded-[3px] border border-ink bg-sky text-[9px] font-bold"
                        >
                          ✦
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {entries.slice(0, 3).map((entry) => (
                      <button
                        key={entry.id}
                        type="button"
                        onClick={() => setSelectedEntry(entry)}
                        className={cx(
                          "truncate rounded-[3px] px-1.5 py-1 text-left text-[10px] font-bold leading-tight tracking-[0.01em] transition-transform hover:-translate-y-px",
                          TONE_BG[entry.tone],
                        )}
                      >
                        {entry.label}
                      </button>
                    ))}
                    {entries.length > 3 ? (
                      <span className="text-[10px] font-bold text-ink/55">
                        +{entries.length - 3}
                      </span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {isReferenceMonth ? (
          <div
            className="pointer-events-none absolute right-[1%] top-[80px] hidden w-[260px] rotate-[-2deg] flex-col gap-1 rounded-md border-[1.5px] border-ink bg-purple px-4 py-3 text-ink shadow-hard-lg xl:flex"
          >
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] opacity-70">
              Samedi 17 mai 2026
            </span>
            <span className="text-[18px] font-bold uppercase leading-none tracking-[-0.02em]">
              Journée portes ouvertes
            </span>
            <span className="text-[9px] font-semibold tracking-[0.08em]">
              10h → 18h · Campus Bagnolet
            </span>
          </div>
        ) : null}
      </div>

      {selectedEntry ? (
        <Card tone="ink" className="text-cream">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-cream/60">
                {format(
                  new Date(MONTH_YEAR, MONTH_INDEX, selectedEntry.day),
                  "EEEE d MMMM yyyy",
                  { locale: fr },
                )}
              </p>
              <h3 className="mt-2 text-[22px] font-bold uppercase leading-tight">
                {selectedEntry.label}
              </h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge tone="purple">{selectedEntry.type}</Badge>
                <Badge tone="sky">{selectedEntry.channel}</Badge>
                <Badge tone="outline" className="border-cream/30 text-cream">
                  {STATUS_LABELS[selectedEntry.status]}
                </Badge>
              </div>
              <p className="mt-3 text-[12px] text-cream/70">
                {selectedEntry.campaign} · assigné à {selectedEntry.assignee}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelectedEntry(null)}
              className="grid h-8 w-8 place-items-center rounded-sm border border-cream/30 text-cream/70 hover:bg-cream/10"
              aria-label="Fermer le détail"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        </Card>
      ) : null}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_0.95fr]">
        <Card>
          <CardHeader
            title="Suggestions IA · événements à venir"
            more={<Badge tone="purple">✦ {AI_SUGGESTIONS.length} suggestions</Badge>}
          />
          <div className="flex flex-col gap-3">
            {AI_SUGGESTIONS.map((suggestion) => (
              <div
                key={suggestion.event}
                className={cx(
                  "rounded-md border border-ink/8 bg-white px-4 py-3 border-l-4",
                  SUGGESTION_ACCENT[suggestion.accent],
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink/55">
                    {suggestion.when}
                  </span>
                  <Button variant="ghost" size="sm">
                    Planifier →
                  </Button>
                </div>
                <p className="mt-1 text-[14px] font-bold">{suggestion.event}</p>
                <p className="mt-1 text-[12px] text-ink/70">
                  {suggestion.action}
                </p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Équilibre éditorial · Mai"
            more={<Badge tone="outline">38 contenus</Badge>}
          />
          <div className="flex flex-col gap-4">
            {BALANCE_SEGMENTS.map((segment) => (
              <div key={segment.label}>
                <div className="flex items-center justify-between text-[12px] font-bold">
                  <span>{segment.label}</span>
                  <span>{segment.pct}%</span>
                </div>
                <div className="mt-1 h-2.5 overflow-hidden rounded-full bg-ink/8">
                  <div
                    className={cx("h-full rounded-full", BALANCE_TONE[segment.tone])}
                    style={{ width: `${segment.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-dashed border-ink/15 pt-4 text-[12px] text-ink/80">
            <b>Recommandation :</b> Ton mix est trop orienté recrutement ce
            mois-ci. Prévois 2 contenus alumni supplémentaires pour nourrir la
            partie « fierté d&#39;appartenance ».
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Campagnes clés · référentiel CFI"
          more={<span>{campaignEvents.length} dates</span>}
        />
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {campaignEvents.map((event) => (
            <div
              key={event.id}
              className="rounded-md border border-ink/8 bg-white p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <Badge tone="purple">{event.campaign}</Badge>
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink/55">
                  {format(new Date(event.startDate), "dd MMM", { locale: fr })}
                  {" → "}
                  {format(new Date(event.endDate), "dd MMM", { locale: fr })}
                </span>
              </div>
              <p className="mt-2 text-[14px] font-bold">{event.title}</p>
              {event.location ? (
                <p className="mt-1 text-[11px] uppercase tracking-[0.08em] text-ink/55">
                  {event.location}
                </p>
              ) : null}
              {event.aiSuggestion ? (
                <p className="mt-2 text-[12px] leading-relaxed text-ink/70">
                  ✦ {event.aiSuggestion}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
