"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SeoAssistant } from "@/components/seo-assistant";
import {
  CONTENT_TYPES,
  GENERATOR_PROMPTS,
  buildGeneratedContent,
  type ContentType,
} from "@/lib/content-generator";

export function ContentGenerator() {
  const [contentType, setContentType] = useState<ContentType>("article blog");
  const [audience, setAudience] = useState("Parents et futurs étudiants");
  const [goal, setGoal] = useState("Mettre en valeur l’approche projet et l’insertion professionnelle.");
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
    <main className="shell px-5 py-5 md:px-8 md:py-8">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_380px]">
        <section className="panel overflow-hidden p-6 md:p-8">
          <div className="flex flex-col gap-5 border-b border-black/8 pb-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="pill">CFI Content Studio</span>
              <span className="pill">Phase 3</span>
              <Link href="/newsletter" className="pill">
                Ouvrir le builder newsletter
              </Link>
            </div>
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
              <div>
                <p className="eyebrow mb-3">Générateur éditorial</p>
                <h1 className="font-heading text-4xl leading-tight md:text-6xl">
                  Produire un contenu CFI puis l’optimiser pour le référencement.
                </h1>
              </div>
              <p className="text-sm leading-7 text-slate-700">
                Le studio compose une base éditoriale exploitable tout de suite et active
                le panneau SEO dès qu’il s’agit d’un article blog ou d’une page web.
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Type de contenu</span>
                <select
                  className="field"
                  value={contentType}
                  onChange={(event) => {
                    const nextType = event.target.value as ContentType;
                    setContentType(nextType);
                    const nextPrompt =
                      GENERATOR_PROMPTS.find((item) => item.contentType === nextType) ??
                      GENERATOR_PROMPTS[0];
                    setAngle(nextPrompt.angle);
                  }}
                >
                  {CONTENT_TYPES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Audience</span>
                <input
                  className="field"
                  value={audience}
                  onChange={(event) => setAudience(event.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Objectif</span>
                <textarea
                  className="field min-h-28"
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Angle éditorial</span>
                <textarea
                  className="field min-h-28"
                  value={angle}
                  onChange={(event) => setAngle(event.target.value)}
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-medium">Ton</span>
                <input
                  className="field"
                  value={tone}
                  onChange={(event) => setTone(event.target.value)}
                />
              </label>
              <div className="flex flex-wrap gap-3 pt-2">
                <button type="button" className="button-primary" onClick={handleGenerate}>
                  Générer la proposition
                </button>
                <Link href="/newsletter" className="button-secondary">
                  Ouvrir le builder
                </Link>
              </div>
              <div className="rounded-[22px] border border-black/8 bg-white/70 p-4">
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
                      <div className="mt-1 text-sm leading-6 text-slate-700">{prompt.angle}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <article className="preview-paper p-6 md:p-8">
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <p className="eyebrow mb-2">Proposition générée</p>
                  <h2 className="font-heading text-3xl leading-tight">{generated.title}</h2>
                </div>
                <span className="pill">{generated.estimatedReadTime} min</span>
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
                <p className="mt-2 text-sm leading-7 text-slate-700">{generated.callToAction}</p>
              </div>
            </article>
          </div>
        </section>

        <SeoAssistant
          visible={seoEnabled}
          contentType={contentType}
          title={generated.title}
          content={generated.sections.map((section) => `${section.heading}\n${section.body}`).join("\n\n")}
        />
      </div>
    </main>
  );
}
