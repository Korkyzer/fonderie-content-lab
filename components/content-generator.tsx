"use client";

import { startTransition, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SeoAssistant } from "@/components/seo-assistant";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Panel } from "@/components/ui/panel";
import { SectionHeading } from "@/components/ui/section-heading";
import { Select } from "@/components/ui/select";
import { Tag } from "@/components/ui/tag";
import { Textarea } from "@/components/ui/textarea";
import {
  CONTENT_TYPES,
  GENERATOR_PROMPTS,
  buildFallbackGeneratedContent,
  type ContentGenerationInput,
  type ContentType,
  type GeneratedContentResult,
} from "@/lib/content-generator";

type ContentGeneratorProps = {
  initialInput: ContentGenerationInput;
  initialAutoRun?: boolean;
};

const CONTENT_TYPE_OPTIONS = CONTENT_TYPES.map((item) => ({
  value: item,
  label: item,
}));

export function ContentGenerator({
  initialInput,
  initialAutoRun = false,
}: ContentGeneratorProps) {
  const [contentType, setContentType] = useState<ContentType>(initialInput.contentType);
  const [audience, setAudience] = useState(initialInput.audience);
  const [goal, setGoal] = useState(initialInput.goal);
  const [tone, setTone] = useState(initialInput.tone);
  const [angle, setAngle] = useState(initialInput.angle);
  const [generated, setGenerated] = useState<GeneratedContentResult>(() =>
    buildFallbackGeneratedContent(
      initialInput,
      initialAutoRun ? "Pré-remplissage local" : "Fallback local",
    ),
  );
  const [generationState, setGenerationState] = useState<"idle" | "loading" | "error">("idle");
  const [generationError, setGenerationError] = useState<string | null>(null);

  const hasAutoRunRef = useRef(false);
  const seoEnabled = contentType === "article blog" || contentType === "page web";

  const promptIdeas = useMemo(
    () => GENERATOR_PROMPTS.filter((item) => item.contentType === contentType),
    [contentType],
  );

  const runGeneration = useCallback(async () => {
    const requestBody: ContentGenerationInput = {
      contentType,
      audience,
      goal,
      tone,
      angle,
    };

    try {
      setGenerationState("loading");
      setGenerationError(null);

      const response = await fetch("/api/generator", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const json = (await response.json()) as
        | { generated: GeneratedContentResult }
        | { error?: string };

      if (!response.ok || !("generated" in json)) {
        throw new Error("error" in json ? json.error : "Génération indisponible");
      }

      startTransition(() => {
        setGenerated(json.generated);
        setGenerationState("idle");
      });
    } catch (issue) {
      startTransition(() => {
        setGenerated(buildFallbackGeneratedContent(requestBody));
      });
      setGenerationState("error");
      setGenerationError(issue instanceof Error ? issue.message : "Génération indisponible");
    }
  }, [angle, audience, contentType, goal, tone]);

  useEffect(() => {
    if (!initialAutoRun || hasAutoRunRef.current) {
      return;
    }

    hasAutoRunRef.current = true;
    void runGeneration();
  }, [initialAutoRun, runGeneration]);

  function handleContentTypeChange(nextType: ContentType) {
    setContentType(nextType);
    const nextPrompt =
      GENERATOR_PROMPTS.find((item) => item.contentType === nextType) ?? GENERATOR_PROMPTS[0];
    setAngle(nextPrompt.angle);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_380px]">
      <section className="space-y-6">
        <SectionHeading
          eyebrow="Générateur éditorial"
          title="Produire un contenu CFI puis le faire circuler dans le studio"
          description="Les briefs injectés depuis community ou inspiration arrivent directement ici. La génération passe par la même couche Requesty que le SEO, avec un fallback local explicite si la clé ou le provider sont indisponibles."
        />

        <Panel className="overflow-hidden p-6 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Tag tone="caramel">CFI Content Studio</Tag>
                <Tag tone={generated.fallback ? "outline" : "sky"}>{generated.provider}</Tag>
                <Tag tone="purple">{seoEnabled ? "SEO actif" : "SEO en veille"}</Tag>
              </div>

              <Select
                label="Type de contenu"
                value={contentType}
                onChange={(event) =>
                  handleContentTypeChange(event.target.value as ContentType)
                }
                options={CONTENT_TYPE_OPTIONS}
              />
              <Input
                label="Audience"
                value={audience}
                onChange={(event) => setAudience(event.target.value)}
              />
              <Textarea
                label="Objectif"
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
              />
              <Textarea
                label="Angle éditorial"
                value={angle}
                onChange={(event) => setAngle(event.target.value)}
                hint="Les écrans community et inspiration alimentent ce champ automatiquement via la route /generator."
              />
              <Input
                label="Ton"
                value={tone}
                onChange={(event) => setTone(event.target.value)}
              />

              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  onClick={() => void runGeneration()}
                  disabled={generationState === "loading"}
                  icon={<Icon name="sparkle" size={12} />}
                >
                  {generationState === "loading" ? "Génération..." : "Générer la proposition"}
                </Button>
                <span className="pill">
                  {generationError
                    ? generationError
                    : "Le résultat reste exploitable même sans provider distant."}
                </span>
              </div>

              <div className="rounded-[22px] border border-black/8 bg-white/72 p-4">
                <p className="mb-3 text-sm font-semibold">Prompts suggérés</p>
                <div className="space-y-3">
                  {promptIdeas.map((prompt) => (
                    <button
                      key={prompt.title}
                      type="button"
                      className="w-full rounded-2xl border border-black/8 bg-slate-950/2 px-4 py-3 text-left transition hover:-translate-y-0.5 hover:bg-slate-950/4"
                      onClick={() => setAngle(prompt.angle)}
                    >
                      <div className="text-sm font-semibold">{prompt.title}</div>
                      <div className="mt-1 text-sm leading-6 text-slate-700">
                        {prompt.angle}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <article className="preview-paper p-6 md:p-8">
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-[34rem]">
                  <p className="eyebrow mb-2">Proposition générée</p>
                  <h2 className="font-heading text-3xl leading-tight">{generated.title}</h2>
                </div>
                <Tag tone="outline">{generated.estimatedReadTime} min</Tag>
              </div>

              <p className="rounded-[22px] bg-[rgba(13,106,109,0.08)] px-4 py-4 text-sm leading-7 text-slate-700">
                {generated.summary}
              </p>

              <div className="mt-6 space-y-4">
                {generated.sections.map((section) => (
                  <section key={section.heading} className="newsletter-card p-5">
                    <p className="eyebrow mb-2">{section.eyebrow}</p>
                    <h3 className="font-heading text-2xl">{section.heading}</h3>
                    <p className="mt-3 text-[15px] leading-7 text-slate-700">{section.body}</p>
                  </section>
                ))}
              </div>

              <div className="mt-6 rounded-[22px] border border-dashed border-[rgba(17,32,49,0.14)] p-5">
                <p className="text-sm font-semibold">Call-to-action conseillé</p>
                <p className="mt-2 text-sm leading-7 text-slate-700">
                  {generated.callToAction}
                </p>
              </div>
            </article>
          </div>
        </Panel>
      </section>

      <SeoAssistant
        visible={seoEnabled}
        contentType={contentType}
        title={generated.title}
        content={generated.sections
          .map((section) => `${section.heading}\n${section.body}`)
          .join("\n\n")}
      />
    </div>
  );
}
