"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import type { BadgeTone } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Icon } from "@/components/ui/icon";
import { Pill } from "@/components/ui/pill";
import type {
  BackstageStep,
  GenerateResponse,
  GeneratorVariant,
} from "@/lib/generator-mock";
import { cx } from "@/lib/utils";

type PersonaOption = { name: string; tone: BadgeTone };

type DurationOption = "15s" | "30s" | "60s" | "90s";

type GeneratorClientProps = {
  personas: PersonaOption[];
  initial: GenerateResponse;
  initialBrief?: string;
  initialPersona?: string;
  initialPlatform?: string;
};

const DEFAULT_BRIEF =
  "Un Reel Instagram pour promouvoir notre JPO de mai avec des extraits de travaux étudiants en motion design";

const VISUAL_STYLES = ["Dynamique & créatif", "Documentaire", "Portrait atelier", "Editorial"];
const TONES = ["Inspirant & accessible", "Direct & factuel", "Chaleureux & alumni", "Expert & corporate"];
const FORMATIONS = ["Motion Design", "Design Graphique", "Sérigraphie", "Direction Artistique"];
const DURATIONS: DurationOption[] = ["15s", "30s", "60s", "90s"];
const PLATFORMS = [
  { id: "instagram-reel", label: "Instagram Reel", icon: "instagram" as const },
  { id: "tiktok", label: "TikTok", icon: "tiktok" as const },
  { id: "linkedin", label: "LinkedIn", icon: "linkedin" as const },
  { id: "email", label: "Email", icon: "bookmark" as const },
];

const DECLINATIONS = [
  "Version LinkedIn Parents",
  "Version TikTok Lycéens",
  "Version Story compte à rebours",
  "Version Mail Alumni",
];

const HISTORY_SEED = [
  { when: "il y a 2 min", msg: "Variantes A/B/C générées" },
  { when: "il y a 4 min", msg: "Persona changée : Lycéens 16-20" },
  { when: "il y a 5 min", msg: "Brief créé depuis template « JPO teaser »" },
];

