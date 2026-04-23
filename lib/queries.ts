import { asc, count, desc, eq } from "drizzle-orm";

import { db } from "@/db/index";
import {
  calendarEvents,
  competitiveAlerts,
  competitorInsights,
  competitorMetrics,
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

export type ScoreboardRow = {
  handle: string;
  label: string;
  isCfi: boolean;
  instagramEngagement: number;
  linkedinEngagement: number;
  tiktokEngagement: number;
  instagramPosts: number;
  linkedinPosts: number;
  tiktokPosts: number;
  reach: number;
  compositeScore: number;
};

export type ScoreboardTrendPoint = {
  weekStart: string;
  cfi: number;
  gobelins: number;
  lisaa: number;
  ecv: number;
  cifacom: number;
};

const HANDLE_LABELS: Record<string, string> = {
  "@cfi_paris": "CFI",
  "@gobelins_paris": "Gobelins",
  "@lisaa_paris": "LISAA",
  "@ecv_france": "ECV",
  "@cifacom": "Cifacom",
};

function normalizeHandleKey(handle: string): keyof ScoreboardTrendPoint | null {
  switch (handle) {
    case "@cfi_paris":
      return "cfi";
    case "@gobelins_paris":
      return "gobelins";
    case "@lisaa_paris":
      return "lisaa";
    case "@ecv_france":
      return "ecv";
    case "@cifacom":
      return "cifacom";
    default:
      return null;
  }
}

export function getScoreboard(): {
  rows: ScoreboardRow[];
  trend: ScoreboardTrendPoint[];
  latestWeek: string | null;
} {
  const metrics = db
    .select()
    .from(competitorMetrics)
    .orderBy(desc(competitorMetrics.weekStart))
    .all();

  if (metrics.length === 0) {
    return { rows: [], trend: [], latestWeek: null };
  }

  const weeks = Array.from(new Set(metrics.map((m) => m.weekStart))).sort();
  const latestWeek = weeks[weeks.length - 1] ?? null;
  const latestMetrics = metrics.filter((m) => m.weekStart === latestWeek);

  const byHandle = new Map<string, typeof latestMetrics>();
  for (const m of latestMetrics) {
    const bucket = byHandle.get(m.handle) ?? [];
    bucket.push(m);
    byHandle.set(m.handle, bucket);
  }

  const rows: ScoreboardRow[] = [];
  for (const [handle, entries] of byHandle) {
    const instagram = entries.find((e) => e.platform === "Instagram");
    const linkedin = entries.find((e) => e.platform === "LinkedIn");
    const tiktok = entries.find((e) => e.platform === "TikTok");

    const instagramEngagement = instagram?.engagementRate ?? 0;
    const linkedinEngagement = linkedin?.engagementRate ?? 0;
    const tiktokEngagement = tiktok?.engagementRate ?? 0;
    const reach = (instagram?.reach ?? 0) + (linkedin?.reach ?? 0) + (tiktok?.reach ?? 0);
    const postsSum = (instagram?.posts ?? 0) + (linkedin?.posts ?? 0) + (tiktok?.posts ?? 0);

    const engagementAvg =
      (instagramEngagement + linkedinEngagement + tiktokEngagement) / 3;
    const compositeScore = Math.round(
      engagementAvg * 7 + Math.log10(Math.max(reach, 10)) * 10 + Math.min(postsSum, 80) * 0.3,
    );

    rows.push({
      handle,
      label: HANDLE_LABELS[handle] ?? handle,
      isCfi: handle === "@cfi_paris",
      instagramEngagement,
      linkedinEngagement,
      tiktokEngagement,
      instagramPosts: instagram?.posts ?? 0,
      linkedinPosts: linkedin?.posts ?? 0,
      tiktokPosts: tiktok?.posts ?? 0,
      reach,
      compositeScore,
    });
  }

  rows.sort((a, b) => b.compositeScore - a.compositeScore);

  const trend: ScoreboardTrendPoint[] = weeks.map((weekStart) => {
    const weekMetrics = metrics.filter((m) => m.weekStart === weekStart);
    const point: ScoreboardTrendPoint = {
      weekStart,
      cfi: 0,
      gobelins: 0,
      lisaa: 0,
      ecv: 0,
      cifacom: 0,
    };
    const byHandleWeek = new Map<string, typeof weekMetrics>();
    for (const m of weekMetrics) {
      const bucket = byHandleWeek.get(m.handle) ?? [];
      bucket.push(m);
      byHandleWeek.set(m.handle, bucket);
    }
    for (const [handle, entries] of byHandleWeek) {
      const key = normalizeHandleKey(handle);
      if (!key || key === "weekStart") continue;
      const avg =
        entries.reduce((sum, e) => sum + e.engagementRate, 0) /
        Math.max(entries.length, 1);
      point[key] = Math.round(avg * 10) / 10;
    }
    return point;
  });

  return { rows, trend, latestWeek };
}

export function getCompetitorInsights() {
  return db.select().from(competitorInsights).orderBy(desc(competitorInsights.generatedAt)).all();
}

export function getActiveAlerts() {
  return db
    .select()
    .from(competitiveAlerts)
    .where(eq(competitiveAlerts.dismissed, false))
    .orderBy(desc(competitiveAlerts.createdAt))
    .all();
}
