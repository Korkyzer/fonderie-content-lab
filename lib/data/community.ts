import { asc } from "drizzle-orm";

import { db } from "@/db/index";
import { alumni, partners } from "@/db/schema";

export type AlumniRow = typeof alumni.$inferSelect;
export type Partner = typeof partners.$inferSelect;

export type AlumniProfile = Omit<AlumniRow, "skills"> & {
  skills: string[];
  initials: string;
};

export type CommunityOpportunity = {
  id: string;
  title: string;
  type: "Alternance" | "Projet" | "Mentorat";
  company: string;
  focus: string;
  graduationTarget: string;
  description: string;
};

export type AlumniTestimonial = {
  id: string;
  alumniName: string;
  graduationYear: number;
  role: string;
  quote: string;
  angle: string;
  promptBody: string;
};

function splitList(value: string): string[] {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return [];
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === "string");
    }
  } catch {
    return trimmed
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part.trim()[0] ?? "")
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function listAlumniProfiles(): AlumniProfile[] {
  return db
    .select()
    .from(alumni)
    .orderBy(asc(alumni.graduationYear), asc(alumni.name))
    .all()
    .map((row) => ({
      ...row,
      skills: splitList(row.skills),
      initials: getInitials(row.name),
    }));
}

export function listPartners() {
  return db.select().from(partners).orderBy(asc(partners.name)).all();
}

export function listCommunityOpportunities(): CommunityOpportunity[] {
  return [
    {
      id: "opp-01",
      title: "Alternant motion design branding",
      type: "Alternance",
      company: "Studio Flamme",
      focus: "Motion design, storytelling social media",
      graduationTarget: "Promo 2024-2026",
      description:
        "Recherche un profil capable de décliner des campagnes courtes pour TikTok, Reels et DOOH.",
    },
    {
      id: "opp-02",
      title: "Sprint social media admissions",
      type: "Projet",
      company: "Maison Moka",
      focus: "Direction artistique, campagne école",
      graduationTarget: "Promo 2025",
      description:
        "Mini équipe pour produire un concept éditorial d’été et un kit de publication en 5 jours.",
    },
    {
      id: "opp-03",
      title: "Programme mentorat DA junior",
      type: "Mentorat",
      company: "Pixel Parade",
      focus: "Portfolio review, préparation entretiens",
      graduationTarget: "Promos 2022 à 2026",
      description:
        "Sessions mensuelles à distance avec relecture portfolio et coaching entrée en studio.",
    },
    {
      id: "opp-04",
      title: "Mission branding festival étudiant",
      type: "Projet",
      company: "Collectif 36",
      focus: "Identité visuelle, activation campus",
      graduationTarget: "Promo 2026",
      description:
        "Travail en binôme pour concevoir un système de visuels et une série d’affiches événementielles.",
    },
  ];
}

export function listAlumniTestimonials(): AlumniTestimonial[] {
  return [
    {
      id: "test-01",
      alumniName: "Mina Roussel",
      graduationYear: 2020,
      role: "Lead motion designer · Studio Flamme",
      angle: "Passer de l’atelier à un studio motion reconnu",
      quote:
        "À la Fonderie, j’ai appris à défendre une idée visuelle vite et bien. C’est exactement ce qu’on attend de moi aujourd’hui en agence.",
      promptBody:
        "Créer un post LinkedIn alumni à partir d’un témoignage. Mettre en avant la progression de Mina Roussel entre la Fonderie et son poste de lead motion designer, avec un ton inspirant, concret et crédible.",
    },
    {
      id: "test-02",
      alumniName: "Rayan El Fassi",
      graduationYear: 2018,
      role: "Creative technologist · TypoLab",
      angle: "Débouchés créatifs hybrides",
      quote:
        "Le plus utile n’était pas une seule technique, mais la capacité à lier narration, design et production dans un même projet.",
      promptBody:
        "Générer un carrousel alumni en 5 slides sur le parcours de Rayan El Fassi. Insister sur la polyvalence créative et les débouchés hybrides après la Fonderie.",
    },
    {
      id: "test-03",
      alumniName: "Camille Dorsin",
      graduationYear: 2016,
      role: "Head of social creative · Maison Moka",
      angle: "Du réseau alumni au recrutement",
      quote:
        "Je recrute aujourd’hui via le réseau alumni parce que je sais déjà comment les promos travaillent, présentent et livrent.",
      promptBody:
        "Rédiger un témoignage court pour newsletter alumni à partir de la citation de Camille Dorsin. Angle: force du réseau et opportunités de recrutement.",
    },
  ];
}
