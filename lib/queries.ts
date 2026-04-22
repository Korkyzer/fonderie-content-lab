import { asc, count, desc } from "drizzle-orm";

import { db } from "@/db/index";
import {
  calendarEvents,
  contentItems,
  kanbanCards,
  personas,
} from "@/db/schema";

export type DashboardKpi = {
  label: string;
  value: string;
  delta: string;
  deltaDir: "up" | "down" | "flat";
  accent: string;
  spark: number[];
};

export async function getDashboardStats() {
  const items = db.select().from(contentItems).all();
  const cards = db.select().from(kanbanCards).all();
  const events = db.select().from(calendarEvents).all();

  const published = items.filter((item) => item.status === "published").length;
  const inProduction = cards.filter((card) =>
    ["brief", "production", "review"].includes(card.columnId),
  ).length;

  const brandScores = cards
    .map((card) => card.brandScore)
    .filter((score): score is number => typeof score === "number");
  const avgBrand =
    brandScores.length > 0
      ? Math.round(
          brandScores.reduce((acc, score) => acc + score, 0) / brandScores.length,
        )
      : 0;

  return {
    published,
    inProduction,
    avgBrand,
    plannedEvents: events.length,
  };
}

export function getUpcomingPublications(limit = 5) {
  return db
    .select()
    .from(contentItems)
    .orderBy(asc(contentItems.dueDate))
    .limit(limit)
    .all();
}

export function getCalendarEvents() {
  return db
    .select()
    .from(calendarEvents)
    .orderBy(asc(calendarEvents.startDate))
    .all();
}

export function getPersonasList() {
  return db.select().from(personas).orderBy(asc(personas.id)).all();
}

export function getKanbanCards() {
  return db
    .select()
    .from(kanbanCards)
    .orderBy(asc(kanbanCards.columnId), asc(kanbanCards.id))
    .all();
}

export function getColumnCounts() {
  return db
    .select({ columnId: kanbanCards.columnId, count: count() })
    .from(kanbanCards)
    .groupBy(kanbanCards.columnId)
    .all();
}

export function getRecentContent(limit = 5) {
  return db
    .select()
    .from(contentItems)
    .orderBy(desc(contentItems.dueDate))
    .limit(limit)
    .all();
}
