import { asc, count } from "drizzle-orm";

import { CalendarView } from "@/components/screens/calendar/calendar-view";
import { db } from "@/db/index";
import { calendarEvents, contentItems } from "@/db/schema";

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

  const scheduledCount = Math.max(38, contentCount?.value ?? 0);

  return (
    <CalendarView
      campaignEvents={events}
      scheduledCount={scheduledCount}
    />
  );
}
