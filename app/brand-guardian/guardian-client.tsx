"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";

import type {
  BrandAnalysisResponse,
  BrandTone,
  BrandViolation,
  GuardianCheck,
  GuardianCheckState,
} from "@/lib/brand-guardian-mock";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Textarea } from "@/components/ui/textarea";
import { cx } from "@/lib/utils";

type BrandRuleRow = {
  id: number;
  category: string;
  name: string;
  description: string;
  severity: "high" | "medium" | "low" | string;
  expectedValue: string;
};

type GuardianClientProps = {
  initial: BrandAnalysisResponse;
  brandRules: BrandRuleRow[];
};

const ASSET_SWATCHES = [
  { label: "Violet primaire", value: "#AE64DE", token: "purple" },
  { label: "Jaune institution", value: "#FFED00", token: "yellow" },
  { label: "Bleu campus", value: "#80D3FF", token: "sky" },
  { label: "Noir éditorial", value: "#1D1D1B", token: "ink" },
  { label: "Vert validation", value: "#00B95A", token: "green" },
  { label: "Orange signal", value: "#FF8D28", token: "orange" },
];

const SEVERITY_TONE: Record<string, "red" | "orange" | "yellow" | "sky"> = {
  high: "red",
  medium: "orange",
  low: "sky",
};

const CHECK_STATE_STYLES: Record<
  GuardianCheckState,
  { chip: string; ring: string; label: string }
> = {
  ok: { chip: "bg-green text-ink", ring: "ring-green", label: "Conforme" },
  warn: { chip: "bg-yellow text-ink", ring: "ring-yellow-off", label: "Vigilance" },
  err: { chip: "bg-red text-cream", ring: "ring-red", label: "Bloquant" },
};

const VIOLATION_STYLES: Record<
  BrandViolation["severity"],
  { badge: "red" | "orange" | "sky"; label: string; border: string; bg: string }
> = {
  error: { badge: "red", label: "Erreur", border: "border-red", bg: "bg-red/10" },
  warning: { badge: "orange", label: "Attention", border: "border-orange", bg: "bg-orange/10" },
  info: { badge: "sky", label: "Info", border: "border-sky", bg: "bg-sky/10" },
};

