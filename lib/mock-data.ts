import type { IconName } from "@/components/ui/icon";

export type NavItem = {
  href: string;
  label: string;
  section: "Workspace" | "Intelligence";
  icon: IconName;
  kbd: string;
  badge?: string;
};

export const navigation: NavItem[] = [
  { href: "/", label: "Dashboard", section: "Workspace", icon: "dashboard", kbd: "D" },
  {
    href: "/generator",
    label: "Générateur",
    section: "Workspace",
    icon: "generate",
    kbd: "G",
    badge: "Nouveau",
  },
  {
    href: "/brand-guardian",
    label: "Brand Guardian",
    section: "Workspace",
    icon: "shield",
    kbd: "B",
  },
  {
    href: "/kanban",
    label: "Production",
    section: "Workspace",
    icon: "kanban",
    kbd: "P",
  },
  {
    href: "/calendar",
    label: "Calendrier",
    section: "Workspace",
    icon: "calendar",
    kbd: "C",
  },
  {
    href: "/auto-publish",
    label: "Auto-publication",
    section: "Workspace",
    icon: "play",
    kbd: "U",
  },
  {
    href: "/competitive",
    label: "Veille concurrentielle",
    section: "Intelligence",
    icon: "eye",
    kbd: "V",
  },
  {
    href: "/prompts",
    label: "Bibliothèque prompts",
    section: "Intelligence",
    icon: "bookmark",
    kbd: "L",
  },
  {
    href: "/personas",
    label: "Audience Personas",
    section: "Intelligence",
    icon: "users",
    kbd: "A",
  },
];

export const pageMeta: Record<
  string,
  { crumb: string; title: string; eyebrow: string; description: string }
> = {
  "/": {
    crumb: "Dashboard",
    title: "Bonjour Laure 👋 · Il reste 9 jours avant la JPO",
    eyebrow: "Dashboard",
    description:
      "Vue d’ensemble éditoriale avec KPIs, activité récente et tendances écoles créatives.",
  },
  "/generator": {
    crumb: "Générateur",
    title: "Brief, variantes, aperçu Reel",
    eyebrow: "Atelier",
    description:
      "Décrivez l’intention, laissez les garde-fous CFI proposer des variantes prêtes à valider.",
  },
  "/brand-guardian": {
    crumb: "Brand Guardian",
    title: "Score de marque et garde-fous",
    eyebrow: "Qualité",
    description:
      "Vérification ton, charte couleur et cohérence visuelle avant publication.",
  },
  "/kanban": {
    crumb: "Production",
    title: "Kanban · contenus en cours",
    eyebrow: "Kanban",
    description:
      "De l’idée à la publication, suivez chaque contenu du brief jusqu’au post validé.",
  },
  "/calendar": {
    crumb: "Calendrier",
    title: "Planning éditorial et temps forts",
    eyebrow: "Calendrier",
    description:
      "Vue mensuelle des publications, événements CFI et moments de l’année scolaire.",
  },
  "/auto-publish": {
    crumb: "Auto-publish",
    title: "Publication automatique par canal",
    eyebrow: "Distribution",
    description:
      "Configurez les canaux qui publieront automatiquement les contenus planifiés.",
  },
  "/competitive": {
    crumb: "Veille",
    title: "Veille concurrentielle des écoles créatives",
    eyebrow: "Intelligence",
    description:
      "Ce que publient Gobelins, LISAA, ECV et Cifacom sur les 30 derniers jours.",
  },
  "/prompts": {
    crumb: "Prompts",
    title: "Bibliothèque de prompts CFI",
    eyebrow: "Intelligence",
    description:
      "Modèles prêts à l’emploi, variables personnalisables et briefs d’équipe.",
  },
  "/personas": {
    crumb: "Personas",
    title: "Audience personas et vocabulaire",
    eyebrow: "Intelligence",
    description:
      "Cibles éditoriales, vocabulaire à privilégier, mots à éviter.",
  },
};
