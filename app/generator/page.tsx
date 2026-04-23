import { ScreenFrame } from "@/components/screens/screen-frame";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Panel } from "@/components/ui/panel";
import { Tag } from "@/components/ui/tag";
import { db } from "@/db/index";
import { personas as personasTable } from "@/db/schema";
import { getPromptBySlug } from "@/lib/data/prompts";
import { fallbackPersonas } from "@/lib/fallback-data";
import {
  createGenerateResponse,
  type GenerateResponse,
} from "@/lib/generator-mock";

import { GeneratorClient } from "./generator-client";

type GeneratorPageProps = {
  searchParams: Promise<{
    prompt?: string;
    title?: string;
    body?: string;
    platform?: string;
    audience?: string;
  }>;
};

export default async function GeneratorPage({
  searchParams,
}: GeneratorPageProps) {
  const params = await searchParams;
  const selectedPrompt = params.prompt ? getPromptBySlug(params.prompt) : undefined;
  const promptTitle = selectedPrompt?.title ?? params.title;
  const promptBody = selectedPrompt?.body ?? params.body;
  const promptPlatform = selectedPrompt?.platform ?? params.platform;
  const promptAudience = selectedPrompt?.audience ?? params.audience;
  const initialGeneration: GenerateResponse = createGenerateResponse();

  const personaOptions = (() => {
    try {
      const personasRows = db.select({ name: personasTable.name }).from(personasTable).all();
      if (personasRows.length === 0) return fallbackPersonas;

      return personasRows.map((persona) => ({
        name: persona.name,
        tone:
          fallbackPersonas.find((fallback) => fallback.name === persona.name)?.tone ??
          "purple",
      }));
    } catch {
      return fallbackPersonas;
    }
  })();

  return (
    <div className="flex flex-col gap-6">
      <ScreenFrame
        eyebrow="Générateur IA"
        title={promptTitle ? `Créer un contenu · ${promptTitle}` : "Créer un contenu"}
        description={
          promptTitle
            ? "Le template sélectionné est injecté dans le générateur pour lancer une première version sans ressaisie."
            : "Briefing, variantes et assets prêts pour les campagnes JPO, Parcoursup et showcase étudiants."
        }
        highlights={[
          { label: promptAudience ?? "Lycéens 16-20", tone: "yellow" as const },
          { label: promptPlatform ?? "Instagram Reel", tone: "sky" as const },
          {
            label: selectedPrompt ? "Prompt préchargé" : "Motion Design",
            tone: "purple" as const,
          },
        ]}
      />

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="light" icon={<Icon name="bookmark" size={14} />}>
          Sauver en template
        </Button>
        <Button variant="primary" icon={<Icon name="sparkle" size={14} />}>
          Régénérer
        </Button>
        <span className="mx-2 h-4 w-px bg-ink/15" />
        <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/55">
          3 étapes · brief · backstage · preview
        </span>
      </div>

      {promptTitle && promptBody ? (
        <Panel className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink/55">
                Prompt sélectionné
              </p>
              <h2 className="mt-1 text-h2 font-display uppercase tracking-[0.01em]">
                {promptTitle}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {promptAudience ? <Tag tone="sky">{promptAudience}</Tag> : null}
              {promptPlatform ? <Tag tone="outline">{promptPlatform}</Tag> : null}
            </div>
          </div>
          <pre className="whitespace-pre-wrap break-words rounded-sm bg-page p-4 font-mono text-[13px] leading-relaxed text-ink/82">
            {promptBody}
          </pre>
        </Panel>
      ) : null}

      <GeneratorClient
        personas={personaOptions}
        initial={initialGeneration}
        initialBrief={promptBody}
        initialPersona={promptAudience}
        initialPlatform={promptPlatform}
      />
    </div>
  );
}
