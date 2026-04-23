import { hasRequestyKey, requestyComplete } from "@/lib/requesty";

export type SeoSuggestion = {
  provider: string;
  keywords: string[];
  metaDescription: string;
  headings: {
    h1: string;
    h2: string[];
    h3: string[];
  };
  internalLinks: Array<{
    title: string;
    url: string;
    reason: string;
  }>;
  score: number;
  notes: string;
};

const INTERNAL_LINKS = [
  {
    title: "BTS Design graphique",
    url: "https://cfi.fr/formations/bts-design-graphique",
    reason: "À relier quand le contenu parle de direction artistique, identité visuelle ou portfolio.",
  },
  {
    title: "Bachelor UX et interfaces",
    url: "https://cfi.fr/formations/bachelor-ux-ui",
    reason: "Pertinent dès qu'il est question d'expérience utilisateur, prototypage ou design numérique.",
  },
  {
    title: "Admissions CFI",
    url: "https://cfi.fr/admissions",
    reason: "À intégrer pour convertir les lecteurs intéressés en demande d'information ou immersion.",
  },
];

export async function generateSeoSuggestions(input: {
  contentType: string;
  title: string;
  content: string;
}): Promise<SeoSuggestion> {
  if (!hasRequestyKey()) {
    return buildFallbackSeo(input, "Fallback local");
  }

  try {
    const prompt = [
      {
        role: "system" as const,
        content:
          "Tu es un stratège SEO pour une école de design française. Réponds uniquement en JSON avec les clés provider, keywords, metaDescription, headings, internalLinks, score, notes.",
      },
      {
        role: "user" as const,
        content: JSON.stringify({
          modelTarget: "deepseek/deepseek-chat",
          contentType: input.contentType,
          title: input.title,
          content: input.content,
          internalLinkTargets: INTERNAL_LINKS,
          expectedShape: {
            provider: "Requesty / deepseek/deepseek-chat",
            keywords: ["mot-clé 1", "mot-clé 2"],
            metaDescription: "155 caractères environ",
            headings: {
              h1: "Titre principal",
              h2: ["Sous-titre 1", "Sous-titre 2"],
              h3: ["Sous-sous-titre 1", "Sous-sous-titre 2"],
            },
            internalLinks: INTERNAL_LINKS,
            score: 72,
            notes: "court conseil prioritaire",
          },
        }),
      },
    ];

    const response = await requestyComplete(prompt, {
      model: "deepseek/deepseek-chat",
      temperature: 0.5,
      maxTokens: 900,
      responseFormat: "json_object",
    });

    return normalizeSeoSuggestion(parseJson(response.text));
  } catch {
    return buildFallbackSeo(input, "Fallback local");
  }
}

function normalizeSeoSuggestion(payload: unknown): SeoSuggestion {
  const raw = (payload ?? {}) as Partial<SeoSuggestion>;
  return {
    provider:
      typeof raw.provider === "string" && raw.provider.length > 0
        ? raw.provider
        : "Requesty / deepseek/deepseek-chat",
    keywords: Array.isArray(raw.keywords) ? raw.keywords.slice(0, 6).map(String) : [],
    metaDescription:
      typeof raw.metaDescription === "string"
        ? raw.metaDescription
        : "Découvrez une formation design CFI qui relie pédagogie projet, immersion métier et accompagnement admissions.",
    headings: {
      h1:
        typeof raw.headings?.h1 === "string"
          ? raw.headings.h1
          : "Choisir une formation design CFI tournée vers les métiers",
      h2: Array.isArray(raw.headings?.h2)
        ? raw.headings.h2.slice(0, 4).map(String)
        : ["Une pédagogie studio qui prépare au terrain", "Des débouchés design clairement identifiés"],
      h3: Array.isArray(raw.headings?.h3)
        ? raw.headings.h3.slice(0, 4).map(String)
        : ["Rencontres métiers", "Projets concrets", "Portfolio", "Admissions"],
    },
    internalLinks: Array.isArray(raw.internalLinks)
      ? raw.internalLinks.slice(0, 3).map((link) => ({
          title: String(link.title ?? ""),
          url: String(link.url ?? ""),
          reason: String(link.reason ?? ""),
        }))
      : INTERNAL_LINKS,
    score: clampScore(raw.score),
    notes:
      typeof raw.notes === "string"
        ? raw.notes
        : "Ajoutez un champ lexical design plus précis et placez un lien admissions dès le premier tiers du contenu.",
  };
}

function clampScore(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 74;
  }
  return Math.max(35, Math.min(96, Math.round(value)));
}

function parseJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```$/i, "");
  return JSON.parse(cleaned);
}

function buildFallbackSeo(
  input: { contentType: string; title: string; content: string },
  provider: string,
): SeoSuggestion {
  const text = `${input.title} ${input.content}`.toLowerCase();
  const keywords = [
    "école de design",
    "formation design",
    "pédagogie projet",
    text.includes("alternance") ? "alternance design" : "portfolio design",
    text.includes("admission") ? "admissions design" : "métiers du design",
  ];

  const wordCount = input.content.split(/\s+/).filter(Boolean).length;
  const score =
    58 +
    (text.includes("design") ? 8 : 0) +
    (text.includes("cfi") ? 6 : 0) +
    (wordCount > 120 ? 8 : 0) +
    (input.title.length > 40 ? 4 : 0);

  return {
    provider,
    keywords,
    metaDescription:
      "Découvrez comment CFI relie pédagogie projet, immersion métier et débouchés concrets pour construire un parcours design crédible et inspirant.",
    headings: {
      h1: input.title,
      h2: [
        "Pourquoi la pédagogie projet compte dans une école de design",
        "Quels débouchés après une formation CFI",
        "Comment préparer son admission ou son orientation",
      ],
      h3: [
        "Workshops et briefs réels",
        "Portfolio et accompagnement",
        "Rencontres avec les professionnels",
      ],
    },
    internalLinks: INTERNAL_LINKS,
    score: clampScore(score),
    notes:
      input.contentType === "page web"
        ? "Conservez un H1 unique, ajoutez un bloc débouchés visible et rapprochez le lien admissions du haut de page."
        : "Renforcez le champ lexical autour du design, glissez deux liens formations CFI et gardez la meta description sous 160 caractères.",
  };
}
