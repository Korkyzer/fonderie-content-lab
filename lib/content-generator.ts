import { hasRequestyKey, requestyComplete } from "@/lib/requesty";

export const CONTENT_TYPES = [
  "article blog",
  "page web",
  "post social",
  "email de recrutement",
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

export type ContentGenerationInput = {
  contentType: ContentType;
  audience: string;
  goal: string;
  tone: string;
  angle: string;
};

export type GeneratedSection = {
  eyebrow: string;
  heading: string;
  body: string;
};

export type GeneratedContent = {
  title: string;
  summary: string;
  callToAction: string;
  estimatedReadTime: number;
  sections: GeneratedSection[];
};

export type GeneratedContentResult = GeneratedContent & {
  provider: string;
  fallback: boolean;
};

export const DEFAULT_GENERATOR_INPUT: ContentGenerationInput = {
  contentType: "article blog",
  audience: "Parents et futurs étudiants",
  goal: "Mettre en valeur l’approche projet et l’insertion professionnelle.",
  tone: "éditorial",
  angle:
    "Montrer comment les admissions CFI transforment une vocation créative hésitante en projet d'études concret.",
};

export const GENERATOR_PROMPTS: Array<{
  title: string;
  contentType: ContentType;
  angle: string;
}> = [
  {
    title: "Carnet admissions",
    contentType: "article blog",
    angle:
      "Montrer comment les admissions CFI transforment une vocation créative hésitante en projet d'études concret.",
  },
  {
    title: "Page immersion campus",
    contentType: "page web",
    angle:
      "Structurer une page qui fait ressentir la pédagogie studio, les workshops et la proximité avec les métiers du design.",
  },
  {
    title: "Série alumni",
    contentType: "post social",
    angle:
      "Extraire une citation forte d'un alumni, puis relier son parcours à la culture projet de l'école.",
  },
  {
    title: "Relance entreprises",
    contentType: "email de recrutement",
    angle:
      "Présenter l'intérêt pour une entreprise de collaborer avec des profils CFI formés au réel, en alternance ou en stage.",
  },
];

export function buildGeneratedContent(input: ContentGenerationInput): GeneratedContent {
  const titleMap: Record<ContentType, string> = {
    "article blog":
      "Pourquoi une école de design orientée projet change la trajectoire d’un étudiant",
    "page web": "Étudier le design à CFI avec une pédagogie ancrée dans les métiers",
    "post social": "Une trajectoire alumni qui raconte la force d’un apprentissage concret",
    "email de recrutement":
      "Inviter une entreprise à co-construire les talents créatifs de demain",
  };

  const summary = `Pensé pour ${input.audience.toLowerCase()}, ce contenu adopte un ton ${input.tone} et poursuit un objectif clair: ${input.goal}`;

  const commonSections: GeneratedSection[] = [
    {
      eyebrow: "Point d'entrée",
      heading: "Une promesse éditoriale ancrée dans le réel",
      body: `L'angle retenu met en avant ${input.angle.toLowerCase()}. Le récit commence par une situation concrète, puis traduit la valeur de CFI en bénéfices lisibles pour ${input.audience.toLowerCase()}.`,
    },
    {
      eyebrow: "Preuve",
      heading: "Des formats pédagogiques qui rendent le discours crédible",
      body: "Workshops, projets en équipe, rencontres métiers et retours d'expérience alumni créent une matière éditoriale dense. Cette preuve narrative évite le discours institutionnel et alimente un contenu utile.",
    },
    {
      eyebrow: "Conversion",
      heading: "Conclure avec une action simple et cohérente",
      body: "Le contenu se termine par une invitation franche: demander une documentation, réserver une immersion, ou entrer en contact avec l'équipe. Le CTA reste précis, situé et directement activable.",
    },
  ];

  return {
    title: titleMap[input.contentType],
    summary,
    callToAction:
      "Proposer en fin de contenu un bouton unique vers la prise de contact, la brochure formations ou la page admissions.",
    estimatedReadTime: input.contentType === "post social" ? 1 : 4,
    sections: commonSections,
  };
}

export function buildFallbackGeneratedContent(
  input: ContentGenerationInput,
  provider = "Fallback local",
): GeneratedContentResult {
  return {
    ...buildGeneratedContent(input),
    provider,
    fallback: true,
  };
}

export async function generateContent(
  input: ContentGenerationInput,
): Promise<GeneratedContentResult> {
  if (!hasRequestyKey()) {
    return buildFallbackGeneratedContent(input);
  }

  try {
    const prompt = [
      {
        role: "system" as const,
        content:
          "Tu es un stratège éditorial pour une école de design française. Réponds uniquement en JSON avec les clés provider, title, summary, callToAction, estimatedReadTime et sections. Chaque section contient eyebrow, heading et body.",
      },
      {
        role: "user" as const,
        content: JSON.stringify({
          modelTarget: "deepseek/deepseek-chat",
          school: "CFI",
          audience: input.audience,
          contentType: input.contentType,
          goal: input.goal,
          tone: input.tone,
          angle: input.angle,
          expectedShape: {
            provider: "Requesty / deepseek/deepseek-chat",
            title: "Titre principal",
            summary: "Résumé synthétique",
            callToAction: "CTA recommandé",
            estimatedReadTime: 4,
            sections: [
              {
                eyebrow: "Angle",
                heading: "Titre de section",
                body: "Paragraphe exploitable.",
              },
            ],
          },
        }),
      },
    ];

    const response = await requestyComplete(prompt, {
      model: "deepseek/deepseek-chat",
      temperature: 0.55,
      maxTokens: 1100,
      responseFormat: "json_object",
    });

    return normalizeGeneratedContent(parseJson(response.text), input);
  } catch {
    return buildFallbackGeneratedContent(input);
  }
}

function normalizeGeneratedContent(
  payload: unknown,
  input: ContentGenerationInput,
): GeneratedContentResult {
  const fallback = buildGeneratedContent(input);
  const raw = (payload ?? {}) as {
    provider?: unknown;
    title?: unknown;
    summary?: unknown;
    callToAction?: unknown;
    estimatedReadTime?: unknown;
    sections?: unknown;
  };

  const normalizedSections = Array.isArray(raw.sections)
    ? raw.sections
        .slice(0, 4)
        .map((section) => normalizeSection(section))
        .filter((section): section is GeneratedSection => section !== null)
    : [];

  return {
    title: readText(raw.title) ?? fallback.title,
    summary: readText(raw.summary) ?? fallback.summary,
    callToAction: readText(raw.callToAction) ?? fallback.callToAction,
    estimatedReadTime: clampReadTime(raw.estimatedReadTime, fallback.estimatedReadTime),
    sections: normalizedSections.length > 0 ? normalizedSections : fallback.sections,
    provider: readText(raw.provider) ?? "Requesty / deepseek/deepseek-chat",
    fallback: false,
  };
}

function normalizeSection(value: unknown): GeneratedSection | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const raw = value as {
    eyebrow?: unknown;
    heading?: unknown;
    body?: unknown;
  };
  const eyebrow = readText(raw.eyebrow);
  const heading = readText(raw.heading);
  const body = readText(raw.body);

  if (!eyebrow || !heading || !body) {
    return null;
  }

  return {
    eyebrow,
    heading,
    body,
  };
}

function clampReadTime(value: unknown, fallback: number): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return fallback;
  }

  return Math.max(1, Math.min(8, Math.round(value)));
}

function parseJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "");
  return JSON.parse(cleaned);
}

function readText(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}
