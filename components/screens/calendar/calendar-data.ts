export type CalendarChipTone =
  | "purple"
  | "purple-soft"
  | "sky"
  | "yellow"
  | "pink"
  | "orange"
  | "green"
  | "green-sapin"
  | "caramel"
  | "turquoise"
  | "red";

export type CalendarChannel = "Instagram" | "TikTok" | "LinkedIn" | "YouTube";

export type CalendarContentStatus =
  | "brief"
  | "production"
  | "review"
  | "scheduled"
  | "published";

export type CalendarEntry = {
  id: string;
  day: number;
  dateIso?: string;
  label: string;
  tone: CalendarChipTone;
  type: string;
  channel: CalendarChannel;
  status: CalendarContentStatus;
  assignee: string;
  campaign: string;
};

export type AiSuggestionTag = {
  day: number;
  text: string;
};

export type AiSuggestion = {
  when: string;
  event: string;
  action: string;
  accent: "yellow" | "pink" | "turquoise" | "green";
};

export type BalanceSegment = {
  label: string;
  pct: number;
  tone: "yellow" | "purple" | "sky" | "caramel" | "pink";
};

export const MONTH_LABEL = "Mai 2026";
export const MONTH_YEAR = 2026;
export const MONTH_INDEX = 4;
export const MONTH_START_OFFSET = 4;
export const MONTH_DAYS = 31;

export const CALENDAR_ENTRIES: CalendarEntry[] = [
  { id: "m-01", day: 1, label: "Kick-off JPO", tone: "purple-soft", type: "Brief", channel: "Instagram", status: "brief", assignee: "Laure Reymond", campaign: "JPO Mai 2026" },
  { id: "m-04a", day: 4, label: "Post formations", tone: "sky", type: "Post", channel: "Instagram", status: "scheduled", assignee: "Thomas L.", campaign: "Recrutement" },
  { id: "m-04b", day: 4, label: "Story alumni", tone: "caramel", type: "Story", channel: "Instagram", status: "production", assignee: "Refika D.", campaign: "Alumni" },
  { id: "m-05a", day: 5, label: "Reel atelier BTS", tone: "yellow", type: "Reel", channel: "Instagram", status: "production", assignee: "Thomas L.", campaign: "Showcase" },
  { id: "m-05b", day: 5, label: "LinkedIn partenaires", tone: "pink", type: "Post", channel: "LinkedIn", status: "review", assignee: "Laure Reymond", campaign: "Partenariats" },
  { id: "m-06", day: 6, label: "Carrousel Motion", tone: "purple", type: "Carrousel", channel: "Instagram", status: "scheduled", assignee: "Thomas L.", campaign: "Showcase" },
  { id: "m-07", day: 7, label: "Story Parcoursup", tone: "yellow", type: "Story", channel: "Instagram", status: "scheduled", assignee: "Laure Reymond", campaign: "Parcoursup" },
  { id: "m-08", day: 8, label: "Post parents", tone: "sky", type: "Post", channel: "LinkedIn", status: "brief", assignee: "Laure Reymond", campaign: "Recrutement" },
  { id: "m-11a", day: 11, label: "Reel J-6 JPO", tone: "yellow", type: "Reel", channel: "Instagram", status: "production", assignee: "Thomas L.", campaign: "JPO Mai 2026" },
  { id: "m-11b", day: 11, label: "Post alumni", tone: "caramel", type: "Post", channel: "LinkedIn", status: "review", assignee: "Refika D.", campaign: "Alumni" },
  { id: "m-12a", day: 12, label: "TikTok atelier sérigraphie", tone: "orange", type: "TikTok", channel: "TikTok", status: "production", assignee: "Thomas L.", campaign: "Showcase" },
  { id: "m-12b", day: 12, label: "Story countdown J-5", tone: "yellow", type: "Story", channel: "Instagram", status: "scheduled", assignee: "Laure Reymond", campaign: "JPO Mai 2026" },
  { id: "m-13a", day: 13, label: "Carrousel témoignages", tone: "green", type: "Carrousel", channel: "Instagram", status: "review", assignee: "Refika D.", campaign: "Alumni" },
  { id: "m-13b", day: 13, label: "LinkedIn Refika", tone: "caramel", type: "Post", channel: "LinkedIn", status: "scheduled", assignee: "Refika D.", campaign: "Alumni" },
  { id: "m-14a", day: 14, label: "Reel teaser JPO", tone: "purple", type: "Reel", channel: "Instagram", status: "production", assignee: "Thomas L.", campaign: "JPO Mai 2026" },
  { id: "m-14b", day: 14, label: "Post parents Q&R", tone: "sky", type: "Post", channel: "Instagram", status: "brief", assignee: "Laure Reymond", campaign: "Recrutement" },
  { id: "m-14c", day: 14, label: "Story horaires", tone: "yellow", type: "Story", channel: "Instagram", status: "scheduled", assignee: "Laure Reymond", campaign: "JPO Mai 2026" },
  { id: "m-15a", day: 15, label: "Compte à rebours J-2", tone: "purple", type: "Story", channel: "Instagram", status: "scheduled", assignee: "Laure Reymond", campaign: "JPO Mai 2026" },
  { id: "m-15b", day: 15, label: "Story prof motion", tone: "yellow", type: "Story", channel: "Instagram", status: "production", assignee: "Thomas L.", campaign: "Showcase" },
  { id: "m-15c", day: 15, label: "Mail alumni", tone: "caramel", type: "Newsletter", channel: "LinkedIn", status: "review", assignee: "Refika D.", campaign: "Alumni" },
  { id: "m-16", day: 16, label: "Story live J-1", tone: "yellow", type: "Story", channel: "Instagram", status: "scheduled", assignee: "Laure Reymond", campaign: "JPO Mai 2026" },
  { id: "m-17a", day: 17, label: "LIVE JPO 10h→18h", tone: "purple", type: "Live", channel: "Instagram", status: "scheduled", assignee: "Laure Reymond", campaign: "JPO Mai 2026" },
  { id: "m-17b", day: 17, label: "Stories toute la journée", tone: "yellow", type: "Story", channel: "Instagram", status: "scheduled", assignee: "Thomas L.", campaign: "JPO Mai 2026" },
  { id: "m-18a", day: 18, label: "Best-of JPO", tone: "green", type: "Reel", channel: "Instagram", status: "brief", assignee: "Thomas L.", campaign: "JPO Mai 2026" },
  { id: "m-18b", day: 18, label: "Remerciements", tone: "sky", type: "Post", channel: "LinkedIn", status: "brief", assignee: "Laure Reymond", campaign: "JPO Mai 2026" },
  { id: "m-20", day: 20, label: "Carrousel debrief", tone: "green", type: "Carrousel", channel: "Instagram", status: "brief", assignee: "Refika D.", campaign: "JPO Mai 2026" },
  { id: "m-22", day: 22, label: "Reel projets exposés", tone: "purple", type: "Reel", channel: "Instagram", status: "brief", assignee: "Thomas L.", campaign: "Showcase" },
  { id: "m-26", day: 26, label: "Post Annecy teaser", tone: "pink", type: "Post", channel: "Instagram", status: "brief", assignee: "Laure Reymond", campaign: "Festival Annecy" },
  { id: "m-28", day: 28, label: "LinkedIn rentrée", tone: "sky", type: "Post", channel: "LinkedIn", status: "brief", assignee: "Laure Reymond", campaign: "Rentrée 2026" },
];

