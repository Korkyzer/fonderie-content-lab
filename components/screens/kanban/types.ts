import type { PlaceholderTone } from "@/components/ui/placeholder";

export const COLUMN_DEFS: ReadonlyArray<{
  id: string;
  title: string;
  dotColor: string;
  accent: PlaceholderTone;
}> = [
  { id: "ideas", title: "Idées", dotColor: "var(--color-lila)", accent: "purple" },
  { id: "brief", title: "Brief", dotColor: "var(--color-sky)", accent: "sky" },
  {
    id: "production",
    title: "En production",
    dotColor: "var(--color-orange)",
    accent: "orange",
  },
  { id: "review", title: "Review", dotColor: "var(--color-yellow)", accent: "yellow" },
  { id: "validated", title: "Validé", dotColor: "var(--color-green)", accent: "green" },
  { id: "published", title: "Publié", dotColor: "var(--color-ink)", accent: "ink" },
];

export type KanbanCardRow = {
  id: number;
  columnId: string;
  title: string;
  platform: string;
  persona: string;
  campaign: string;
  assignee: string;
  dueDate: string;
  aiProgress: number | null;
  brandScore: number | null;
};
