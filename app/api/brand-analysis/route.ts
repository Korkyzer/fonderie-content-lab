import { NextResponse } from "next/server";

import {
  DEFAULT_DRAFT,
  createBrandAnalysisResponse,
  type BrandAnalysisRequest,
  type BrandAnalysisResponse,
  type BrandViolation,
  type GuardianCheck,
  type GuardianCheckState,
} from "@/lib/brand-guardian-mock";
import {
  buildBrandAnalysisMessages,
  parseBrandAnalysisJSON,
  type LLMBrandAnalysis,
} from "@/lib/brand-guardian-prompt";
import { hasRequestyKey, requestyComplete, RequestyError } from "@/lib/requesty";

export const runtime = "nodejs";

const BRAND_ANALYSIS_MODEL = "deepseek/deepseek-chat";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<BrandAnalysisRequest>;
  const mock = createBrandAnalysisResponse(body);

  if (!hasRequestyKey()) {
    return NextResponse.json(mock);
  }

  try {
    const content = body.content?.trim() || DEFAULT_DRAFT;
    const format = body.format?.trim() || mock.meta.format;
    const messages = buildBrandAnalysisMessages(content, format);
    const { text } = await requestyComplete(messages, {
      model: BRAND_ANALYSIS_MODEL,
      temperature: 0.2,
      maxTokens: 900,
      responseFormat: "json_object",
      signal: request.signal,
    });
    const parsed = parseBrandAnalysisJSON(text);
    if (!parsed) {
      return NextResponse.json(mock);
    }
    return NextResponse.json(mergeAnalysisWithLLM(mock, parsed));
  } catch (error) {
    const message = error instanceof RequestyError ? error.message : String(error);
    console.error("[api/brand-analysis] fallback mock:", message);
    return NextResponse.json(mock);
  }
}

export async function GET() {
  return NextResponse.json(createBrandAnalysisResponse());
}

function mergeAnalysisWithLLM(
  mock: BrandAnalysisResponse,
  llm: LLMBrandAnalysis,
): BrandAnalysisResponse {
  const score = llm.score;
  const violations = llm.violations;
  const verdict = deriveVerdict(score);
  const checks = mapViolationsToChecks(mock.checks, violations);

  return {
    ...mock,
    score,
    verdict: verdict.title,
    verdictSub: llm.summary || verdict.sub,
    checks,
    summary: llm.summary,
    violations,
    meta: {
      ...mock.meta,
      analyzedAt: new Date().toISOString(),
      source: "requesty",
    },
  };
}

function deriveVerdict(score: number): { title: string; sub: string } {
  if (score >= 95) return { title: "Prêt à publier", sub: "Tous les garde-fous CFI sont alignés." };
  if (score >= 85) return { title: "Presque prêt", sub: "Quelques points d'attention avant publication." };
  if (score >= 70) return { title: "À retravailler", sub: "Plusieurs ajustements à faire avant validation." };
  return { title: "Non conforme", sub: "Contenu bloquant, retravail majeur nécessaire." };
}

const RULE_TO_CHECK_ID: Record<string, string> = {
  palette: "graphic",
  couleur: "graphic",
  couleurs: "graphic",
  typographie: "graphic",
  typo: "graphic",
  charte: "graphic",
  ton: "tone",
  tone: "tone",
  vocabulaire: "lex",
  lexique: "lex",
  mots: "lex",
  etudiants: "edu",
  "étudiants": "edu",
  education: "edu",
  "éducation": "edu",
  accessibilite: "a11y",
  "accessibilité": "a11y",
  a11y: "a11y",
};

function mapViolationsToChecks(
  baseChecks: GuardianCheck[],
  violations: BrandViolation[],
): GuardianCheck[] {
  if (violations.length === 0) {
    return baseChecks.map((check) => ({
      ...check,
      state: "ok" as GuardianCheckState,
      score: check.max,
    }));
  }

  const byCheckId = new Map<string, BrandViolation[]>();
  for (const v of violations) {
    const key = RULE_TO_CHECK_ID[v.rule.toLowerCase().trim()] ?? "graphic";
    const bucket = byCheckId.get(key) ?? [];
    bucket.push(v);
    byCheckId.set(key, bucket);
  }

  return baseChecks.map((check) => {
    const hits = byCheckId.get(check.id) ?? [];
    if (hits.length === 0) {
      return { ...check, state: "ok" as GuardianCheckState, score: check.max };
    }
    const hasError = hits.some((h) => h.severity === "error");
    const state: GuardianCheckState = hasError ? "err" : "warn";
    const penalty = hasError ? Math.max(5, Math.round(check.max * 0.4)) : Math.max(2, Math.round(check.max * 0.2));
    const nextScore = Math.max(0, check.max - penalty);
    const primary = hits[0];
    return {
      ...check,
      state,
      score: nextScore,
      msg: `${primary.description}${primary.suggestion ? ` · ${primary.suggestion}` : ""}`,
    };
  });
}
