"use client";

import { useEffect, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  endOfMonth,
  format,
  getDay,
  isSameDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Pill } from "@/components/ui/pill";
import {
  CHANNEL_TIMING,
  TIMING_LABEL,
  TIMING_TONE,
  expandRecurrence,
  recurrencePatternLabel,
  scoreDay,
  scoreSlot,
  type RecurrenceRule,
} from "@/lib/timing-recommendations";
import {
  AUTO_PUBLISH_CHANNELS,
  CONTENT_STATUS_FLOW,
  CONTENT_STATUS_LABEL,
  CONTENT_STATUS_TONE,
  type ContentPublishStatus,
} from "@/lib/auto-publish";
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

type KanbanScheduledCard = {
  id: number;
  title: string;
  platform: string;
  campaign: string;
  assignee: string;
  dueDate: string;
  columnId: string;
};

type CalendarViewProps = {
  campaignEvents: CampaignEvent[];
  scheduledCount: number;
  scheduledCards: KanbanScheduledCard[];
};

type ViewMode = "month" | "week";

type CalendarContentStatus = CalendarEntry["status"];

type Filters = {
  channel: CalendarChannel | "Toutes";
  campaign: string;
  type: string;
  status: CalendarContentStatus | "Tous";
};

const FILTERS_STORAGE_KEY = "fcl.calendar.filters.v1";
const VIEW_STORAGE_KEY = "fcl.calendar.view.v1";
const RECURRENCE_STORAGE_KEY = "fcl.calendar.recurrences.v1";
const PUBLISH_STATUS_STORAGE_KEY = "fcl.calendar.publish-status.v1";

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

const DEFAULT_FILTERS: Filters = {
  channel: "Toutes",
  campaign: "Toutes",
  type: "Tous",
  status: "Tous",
};

const DEFAULT_RECURRENCES: RecurrenceRule[] = [
  {
    id: "newsletter-alumni",
    label: "Newsletter alumni",
    channel: "Email",
    pattern: "monthly-first",
    startDate: "2026-01-01",
  },
  {
    id: "live-instagram-mardi",
    label: "Live Instagram mardi soir",
    channel: "Instagram",
    pattern: "weekly",
    weekday: 2,
    startDate: "2026-04-01",
  },
];

function getMondayIndex(date: Date) {
  return (getDay(date) + 6) % 7;
}

function parseCalendarEventDate(value: string) {
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  return new Date(year, month - 1, day, 12);
}

function loadJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...(JSON.parse(raw) as T) };
  } catch {
    return fallback;
  }
}

