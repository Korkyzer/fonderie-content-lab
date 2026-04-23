export type AlumniProfile = {
  id: string;
  name: string;
  initials: string;
  graduationYear: number;
  currentRole: string;
  company: string;
  bio: string;
  skills: string[];
};

export type Partner = {
  id: string;
  name: string;
  sector: string;
  description: string;
  partnershipType: string;
  contactEmail: string;
};

export type CommunityOpportunity = {
  id: string;
  title: string;
  type: string;
  company: string;
  focus: string;
  description: string;
  graduationTarget: string;
};

export type AlumniTestimonial = {
  id: string;
  alumniName: string;
  graduationYear: number;
  role: string;
  angle: string;
  quote: string;
  promptBody: string;
};

const alumniProfiles: AlumniProfile[] = [
  {
    id: "alumni-1",
    name: "Lina Moreau",
    initials: "LM",
    graduationYear: 2024,
    currentRole: "Designer UX",
    company: "Studio Flux",
    bio: "Elle conçoit des interfaces culturelles et encadre ponctuellement des workshops portfolio.",
    skills: ["UX", "Figma", "Design système"],
  },
  {
    id: "alumni-2",
    name: "Mathis Chenot",
    initials: "MC",
    graduationYear: 2023,
    currentRole: "Motion designer",
    company: "Frame Club",
    bio: "Il travaille sur des identités animées pour des marques mode et musique.",
    skills: ["Motion", "After Effects", "Direction artistique"],
  },
];

const partners: Partner[] = [
  {
    id: "partner-1",
    name: "Atelier Nord",
    sector: "Design graphique",
    description: "Agence indépendante qui ouvre des briefs branding et accueille des alternants.",
    partnershipType: "alternance",
    contactEmail: "contact@ateliernord.fr",
  },
  {
    id: "partner-2",
    name: "Pixel Commons",
    sector: "Produit numérique",
    description: "Studio produit intéressé par des workshops UX et du mentorat sur prototype.",
    partnershipType: "mentorat",
    contactEmail: "hello@pixelcommons.fr",
  },
];

const opportunities: CommunityOpportunity[] = [
  {
    id: "opp-1",
    title: "Stage branding junior",
    type: "Stage",
    company: "Atelier Nord",
    focus: "Identité visuelle",
    description: "Mission de six mois autour d'un rebranding territorial avec production print et digital.",
    graduationTarget: "Promo 2025",
  },
  {
    id: "opp-2",
    title: "Workshop UX express",
    type: "Workshop",
    company: "Pixel Commons",
    focus: "Prototype et test utilisateur",
    description: "Sprint de deux jours pour explorer une nouvelle expérience d'accueil sur une app culturelle.",
    graduationTarget: "Promo 2024-2025",
  },
];

const testimonials: AlumniTestimonial[] = [
  {
    id: "testi-1",
    alumniName: "Lina Moreau",
    graduationYear: 2024,
    role: "Designer UX chez Studio Flux",
    angle: "Passer d'un projet d'école à un premier produit en production",
    quote: "Le rythme projet m'a appris à défendre une intention tout en restant très concrète sur les usages.",
    promptBody:
      "Rédiger un post LinkedIn inspirant à partir d'un témoignage alumni sur la transition vers un premier poste UX.",
  },
  {
    id: "testi-2",
    alumniName: "Mathis Chenot",
    graduationYear: 2023,
    role: "Motion designer chez Frame Club",
    angle: "Faire du portfolio un levier d'embauche",
    quote: "Le portfolio n'était pas une vitrine figée, mais une démonstration de méthode et d'énergie.",
    promptBody:
      "Composer un post alumni autour d'un portfolio devenu un déclencheur de recrutement.",
  },
];

export function listAlumniProfiles() {
  return alumniProfiles;
}

export function listPartners() {
  return partners;
}

export function listCommunityOpportunities() {
  return opportunities;
}

export function listAlumniTestimonials() {
  return testimonials;
}
