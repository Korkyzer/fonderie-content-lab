import { desc } from "drizzle-orm";

import { CompetitiveView } from "@/components/screens/competitive/competitive-view";
import { db } from "@/db/index";
import { competitors } from "@/db/schema";
import { getActiveAlerts, getCompetitorInsights } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default function CompetitivePage() {
  const records = db
    .select()
    .from(competitors)
    .orderBy(desc(competitors.monthlyPosts))
    .all();

  const insights = getCompetitorInsights().map((row) => ({
    id: row.id,
    handle: row.handle,
    summary: row.summary,
    highlights: safeParseHighlights(row.highlights),
    opportunity: row.opportunity,
    source: row.source,
    generatedAt: row.generatedAt,
  }));

  const alerts = getActiveAlerts();

  return <CompetitiveView competitors={records} insights={insights} alerts={alerts} />;
}

function safeParseHighlights(raw: string): string[] {
  try {
    const value = JSON.parse(raw);
    if (Array.isArray(value)) return value.filter((v): v is string => typeof v === "string");
  } catch {
    return [];
  }
  return [];
}
