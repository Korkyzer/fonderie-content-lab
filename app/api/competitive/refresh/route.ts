import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db/index";
import {
  competitiveAlerts,
  competitorInsights,
  competitors,
} from "@/db/schema";
import {
  COMPETITIVE_MODEL,
  buildCompetitiveRefreshMessages,
  parseCompetitiveRefreshJSON,
  type CompetitorSummary,
  type LLMCompetitiveRefresh,
} from "@/lib/competitive-prompt";
import { hasRequestyKey, requestyComplete, RequestyError } from "@/lib/requesty";

export const runtime = "nodejs";

export async function POST() {
  const competitorRows = db.select().from(competitors).all();
  if (competitorRows.length === 0) {
    return NextResponse.json(
      { error: "Aucun concurrent configuré" },
      { status: 400 },
    );
  }

  const summaries: CompetitorSummary[] = competitorRows.map((c) => ({
    name: c.name,
    handle: c.handle,
    primaryPlatform: c.primaryPlatform,
    monthlyPosts: c.monthlyPosts,
    deltaPercent: c.deltaPercent,
    positioning: c.positioning,
  }));

  const { payload, source, error } = await generatePayload(summaries);
  persistPayload(payload, source);

  const now = new Date().toISOString();
  return NextResponse.json({
    source,
    generatedAt: now,
    insights: payload.insights,
    alerts: payload.alerts,
    ...(error ? { warning: error } : {}),
  });
}

async function generatePayload(summaries: CompetitorSummary[]): Promise<{
  payload: LLMCompetitiveRefresh;
  source: "requesty" | "mock";
  error?: string;
}> {
  if (!hasRequestyKey()) {
    return { payload: buildMockPayload(summaries), source: "mock" };
  }
  try {
    const messages = buildCompetitiveRefreshMessages(summaries);
    const { text } = await requestyComplete(messages, {
      model: COMPETITIVE_MODEL,
      temperature: 0.4,
      maxTokens: 1400,
      responseFormat: "json_object",
    });
    const parsed = parseCompetitiveRefreshJSON(text);
    if (!parsed) {
      return {
        payload: buildMockPayload(summaries),
        source: "mock",
        error: "Réponse LLM non exploitable, fallback mock",
      };
    }
    return { payload: parsed, source: "requesty" };
  } catch (err) {
    const message = err instanceof RequestyError ? err.message : String(err);
    console.error("[api/competitive/refresh] fallback mock:", message);
    return {
      payload: buildMockPayload(summaries),
      source: "mock",
      error: message,
    };
  }
}

function persistPayload(payload: LLMCompetitiveRefresh, source: string) {
  const now = new Date().toISOString();

  for (const insight of payload.insights) {
    db.delete(competitorInsights).where(eq(competitorInsights.handle, insight.handle)).run();
    db.insert(competitorInsights).values({
      handle: insight.handle,
      summary: insight.summary,
      highlights: JSON.stringify(insight.highlights),
      opportunity: insight.opportunity,
      source,
      generatedAt: now,
    }).run();
  }

  db.delete(competitiveAlerts).run();
  if (payload.alerts.length > 0) {
    db.insert(competitiveAlerts).values(
      payload.alerts.map((alert) => ({
        handle: alert.handle,
        severity: alert.severity,
        title: alert.title,
        description: alert.description,
        source,
        dismissed: false,
        createdAt: now,
      })),
    ).run();
  }
}

function buildMockPayload(summaries: CompetitorSummary[]): LLMCompetitiveRefresh {
  const insights = summaries.map((c) => {
    const trend = c.deltaPercent >= 10
      ? "accélération"
      : c.deltaPercent <= -5
        ? "ralentissement"
        : "stabilité";
    return {
      handle: c.handle,
      summary: `${c.name} · ${c.monthlyPosts} posts/mois sur ${c.primaryPlatform}, ${trend} (${c.deltaPercent >= 0 ? "+" : ""}${c.deltaPercent}%).`,
      highlights: [
        `${c.monthlyPosts} publications mensuelles`,
        `Plateforme dominante: ${c.primaryPlatform}`,
        c.positioning,
      ],
      opportunity: `Suivre de près ${c.name} sur ${c.primaryPlatform} et lancer un format différenciant.`,
    };
  });

  const sorted = [...summaries].sort((a, b) => b.deltaPercent - a.deltaPercent);
  const top = sorted[0];
  const bottom = sorted[sorted.length - 1];
  const alerts = [
    {
      handle: top.handle,
      severity: "high" as const,
      title: `${top.name} accélère fort (${top.deltaPercent >= 0 ? "+" : ""}${top.deltaPercent}%)`,
      description: `Volume en hausse sur ${top.primaryPlatform}, prévoir une contre-offensive éditoriale cette semaine.`,
    },
    {
      handle: bottom.handle,
      severity: bottom.deltaPercent < 0 ? ("medium" as const) : ("low" as const),
      title: `${bottom.name} ajuste sa cadence (${bottom.deltaPercent >= 0 ? "+" : ""}${bottom.deltaPercent}%)`,
      description: `Opportunité de capter une part de voix sur ${bottom.primaryPlatform}.`,
    },
  ];

  return { insights, alerts };
}
