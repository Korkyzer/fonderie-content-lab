import { KanbanBoard } from "@/components/screens/kanban/kanban-board";
import {
  PRIORITY_OPTIONS,
  type KanbanCardRow,
  type KanbanPriority,
} from "@/components/screens/kanban/types";
import { getKanbanCards } from "@/lib/queries";

export const dynamic = "force-dynamic";

const PRIORITY_SET = new Set<string>(PRIORITY_OPTIONS);

export default function KanbanPage() {
  const cards = getKanbanCards().map<KanbanCardRow>((card) => {
    const priority = PRIORITY_SET.has(card.priority)
      ? (card.priority as KanbanPriority)
      : "normal";
    return {
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
      priority,
      reviewerId: card.reviewerId ?? null,
      deadline: card.deadline ?? null,
    };
  });

  return <KanbanBoard initialCards={cards} />;
}
