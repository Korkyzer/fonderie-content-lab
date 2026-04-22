import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-heading";
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionHeading
          eyebrow="Production"
          title="Kanban · contenus en cours"
          description="Pipeline multi-colonnes pour idées, briefs, production, review, validation et publication."
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="light" icon={<Icon name="filter" size={14} />}>
            Filtres
          </Button>
          <Button variant="light" icon={<Icon name="users" size={14} />}>
            Équipe (4)
          </Button>
          <Button variant="primary" icon={<Icon name="plus" size={14} />}>
            Nouveau brief
          </Button>
        </div>
      </div>

      <KanbanBoard initialCards={cards} />
    </div>
  );
}
