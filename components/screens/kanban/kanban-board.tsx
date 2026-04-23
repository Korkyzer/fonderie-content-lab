"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  type DropResult,
} from "@hello-pangea/dnd";

import { Avatar } from "@/components/ui/avatar";
import { Badge, type BadgeTone } from "@/components/ui/badge";

type AvatarTone =
  | "purple"
  | "sky"
  | "yellow"
  | "green"
  | "orange"
  | "pink"
  | "caramel"
  | "ink";
import { Icon } from "@/components/ui/icon";
import { Placeholder } from "@/components/ui/placeholder";
import { Pill } from "@/components/ui/pill";
import { cx } from "@/lib/utils";

import { AddCardDialog } from "./add-card-dialog";
import {
  COLUMN_DEFS,
  PRIORITY_LABEL,
  PRIORITY_OPTIONS,
  SLA_HOURS_THRESHOLD,
  type KanbanCardRow,
  type KanbanComment,
  type KanbanPriority,
  type KanbanTransition,
} from "./types";

type KanbanBoardProps = {
  initialCards: KanbanCardRow[];
};

const CURRENT_USER = "Laure Reymond";

const PERSONA_TONE: Record<string, BadgeTone> = {
  "Lycéens 16-20": "yellow",
  Parents: "sky",
  "Entreprises partenaires": "pink",
  Alumni: "caramel",
};

const CAMPAIGNS = [
  "Tous",
  "JPO Mai 2026",
  "Parcoursup",
  "Showcase étudiants",
  "Alumni",
  "Partenariats",
];

const PLATFORM_ACCENTS: Record<string, BadgeTone> = {
  "Instagram Reel": "purple",
  Instagram: "sky",
  TikTok: "orange",
  LinkedIn: "ink",
  Email: "outline",
  Story: "yellow",
};

const PRIORITY_TONE: Record<KanbanPriority, BadgeTone> = {
  urgent: "pink",
  normal: "outline",
  can_wait: "sky",
};

type ViewMode = "board" | "timeline";
type DeadlineFilter = "all" | "dated" | "sla";

function moveItem<T>(items: T[], fromIndex: number, toIndex: number) {
  const nextItems = [...items];
  const [movedItem] = nextItems.splice(fromIndex, 1);
  nextItems.splice(toIndex, 0, movedItem);
  return nextItems;
}

function reorderVisibleCards(
  cards: KanbanCardRow[],
  columnId: string,
  orderedIds: number[],
) {
  if (orderedIds.length === 0) return cards;

  const orderedIdSet = new Set(orderedIds);
  const cardsById = new Map(cards.map((card) => [card.id, card]));
  const orderedCards = orderedIds
    .map((id) => cardsById.get(id))
    .filter((card): card is KanbanCardRow => Boolean(card));
  let orderedIndex = 0;

  return cards.map((card) => {
    if (card.columnId !== columnId || !orderedIdSet.has(card.id)) {
      return card;
    }

    const nextCard = orderedCards[orderedIndex];
    orderedIndex += 1;
    return nextCard ?? card;
  });
}

function daysUntil(dueDate: string) {
  const diffMs = new Date(dueDate).getTime() - Date.now();
  const days = Math.round(diffMs / 86_400_000);
  if (days === 0) return "Aujourd’hui";
  if (days > 0) return `J-${days}`;
  return `J+${Math.abs(days)}`;
}

function slaBreached(deadline: string | null): boolean {
  if (!deadline) return false;
  const diffMs = new Date(deadline).getTime() - Date.now();
  return diffMs <= SLA_HOURS_THRESHOLD * 3_600_000;
}

