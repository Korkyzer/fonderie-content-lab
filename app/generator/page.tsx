import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { db } from "@/db/index";
import { personas as personasTable } from "@/db/schema";
import { fallbackPersonas } from "@/lib/fallback-data";
import {
  createGenerateResponse,
  type GenerateResponse,
} from "@/lib/generator-mock";

import { GeneratorClient } from "./generator-client";

export default function GeneratorPage() {
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
      <SectionHeading
        eyebrow="Générateur IA"
        title="Créer un contenu"
        description="Briefing, variantes et assets prêts pour les campagnes JPO, Parcoursup et showcase étudiants."
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

      <GeneratorClient personas={personaOptions} initial={initialGeneration} />
    </div>
  );
}
