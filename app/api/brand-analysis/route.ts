import { NextResponse } from "next/server";

export type BrandAnalysisRequest = {
  contentId?: string;
  content?: string;
  format?: string;
};

export type GuardianCheckState = "ok" | "warn" | "err";

export type GuardianCheck = {
  id: string;
  label: string;
  msg: string;
  score: number;
  max: number;
  state: GuardianCheckState;
};

export type GuardianSlide = {
  step: string;
  title: string;
  background: string;
  tone?: "cream" | "ink" | "purple" | "sky" | "warning";
  warning?: string;
};

export type GuardianSuggestion = {
  slide: string;
  wrongValue: string;
  correctValue: string;
  gain: number;
  projectedScore: number;
  description: string;
};

export type ValidationEvent = {
  id: string;
  author: string;
  initials: string;
  avatarTone: "purple" | "sky" | "orange" | "green";
  title: string;
  note: string;
  time: string;
};

export type BrandAnalysisResponse = {
  score: number;
  verdict: string;
  verdictSub: string;
  tags: Array<{ label: string; tone: string }>;
  checks: GuardianCheck[];
  slides: GuardianSlide[];
  suggestion: GuardianSuggestion;
  history: ValidationEvent[];
  meta: { author: string; format: string; analyzedAt: string };
};

const ANALYSIS: BrandAnalysisResponse = {
  score: 89,
  verdict: "Presque prêt",
  verdictSub:
    "2 points d'attention avant publication. L'identité CFI est globalement respectée mais la palette s'écarte du jaune officiel sur 2 slides.",
  tags: [
    { label: "Motion Design", tone: "purple" },
    { label: "Instagram · Carrousel", tone: "sky" },
  ],
  checks: [
    {
      id: "edu",
      label: "Conformité éducation",
      msg: "Mentions Qualiopi + financements présentes · bloc RNCP correct",
      score: 24,
      max: 25,
      state: "ok",
    },
    {
      id: "tone",
      label: "Tone of voice",
      msg: "Direct · tutoiement · zéro jargon corporate — bien aligné persona Lycéens",
      score: 19,
      max: 20,
      state: "ok",
    },
    {
      id: "graphic",
      label: "Charte graphique",
      msg: "Slide 3 utilise un jaune #FFD914 au lieu du jaune officiel CFI #FFED00. Police bold respectée.",
      score: 13,
      max: 20,
      state: "warn",
    },
    {
      id: "a11y",
      label: "Accessibilité",
      msg: "Contraste AA+, sous-titres présents, alt text renseigné",
      score: 19,
      max: 20,
      state: "ok",
    },
    {
      id: "lex",
      label: "Vocabulaire",
      msg: "Usage correct de « étudiant·es », « DCDG », « atelier ». 0 occurrence interdite.",
      score: 14,
      max: 15,
      state: "ok",
    },
  ],
  slides: [
    { step: "01 · Cover", title: "Motion design à la Fonderie", background: "var(--purple)", tone: "purple" },
    { step: "02 · Intro", title: "4 formations. 24 frames/sec.", background: "var(--cream)", tone: "cream" },
    {
      step: "03 · BTS",
      title: "BTS Design Graphique option Motion",
      background: "#FFD914",
      tone: "warning",
      warning: "Jaune off-brand",
    },
    { step: "04 · Mastère", title: "Mastère DCDG — Direction créative", background: "var(--ink)", tone: "ink" },
    { step: "05 · CTA", title: "JPO 17 mai — Viens voir", background: "var(--sky)", tone: "sky" },
  ],
  suggestion: {
    slide: "Slide 3",
    wrongValue: "#FFD914",
    correctValue: "#FFED00",
    gain: 6,
    projectedScore: 95,
    description:
      "Remplacer le jaune off-brand par le jaune officiel CFI. Gain estimé sur la charte graphique.",
  },
  history: [
    {
      id: "bg-auto",
      author: "Brand Guardian · analyse automatique",
      initials: "BG",
      avatarTone: "purple",
      title: "Analyse automatique",
      note: "Score 89/100 — 2 points d'attention",
      time: "il y a 3 min",
    },
    {
      id: "thomas",
      author: "Thomas L.",
      initials: "TL",
      avatarTone: "sky",
      title: "Demande de validation",
      note: "« Brief pour poster demain matin, la cover est validée côté direction »",
      time: "il y a 12 min",
    },
  ],
  meta: {
    author: "Thomas L.",
    format: "Carrousel · 5 slides",
    analyzedAt: new Date().toISOString(),
  },
};

export async function POST(request: Request) {
  await request.json().catch(() => ({}));
  return NextResponse.json(ANALYSIS);
}

export async function GET() {
  return NextResponse.json(ANALYSIS);
}
