export const CONTENT_TYPES = [
  "article blog",
  "page web",
  "post social",
  "email de recrutement",
] as const;

export type ContentType = (typeof CONTENT_TYPES)[number];

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

export function buildGeneratedContent(input: {
  contentType: ContentType;
  audience: string;
  goal: string;
  tone: string;
  angle: string;
}): GeneratedContent {
  const titleMap: Record<ContentType, string> = {
    "article blog": "Pourquoi une école de design orientée projet change la trajectoire d’un étudiant",
    "page web": "Étudier le design à CFI avec une pédagogie ancrée dans les métiers",
    "post social": "Une trajectoire alumni qui raconte la force d’un apprentissage concret",
    "email de recrutement": "Inviter une entreprise à co-construire les talents créatifs de demain",
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
