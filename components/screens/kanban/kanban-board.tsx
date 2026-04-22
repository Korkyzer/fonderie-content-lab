"use client";

import { useMemo, useState, useTransition } from "react";
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
import { COLUMN_DEFS, type KanbanCardRow } from "./types";

type KanbanBoardProps = {
  initialCards: KanbanCardRow[];
};

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

function daysUntil(dueDate: string) {
  const diffMs = new Date(dueDate).getTime() - Date.now();
  const days = Math.round(diffMs / 86_400_000);
  if (days === 0) return "Aujourd’hui";
  if (days > 0) return `J-${days}`;
  return `J+${Math.abs(days)}`;
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogColumn, setDialogColumn] = useState(COLUMN_DEFS[0].id);
  const [, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return cards.filter((card) => {
      if (campaign !== "Tous" && card.campaign !== campaign) return false;
      if (aiOnly && (card.aiProgress ?? 0) === 0) return false;
      if (mineOnly && card.assignee !== "Laure Reymond") return false;
      return true;
    });
  }, [cards, campaign, aiOnly, mineOnly]);

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

    setCards((prev) =>
      prev.map((card) =>
        card.id === cardId ? { ...card, columnId: targetColumn } : card,
      ),
    );

    startTransition(() => {
      fetch(`/api/kanban/${cardId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId: targetColumn }),
      }).catch(() => {
        setCards((prev) =>
          prev.map((card) =>
            card.id === cardId
              ? { ...card, columnId: source.droppableId }
              : card,
          ),
        );
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
          IA uniquement
        </Pill>
        <Pill active={mineOnly} onClick={() => setMineOnly((v) => !v)}>
          Mes cartes
        </Pill>
      </div>

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
                              <h4 className="text-[13px] font-bold leading-tight text-ink">
                                {card.title}
                              </h4>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <Badge tone={PERSONA_TONE[card.persona] ?? "outline"}>
                                  {card.persona}
                                </Badge>
                                <Badge
                                  tone={PLATFORM_ACCENTS[card.platform] ?? "outline"}
                                >
                                  {card.platform}
                                </Badge>
                              </div>
                              {(card.aiProgress ?? 0) > 0 &&
                                (card.aiProgress ?? 0) < 100 && (
                                  <div className="flex items-center gap-2 rounded-sm bg-purple/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.06em] text-purple-deep">
                                    <Icon name="sparkle" size={11} />
                                    <span>IA en cours · {card.aiProgress}%</span>
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
                                  onClick={() => handleDelete(card.id)}
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

      <AddCardDialog
        open={dialogOpen}
        defaultColumn={dialogColumn}
        onClose={() => setDialogOpen(false)}
        onCreate={handleCreate}
      />
    </div>
  );
}
