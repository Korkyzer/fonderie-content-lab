import { asc, count, inArray } from "drizzle-orm";

import { CalendarView } from "@/components/screens/calendar/calendar-view";
import { db } from "@/db/index";
import { calendarEvents, contentItems, kanbanCards } from "@/db/schema";

export const dynamic = "force-dynamic";

export default function CalendarPage() {
  const events = db
    .select()
    .from(calendarEvents)
    .orderBy(asc(calendarEvents.startDate))
    .all();

  const [contentCount] = db
    .select({ value: count() })
    .from(contentItems)
    .all();

  const scheduledCards = db
    .select({
      id: kanbanCards.id,
      title: kanbanCards.title,
      platform: kanbanCards.platform,
      campaign: kanbanCards.campaign,
      assignee: kanbanCards.assignee,
      dueDate: kanbanCards.dueDate,
      columnId: kanbanCards.columnId,
    })
    .from(kanbanCards)
    .where(inArray(kanbanCards.columnId, ["validated", "published"]))
    .all();

  const scheduledCount = Math.max(38, contentCount?.value ?? 0);

  return (
    <CalendarView
      campaignEvents={events}
      scheduledCount={scheduledCount}
      scheduledCards={scheduledCards}
    />
  );
}
