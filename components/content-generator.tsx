"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

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
  buildGeneratedContent,
  type ContentType,
} from "@/lib/content-generator";

export function ContentGenerator() {
  const [contentType, setContentType] = useState<ContentType>("article blog");
  const [audience, setAudience] = useState("Parents et futurs étudiants");
  const [goal, setGoal] = useState(
    "Mettre en valeur l’approche projet et l’insertion professionnelle.",
  );
  const [tone, setTone] = useState("éditorial");
  const [angle, setAngle] = useState(GENERATOR_PROMPTS[0].angle);
  const [generated, setGenerated] = useState(() =>
    buildGeneratedContent({
      contentType: "article blog",
      audience: "Parents et futurs étudiants",
      goal: "Mettre en valeur l’approche projet et l’insertion professionnelle.",
      tone: "éditorial",
      angle: GENERATOR_PROMPTS[0].angle,
    }),
  );

  const seoEnabled = contentType === "article blog" || contentType === "page web";

  const promptIdeas = useMemo(
    () => GENERATOR_PROMPTS.filter((item) => item.contentType === contentType),
    [contentType],
  );

  function handleGenerate() {
    setGenerated(
      buildGeneratedContent({
        contentType,
        audience,
        goal,
        tone,
        angle,
      }),
    );
  }

  return (
    <div className="space-y-6">
      <SectionHeading
        eyebrow="Générateur éditorial"
        title="Produire un contenu CFI puis l’optimiser pour le référencement"
        description="Le studio compose une base éditoriale exploitable tout de suite et active le panneau SEO dès qu’il s’agit d’un article blog ou d’une page web."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_380px]">
        <Panel className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Tag tone="purple">CFI Content Studio</Tag>
            <Tag tone="sky">Phase 3</Tag>
            <Link
              href="/newsletter"
              className="inline-flex items-center gap-1.5 rounded-sm border border-ink/15 bg-white px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.05em] text-ink transition-colors hover:border-ink hover:bg-cream"
            >
              <Icon name="arrow" size={12} />
              Builder newsletter
            </Link>
          </div>

          <div className="grid gap-6 border-t border-ink/8 pt-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="space-y-4">
              <Select
                label="Type de contenu"
                value={contentType}
                onChange={(event) => {
                  const nextType = event.target.value as ContentType;
                  setContentType(nextType);
                  const nextPrompt =
                    GENERATOR_PROMPTS.find((item) => item.contentType === nextType) ??
                    GENERATOR_PROMPTS[0];
                  setAngle(nextPrompt.angle);
                }}
                options={CONTENT_TYPES.map((item) => ({ value: item, label: item }))}
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
              />
              <Input
                label="Ton"
                value={tone}
                onChange={(event) => setTone(event.target.value)}
              />

              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  variant="primary"
                  size="md"
                  icon={<Icon name="sparkle" size={12} />}
                  onClick={handleGenerate}
                >
                  Générer la proposition
                </Button>
                <Link
                  href="/newsletter"
                  className="inline-flex items-center gap-2 rounded-sm border border-ink/15 bg-cream px-3.5 py-2.5 text-[12px] font-bold uppercase tracking-[0.06em] text-ink transition-all duration-150 ease-brand hover:-translate-x-px hover:-translate-y-px hover:border-ink hover:bg-white"
                >
                  Ouvrir le builder
                </Link>
              </div>

              <div className="rounded-md border border-ink/10 bg-white p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55">
                  Prompts suggérés
                </p>
                <div className="mt-3 space-y-2">
                  {promptIdeas.map((prompt) => (
                    <button
                      key={prompt.title}
                      type="button"
                      className="block w-full rounded-sm border border-ink/10 bg-cream px-3 py-2.5 text-left transition-all duration-150 ease-brand hover:-translate-x-px hover:-translate-y-px hover:border-ink hover:bg-white"
                      onClick={() => setAngle(prompt.angle)}
                    >
                      <div className="text-[13px] font-bold uppercase tracking-[0.02em]">
                        {prompt.title}
                      </div>
                      <div className="mt-1 text-[12px] leading-relaxed text-ink/72">
                        {prompt.angle}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <article className="rounded-md border border-ink/8 bg-white p-5 md:p-6">
              <div className="flex items-start justify-between gap-3 border-b border-ink/8 pb-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55">
                    Proposition générée
                  </p>
                  <h2 className="mt-1 text-h2 font-display uppercase leading-[0.95]">
                    {generated.title}
                  </h2>
                </div>
                <Tag tone="outline">{generated.estimatedReadTime} min</Tag>
              </div>

              <p className="mt-5 rounded-sm border-l-4 border-purple bg-purple-soft/40 px-4 py-3 text-[13px] leading-relaxed text-ink">
                {generated.summary}
              </p>

              <div className="mt-5 space-y-3">
                {generated.sections.map((section) => (
                  <section
                    key={section.heading}
                    className="rounded-sm border border-ink/10 bg-cream p-4"
                  >
                    <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55">
                      {section.eyebrow}
                    </p>
                    <h3 className="mt-1 text-b2 font-display uppercase leading-tight">
                      {section.heading}
                    </h3>
                    <p className="mt-2 text-[13px] leading-relaxed text-ink/78">
                      {section.body}
                    </p>
                  </section>
                ))}
              </div>

              <div className="mt-5 rounded-sm border border-dashed border-ink/20 bg-cream/60 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink/55">
                  Call-to-action conseillé
                </p>
                <p className="mt-1 text-[13px] leading-relaxed text-ink/78">
                  {generated.callToAction}
                </p>
              </div>
            </article>
          </div>
        </Panel>

        <SeoAssistant
          visible={seoEnabled}
          contentType={contentType}
          title={generated.title}
          content={generated.sections
            .map((section) => `${section.heading}\n${section.body}`)
            .join("\n\n")}
        />
      </div>
    </div>
  );
}
