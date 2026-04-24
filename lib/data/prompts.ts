import { asc, desc, eq } from "drizzle-orm";

import { db } from "@/db/index";
import { prompts } from "@/db/schema";

export type Prompt = typeof prompts.$inferSelect;
export type NewPrompt = typeof prompts.$inferInsert;

export function listPrompts(): Prompt[] {
  return db.select().from(prompts).orderBy(desc(prompts.favorite), asc(prompts.title)).all();
}

export function getPromptBySlug(slug: string): Prompt | undefined {
  return db.select().from(prompts).where(eq(prompts.slug, slug)).get();
}

export function getPromptById(id: number): Prompt | undefined {
  return db.select().from(prompts).where(eq(prompts.id, id)).get();
}

export function getPromptBySlugOrId(value: string): Prompt | undefined {
  const reference = value.trim();
  if (!reference) return undefined;

  const bySlug = getPromptBySlug(reference);
  if (bySlug) return bySlug;

  const id = Number.parseInt(reference, 10);
  if (!Number.isSafeInteger(id) || String(id) !== reference) return undefined;

  return getPromptById(id);
}

export function createPrompt(input: NewPrompt): Prompt {
  const [row] = db.insert(prompts).values(input).returning().all();
  return row;
}

export function updatePromptById(id: number, patch: Partial<NewPrompt>): Prompt | undefined {
  const [row] = db
    .update(prompts)
    .set({ ...patch, updatedAt: new Date().toISOString() })
    .where(eq(prompts.id, id))
    .returning()
    .all();
  return row;
}

export function deletePromptById(id: number): boolean {
  const result = db.delete(prompts).where(eq(prompts.id, id)).run();
  return result.changes > 0;
}

export function toggleFavorite(id: number): Prompt | undefined {
  const existing = getPromptById(id);
  if (!existing) return undefined;
  return updatePromptById(id, { favorite: !existing.favorite });
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 64);
}
