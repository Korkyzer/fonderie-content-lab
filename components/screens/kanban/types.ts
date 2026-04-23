import type { PlaceholderTone } from "@/components/ui/placeholder";

export const COLUMN_DEFS: ReadonlyArray<{
  id: string;
  title: string;
  dotColor: string;
  accent: PlaceholderTone;
}> = [
  { id: "ideas", title: "Brouillon", dotColor: "var(--color-lila)", accent: "purple" },
  { id: "brief", title: "En rédaction", dotColor: "var(--color-sky)", accent: "sky" },
  {
    id: "production",
    title: "Revue interne",
    dotColor: "var(--color-orange)",
    accent: "orange",
  },
  { id: "review", title: "Approuvé", dotColor: "var(--color-yellow)", accent: "yellow" },
  { id: "validated", title: "Planifié", dotColor: "var(--color-green)", accent: "green" },
  { id: "published", title: "Publié", dotColor: "var(--color-ink)", accent: "ink" },
];

export const PRIORITY_OPTIONS = ["urgent", "normal", "can_wait"] as const;
export type KanbanPriority = (typeof PRIORITY_OPTIONS)[number];

export const PRIORITY_LABEL: Record<KanbanPriority, string> = {
  urgent: "Urgent",
  normal: "Normal",
  can_wait: "Peut attendre",
};

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
  priority: KanbanPriority;
  reviewerId: string | null;
  deadline: string | null;
};

export type KanbanComment = {
  id: number;
  cardId: number;
  author: string;
  content: string;
  createdAt: string;
};

export type KanbanTransition = {
  id: number;
  cardId: number;
  fromStatus: string | null;
  toStatus: string;
  user: string;
  createdAt: string;
};

export const SLA_HOURS_THRESHOLD = 72;
