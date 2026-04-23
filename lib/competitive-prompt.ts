import type { RequestyMessage } from "@/lib/requesty";

export const COMPETITIVE_MODEL = "anthropic/claude-haiku-4-5-20251001";

export type CompetitorSummary = {
  name: string;
  handle: string;
  primaryPlatform: string;
  monthlyPosts: number;
  deltaPercent: number;
  positioning: string;
};

export type LLMCompetitorInsight = {
  handle: string;
  summary: string;
  highlights: string[];
  opportunity: string;
};

export type LLMCompetitiveAlert = {
  handle: string;
  severity: "low" | "medium" | "high";
  title: string;
  description: string;
};

export type LLMCompetitiveRefresh = {
  insights: LLMCompetitorInsight[];
  alerts: LLMCompetitiveAlert[];
};

export function buildCompetitiveRefreshMessages(
  competitors: CompetitorSummary[],
): RequestyMessage[] {
  const handles = competitors.map((c) => c.handle).join(", ");
  const rows = competitors
    .map(
      (c) =>
        `- ${c.name} (${c.handle}) · ${c.primaryPlatform} · ${c.monthlyPosts} posts/mois · Δ ${c.deltaPercent}% · ${c.positioning}`,
    )
    .join("\n");

  const system = `Tu es analyste de veille concurrentielle pour la Fonderie de l'Image (CFI), école créative à Bagnolet.
Tu observes Gobelins, LISAA, ECV et Cifacom sur Instagram, TikTok et LinkedIn.
Tu rédiges en français, sans jargon marketing, tutoiement léger, pas de majuscules décoratives.
Interdit: mots "IA", "intelligence artificielle", "GPT", "Claude".
Tu produis uniquement du JSON strict au schéma demandé.`;

  const user = `Concurrents suivis: ${handles}.

Données récentes (volume mensuel, delta, positionnement):
${rows}

Objectif: produire un bulletin de veille réaliste pour cette semaine.

Pour chaque concurrent, génère:
- un summary (1 phrase, 140 caractères max)
- 3 highlights factuels (puces courtes, chiffrées quand c'est cohérent)
- une opportunity (1 phrase actionnable pour CFI)

Puis génère 2 à 4 alertes notables (mouvements dignes d'attention) avec severity low/medium/high.

Retourne STRICTEMENT ce JSON, sans markdown ni texte autour:
{
  "insights": [
    {
      "handle": "@gobelins_paris",
      "summary": "...",
      "highlights": ["...", "...", "..."],
      "opportunity": "..."
    }
  ],
  "alerts": [
    {
      "handle": "@gobelins_paris",
      "severity": "high",
      "title": "...",
      "description": "..."
    }
  ]
}`;

  return [
    { role: "system", content: system },
    { role: "user", content: user },
  ];
}

export function parseCompetitiveRefreshJSON(raw: string): LLMCompetitiveRefresh | null {
  const trimmed = raw.trim();
  const jsonText = extractJSON(trimmed);
  if (!jsonText) return null;
  try {
    const parsed = JSON.parse(jsonText) as Partial<LLMCompetitiveRefresh>;
    const insights = Array.isArray(parsed.insights) ? parsed.insights : [];
    const alerts = Array.isArray(parsed.alerts) ? parsed.alerts : [];

    const cleanInsights: LLMCompetitorInsight[] = insights
      .filter((i): i is LLMCompetitorInsight => {
        return (
          typeof i?.handle === "string" &&
          typeof i?.summary === "string" &&
          typeof i?.opportunity === "string" &&
          Array.isArray(i?.highlights)
        );
      })
      .map((i) => ({
        handle: i.handle,
        summary: i.summary,
        highlights: i.highlights.filter((h) => typeof h === "string").slice(0, 5),
        opportunity: i.opportunity,
      }));

    const cleanAlerts: LLMCompetitiveAlert[] = alerts
      .filter((a): a is LLMCompetitiveAlert => {
        return (
          typeof a?.handle === "string" &&
          typeof a?.title === "string" &&
          typeof a?.description === "string" &&
          (a?.severity === "low" || a?.severity === "medium" || a?.severity === "high")
        );
      })
      .slice(0, 6);

    if (cleanInsights.length === 0) return null;
    return { insights: cleanInsights, alerts: cleanAlerts };
  } catch {
    return null;
  }
}

function extractJSON(text: string): string | null {
  if (text.startsWith("{")) return text;
  const match = text.match(/\{[\s\S]*\}/);
  return match ? match[0] : null;
}