function loadList<T>(key: string, fallback: T[]): T[] {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T[];
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function saveJSON<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function kanbanCardToEntry(card: KanbanScheduledCard): CalendarEntry {
  const date = new Date(card.dueDate);
  const platform = card.platform.toLowerCase();
  const channelGuess: CalendarChannel = platform.includes("tiktok")
    ? "TikTok"
    : platform.includes("linkedin")
      ? "LinkedIn"
      : platform.includes("youtube")
        ? "YouTube"
        : "Instagram";
  return {
    id: `kanban-${card.id}`,
    day: date.getDate(),
    label: card.title,
    tone: "green",
    type: card.platform,
    channel: channelGuess,
    status: card.columnId === "published" ? "published" : "scheduled",
    assignee: card.assignee,
    campaign: card.campaign,
  };
}

export function CalendarView({
  campaignEvents,
  scheduledCount,
  scheduledCards,
}: CalendarViewProps) {
  const baseDate = useMemo(() => new Date(MONTH_YEAR, MONTH_INDEX, 1), []);
  const [cursor, setCursor] = useState<Date>(baseDate);
  const [view, setView] = useState<ViewMode>("month");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntry | null>(null);
  const [recurrences, setRecurrences] = useState<RecurrenceRule[]>(DEFAULT_RECURRENCES);
  const [publishStatus, setPublishStatus] = useState<Record<string, ContentPublishStatus>>({});
  const [hydrated, setHydrated] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTargetDay, setDropTargetDay] = useState<number | null>(null);
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [showRecurrenceForm, setShowRecurrenceForm] = useState(false);

  useEffect(() => {
    setFilters(loadJSON<Filters>(FILTERS_STORAGE_KEY, DEFAULT_FILTERS));
    const storedView = typeof window !== "undefined"
      ? (window.localStorage.getItem(VIEW_STORAGE_KEY) as ViewMode | null)
      : null;
    if (storedView === "week" || storedView === "month") setView(storedView);
    setRecurrences(loadList<RecurrenceRule>(RECURRENCE_STORAGE_KEY, DEFAULT_RECURRENCES));
    setPublishStatus(
      loadJSON<Record<string, ContentPublishStatus>>(PUBLISH_STATUS_STORAGE_KEY, {}),
    );
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveJSON(FILTERS_STORAGE_KEY, filters);
  }, [filters, hydrated]);

  useEffect(() => {
    if (hydrated && typeof window !== "undefined") {
      window.localStorage.setItem(VIEW_STORAGE_KEY, view);
    }
  }, [view, hydrated]);

  useEffect(() => {
    if (hydrated) saveJSON(RECURRENCE_STORAGE_KEY, recurrences);
  }, [recurrences, hydrated]);

  useEffect(() => {
    if (hydrated) saveJSON(PUBLISH_STATUS_STORAGE_KEY, publishStatus);
  }, [publishStatus, hydrated]);

  const isReferenceMonth =
    cursor.getFullYear() === MONTH_YEAR && cursor.getMonth() === MONTH_INDEX;

  const allEntries = useMemo<CalendarEntry[]>(() => {
    const fromKanban = scheduledCards
      .filter((card) => card.columnId === "validated" || card.columnId === "published")
      .map(kanbanCardToEntry);
    const merged = [...CALENDAR_ENTRIES, ...fromKanban];
    return merged.map((entry) =>
      overrides[entry.id] !== undefined
        ? { ...entry, day: overrides[entry.id] }
        : entry,
    );
  }, [scheduledCards, overrides]);

  const campaignOptions = useMemo(() => {
    const set = new Set<string>(["Toutes"]);
    allEntries.forEach((e) => set.add(e.campaign));
    return Array.from(set);
  }, [allEntries]);

  const typeOptions = useMemo(() => {
    const set = new Set<string>(["Tous"]);
    allEntries.forEach((e) => set.add(e.type));
    return Array.from(set);
  }, [allEntries]);

  const statusOptions: Array<CalendarContentStatus | "Tous"> = useMemo(
    () => ["Tous", "brief", "production", "review", "scheduled", "published"],
    [],
  );

  const filteredEntries = useMemo(
    () =>
      allEntries.filter((entry) => {
        if (filters.channel !== "Toutes" && entry.channel !== filters.channel)
          return false;
        if (filters.campaign !== "Toutes" && entry.campaign !== filters.campaign)
          return false;
        if (filters.type !== "Tous" && entry.type !== filters.type) return false;
        if (filters.status !== "Tous" && entry.status !== filters.status)
          return false;
        return true;
      }),
    [allEntries, filters],
  );

  const recurrenceEntriesByDay = useMemo(() => {
    const map = new Map<number, RecurrenceRule[]>();
    recurrences.forEach((rule) => {
      const dates = expandRecurrence(rule, cursor);
      dates.forEach((date) => {
        const list = map.get(date.getDate()) ?? [];
        list.push(rule);
        map.set(date.getDate(), list);
      });
    });
    return map;
  }, [recurrences, cursor]);

  const entriesByDay = useMemo(() => {
    if (!isReferenceMonth && view === "month")
      return new Map<number, CalendarEntry[]>();
    const map = new Map<number, CalendarEntry[]>();
    filteredEntries.forEach((entry) => {
      const list = map.get(entry.day) ?? [];
      list.push(entry);
      map.set(entry.day, list);
    });
    return map;
  }, [filteredEntries, isReferenceMonth, view]);

  const aiByDay = useMemo(() => {
    if (!isReferenceMonth) return new Map<number, string>();
    return new Map(AI_SUGGESTION_TAGS.map(({ day, text }) => [day, text]));
  }, [isReferenceMonth]);

  const monthStart = startOfMonth(cursor);
  const monthEnd = endOfMonth(cursor);
  const startOffset = getMondayIndex(monthStart);
  const totalDays = monthEnd.getDate();

  const monthCells: Array<
    | { key: string; type: "pad"; num: number }
    | { key: string; type: "day"; num: number; date: Date }
  > = [];
  if (view === "month") {
    const prevMonthEnd = new Date(monthStart);
    prevMonthEnd.setDate(0);
    const prevDays = prevMonthEnd.getDate();
    for (let i = 0; i < startOffset; i++) {
      monthCells.push({
        key: `pad-start-${i}`,
        type: "pad",
        num: prevDays - startOffset + i + 1,
      });
    }
    for (let d = 1; d <= totalDays; d++) {
      monthCells.push({
        key: `day-${d}`,
        type: "day",
        num: d,
        date: new Date(monthStart.getFullYear(), monthStart.getMonth(), d),
      });
    }
    let tail = 1;
    while (monthCells.length % 7 !== 0) {
      monthCells.push({ key: `pad-end-${tail}`, type: "pad", num: tail });
      tail += 1;
    }
  }

  const weekStart = useMemo(
    () => startOfWeek(cursor, { weekStartsOn: 1 }),
    [cursor],
  );
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  const monthLabel = format(cursor, "MMMM yyyy", { locale: fr });
  const prev = view === "week" ? addWeeks(cursor, -1) : addMonths(cursor, -1);
  const next = view === "week" ? addWeeks(cursor, 1) : addMonths(cursor, 1);

  function moveEntryToDay(entryId: string, day: number) {
    if (entryId.startsWith("kanban-")) {
      const cardId = entryId.replace("kanban-", "");
      const newDate = new Date(cursor.getFullYear(), cursor.getMonth(), day, 12);
      fetch(`/api/kanban/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dueDate: newDate.toISOString() }),
      }).catch(() => {});
    }
    setOverrides((prevOverrides) => ({ ...prevOverrides, [entryId]: day }));
  }

  function handleDragStart(entryId: string) {
    setDraggingId(entryId);
  }

  function handleDragOverCell(day: number, event: React.DragEvent) {
    event.preventDefault();
    setDropTargetDay(day);
  }

  function handleDropOnDay(day: number, event: React.DragEvent) {
    event.preventDefault();
    if (draggingId) {
      moveEntryToDay(draggingId, day);
    }
    setDraggingId(null);
    setDropTargetDay(null);
  }

  function setStatus(entryId: string, status: ContentPublishStatus) {
    setPublishStatus((prev) => ({ ...prev, [entryId]: status }));
  }

  function getStatus(entry: CalendarEntry): ContentPublishStatus {
    if (publishStatus[entry.id]) return publishStatus[entry.id];
    if (entry.status === "published") return "published";
    if (entry.status === "scheduled") return "scheduled";
    return "draft";
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 border-b border-ink/10 pb-5 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink/55">
            Calendrier éditorial
          </p>
          <h1 className="mt-2 text-h1 font-display uppercase">
            {view === "week"
              ? `Semaine du ${format(weekStart, "dd MMM", { locale: fr })}`
              : monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
            <span className="text-ink/55"> · {scheduledCount} publications planifiées</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-sm border border-ink/15">
            <button
              type="button"
              onClick={() => setView("month")}
              className={cx(
                "px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em]",
                view === "month" ? "bg-ink text-cream" : "bg-cream text-ink/70",
              )}
            >
              Mois
            </button>
            <button
              type="button"
              onClick={() => setView("week")}
              className={cx(
                "px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] border-l border-ink/15",
                view === "week" ? "bg-ink text-cream" : "bg-cream text-ink/70",
              )}
            >
              Semaine
            </button>
          </div>
          <Button variant="light" size="sm" onClick={() => setCursor(prev)}>
            ← {view === "week" ? "Sem. -1" : format(prev, "MMM", { locale: fr })}
          </Button>
          <Button variant="dark" size="sm" className="pointer-events-none">
            {view === "week"
              ? format(cursor, "dd MMM", { locale: fr })
              : format(cursor, "MMM", { locale: fr })}
          </Button>
          <Button variant="light" size="sm" onClick={() => setCursor(next)}>
            {view === "week" ? "Sem. +1" : format(next, "MMM", { locale: fr })} →
          </Button>
          <Button variant="primary" icon={<Icon name="plus" size={14} />}>
            Programmer
          </Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/55">
          Plateforme
        </span>
        {CHANNEL_FILTERS.map((filter) => (
          <Pill
            key={filter}
            active={filters.channel === filter}
            onClick={() => setFilters((f) => ({ ...f, channel: filter }))}
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
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/55">
          Persona / campagne
        </span>
        <select
          value={filters.campaign}
          onChange={(event) => setFilters((f) => ({ ...f, campaign: event.target.value }))}
          className="rounded-sm border border-ink/15 bg-cream px-2 py-1 text-[11px] font-bold uppercase tracking-[0.06em]"
        >
          {campaignOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        <select
          value={filters.type}
          onChange={(event) => setFilters((f) => ({ ...f, type: event.target.value }))}
          className="rounded-sm border border-ink/15 bg-cream px-2 py-1 text-[11px] font-bold uppercase tracking-[0.06em]"
        >
          {typeOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt === "Tous" ? "Tous types" : opt}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(event) =>
            setFilters((f) => ({ ...f, status: event.target.value as Filters["status"] }))
          }
          className="rounded-sm border border-ink/15 bg-cream px-2 py-1 text-[11px] font-bold uppercase tracking-[0.06em]"
        >
          {statusOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt === "Tous"
                ? "Tous statuts"
                : STATUS_LABELS[opt as CalendarContentStatus]}
            </option>
          ))}
        </select>
        {(filters.channel !== "Toutes" ||
          filters.campaign !== "Toutes" ||
          filters.type !== "Tous" ||
          filters.status !== "Tous") && (
          <button
            type="button"
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="text-[11px] font-bold uppercase tracking-[0.06em] text-ink/55 underline-offset-2 hover:underline"
          >
            Réinitialiser
          </button>
        )}
        <span className="mx-1 h-4 w-px bg-ink/15" />
        {CAMPAIGN_TAGS.map((tag) => (
          <Badge key={tag.label} tone={tag.tone}>
            {tag.label}
          </Badge>
        ))}
      </div>

      {view === "month" ? (
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
              {monthCells.map((cell, index) => {
                const col = index % 7;
                const isSat = col === 5;
                const isSun = col === 6;
                const isPad = cell.type === "pad";
                const isJpo = !isPad && isReferenceMonth && cell.num === 17;
                const isToday = !isPad && isReferenceMonth && cell.num === 7;
                const aiText = !isPad ? aiByDay.get(cell.num) : undefined;
                const entries = !isPad ? entriesByDay.get(cell.num) ?? [] : [];
                const recurrenceList = !isPad
                  ? recurrenceEntriesByDay.get(cell.num) ?? []
                  : [];
                const cellDate = !isPad && cell.type === "day" ? cell.date : null;
                const channelForScore =
                  filters.channel !== "Toutes" ? filters.channel : entries[0]?.channel;
                const slotScore =
                  cellDate && channelForScore
                    ? entries.length > 0
                      ? scoreDay(cellDate, entries.map((e) => ({ channel: e.channel })))
                      : scoreSlot(cellDate, channelForScore, 12)
                    : "neutral";
                const isDropTarget = !isPad && dropTargetDay === cell.num;

                return (
                  <div
                    key={cell.key}
                    onDragOver={
                      isPad ? undefined : (event) => handleDragOverCell(cell.num, event)
                    }
                    onDrop={isPad ? undefined : (event) => handleDropOnDay(cell.num, event)}
                    className={cx(
                      "flex min-h-[108px] flex-col gap-1 border-b border-r border-ink/8 p-2 last:border-r-0",
                      isPad && "bg-page/60",
                      !isPad && TIMING_TONE[slotScore],
                      isToday && "ring-1 ring-inset ring-sky",
                      isDropTarget && "ring-2 ring-inset ring-purple",
                    )}
                    title={
                      !isPad && cellDate && channelForScore
                        ? `${TIMING_LABEL[slotScore]} · ${channelForScore}`
                        : undefined
                    }
                  >
                    <div className="flex items-start justify-between gap-1">
                      <span
                        className={cx(
                          "inline-flex h-6 min-w-6 items-center justify-center text-[12px] font-bold",
                          isPad && "text-ink/30",
                          !isPad && isSat && "text-ink/60",
                          !isPad && isSun && "text-red",
                          isToday && "rounded-full bg-ink text-cream px-1.5",
                        )}
                      >
                        {cell.num}
                      </span>
                      <div className="flex items-center gap-1">
                        {isJpo ? <Badge tone="purple">JPO</Badge> : null}
                        {recurrenceList.length > 0 ? (
                          <span
                            title={recurrenceList.map((r) => r.label).join(" · ")}
                            className="grid h-4 w-4 place-items-center rounded-[3px] border border-ink bg-yellow text-[9px] font-bold"
                          >
                            ↻
                          </span>
                        ) : null}
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
                          draggable
                          onDragStart={() => handleDragStart(entry.id)}
                          onClick={() => setSelectedEntry(entry)}
                          className={cx(
                            "truncate rounded-[3px] px-1.5 py-1 text-left text-[10px] font-bold leading-tight tracking-[0.01em] transition-transform hover:-translate-y-px cursor-grab active:cursor-grabbing",
                            TONE_BG[entry.tone],
                            draggingId === entry.id && "opacity-50",
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
                      {recurrenceList.map((rule) => (
                        <span
                          key={`rec-${rule.id}-${cell.num}`}
                          className="truncate rounded-[3px] border border-dashed border-ink/30 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.04em] text-ink/70"
                        >
                          ↻ {rule.label}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {isReferenceMonth ? (
            <div className="pointer-events-none absolute right-[1%] top-[80px] hidden w-[260px] rotate-[-2deg] flex-col gap-1 rounded-md border-[1.5px] border-ink bg-purple px-4 py-3 text-ink shadow-hard-lg xl:flex">
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
      ) : (
        <div className="overflow-hidden rounded-md border border-ink/8 bg-cream shadow-card">
          <div className="grid grid-cols-7 border-b border-ink/8 bg-cream">
            {weekDays.map((day) => (
              <div
                key={day.toISOString()}
                className="flex flex-col border-r border-ink/8 px-3 py-2 last:border-r-0"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/55">
                  {format(day, "EEE", { locale: fr })}
                </span>
                <span className="text-[16px] font-bold">
                  {format(day, "dd MMM", { locale: fr })}
                </span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {weekDays.map((day) => {
              const isReferenceWeek =
                day.getFullYear() === MONTH_YEAR && day.getMonth() === MONTH_INDEX;
              const dayNum = day.getDate();
              const entries = isReferenceWeek ? entriesByDay.get(dayNum) ?? [] : [];
              const recurrenceList = recurrences.flatMap((rule) =>
                expandRecurrence(rule, day).some((d) => isSameDay(d, day)) ? [rule] : [],
              );
              const channelForScore =
                filters.channel !== "Toutes" ? filters.channel : entries[0]?.channel;
              const slotScore =
                channelForScore && entries.length > 0
                  ? scoreDay(day, entries.map((e) => ({ channel: e.channel })))
                  : channelForScore
                    ? scoreSlot(day, channelForScore, 18)
                    : "neutral";
              const isDropTarget = dropTargetDay === dayNum && isReferenceWeek;
              return (
                <div
                  key={day.toISOString()}
                  onDragOver={(event) =>
                    isReferenceWeek
                      ? handleDragOverCell(dayNum, event)
                      : event.preventDefault()
                  }
                  onDrop={(event) =>
                    isReferenceWeek
                      ? handleDropOnDay(dayNum, event)
                      : event.preventDefault()
                  }
                  className={cx(
                    "flex min-h-[260px] flex-col gap-1 border-r border-ink/8 p-2 last:border-r-0",
                    TIMING_TONE[slotScore],
                    isDropTarget && "ring-2 ring-inset ring-purple",
                  )}
                >
                  {entries.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      draggable
                      onDragStart={() => handleDragStart(entry.id)}
                      onClick={() => setSelectedEntry(entry)}
                      className={cx(
                        "truncate rounded-[3px] px-2 py-1.5 text-left text-[11px] font-bold transition-transform hover:-translate-y-px cursor-grab active:cursor-grabbing",
                        TONE_BG[entry.tone],
                        draggingId === entry.id && "opacity-50",
                      )}
                    >
                      {entry.label}
                      <span className="ml-1 opacity-70">· {entry.channel}</span>
                    </button>
                  ))}
                  {recurrenceList.map((rule) => (
                    <span
                      key={`week-rec-${rule.id}-${day.toISOString()}`}
                      className="truncate rounded-[3px] border border-dashed border-ink/30 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.04em] text-ink/70"
                    >
                      ↻ {rule.label}
                    </span>
                  ))}
                  {entries.length === 0 && recurrenceList.length === 0 ? (
                    <span className="mt-auto text-center text-[10px] font-bold uppercase tracking-[0.06em] text-ink/30">
                      —
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedEntry ? (
        <Card tone="ink" className="text-cream">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
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
              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-cream/15 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-cream/55">
                  Statut publication
                </span>
                {CONTENT_STATUS_FLOW.map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatus(selectedEntry.id, status)}
                    className={cx(
                      "rounded-sm px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em]",
                      getStatus(selectedEntry) === status
                        ? CONTENT_STATUS_TONE[status]
                        : "bg-cream/10 text-cream/70 hover:bg-cream/20",
                    )}
                  >
                    {CONTENT_STATUS_LABEL[status]}
                  </button>
                ))}
              </div>
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
            title="Suggestions de timing · par canal"
            more={<Badge tone="purple">✦ Analyse Requesty</Badge>}
          />
          <p className="mb-3 text-[12px] text-ink/70">
            Les créneaux verts sur le calendrier reflètent ces fenêtres optimales
            calculées sur l&apos;historique d&apos;engagement par canal.
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {CHANNEL_TIMING.map((timing) => (
              <div
                key={timing.channel}
                className="rounded-md border border-ink/8 bg-white p-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-[0.08em]">
                    {timing.channel}
                  </span>
                  <Badge tone="sky">{timing.bestSlots}</Badge>
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-ink/70">
                  {timing.rationale}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-3 border-t border-dashed border-ink/15 pt-3 text-[11px] font-bold uppercase tracking-[0.06em] text-ink/55">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-green/50" /> Bon timing
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-ink/10" /> Neutre
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-red/30" /> À éviter
            </span>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Récurrences planifiées"
            more={
              <button
                type="button"
                onClick={() => setShowRecurrenceForm((v) => !v)}
                className="text-[11px] font-bold uppercase tracking-[0.06em] text-purple-deep hover:underline"
              >
                {showRecurrenceForm ? "Annuler" : "+ Ajouter"}
              </button>
            }
          />
          <ul className="flex flex-col gap-2">
            {recurrences.map((rule) => (
              <li
                key={rule.id}
                className="flex items-start justify-between gap-2 rounded-md border border-ink/8 bg-white px-3 py-2"
              >
                <div>
                  <p className="text-[13px] font-bold">{rule.label}</p>
                  <p className="text-[11px] text-ink/60">
                    {recurrencePatternLabel(rule.pattern)} · {rule.channel}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setRecurrences((prev) => prev.filter((r) => r.id !== rule.id))
                  }
                  aria-label="Supprimer la récurrence"
                  className="grid h-6 w-6 place-items-center rounded-sm text-ink/50 hover:bg-ink/10"
                >
                  <Icon name="close" size={11} />
                </button>
              </li>
            ))}
            {recurrences.length === 0 ? (
              <li className="rounded-md border border-dashed border-ink/15 px-3 py-3 text-center text-[11px] uppercase tracking-[0.06em] text-ink/40">
                Aucune récurrence
              </li>
            ) : null}
          </ul>
          {showRecurrenceForm ? (
            <RecurrenceForm
              onSubmit={(rule) => {
                setRecurrences((prev) => [...prev, rule]);
                setShowRecurrenceForm(false);
              }}
            />
          ) : null}
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Auto-publication · canaux configurés"
          more={<Badge tone="outline">Aperçu rapide</Badge>}
        />
        <p className="mb-3 text-[12px] text-ink/70">
          Aucun canal n&apos;est encore connecté. Les contenus passent en{" "}
          <b>En attente publication</b> à la date prévue, puis seront poussés
          automatiquement une fois les API branchées.
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {AUTO_PUBLISH_CHANNELS.map((channel) => (
            <div
              key={channel.key}
              className="rounded-md border border-ink/8 bg-white p-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-[12px] font-bold uppercase tracking-[0.06em]">
                  {channel.label}
                </span>
                <span className="rounded-sm bg-ink/8 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-ink/60">
                  Non connecté
                </span>
              </div>
              <p className="mt-1 text-[11px] uppercase tracking-[0.06em] text-ink/55">
                {channel.provider}
              </p>
            </div>
          ))}
        </div>
      </Card>

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
                <p className="mt-1 text-[12px] text-ink/70">{suggestion.action}</p>
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
            partie « fierté d&apos;appartenance ».
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
                  {format(parseCalendarEventDate(event.startDate), "dd MMM", {
                    locale: fr,
                  })}
                  {" → "}
                  {format(parseCalendarEventDate(event.endDate), "dd MMM", {
                    locale: fr,
                  })}
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

      <Card tone="cream" className="border border-dashed border-ink/15">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink/55">
          Bon à savoir
        </p>
        <p className="mt-2 text-[13px] text-ink/80">
          Glissez n&apos;importe quel contenu sur une autre date pour le
          replanifier. Les cartes Kanban marquées <b>Validé</b> arrivent
          automatiquement sur le calendrier en statut <b>Planifié</b>.
        </p>
      </Card>
    </div>
  );
}

type RecurrenceFormProps = {
  onSubmit: (rule: RecurrenceRule) => void;
};

function RecurrenceForm({ onSubmit }: RecurrenceFormProps) {
  const [label, setLabel] = useState("");
  const [channel, setChannel] = useState("Instagram");
  const [pattern, setPattern] = useState<RecurrenceRule["pattern"]>("weekly");
  const [weekday, setWeekday] = useState(2);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (!label.trim()) return;
        onSubmit({
          id: `custom-${Date.now()}`,
          label: label.trim(),
          channel,
          pattern,
          weekday,
          startDate: new Date().toISOString().slice(0, 10),
        });
        setLabel("");
      }}
      className="mt-3 flex flex-col gap-2 rounded-md border border-ink/10 bg-cream/60 p-3"
    >
      <input
        type="text"
        value={label}
        onChange={(event) => setLabel(event.target.value)}
        placeholder="Titre (ex. Newsletter alumni)"
        className="rounded-sm border border-ink/15 bg-white px-2 py-1 text-[12px]"
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          value={channel}
          onChange={(event) => setChannel(event.target.value)}
          className="rounded-sm border border-ink/15 bg-white px-2 py-1 text-[12px]"
        >
          <option>Instagram</option>
          <option>TikTok</option>
          <option>LinkedIn</option>
          <option>Email</option>
          <option>YouTube</option>
        </select>
        <select
          value={pattern}
          onChange={(event) =>
            setPattern(event.target.value as RecurrenceRule["pattern"])
          }
          className="rounded-sm border border-ink/15 bg-white px-2 py-1 text-[12px]"
        >
          <option value="weekly">Hebdomadaire</option>
          <option value="biweekly">Toutes les 2 semaines</option>
          <option value="monthly-first">1er du mois</option>
          <option value="monthly-last">Dernier du mois</option>
        </select>
      </div>
      {(pattern === "weekly" || pattern === "biweekly") && (
        <select
          value={weekday}
          onChange={(event) => setWeekday(Number(event.target.value))}
          className="rounded-sm border border-ink/15 bg-white px-2 py-1 text-[12px]"
        >
          <option value={1}>Lundi</option>
          <option value={2}>Mardi</option>
          <option value={3}>Mercredi</option>
          <option value={4}>Jeudi</option>
          <option value={5}>Vendredi</option>
          <option value={6}>Samedi</option>
          <option value={7}>Dimanche</option>
        </select>
      )}
      <Button type="submit" variant="primary" size="sm">
        Ajouter la récurrence
      </Button>
    </form>
  );
}
