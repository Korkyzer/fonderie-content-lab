import { and, asc, desc, eq } from "drizzle-orm";

import { db } from "@/db/index";
import { campaignKits, templates } from "@/db/schema";

export type TemplateRow = typeof templates.$inferSelect;
export type NewTemplate = typeof templates.$inferInsert;

export type TemplateKind = "formation" | "event" | "audience" | "general";

export type Template = Omit<TemplateRow, "structure" | "assets"> & {
  structure: string[];
  assets: string[];
};

function parseStringList(value: string): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return parsed.filter((entry): entry is string => typeof entry === "string");
    }
  } catch {
    return [];
  }
  return [];
}

function rowToTemplate(row: TemplateRow): Template {
  return {
    ...row,
    structure: parseStringList(row.structure),
    assets: parseStringList(row.assets),
  };
}

export function listTemplates(includeArchived = false): Template[] {
  const rows = includeArchived
    ? db.select().from(templates).orderBy(asc(templates.name)).all()
    : db
        .select()
        .from(templates)
        .where(eq(templates.archived, false))
        .orderBy(asc(templates.name))
        .all();
  return rows.map(rowToTemplate);
}

export function getTemplateBySlug(slug: string): Template | undefined {
  const row = db.select().from(templates).where(eq(templates.slug, slug)).get();
  return row ? rowToTemplate(row) : undefined;
}

export function getTemplateById(id: number): Template | undefined {
  const row = db.select().from(templates).where(eq(templates.id, id)).get();
  return row ? rowToTemplate(row) : undefined;
}

export function createTemplate(input: NewTemplate): Template {
  const [row] = db.insert(templates).values(input).returning().all();
  return rowToTemplate(row);
}

export function updateTemplate(id: number, patch: Partial<NewTemplate>): Template | undefined {
  const [row] = db
    .update(templates)
    .set({ ...patch, updatedAt: new Date().toISOString() })
    .where(eq(templates.id, id))
    .returning()
    .all();
  return row ? rowToTemplate(row) : undefined;
}

export function archiveTemplate(id: number, archived: boolean): Template | undefined {
  return updateTemplate(id, { archived });
}

export function deleteTemplate(id: number): boolean {
  const result = db.delete(templates).where(eq(templates.id, id)).run();
  return result.changes > 0;
}

export function slugifyTemplateName(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 64);
}

export type CampaignKitRow = typeof campaignKits.$inferSelect;
export type NewCampaignKit = typeof campaignKits.$inferInsert;

export type CampaignKitItem = {
  platform: string;
  persona: string;
  format: string;
  title: string;
  body: string;
  hashtags: string[];
  cta: string;
  duration?: string;
  notes?: string;
};

export type CampaignKit = Omit<CampaignKitRow, "items"> & {
  items: CampaignKitItem[];
};

function rowToKit(row: CampaignKitRow): CampaignKit {
  let parsed: CampaignKitItem[] = [];
  try {
    const raw = JSON.parse(row.items);
    if (Array.isArray(raw)) {
      parsed = raw.filter((entry): entry is CampaignKitItem => {
        if (!entry || typeof entry !== "object") return false;
        const item = entry as Record<string, unknown>;
        return (
          typeof item.platform === "string" &&
          typeof item.persona === "string" &&
          typeof item.title === "string" &&
          typeof item.body === "string"
        );
      });
    }
  } catch {
    parsed = [];
  }
  return { ...row, items: parsed };
}

export function listCampaignKits(limit = 30): CampaignKit[] {
  const rows = db
    .select()
    .from(campaignKits)
    .orderBy(desc(campaignKits.generatedAt))
    .limit(limit)
    .all();
  return rows.map(rowToKit);
}

export function getCampaignKitBySlug(slug: string): CampaignKit | undefined {
  const row = db.select().from(campaignKits).where(eq(campaignKits.slug, slug)).get();
  return row ? rowToKit(row) : undefined;
}

export function createCampaignKit(input: NewCampaignKit): CampaignKit {
  const [row] = db.insert(campaignKits).values(input).returning().all();
  return rowToKit(row);
}

export function findTemplatesByContext(filters: {
  kind?: TemplateKind;
  formation?: string;
  eventName?: string;
  audience?: string;
}): Template[] {
  const conditions = [eq(templates.archived, false)];
  if (filters.kind) conditions.push(eq(templates.kind, filters.kind));
  if (filters.formation) conditions.push(eq(templates.formation, filters.formation));
  if (filters.eventName) conditions.push(eq(templates.eventName, filters.eventName));
  if (filters.audience) conditions.push(eq(templates.audience, filters.audience));

  const rows = db
    .select()
    .from(templates)
    .where(and(...conditions))
    .orderBy(asc(templates.name))
    .all();
  return rows.map(rowToTemplate);
}
