import { asc, eq } from "drizzle-orm";

import { db } from "@/db/index";
import { personas } from "@/db/schema";

export type PersonaRow = typeof personas.$inferSelect;

export type Persona = Omit<
  PersonaRow,
  | "preferredPlatforms"
  | "vocabularyYes"
  | "vocabularyNo"
  | "goals"
  | "painPoints"
  | "keyMessages"
  | "topContent"
  | "recommendations"
> & {
  preferredPlatforms: string[];
  vocabularyYes: string[];
  vocabularyNo: string[];
  goals: string[];
  painPoints: string[];
  keyMessages: string[];
  topContent: string[];
  recommendations: string[];
};

function splitList(value: string): string[] {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return [];
  }

  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean);
      }
    } catch {
      // Garde la compatibilité avec les anciennes seeds CSV.
    }
  }

  return trimmed
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toPersona(row: PersonaRow): Persona {
  return {
    ...row,
    preferredPlatforms: splitList(row.preferredPlatforms),
    vocabularyYes: splitList(row.vocabularyYes),
    vocabularyNo: splitList(row.vocabularyNo),
    goals: splitList(row.goals),
    painPoints: splitList(row.painPoints),
    keyMessages: splitList(row.keyMessages),
    topContent: splitList(row.topContent),
    recommendations: splitList(row.recommendations),
  };
}

export function listPersonas(): Persona[] {
  return db.select().from(personas).orderBy(asc(personas.id)).all().map(toPersona);
}

export function getPersonaBySlug(slug: string): Persona | undefined {
  const row = db.select().from(personas).where(eq(personas.slug, slug)).get();
  return row ? toPersona(row) : undefined;
}