function wordCount(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export function GeneratorClient({
  personas,
  initial,
  initialBrief,
  initialPersona,
  initialPlatform,
}: GeneratorClientProps) {
  const initialPlatformId =
    PLATFORMS.find((option) => option.label === initialPlatform)?.id ?? "instagram-reel";

  const [brief, setBrief] = useState(initialBrief ?? DEFAULT_BRIEF);
  const [persona, setPersona] = useState(initialPersona ?? personas[0]?.name ?? "Lycéens 16-20");
  const [platform, setPlatform] = useState(initialPlatformId);
  const [visualStyle, setVisualStyle] = useState(VISUAL_STYLES[0]);
  const [tone, setTone] = useState(TONES[0]);
  const [formation, setFormation] = useState(FORMATIONS[0]);
  const [duration, setDuration] = useState<DurationOption>("30s");
  const [variantId, setVariantId] = useState<GeneratorVariant["id"]>("A");
  const [generation, setGeneration] = useState<GenerateResponse>(initial);
  const [isPending, setIsPending] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [tokenUsage, setTokenUsage] = useState<number | null>(null);
  const [streamSource, setStreamSource] = useState<"requesty" | "mock" | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const variant = useMemo(
    () =>
      generation.variants.find((v) => v.id === variantId) ?? generation.variants[0],
    [generation.variants, variantId],
  );

  const personaTone = personas.find((p) => p.name === persona)?.tone ?? "yellow";
  const platformMeta = PLATFORMS.find((p) => p.id === platform) ?? PLATFORMS[0];
  const chars = brief.length;
  const words = wordCount(brief);

  const regenerate = async () => {
    if (isPending) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsPending(true);
    setStreamingText("");
    setTokenUsage(null);
    setStreamSource(null);
    setStreamError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "text/event-stream",
        },
        body: JSON.stringify({
          brief,
          persona,
          platform: platformMeta.label,
          visualStyle,
          tone,
          formation,
          duration,
        }),
        signal: controller.signal,
      });
      if (!res.ok || !res.body) {
        setStreamError(`HTTP ${res.status}`);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let boundary: number;
        while ((boundary = buffer.indexOf("\n\n")) !== -1) {
          const rawEvent = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 2);
          handleSSEEvent(rawEvent);
        }
      }
    } catch (error) {
      if ((error as Error).name === "AbortError") return;
      setStreamError(error instanceof Error ? error.message : "stream failed");
    } finally {
      setIsPending(false);
      abortRef.current = null;
    }
  };

  const handleSSEEvent = (raw: string) => {
    let eventName = "message";
    let dataLine = "";
    for (const line of raw.split("\n")) {
      if (line.startsWith("event:")) eventName = line.slice(6).trim();
      else if (line.startsWith("data:")) dataLine += line.slice(5).trim();
    }
    if (!dataLine) return;

    let payload: unknown;
    try {
      payload = JSON.parse(dataLine);
    } catch {
      return;
    }

    if (eventName === "delta") {
      const text = (payload as { text?: string }).text ?? "";
      setStreamingText((prev) => prev + text);
    } else if (eventName === "usage") {
      const total = (payload as { total_tokens?: number }).total_tokens;
      if (typeof total === "number") setTokenUsage(total);
    } else if (eventName === "mock") {
      setStreamSource("mock");
    } else if (eventName === "start") {
      setStreamSource("requesty");
    } else if (eventName === "error") {
      const message = (payload as { message?: string }).message;
      if (message) setStreamError(message);
    } else if (eventName === "done") {
      const result = (payload as { result?: GenerateResponse; tokens?: number }).result;
      const tokens = (payload as { tokens?: number }).tokens;
      if (result) setGeneration(result);
      if (typeof tokens === "number") setTokenUsage(tokens);
    }
  };

  const estimatedCostEUR = tokenUsage ? (tokenUsage / 1000) * 0.012 : null;

  return (
    <div className="grid gap-4 xl:grid-cols-[0.9fr_1.6fr_0.85fr]">
      <div className="flex flex-col gap-4">
        <Card>
          <CardHeader title="Paramètres" />
          <div className="flex flex-col gap-3.5">
            <Field label="Persona">
              <SelectChip
                leading={<Badge tone={personaTone}>{persona}</Badge>}
                options={personas.map((p) => p.name)}
                value={persona}
                onChange={setPersona}
                ariaLabel="Persona"
              />
            </Field>

            <Field label="Plateforme">
              <SelectChip
                leading={
                  <span className="inline-flex items-center gap-2 text-[13px] font-bold">
                    <Icon name={platformMeta.icon} size={14} />
                    {platformMeta.label}
                  </span>
                }
                options={PLATFORMS.map((p) => p.label)}
                value={platformMeta.label}
                onChange={(label) => {
                  const match = PLATFORMS.find((p) => p.label === label);
                  if (match) setPlatform(match.id);
                }}
                ariaLabel="Plateforme"
              />
            </Field>

            <Field label="Style visuel">
              <SelectChip
                leading={<span>{visualStyle}</span>}
                options={VISUAL_STYLES}
                value={visualStyle}
                onChange={setVisualStyle}
                ariaLabel="Style visuel"
              />
            </Field>

            <Field label="Ton éditorial">
              <SelectChip
                leading={<span>{tone}</span>}
                options={TONES}
                value={tone}
                onChange={setTone}
                ariaLabel="Ton éditorial"
              />
            </Field>

            <Field label="Formation en vedette">
              <SelectChip
                leading={<Badge tone="purple">{formation}</Badge>}
                options={FORMATIONS}
                value={formation}
                onChange={setFormation}
                ariaLabel="Formation en vedette"
              />
            </Field>

            <Field label="Durée cible">
              <div className="flex flex-wrap gap-1.5">
                {DURATIONS.map((d) => (
                  <Pill
                    key={d}
                    active={duration === d}
                    onClick={() => setDuration(d)}
                  >
                    {d}
                  </Pill>
                ))}
              </div>
            </Field>
          </div>
        </Card>

        <Card>
          <CardHeader title="Assets repérés" />
          <ul className="flex flex-col gap-1.5">
            {generation.assets.map((asset) => (
              <li
                key={asset.label}
                className="flex items-center justify-between gap-2 rounded-sm bg-white px-2.5 py-2 text-[11px]"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                    style={{ backgroundColor: `var(--${asset.tone})` }}
                  />
                  <span className="truncate">{asset.label}</span>
                </span>
                <span className="shrink-0 text-ink/50">{asset.size}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
              Étape 1 · Brief
            </h3>
            <Badge tone="outline">Étape 2 ci-dessous</Badge>
          </div>
          <div className="flex flex-col gap-3">
            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              className="min-h-[130px] w-full resize-vertical rounded-md border-2 border-ink bg-white p-4 text-[15px] font-medium leading-relaxed text-ink outline-none transition-colors placeholder:text-ink/40 focus:border-purple"
              placeholder="Décris l'intention, les assets et l'audience..."
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-1.5">
                <Pill onClick={() => setBrief((b) => `${b} #JPO2026`)}>+ Hashtags</Pill>
                <Pill onClick={() => setBrief((b) => `${b}\nLien JPO`)}>+ Lien JPO</Pill>
                <Pill onClick={() => setBrief((b) => `${b}\nCTA: viens au campus.`)}>+ Call to action</Pill>
                <Pill onClick={() => setBrief((b) => `${b}\nUGC étudiants 17 mai`)}>+ UGC étudiants</Pill>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink/55">
                {chars} caractères · {words} mots
              </span>
            </div>
          </div>
        </Card>

        <Card tone="ink" className="bg-ink text-cream">
          <div className="mb-3 flex items-center justify-between gap-3 text-[11px] font-bold uppercase tracking-[0.14em]">
            <span className="flex items-center gap-2">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-cream" />
              Étape 2 · Enrichissement backstage
            </span>
            <span className="text-cream/50 tracking-[0.1em]">
              4 agents travaillent
            </span>
          </div>
          <ul className="flex flex-col gap-2">
            {generation.backstage.map((step) => (
              <BackstageRow key={step.label} step={step} />
            ))}
          </ul>

          {(isPending || streamingText) && (
            <div className="mt-4 rounded-md border border-cream/15 bg-cream/5 p-3">
              <div className="mb-2 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.12em] text-cream/55">
                <span className="flex items-center gap-2">
                  <span
                    className={cx(
                      "inline-block h-1.5 w-1.5 rounded-full",
                      isPending ? "animate-pulse bg-purple" : "bg-green",
                    )}
                  />
                  {isPending ? "Streaming en cours" : "Streaming terminé"}
                  {streamSource === "mock" ? " · mode mock" : ""}
                </span>
                {tokenUsage ? (
                  <span>
                    {tokenUsage} tokens
                    {estimatedCostEUR ? ` · ≈ ${estimatedCostEUR.toFixed(4)} €` : ""}
                  </span>
                ) : null}
              </div>
              <pre className="max-h-48 overflow-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-cream/85">
                {streamingText || "…"}
              </pre>
            </div>
          )}

          {streamError ? (
            <p className="mt-3 rounded-sm bg-red-500/15 px-3 py-2 text-[11px] text-red-200">
              Génération interrompue : {streamError} · contenu mock affiché.
            </p>
          ) : null}
        </Card>

        <Card>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em]">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
              Étape 3 · Preview
            </h3>
            <div className="inline-flex rounded-sm border border-ink/15 bg-white p-0.5">
              {generation.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVariantId(v.id)}
                  className={cx(
                    "rounded-[3px] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] transition-colors",
                    variantId === v.id
                      ? "bg-ink text-cream"
                      : "text-ink/55 hover:text-ink",
                  )}
                >
                  Variante {v.id}
                </button>
              ))}
            </div>
          </div>

          {variant ? (
            <div className="grid gap-5 lg:grid-cols-[260px_1fr]">
              <ReelPreview variant={variant} platformLabel={platformMeta.label} />

              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55">
                    Titre
                  </p>
                  <p className="mt-1 text-b2 font-display uppercase">
                    Reel JPO · {formation} · variante {variant.id}
                  </p>
                </div>

                <div className="flex items-center gap-3 rounded-md border border-ink/10 bg-page p-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-[10px] bg-green text-ink">
                    <span className="text-[18px] font-bold">{variant.score}</span>
                  </div>
                  <div className="text-[11px] leading-tight">
                    <b>Brand Guardian</b>
                    <br />
                    <span className="text-ink/60">
                      validé · {variant.score}/100
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55">
                    Caption proposée
                  </p>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink">
                    {variant.caption}
                  </p>
                  <p className="mt-2 text-[12px] font-bold text-ink/75">
                    {variant.hashtags.join(" ")}
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55">
                    Métriques prédites
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge tone="sky">{variant.metrics.reach}</Badge>
                    <Badge tone="green">{variant.metrics.engagement}</Badge>
                    <Badge tone="purple">{variant.metrics.saves}</Badge>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button variant="primary" icon={<Icon name="check" size={14} />}>
                    Envoyer en production
                  </Button>
                  <Link
                    href={{
                      pathname: "/brand-guardian",
                      query: {
                        content: `${variant.hook}\n\n${variant.caption}\n\n${variant.hashtags.join(" ")}`,
                        autoAnalyze: "1",
                      },
                    }}
                    className="inline-flex items-center gap-2 rounded-sm border border-ink bg-purple px-3 py-2 text-[12px] font-bold text-ink transition-colors hover:bg-purple/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    aria-label="Vérifier la conformité brand de la variante"
                  >
                    <Icon name="shield" size={14} />
                    Vérifier la conformité
                  </Link>
                  <Button
                    variant="light"
                    icon={<Icon name="sparkle" size={14} />}
                    onClick={regenerate}
                    disabled={isPending}
                  >
                    {isPending ? "Raffinement…" : "Raffiner"}
                  </Button>
                  <Button
                    variant="ghost"
                    icon={<Icon name="bookmark" size={14} />}
                  >
                    Copier le texte
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </Card>
      </div>

      <div className="flex flex-col gap-4 xl:sticky xl:top-24 xl:self-start">
        <Card>
          <CardHeader title="Historique du brief" more="Tout voir" />
          <ul className="flex flex-col gap-2">
            {HISTORY_SEED.map((item) => (
              <li
                key={item.msg}
                className="rounded-sm bg-white px-2.5 py-2 text-[11px]"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink/45">
                  {item.when}
                </p>
                <p className="mt-1 text-[12px] leading-snug">{item.msg}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Décliner ce brief" />
          <ul className="flex flex-col gap-1.5">
            {DECLINATIONS.map((label) => (
              <li key={label}>
                <button
                  type="button"
                  className="flex w-full items-center justify-between rounded-sm bg-white px-3 py-2.5 text-left text-[12px] transition-colors hover:bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple"
                  aria-label={`Créer ${label}`}
                >
                  <span>{label}</span>
                  <Icon name="plus" size={14} />
                </button>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Actions rapides" />
          <div className="flex flex-col gap-2">
            <Button
              variant="dark"
              size="sm"
              icon={<Icon name="bookmark" size={14} />}
            >
              Sauver en template
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<Icon name="sparkle" size={14} />}
              onClick={regenerate}
              disabled={isPending}
            >
              {isPending ? "Régénération…" : "Régénérer"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink/60">
        {label}
      </span>
      {children}
    </label>
  );
}

type SelectChipProps = {
  leading: React.ReactNode;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel: string;
};

function SelectChip({
  leading,
  options,
  value,
  onChange,
  ariaLabel,
}: SelectChipProps) {
  return (
    <div className="relative flex cursor-pointer items-center justify-between gap-2 rounded-sm border border-ink/15 bg-white px-3 py-2 text-[13px] font-medium transition-colors hover:border-ink">
      <span className="min-w-0 truncate">{leading}</span>
      <Icon name="chevron-down" size={14} />
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}

function BackstageRow({ step }: { step: BackstageStep }) {
  return (
    <li className="flex items-center gap-3 text-[12px]">
      <span
        className={cx(
          "grid h-5 w-5 shrink-0 place-items-center rounded-full border text-[10px] font-bold",
          step.done
            ? "border-green bg-green text-ink"
            : "animate-pulse border-cream/50 bg-transparent text-cream",
        )}
      >
        {step.done ? "✓" : ""}
      </span>
      <span className="flex-1 leading-snug">{step.label}</span>
      <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.1em] text-cream/55">
        {step.meta}
      </span>
    </li>
  );
}

type ReelPreviewProps = {
  variant: GeneratorVariant;
  platformLabel: string;
};

function ReelPreview({ variant, platformLabel }: ReelPreviewProps) {
  return (
    <div className="mx-auto w-full max-w-[240px]">
      <div className="rounded-[22px] border-2 border-ink bg-ink p-1.5 shadow-hard-lg">
        <div
          className="relative flex flex-col justify-between overflow-hidden rounded-[16px] p-4"
          style={{
            aspectRatio: "9/16",
            backgroundImage: `linear-gradient(135deg, ${variant.color} 0%, ${variant.color2} 100%)`,
          }}
        >
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.1em] text-ink">
            <span>@fonderie.cfi</span>
            <span>•••</span>
          </div>
          <div className="flex flex-col items-start gap-2">
            <span className="inline-block rounded-sm bg-ink px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-cream">
              JPO · 17 MAI
            </span>
            <span className="text-[28px] font-display leading-[0.9] uppercase text-ink">
              {variant.hook}
            </span>
            <span className="max-w-[180px] text-[11px] font-bold leading-tight text-ink">
              {platformLabel} · BTS / Mastère DCDG
            </span>
          </div>
          <div className="flex items-center gap-2 rounded-md bg-ink/80 p-2 text-cream">
            <span className="grid h-6 w-6 place-items-center rounded-full bg-cream text-[10px] font-bold text-ink">
              F
            </span>
            <span className="text-[10px] leading-tight">
              <b>fonderie.cfi</b> · Portes ouvertes samedi.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
