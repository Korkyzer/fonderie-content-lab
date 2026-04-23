import { desc } from "drizzle-orm";

import { db } from "@/db/index";
import { references } from "@/db/schema";

export type CreativeReferenceRow = typeof references.$inferSelect;

export type CreativeReference = Omit<CreativeReferenceRow, "tags"> & {
  tags: string[];
  screenshotTone: "purple" | "sky" | "orange" | "pink";
  generatorHref: string;
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

function toneForCategory(category: string): CreativeReference["screenshotTone"] {
  switch (category) {
    case "Tendances design":
      return "purple";
    case "Hooks social media":
      return "orange";
    case "Campagnes écoles":
      return "sky";
    default:
      return "pink";
  }
}

function buildGeneratorHref(reference: CreativeReferenceRow, tags: string[]): string {
  const params = new URLSearchParams({
    title: `Inspiration · ${reference.title}`,
    platform:
      reference.category === "Hooks social media" ? "Instagram Reel" : "LinkedIn",
    audience:
      reference.category === "Campagnes écoles"
        ? "Lycéens 16-20"
        : "Entreprises partenaires",
    body: [
      `S'inspirer de la référence "${reference.title}".`,
      `Catégorie: ${reference.category}.`,
      `Tags: ${tags.join(", ")}.`,
      `Notes: ${reference.notes}`,
      `Source: ${reference.url}`,
    ].join(" "),
  });

  return `/generator?${params.toString()}`;
}

export function listCreativeReferences(): CreativeReference[] {
  return db
    .select()
    .from(references)
    .orderBy(desc(references.score), desc(references.createdAt))
    .all()
    .map((row) => {
      const tags = splitList(row.tags);
      return {
        ...row,
        tags,
        screenshotTone: toneForCategory(row.category),
        generatorHref: buildGeneratorHref(row, tags),
      };
    });
}