export function GuardianClient({ initial, brandRules }: GuardianClientProps) {
  const searchParams = useSearchParams();
  const incomingContent = searchParams.get("content");
  const autoAnalyze = searchParams.get("autoAnalyze") === "1";

  const [analysis, setAnalysis] = useState<BrandAnalysisResponse>(initial);
  const [draft, setDraft] = useState(
    incomingContent?.trim() ||
      "Viens créer ton futur à la Fonderie · JPO 17 mai, campus Bagnolet. Motion design, sérigraphie, DA.",
  );
  const [fixedSlides, setFixedSlides] = useState<Set<number>>(new Set());
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const autoAnalyzedRef = useRef(false);

  const hasFix = fixedSlides.size > 0;
  const effectiveScore = hasFix
    ? analysis.suggestion.projectedScore
    : analysis.score;
  const ringCirc = 2 * Math.PI * 62;
  const offset = ringCirc * (1 - effectiveScore / 100);

  const analyzeDraft = (overrideContent?: string) => {
    const contentToAnalyze = (overrideContent ?? draft).trim();
    if (!contentToAnalyze) return;
    setAnalysisError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/brand-analysis", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ content: contentToAnalyze, format: "post-instagram" }),
        });
        if (!res.ok) {
          setAnalysisError(`Analyse indisponible (HTTP ${res.status}).`);
          return;
        }
        const data = (await res.json()) as BrandAnalysisResponse;
        setAnalysis(data);
        setFixedSlides(new Set());
      } catch (error) {
        setAnalysisError(error instanceof Error ? error.message : "Analyse en erreur.");
      }
    });
  };

  useEffect(() => {
    if (!autoAnalyze || autoAnalyzedRef.current) return;
    if (!incomingContent?.trim()) return;
    autoAnalyzedRef.current = true;
    const content = incomingContent;
    queueMicrotask(() => analyzeDraft(content));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoAnalyze, incomingContent]);

  const autoFix = () => {
    setFixedSlides(new Set([2]));
    setAnalysis((prev) => ({
      ...prev,
      score: prev.suggestion.projectedScore,
      checks: prev.checks.map((c) =>
        c.id === "graphic"
          ? {
              ...c,
              score: c.max - 1,
              state: "ok" as GuardianCheckState,
              msg: "Palette CFI validée sur les 5 slides.",
            }
          : c,
      ),
    }));
  };

  const verdictCopy = useMemo(() => {
    if (effectiveScore >= 95) return { title: "Prêt à publier", sub: "Toutes les garde-fous CFI sont alignés." };
    if (effectiveScore >= 85) return { title: analysis.verdict, sub: analysis.verdictSub };
    return { title: "À retravailler", sub: "Plusieurs points bloquants avant publication." };
  }, [effectiveScore, analysis.verdict, analysis.verdictSub]);

  return (
    <div className="grid gap-4 xl:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col gap-4">
        <Card>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div className="relative mx-auto shrink-0 sm:mx-0">
              <svg width={140} height={140} viewBox="0 0 140 140">
                <circle
                  cx={70}
                  cy={70}
                  r={62}
                  fill="none"
                  stroke="rgb(29 29 27 / 0.08)"
                  strokeWidth={10}
                />
                <circle
                  cx={70}
                  cy={70}
                  r={62}
                  fill="none"
                  stroke="var(--purple)"
                  strokeWidth={10}
                  strokeDasharray={ringCirc}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  transform="rotate(-90 70 70)"
                  className="transition-[stroke-dashoffset] duration-700 ease-brand"
                />
              </svg>
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="text-center font-display uppercase leading-none">
                  <span className="text-[38px]">{effectiveScore}</span>
                  <span className="text-[14px] text-ink/50"> /100</span>
                </div>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink/55">
                Verdict
              </p>
              <h3 className="mt-1 text-b2 font-display uppercase">
                {verdictCopy.title}
              </h3>
              <p className="mt-2 text-[13px] leading-snug text-ink/75">
                {verdictCopy.sub}
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {analysis.tags.map((t) => (
                  <Badge key={t.label} tone={t.tone}>
                    {t.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Checklist brand"
            more={`${analysis.checks.length} contrôles`}
          />
          <ul className="flex flex-col gap-2">
            {analysis.checks.map((check) => (
              <CheckRow key={check.id} check={check} />
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Règles brand actives" more={`${brandRules.length} règles`} />
          <ul className="flex flex-col divide-y divide-dashed divide-ink/10">
            {brandRules.map((rule) => (
              <li key={rule.id} className="flex items-start gap-3 py-2.5">
                <Badge tone={SEVERITY_TONE[rule.severity] ?? "ink"}>
                  {rule.severity.toUpperCase()}
                </Badge>
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-bold uppercase tracking-[0.06em]">
                    {rule.category} · {rule.name}
                  </p>
                  <p className="mt-1 text-[12px] leading-snug text-ink/70">
                    {rule.description}
                  </p>
                  <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-ink/45">
                    Attendu · {rule.expectedValue}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader title={`Contenu analysé · ${analysis.slides.length} slides`} more={`Auteur · ${analysis.meta.author}`} />
          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            {analysis.slides.map((slide, idx) => {
              const fixed = fixedSlides.has(idx);
              const background =
                fixed && slide.tone === "warning" ? "var(--yellow)" : slide.background;
              const tone: BrandTone = slide.tone ?? "ink";
              return (
                <div
                  key={slide.step}
                  className={cx(
                    "relative flex min-h-[110px] flex-col justify-between rounded-md border border-ink/10 p-3",
                    tone === "ink" ? "text-cream" : "text-ink",
                  )}
                  style={{ backgroundColor: background }}
                >
                  {slide.warning && !fixed ? (
                    <span className="absolute right-1.5 top-1.5 rounded-sm border border-ink bg-yellow px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.06em] text-ink">
                      ⚠ {slide.warning}
                    </span>
                  ) : null}
                  {fixed ? (
                    <span className="absolute right-1.5 top-1.5 rounded-sm border border-ink bg-green px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.06em] text-ink">
                      ✓ Corrigé
                    </span>
                  ) : null}
                  <span className="text-[9px] font-bold uppercase tracking-[0.12em] opacity-70">
                    {slide.step}
                  </span>
                  <span className="text-[12px] font-bold leading-tight">
                    {slide.title}
                  </span>
                </div>
              );
            })}
          </div>

          {!hasFix ? (
            <div className="mt-4 flex items-start gap-3 rounded-md border border-ink/10 bg-page p-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-yellow text-[12px] font-bold text-ink">
                !
              </span>
              <div className="flex-1 text-[12px] leading-snug">
                <b>{analysis.suggestion.slide} · Correction suggérée</b>
                <br />
                Remplacer{" "}
                <code className="rounded-[3px] bg-ink/6 px-1 font-mono">
                  {analysis.suggestion.wrongValue}
                </code>{" "}
                par le jaune officiel CFI{" "}
                <code className="rounded-[3px] bg-yellow px-1 font-mono">
                  {analysis.suggestion.correctValue}
                </code>
                . Gain estimé : +{analysis.suggestion.gain} pts sur Charte graphique →
                score projeté <b>{analysis.suggestion.projectedScore}/100</b>.
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={autoFix}
                icon={<Icon name="sparkle" size={14} />}
              >
                Auto-corriger
              </Button>
            </div>
          ) : (
            <div className="mt-4 flex items-center gap-3 rounded-md border border-green bg-green/15 p-3">
              <Icon name="check" size={18} />
              <span className="text-[12px] leading-snug">
                <b>Slide 3 corrigée</b> · Score mis à jour à{" "}
                {analysis.suggestion.projectedScore}/100.
              </span>
            </div>
          )}
        </Card>

        <Card>
          <CardHeader title="Analyser un autre contenu" />
          <div className="flex flex-col gap-3">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              label="Texte à analyser"
              hint="Colle une caption, un post, un email. Le Brand Guardian produit un score en 1,2s."
              emphasized
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/55">
                {draft.length} caractères · analyse persona Lycéens
              </span>
              <Button
                variant="dark"
                size="sm"
                onClick={() => analyzeDraft()}
                disabled={isPending}
                icon={<Icon name="shield" size={14} />}
              >
                {isPending ? "Analyse…" : "Analyser"}
              </Button>
            </div>
            {isPending ? (
              <p
                className="text-[11px] font-bold uppercase tracking-[0.1em] text-ink/55"
                role="status"
                aria-live="polite"
              >
                Analyse en cours · Requesty · DeepSeek…
              </p>
            ) : null}
            {analysisError ? (
              <p className="rounded-sm border border-red bg-red/10 px-3 py-2 text-[12px] text-red">
                {analysisError}
              </p>
            ) : null}
            {analysis.meta.source ? (
              <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink/45">
                Source · {analysis.meta.source === "requesty" ? "Requesty (LLM)" : "Mock local"}
              </p>
            ) : null}
          </div>
        </Card>

        {analysis.violations && analysis.violations.length > 0 ? (
          <Card>
            <CardHeader
              title="Violations détectées"
              more={`${analysis.violations.length} remontée${analysis.violations.length > 1 ? "s" : ""}`}
            />
            {analysis.summary ? (
              <p className="mb-3 text-[12px] leading-snug text-ink/75">{analysis.summary}</p>
            ) : null}
            <ul className="flex flex-col gap-2">
              {analysis.violations.map((violation, idx) => (
                <ViolationRow key={`${violation.rule}-${idx}`} violation={violation} />
              ))}
            </ul>
          </Card>
        ) : analysis.meta.source === "requesty" && analysis.summary ? (
          <Card>
            <CardHeader title="Audit LLM" more="0 violation" />
            <div className="flex items-start gap-3 rounded-md border border-green bg-green/10 p-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-green text-ink">
                <Icon name="check" size={14} />
              </span>
              <p className="flex-1 text-[12px] leading-snug text-ink/80">{analysis.summary}</p>
            </div>
          </Card>
        ) : null}

        <Card>
          <CardHeader title="Historique de validation" />
          <ul className="flex flex-col divide-y divide-dashed divide-ink/10">
            {analysis.history.map((event) => (
              <li key={event.id} className="flex items-start gap-3 py-2.5">
                <span
                  className={cx(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full text-[11px] font-bold text-ink",
                    event.avatarTone === "purple" && "bg-purple",
                    event.avatarTone === "sky" && "bg-sky",
                    event.avatarTone === "orange" && "bg-orange",
                    event.avatarTone === "green" && "bg-green",
                  )}
                >
                  {event.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-bold">{event.author}</p>
                  <p className="mt-1 text-[11px] text-ink/60">{event.note}</p>
                </div>
                <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] text-ink/45">
                  {event.time}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Bibliothèque d'assets" more="Tout voir" />
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {ASSET_SWATCHES.map((swatch) => (
              <div
                key={swatch.value}
                className="flex items-center gap-2.5 rounded-md border border-ink/10 bg-white p-2"
              >
                <span
                  aria-hidden
                  className="h-10 w-10 shrink-0 rounded-md border border-ink/15"
                  style={{ backgroundColor: swatch.value }}
                />
                <div className="min-w-0 text-[11px] leading-tight">
                  <p className="font-bold">{swatch.label}</p>
                  <p className="mt-0.5 font-mono text-ink/60">{swatch.value}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-bold uppercase tracking-[0.1em]">
            <div className="rounded-md border border-ink bg-cream p-2">
              <p className="text-ink/50">Typo</p>
              <p className="mt-1 font-display text-[16px] normal-case tracking-normal">
                SVHFlib Bold
              </p>
            </div>
            <div className="rounded-md border border-ink bg-ink p-2 text-cream">
              <p className="text-cream/50">Logo</p>
              <p className="mt-1 text-[16px]">CFI · Fonderie</p>
            </div>
            <div className="rounded-md border border-ink bg-purple p-2 text-ink">
              <p className="text-ink/55">Ton</p>
              <p className="mt-1 text-[14px]">Accessible</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function ViolationRow({ violation }: { violation: BrandViolation }) {
  const styles = VIOLATION_STYLES[violation.severity];
  return (
    <li className={cx("rounded-md border p-3", styles.border, styles.bg)}>
      <div className="flex items-start gap-3">
        <Badge tone={styles.badge}>{styles.label}</Badge>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink/55">
            Règle · {violation.rule || "brand"}
          </p>
          <p className="mt-1 text-[12px] leading-snug text-ink">{violation.description}</p>
          {violation.suggestion ? (
            <p className="mt-1 text-[12px] leading-snug text-ink/75">
              <b>Suggestion · </b>
              {violation.suggestion}
            </p>
          ) : null}
        </div>
      </div>
    </li>
  );
}

function CheckRow({ check }: { check: GuardianCheck }) {
  const styles = CHECK_STATE_STYLES[check.state];
  return (
    <li className="flex items-start gap-3 rounded-md border border-ink/8 bg-page p-3">
      <span
        className={cx(
          "grid h-8 w-8 shrink-0 place-items-center rounded-md",
          styles.chip,
        )}
      >
        {check.state === "ok" ? (
          <Icon name="check" size={14} />
        ) : check.state === "warn" ? (
          <span className="text-[14px] font-bold">!</span>
        ) : (
          <Icon name="close" size={14} />
        )}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-bold uppercase tracking-[0.06em]">
          {check.label}
        </p>
        <p className="mt-1 text-[12px] leading-snug text-ink/70">{check.msg}</p>
      </div>
      <span className="shrink-0 text-[11px] font-bold uppercase tracking-[0.08em] text-ink/60">
        {check.score}/{check.max}
      </span>
    </li>
  );
}
