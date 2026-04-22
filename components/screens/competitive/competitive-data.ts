export type PostTone =
  | "purple"
  | "orange"
  | "green"
  | "caramel"
  | "yellow"
  | "pink"
  | "sky"
  | "turquoise";

export type CompetitivePost = {
  id: string;
  competitorIndex: number;
  type: string;
  title: string;
  platform: "Instagram" | "TikTok" | "LinkedIn" | "YouTube";
  aspectRatio: "4/5" | "1/1" | "9/16" | "16/9";
  engagement: string;
  time: string;
  tone: PostTone;
};

export type Trend = {
  delta: string;
  label: string;
  description: string;
  tags?: Array<{ label: string; tone: "purple" | "outline" }>;
  tone?: "ink" | "purple" | "sky";
};

export type FeedFilter = "Tous" | "Reels" | "Carrousels" | "Stories" | "LinkedIn";

export const POSTS: CompetitivePost[] = [
  { id: "p01", competitorIndex: 0, type: "Reel", title: "Behind-the-scenes atelier photo — process argentique", platform: "Instagram", aspectRatio: "4/5", engagement: "8,2%", time: "il y a 2h", tone: "purple" },
  { id: "p02", competitorIndex: 1, type: "Carrousel", title: "10 conseils pour ton book motion", platform: "Instagram", aspectRatio: "1/1", engagement: "6,4%", time: "il y a 4h", tone: "orange" },
  { id: "p03", competitorIndex: 2, type: "TikTok", title: "POV tu entres en 2e année graphisme", platform: "TikTok", aspectRatio: "9/16", engagement: "12,1%", time: "il y a 5h", tone: "green" },
  { id: "p04", competitorIndex: 0, type: "Portrait", title: "Alumni · directrice artistique chez studio Akatre", platform: "LinkedIn", aspectRatio: "4/5", engagement: "4,8%", time: "il y a 6h", tone: "caramel" },
  { id: "p05", competitorIndex: 3, type: "Story", title: "Parcoursup J-3 · dernières places en design graphique", platform: "Instagram", aspectRatio: "9/16", engagement: "3,2%", time: "il y a 8h", tone: "yellow" },
  { id: "p06", competitorIndex: 1, type: "Reel", title: "Showcase workshop typographie — édition hiver", platform: "Instagram", aspectRatio: "9/16", engagement: "9,1%", time: "il y a 10h", tone: "pink" },
  { id: "p07", competitorIndex: 2, type: "Post", title: "Ouverture master en design interactif — admissions", platform: "LinkedIn", aspectRatio: "1/1", engagement: "5,5%", time: "il y a 12h", tone: "sky" },
  { id: "p08", competitorIndex: 0, type: "Reel", title: "Journée type étudiant·e 1re année motion", platform: "Instagram", aspectRatio: "9/16", engagement: "11,4%", time: "hier", tone: "turquoise" },
  { id: "p09", competitorIndex: 3, type: "Carrousel", title: "5 erreurs à éviter sur ton dossier Parcoursup", platform: "Instagram", aspectRatio: "1/1", engagement: "7,2%", time: "hier", tone: "orange" },
  { id: "p10", competitorIndex: 1, type: "Reel", title: "Tuto motion express en 60 secondes", platform: "TikTok", aspectRatio: "9/16", engagement: "10,8%", time: "hier", tone: "purple" },
  { id: "p11", competitorIndex: 2, type: "Portrait", title: "Prof invité · workshop illustration rétro", platform: "Instagram", aspectRatio: "4/5", engagement: "5,9%", time: "il y a 2j", tone: "pink" },
  { id: "p12", competitorIndex: 0, type: "Post", title: "Inscription JPO mai · formulaire et horaires", platform: "Instagram", aspectRatio: "1/1", engagement: "3,8%", time: "il y a 2j", tone: "yellow" },
];

export const TRENDS: Trend[] = [
  {
    delta: "+280%",
    label: "Reels behind-the-scenes atelier",
    description:
      "Format court, tutoiement, musique lente. 9 posts en 30 jours, engagement moyen 9,4%.",
    tags: [
      { label: "Tendance forte", tone: "purple" },
      { label: "× Gobelins, LISAA, ECV", tone: "outline" },
    ],
  },
  {
    delta: "+190%",
    label: "Témoignages alumni vidéo",
    description:
      "Format 60s, plan fixe bureau. Engagement LinkedIn 7,1%, saves ×3.",
  },
  {
    delta: "+112%",
    label: "Carrousels « process étudiant »",
    description:
      "6 à 10 slides. Captures Figma et AE avec commentaire manuscrit. À tester.",
    tone: "sky",
  },
];

export const FEED_FILTERS: FeedFilter[] = [
  "Tous",
  "Reels",
  "Carrousels",
  "Stories",
  "LinkedIn",
];

export const COMPETITOR_VISUALS: Array<{
  short: string;
  color: string;
}> = [
  { short: "GB", color: "bg-purple" },
  { short: "LS", color: "bg-orange" },
  { short: "EC", color: "bg-green" },
  { short: "CF", color: "bg-pink" },
];