export const AI_SUGGESTION_TAGS: AiSuggestionTag[] = [
  { day: 7, text: "Parcoursup phase complémentaire · Publier story J-14" },
  { day: 26, text: "Festival d'Annecy · Publier teaser partenariat" },
];

export const AI_SUGGESTIONS: AiSuggestion[] = [
  {
    when: "Dans 2 semaines",
    event: "Parcoursup · phase complémentaire",
    action:
      "Publier story J-14 et post récap sur les formations encore ouvertes aux lycéens.",
    accent: "yellow",
  },
  {
    when: "Dans 3 semaines",
    event: "Festival d'Annecy · Motion et animation",
    action:
      "Teaser partenariat — étudiants DCDG invités en workshops studio.",
    accent: "pink",
  },
  {
    when: "Dans 5 semaines",
    event: "Puces Typo · édition 2026",
    action:
      "Capter contenu live et lancer une série carrousels behind-the-scenes.",
    accent: "turquoise",
  },
  {
    when: "Dans 8 semaines",
    event: "Résultats Bac · stratégie conversion",
    action:
      "Plan 7 jours : post félicitations, post formations, CTA candidature.",
    accent: "green",
  },
];

export const BALANCE_SEGMENTS: BalanceSegment[] = [
  { label: "Recrutement étudiants", pct: 48, tone: "yellow" },
  { label: "JPO et événements", pct: 28, tone: "purple" },
  { label: "Showcase étudiants", pct: 14, tone: "sky" },
  { label: "Alumni", pct: 6, tone: "caramel" },
  { label: "Partenariats", pct: 4, tone: "pink" },
];

export const CHANNEL_FILTERS: Array<CalendarChannel | "Toutes"> = [
  "Toutes",
  "Instagram",
  "TikTok",
  "LinkedIn",
  "YouTube",
];

export const STATUS_LABELS: Record<CalendarContentStatus, string> = {
  brief: "Brief",
  production: "En production",
  review: "En revue",
  scheduled: "Planifié",
  published: "Publié",
};

export const TONE_BG: Record<CalendarChipTone, string> = {
  purple: "bg-purple text-ink",
  "purple-soft": "bg-purple-soft text-ink",
  sky: "bg-sky text-ink",
  yellow: "bg-yellow text-ink",
  pink: "bg-pink text-ink",
  orange: "bg-orange text-ink",
  green: "bg-green text-ink",
  "green-sapin": "bg-green-sapin text-cream",
  caramel: "bg-caramel text-cream",
  turquoise: "bg-turquoise text-ink",
  red: "bg-red text-cream",
};
