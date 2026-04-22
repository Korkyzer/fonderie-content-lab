import type { GenerateResponse, GeneratorVariant } from "@/app/api/generate/route";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { SectionHeading } from "@/components/ui/section-heading";
import { db } from "@/db/index";
import { personas as personasTable } from "@/db/schema";

import { GeneratorClient } from "./generator-client";

const PERSONA_TONES: Record<string, string> = {
  "Lycéens 16-20": "yellow",
  Parents: "sky",
  "Entreprises partenaires": "caramel",
  Alumni: "pink",
};

const SEED_VARIANTS: GeneratorVariant[] = [
  {
    id: "A",
    hook: "Viens créer.",
    caption:
      "3 jours. 800 étudiants. Un campus qui bouillonne. RDV le 17 mai pour notre JPO. Tes travaux, ton futur, chez nous.",
    score: 96,
    color: "var(--purple)",
    color2: "var(--sky)",
    hashtags: ["#FonderieDeLImage", "#JPO2026", "#MotionDesign", "#EcoleCreative", "#Bagnolet"],
    metrics: { reach: "Reach 24-32k", engagement: "Engagement 7,4%", saves: "Saves 180+" },
  },
  {
    id: "B",
    hook: "Motion. Émotion.",
    caption:
      "Nos étudiant·es DCDG ont animé ton été. Viens voir comment. Journée Portes Ouvertes · Samedi 17 mai · 10h-18h.",
    score: 92,
    color: "var(--yellow)",
    color2: "var(--orange)",
    hashtags: ["#FonderieDeLImage", "#JPO2026", "#MotionDesign", "#DCDG", "#Campus"],
    metrics: { reach: "Reach 18-26k", engagement: "Engagement 6,8%", saves: "Saves 140+" },
  },
  {
    id: "C",
    hook: "24 frames / sec d'avenir.",
    caption:
      "Découvre la Fonderie IRL. Ateliers, showcases étudiants, rencontres profs. JPO · 17 mai · métro Gallieni.",
    score: 89,
    color: "var(--green)",
    color2: "var(--turquoise)",
    hashtags: ["#FonderieDeLImage", "#JPO2026", "#Animation", "#Bagnolet", "#PortesOuvertes"],
    metrics: { reach: "Reach 14-22k", engagement: "Engagement 6,1%", saves: "Saves 110+" },
  },
];

const SEED_GENERATION: GenerateResponse = {
  variants: SEED_VARIANTS,
  backstage: [
    { label: "Analyse du brief · identification intent JPO + persona Lycéens", meta: "0.2s", done: true },
    { label: "Récupération des assets CFI pertinents (4 fichiers)", meta: "0.8s", done: true },
    { label: "Application de la charte graphique (police SVHFlib, palette)", meta: "0.4s", done: true },
    { label: "Génération des variantes A / B / C + légendes", meta: "en cours…", done: false },
  ],
  assets: [
    { label: "rushs_motion_DCDG_mars26.mp4", size: "1,2 Go", tone: "purple" },
    { label: "atelier_sérigraphie_04.jpg", size: "8 Mo", tone: "orange" },
    { label: "logo_cfi_animé.aep", size: "14 Mo", tone: "ink" },
    { label: "showreel_etudiants_2025.mp4", size: "840 Mo", tone: "sky" },
  ],
  generatedAt: new Date(0).toISOString(),
  briefEcho: "",
};

export default function GeneratorPage() {
  const personasRows = db.select().from(personasTable).all();
  const personaOptions = personasRows.map((p) => ({
    name: p.name,
    tone: PERSONA_TONES[p.name] ?? "purple",
  }));

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

      <GeneratorClient personas={personaOptions} initial={SEED_GENERATION} />
    </div>
  );
}
