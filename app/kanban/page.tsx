import { KanbanBoard } from "@/components/screens/kanban/kanban-board";
import type { KanbanCardRow } from "@/components/screens/kanban/types";
import { getKanbanCards } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function KanbanPage() {
  const cards = getKanbanCards().map<KanbanCardRow>((card) => ({
    id: card.id,
    columnId: card.columnId,
    title: card.title,
    platform: card.platform,
    persona: card.persona,
    campaign: card.campaign,
    assignee: card.assignee,
    dueDate: card.dueDate,
    aiProgress: card.aiProgress ?? null,
    brandScore: card.brandScore ?? null,
  }));

  return <KanbanBoard initialCards={cards} />;
}