function formatDateShort(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initialsOf(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function assigneeTone(name: string): AvatarTone {
  const lookup: Record<string, AvatarTone> = {
    "Laure Reymond": "purple",
    "Thomas L.": "sky",
    "Claire D.": "pink",
    "Mathilde P.": "orange",
  };
  return lookup[name] ?? "caramel";
}

export function KanbanBoard({ initialCards }: KanbanBoardProps) {
  const [cards, setCards] = useState(initialCards);
  const [campaign, setCampaign] = useState("Tous");
  const [aiOnly, setAiOnly] = useState(false);
  const [mineOnly, setMineOnly] = useState(false);
  const [platformFilter, setPlatformFilter] = useState("Tous");
  const [personaFilter, setPersonaFilter] = useState("Tous");
  const [assigneeFilter, setAssigneeFilter] = useState("Tous");
  const [priorityFilter, setPriorityFilter] = useState<"Tous" | KanbanPriority>(
    "Tous",
  );
  const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilter>("all");
  const [view, setView] = useState<ViewMode>("board");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogColumn, setDialogColumn] = useState(COLUMN_DEFS[0].id);
  const [dialogInstance, setDialogInstance] = useState(0);
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [, startTransition] = useTransition();

  const platformOptions = useMemo(() => {
    const set = new Set<string>();
    cards.forEach((card) => set.add(card.platform));
    return ["Tous", ...Array.from(set).sort()];
  }, [cards]);

  const personaOptions = useMemo(() => {
    const set = new Set<string>();
    cards.forEach((card) => set.add(card.persona));
    return ["Tous", ...Array.from(set).sort()];
  }, [cards]);

  const assigneeOptions = useMemo(() => {
    const set = new Set<string>();
    cards.forEach((card) => set.add(card.assignee));
    return ["Tous", ...Array.from(set).sort()];
  }, [cards]);

  const filtered = useMemo(() => {
    return cards.filter((card) => {
      if (campaign !== "Tous" && card.campaign !== campaign) return false;
      if (aiOnly && (card.aiProgress ?? 0) === 0) return false;
      if (mineOnly && card.assignee !== CURRENT_USER) return false;
      if (platformFilter !== "Tous" && card.platform !== platformFilter)
        return false;
      if (personaFilter !== "Tous" && card.persona !== personaFilter)
        return false;
      if (assigneeFilter !== "Tous" && card.assignee !== assigneeFilter)
        return false;
      if (priorityFilter !== "Tous" && card.priority !== priorityFilter)
        return false;
      if (deadlineFilter === "dated" && !card.deadline) return false;
      if (deadlineFilter === "sla" && !slaBreached(card.deadline)) return false;
      return true;
    });
  }, [
    cards,
    campaign,
    aiOnly,
    mineOnly,
    platformFilter,
    personaFilter,
    assigneeFilter,
    priorityFilter,
    deadlineFilter,
  ]);

  const byColumn = useMemo(() => {
    const map: Record<string, KanbanCardRow[]> = {};
    for (const col of COLUMN_DEFS) map[col.id] = [];
    for (const card of filtered) {
      if (map[card.columnId]) map[card.columnId].push(card);
    }
    return map;
  }, [filtered]);

  async function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const cardId = Number(draggableId);
    const targetColumn = destination.droppableId;
    const previousCards = cards;
    const sourceCardIds = (byColumn[source.droppableId] ?? []).map((card) => card.id);
    const destinationCardIds = (byColumn[destination.droppableId] ?? []).map(
      (card) => card.id,
    );

    setCards((prev) => {
      if (source.droppableId === destination.droppableId) {
        const reorderedIds = moveItem(
          sourceCardIds,
          source.index,
          destination.index,
        );
        return reorderVisibleCards(prev, source.droppableId, reorderedIds);
      }

      const nextSourceIds = sourceCardIds.filter((id) => id !== cardId);
      const nextDestinationIds = [...destinationCardIds];
      nextDestinationIds.splice(destination.index, 0, cardId);

      const movedCards = prev.map((card) =>
        card.id === cardId ? { ...card, columnId: targetColumn } : card,
      );

      return reorderVisibleCards(
        reorderVisibleCards(movedCards, source.droppableId, nextSourceIds),
        targetColumn,
        nextDestinationIds,
      );
    });

    startTransition(() => {
      fetch(`/api/kanban/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          columnId: targetColumn,
          transitionUser: CURRENT_USER,
        }),
      }).catch(() => {
        setCards(previousCards);
      });
    });
  }

  async function handleCreate(payload: {
    title: string;
    platform: string;
    persona: string;
    campaign: string;
    assignee: string;
    dueDate: string;
    columnId: string;
    priority: KanbanPriority;
    reviewerId: string | null;
    deadline: string | null;
  }) {
    const response = await fetch("/api/kanban", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) return;
    const { card } = (await response.json()) as { card: KanbanCardRow };
    setCards((prev) => [...prev, card]);
  }

  async function handleDelete(id: number) {
    setCards((prev) => prev.filter((card) => card.id !== id));
    await fetch(`/api/kanban/${id}`, { method: "DELETE" });
  }

  const totalByColumn: Record<string, number> = {};
  for (const col of COLUMN_DEFS) {
    totalByColumn[col.id] = cards.filter((card) => card.columnId === col.id).length;
  }

  const selectedCard = selectedCardId
    ? cards.find((card) => card.id === selectedCardId) ?? null
    : null;

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        {CAMPAIGNS.map((option) => (
          <Pill
            key={option}
            active={campaign === option}
            onClick={() => setCampaign(option)}
          >
            {option}
          </Pill>
        ))}
        <span className="mx-1 h-4 w-px bg-ink/15" />
        <Pill tone="purple" active={aiOnly} onClick={() => setAiOnly((v) => !v)}>
          <Icon name="sparkle" size={11} />
          Assisté uniquement
        </Pill>
        <Pill active={mineOnly} onClick={() => setMineOnly((v) => !v)}>
          Mes cartes
        </Pill>
        <span className="mx-1 h-4 w-px bg-ink/15" />
        <Pill active={view === "board"} onClick={() => setView("board")}>
          Board
        </Pill>
        <Pill active={view === "timeline"} onClick={() => setView("timeline")}>
          Timeline
        </Pill>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-sm border border-ink/10 bg-cream/70 px-3 py-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink/60">
          Filtres
        </span>
        <FilterSelect
          label="Plateforme"
          value={platformFilter}
          options={platformOptions}
          onChange={setPlatformFilter}
        />
        <FilterSelect
          label="Persona"
          value={personaFilter}
          options={personaOptions}
          onChange={setPersonaFilter}
        />
        <FilterSelect
          label="Assignee"
          value={assigneeFilter}
          options={assigneeOptions}
          onChange={setAssigneeFilter}
        />
        <FilterSelect
          label="Priorité"
          value={priorityFilter}
          options={["Tous", ...PRIORITY_OPTIONS]}
          renderOption={(option) =>
            option === "Tous" ? "Tous" : PRIORITY_LABEL[option as KanbanPriority]
          }
          onChange={(value) =>
            setPriorityFilter(value as "Tous" | KanbanPriority)
          }
        />
        <FilterSelect
          label="Deadline"
          value={deadlineFilter}
          options={["all", "dated", "sla"]}
          renderOption={(option) =>
            option === "all"
              ? "Toutes"
              : option === "dated"
              ? "Avec deadline"
              : "SLA en alerte"
          }
          onChange={(value) => setDeadlineFilter(value as DeadlineFilter)}
        />
      </div>

      {view === "board" ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid auto-rows-fr grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-6">
            {COLUMN_DEFS.map((column) => {
              const columnCards = byColumn[column.id] ?? [];
              return (
                <div
                  key={column.id}
                  className="flex min-h-[320px] flex-col gap-2 rounded-md bg-ink/[0.04] p-2"
                >
                  <div className="flex items-center justify-between px-1">
                    <h3 className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.12em]">
                      <span
                        className="inline-block h-2 w-2 rounded-full"
                        style={{ background: column.dotColor }}
                      />
                      {column.title}
                      <span className="ml-1 rounded-[3px] bg-ink/10 px-1.5 py-0.5 text-[10px] text-ink/70">
                        {totalByColumn[column.id]}
                      </span>
                    </h3>
                    <button
                      type="button"
                      aria-label={`Ajouter dans ${column.title}`}
                      onClick={() => {
                        setDialogColumn(column.id);
                        setDialogInstance((value) => value + 1);
                        setDialogOpen(true);
                      }}
                      className="grid h-6 w-6 place-items-center rounded-sm text-ink/50 transition-colors hover:bg-ink hover:text-cream"
                    >
                      <Icon name="plus" size={12} />
                    </button>
                  </div>

                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={cx(
                          "flex flex-1 flex-col gap-2 rounded-sm transition-colors",
                          snapshot.isDraggingOver && "bg-ink/[0.06]",
                        )}
                      >
                        {columnCards.map((card, index) => (
                          <Draggable
                            draggableId={String(card.id)}
                            index={index}
                            key={card.id}
                          >
                            {(dragProvided, dragSnapshot) => (
                              <article
                                ref={dragProvided.innerRef}
                                {...dragProvided.draggableProps}
                                {...dragProvided.dragHandleProps}
                                onClick={() => setSelectedCardId(card.id)}
                                className={cx(
                                  "flex cursor-grab flex-col gap-2 rounded-sm border border-ink/6 bg-cream p-3 shadow-card transition-shadow",
                                  dragSnapshot.isDragging
                                    ? "shadow-hover ring-1 ring-ink/10"
                                    : "hover:shadow-hover",
                                )}
                              >
                                {(column.id === "production" ||
                                  column.id === "review" ||
                                  column.id === "validated" ||
                                  column.id === "published") && (
                                  <Placeholder
                                    tone={column.accent}
                                    className="h-16 w-full rounded-sm"
                                  />
                                )}
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="flex-1 text-[13px] font-bold leading-tight text-ink">
                                    {card.title}
                                  </h4>
                                  <Badge tone={PRIORITY_TONE[card.priority]}>
                                    {PRIORITY_LABEL[card.priority]}
                                  </Badge>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <Badge tone={PERSONA_TONE[card.persona] ?? "outline"}>
                                    {card.persona}
                                  </Badge>
                                  <Badge
                                    tone={PLATFORM_ACCENTS[card.platform] ?? "outline"}
                                  >
                                    {card.platform}
                                  </Badge>
                                  {card.reviewerId && (
                                    <Badge tone="outline">
                                      Reviewer : {card.reviewerId}
                                    </Badge>
                                  )}
                                </div>
                                {(card.aiProgress ?? 0) > 0 &&
                                  (card.aiProgress ?? 0) < 100 && (
                                    <div className="flex items-center gap-2 rounded-sm bg-purple/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-purple-deep">
                                      <Icon name="sparkle" size={11} />
                                      <span>Génération · {card.aiProgress}%</span>
                                      <span className="ml-auto h-1 flex-1 overflow-hidden rounded-full bg-purple/20">
                                        <span
                                          className="block h-full bg-purple"
                                          style={{ width: `${card.aiProgress}%` }}
                                        />
                                      </span>
                                    </div>
                                  )}
                                {typeof card.brandScore === "number" && (
                                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.06em] text-ink/70">
                                    <span className="flex items-center gap-1">
                                      <Icon name="shield" size={11} />
                                      BG {card.brandScore}/100
                                    </span>
                                    <Icon name="drag" size={12} />
                                  </div>
                                )}
                                {slaBreached(card.deadline) && (
                                  <div className="rounded-sm bg-pink/15 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-pink-deep">
                                    SLA dépassé · deadline {card.deadline ? formatDateShort(card.deadline) : ""}
                                  </div>
                                )}
                                <div className="flex items-center justify-between border-t border-dashed border-ink/10 pt-2 text-[10px] font-bold uppercase tracking-[0.06em] text-ink/60">
                                  <span className="flex items-center gap-1.5">
                                    <Avatar
                                      name={initialsOf(card.assignee)}
                                      tone={assigneeTone(card.assignee)}
                                      size="sm"
                                    />
                                    {daysUntil(card.dueDate)}
                                  </span>
                                  <button
                                    type="button"
                                    aria-label="Supprimer"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      handleDelete(card.id);
                                    }}
                                    className="grid h-5 w-5 place-items-center rounded-sm text-ink/40 hover:bg-ink/10 hover:text-ink"
                                  >
                                    <Icon name="close" size={10} />
                                  </button>
                                </div>
                              </article>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        {columnCards.length === 0 && !snapshot.isDraggingOver && (
                          <p className="px-3 py-6 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-ink/30">
                            Aucune carte
                          </p>
                        )}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>
        </DragDropContext>
      ) : (
        <TimelineView
          cards={filtered}
          onSelect={(id) => setSelectedCardId(id)}
        />
      )}

      <AddCardDialog
        key={dialogInstance}
        open={dialogOpen}
        defaultColumn={dialogColumn}
        onClose={() => setDialogOpen(false)}
        onCreate={handleCreate}
      />

      {selectedCard && (
        <CardDetailDrawer
          card={selectedCard}
          onClose={() => setSelectedCardId(null)}
        />
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
  renderOption,
}: {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  renderOption?: (option: string) => string;
}) {
  return (
    <label className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.08em] text-ink/60">
      <span>{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-sm border border-ink/15 bg-white px-2 py-1 text-[11px] font-medium text-ink focus:border-ink focus:outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {renderOption ? renderOption(option) : option}
          </option>
        ))}
      </select>
    </label>
  );
}

function TimelineView({
  cards,
  onSelect,
}: {
  cards: KanbanCardRow[];
  onSelect: (id: number) => void;
}) {
  const byPlatform = useMemo(() => {
    const map = new Map<string, KanbanCardRow[]>();
    for (const card of cards) {
      const list = map.get(card.platform) ?? [];
      list.push(card);
      map.set(card.platform, list);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [cards]);

  if (byPlatform.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-ink/15 p-8 text-center text-[11px] font-bold uppercase tracking-[0.12em] text-ink/40">
        Aucune carte à afficher dans la timeline
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {byPlatform.map(([platform, platformCards]) => {
        const sorted = [...platformCards].sort(
          (a, b) =>
            new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
        );
        return (
          <div
            key={platform}
            className="rounded-md border border-ink/10 bg-cream p-3"
          >
            <div className="mb-2 flex items-center gap-2">
              <Badge tone={PLATFORM_ACCENTS[platform] ?? "outline"}>
                {platform}
              </Badge>
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink/50">
                {sorted.length} carte(s)
              </span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {sorted.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => onSelect(card.id)}
                  className="flex min-w-[180px] flex-col items-start gap-1 rounded-sm border border-ink/6 bg-white p-2 text-left hover:shadow-card"
                >
                  <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink/50">
                    {daysUntil(card.dueDate)}
                  </span>
                  <span className="text-[13px] font-bold leading-tight text-ink">
                    {card.title}
                  </span>
                  <div className="flex flex-wrap gap-1">
                    <Badge tone={PRIORITY_TONE[card.priority]}>
                      {PRIORITY_LABEL[card.priority]}
                    </Badge>
                    <Badge tone="outline">{card.columnId}</Badge>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CardDetailDrawer({
  card,
  onClose,
}: {
  card: KanbanCardRow;
  onClose: () => void;
}) {
  const [comments, setComments] = useState<KanbanComment[]>([]);
  const [transitions, setTransitions] = useState<KanbanTransition[]>([]);
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [commentsRes, transitionsRes] = await Promise.all([
        fetch(`/api/kanban/${card.id}/comments`),
        fetch(`/api/kanban/${card.id}/transitions`),
      ]);
      if (cancelled) return;
      if (commentsRes.ok) {
        const { comments: data } = (await commentsRes.json()) as {
          comments: KanbanComment[];
        };
        setComments(data);
      }
      if (transitionsRes.ok) {
        const { transitions: data } = (await transitionsRes.json()) as {
          transitions: KanbanTransition[];
        };
        setTransitions(data);
      }
      setLoaded(true);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [card.id]);

  async function submitComment() {
    const content = commentText.trim();
    if (!content || submitting) return;
    setSubmitting(true);
    try {
      const response = await fetch(`/api/kanban/${card.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author: CURRENT_USER, content }),
      });
      if (response.ok) {
        const { comment } = (await response.json()) as {
          comment: KanbanComment;
        };
        setComments((prev) => [...prev, comment]);
        setCommentText("");
      }
    } finally {
      setSubmitting(false);
    }
  }

  const columnTitle =
    COLUMN_DEFS.find((col) => col.id === card.columnId)?.title ?? card.columnId;

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-ink/40 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={`Détails de ${card.title}`}
        className="flex h-full w-full max-w-md flex-col gap-4 overflow-y-auto border-l border-ink bg-cream p-5 shadow-hard"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/50">
              {columnTitle} · {PRIORITY_LABEL[card.priority]}
            </p>
            <h2 className="mt-1 text-[18px] font-bold leading-tight">
              {card.title}
            </h2>
          </div>
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-sm border border-ink/15 text-ink/60 hover:border-ink hover:text-ink"
          >
            <Icon name="close" size={14} />
          </button>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-[11px]">
          <MetaItem label="Responsable" value={card.assignee} />
          <MetaItem label="Reviewer" value={card.reviewerId ?? "—"} />
          <MetaItem label="Plateforme" value={card.platform} />
          <MetaItem label="Persona" value={card.persona} />
          <MetaItem label="Campagne" value={card.campaign} />
          <MetaItem
            label="Deadline SLA"
            value={card.deadline ? formatDateShort(card.deadline) : "—"}
          />
        </dl>

        <section className="flex flex-col gap-2">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink/60">
            Pièces jointes
          </h3>
          <div className="rounded-sm border border-dashed border-ink/20 bg-white/60 p-4 text-center text-[11px] text-ink/50">
            Glisser un fichier ici (UI uniquement pour le moment)
          </div>
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink/60">
            Historique des transitions
          </h3>
          {!loaded ? (
            <p className="text-[11px] text-ink/40">Chargement…</p>
          ) : transitions.length === 0 ? (
            <p className="text-[11px] text-ink/40">Aucune transition encore.</p>
          ) : (
            <ul className="flex flex-col gap-1.5">
              {transitions.map((transition) => (
                <li
                  key={transition.id}
                  className="rounded-sm border border-ink/8 bg-white/70 p-2 text-[11px]"
                >
                  <div className="font-bold text-ink">
                    {transition.fromStatus ?? "création"} → {transition.toStatus}
                  </div>
                  <div className="text-ink/60">
                    {transition.user} · {formatDateShort(transition.createdAt)}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="flex flex-col gap-2">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink/60">
            Commentaires
          </h3>
          {comments.length === 0 ? (
            <p className="text-[11px] text-ink/40">Aucun commentaire.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {comments.map((comment) => (
                <li
                  key={comment.id}
                  className="rounded-sm border border-ink/8 bg-white/70 p-2 text-[12px]"
                >
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.1em] text-ink/50">
                    <span>{comment.author}</span>
                    <span>{formatDateShort(comment.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-ink">{comment.content}</p>
                </li>
              ))}
            </ul>
          )}

          <textarea
            className="mt-1 min-h-[72px] rounded-sm border border-ink/15 bg-white p-2 text-[12px] focus:border-ink focus:outline-none"
            placeholder="Écrire un commentaire…"
            value={commentText}
            onChange={(event) => setCommentText(event.target.value)}
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={submitComment}
              disabled={submitting || !commentText.trim()}
              className="rounded-sm bg-ink px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-cream disabled:opacity-40"
            >
              {submitting ? "Envoi…" : "Publier"}
            </button>
          </div>
        </section>
      </aside>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-sm bg-ink/[0.04] p-2">
      <dt className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink/50">
        {label}
      </dt>
      <dd className="mt-1 text-[12px] font-medium text-ink">{value}</dd>
    </div>
  );
}
