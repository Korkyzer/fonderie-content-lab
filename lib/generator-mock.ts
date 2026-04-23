// TODO(real-provider): replace this deterministic mock builder with the real generation adapter when the backend is wired.

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

export type GeneratorAssetTone = "purple" | "orange" | "ink" | "sky";

export type GeneratorAsset = {
  label: string;
  size: string;
  tone: GeneratorAssetTone;
};

export type GenerateResponse = {
  variants: GeneratorVariant[];
  backstage: BackstageStep[];
  assets: GeneratorAsset[];
  generatedAt: string;
  briefEcho: string;
};

const DEFAULT_REQUEST: GenerateRequest = {
  brief:
    "Un Reel Instagram pour promouvoir notre JPO de mai avec des extraits de travaux étudiants en motion design",
  persona: "Lycéens 16-20",
  platform: "Instagram Reel",
  visualStyle: "Dynamique & créatif",
  tone: "Inspirant & accessible",
  formation: "Motion Design",
  duration: "30s",
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

export const GENERATOR_ASSETS: GeneratorAsset[] = [
  { label: "rushs_motion_DCDG_mars26.mp4", size: "1,2 Go", tone: "purple" },
  { label: "atelier_sérigraphie_04.jpg", size: "8 Mo", tone: "orange" },
  { label: "logo_cfi_animé.aep", size: "14 Mo", tone: "ink" },
  { label: "showreel_etudiants_2025.mp4", size: "840 Mo", tone: "sky" },
];

function trimOrFallback(value: string | undefined, fallback: string) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : fallback;
}

export function normalizeGenerateRequest(
  input: Partial<GenerateRequest> = {},
): GenerateRequest {
  return {
    brief: trimOrFallback(input.brief, DEFAULT_REQUEST.brief),
    persona: trimOrFallback(input.persona, DEFAULT_REQUEST.persona),
    platform: trimOrFallback(input.platform, DEFAULT_REQUEST.platform),
    visualStyle: trimOrFallback(input.visualStyle, DEFAULT_REQUEST.visualStyle),
    tone: trimOrFallback(input.tone, DEFAULT_REQUEST.tone),
    formation: trimOrFallback(input.formation, DEFAULT_REQUEST.formation),
    duration: trimOrFallback(input.duration, DEFAULT_REQUEST.duration),
  };
}

function buildBackstage(request: GenerateRequest): BackstageStep[] {
  return [
    {
      label: `Analyse du brief · intent JPO + persona ${request.persona}`,
      meta: "0.2s",
      done: true,
    },
    {
      label: `Sélection des assets ${request.formation} adaptés au format ${request.platform}`,
      meta: "0.8s",
      done: true,
    },
    {
      label: `Application de la charte CFI · ${request.visualStyle} · ${request.tone}`,
      meta: "0.4s",
      done: true,
    },
    {
      label: `Déclinaison ${request.duration} sur 3 variantes prêtes à valider`,
      meta: "en cours…",
      done: false,
    },
  ];
}

function buildCaption(base: GeneratorVariant, request: GenerateRequest) {
  return `${base.caption} Format ${request.platform} · ${request.formation} · ${request.persona}.`;
}

export function createGenerateResponse(
  input: Partial<GenerateRequest> = {},
): GenerateResponse {
  const request = normalizeGenerateRequest(input);

  return {
    variants: BASE_VARIANTS.map((variant, index) => ({
      ...variant,
      caption: buildCaption(variant, request),
      score: Math.max(80, variant.score - index),
    })),
    backstage: buildBackstage(request),
    assets: GENERATOR_ASSETS,
    generatedAt: new Date().toISOString(),
    briefEcho: request.brief,
  };
}
