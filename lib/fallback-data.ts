import type { BadgeTone } from "@/components/ui/badge";

export type FallbackPersona = {
  name: string;
  tone: BadgeTone;
};

export type FallbackBrandRule = {
  id: number;
  category: string;
  name: string;
  description: string;
  severity: "high" | "medium" | "low";
  expectedValue: string;
};

export const fallbackPersonas: FallbackPersona[] = [
  { name: "Lycéens 16-20", tone: "yellow" },
  { name: "Parents", tone: "sky" },
  { name: "Entreprises partenaires", tone: "caramel" },
  { name: "Alumni", tone: "pink" },
];

export const fallbackBrandRules: FallbackBrandRule[] = [
  {
    id: 1,
    category: "Palette",
    name: "Jaune institutionnel",
    description: "Utiliser #FFED00 et refuser toute dérive off-brand sur les slides CTA et admissions.",
    severity: "high",
    expectedValue: "#FFED00",
  },
  {
    id: 2,
    category: "Typographie",
    name: "Titres SVHFlib Bold",
    description: "Les écrans de campagne gardent des titres courts, en capitales, avec SVHFlib Bold.",
    severity: "high",
    expectedValue: "SVHFlib Bold uppercase",
  },
  {
    id: 3,
    category: "Conformité",
    name: "Mentions formation",
    description: "Toute promesse formation ou financement doit conserver les mentions Qualiopi et RNCP utiles.",
    severity: "high",
    expectedValue: "Mentions présentes",
  },
  {
    id: 4,
    category: "Ton",
    name: "Tutoiement lycéens",
    description: "Sur les contenus recrutement, rester direct, incarné et accessible, sans jargon corporate.",
    severity: "medium",
    expectedValue: "Tutoiement + ton concret",
  },
  {
    id: 5,
    category: "CTA",
    name: "Repères JPO",
    description: "Les contenus JPO citent la date, le campus et le bénéfice visiteur dès le CTA final.",
    severity: "medium",
    expectedValue: "Date + campus + bénéfice",
  },
];
