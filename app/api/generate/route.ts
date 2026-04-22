import { NextResponse } from "next/server";

export type GenerateRequest = {
  brief: string;
  persona: string;
  platform: string;
  visualStyle: string;
  tone: string;
  formation: string;
  duration: string;
};

export type GeneratorVariant = {
  id: "A" | "B" | "C";
  hook: string;
  caption: string;
  score: number;
  color: string;
  color2: string;
  hashtags: string[];
  metrics: { reach: string; engagement: string; saves: string };
};

export type BackstageStep = {
  label: string;
  meta: string;
  done: boolean;
};

export type GenerateResponse = {
  variants: GeneratorVariant[];
  backstage: BackstageStep[];
  assets: Array<{ label: string; size: string; tone: string }>;
  generatedAt: string;
  briefEcho: string;
};

const BASE_VARIANTS: GeneratorVariant[] = [
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

const ASSETS = [
  { label: "rushs_motion_DCDG_mars26.mp4", size: "1,2 Go", tone: "purple" },
  { label: "atelier_sérigraphie_04.jpg", size: "8 Mo", tone: "orange" },
  { label: "logo_cfi_animé.aep", size: "14 Mo", tone: "ink" },
  { label: "showreel_etudiants_2025.mp4", size: "840 Mo", tone: "sky" },
];

function buildBackstage(): BackstageStep[] {
  return [
    {
      label: "Analyse du brief · identification intent JPO + persona Lycéens",
      meta: "0.2s",
      done: true,
    },
    {
      label: "Récupération des assets CFI pertinents (4 fichiers)",
      meta: "0.8s",
      done: true,
    },
    {
      label: "Application de la charte graphique (police SVHFlib, palette)",
      meta: "0.4s",
      done: true,
    },
    {
      label: "Génération des variantes A / B / C + légendes",
      meta: "en cours…",
      done: false,
    },
  ];
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Partial<GenerateRequest>;

  const brief = body.brief?.trim() ?? "";

  const payload: GenerateResponse = {
    variants: BASE_VARIANTS,
    backstage: buildBackstage(),
    assets: ASSETS,
    generatedAt: new Date().toISOString(),
    briefEcho: brief,
  };

  return NextResponse.json(payload);
}
