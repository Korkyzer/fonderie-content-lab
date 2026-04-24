import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import {
  buildNewsletterHtml,
  type NewsletterDraftPayload,
  type StoredNewsletterDraft,
} from "@/lib/newsletter";

const DEFAULT_DB_DIR =
  process.env.NODE_ENV === "production"
    ? join("/tmp", "fonderie-content-lab")
    : join(process.cwd(), "db");
const DB_PATH = process.env.NEWSLETTER_DB_PATH ?? join(DEFAULT_DB_DIR, "fonderie.db");

let database: DatabaseSync | null = null;

function getDb() {
  if (database) {
    return database;
  }

  mkdirSync(dirname(DB_PATH), { recursive: true });
  database = new DatabaseSync(DB_PATH);
  database.exec(`
    CREATE TABLE IF NOT EXISTS newsletter_drafts (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      template_key TEXT NOT NULL,
      payload TEXT NOT NULL,
      html TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  return database;
}

export function listNewsletterDrafts(): StoredNewsletterDraft[] {
  const db = getDb();
  const statement = db.prepare(`
    SELECT id, title, template_key, payload, html, updated_at
    FROM newsletter_drafts
    ORDER BY updated_at DESC
    LIMIT 12
  `);

  const rows = statement.all() as Array<{
    id: string;
    title: string;
    template_key: string;
    payload: string;
    html: string;
    updated_at: string;
  }>;

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    templateKey: row.template_key,
    payload: JSON.parse(row.payload) as NewsletterDraftPayload,
    html: row.html,
    updatedAt: row.updated_at,
  }));
}

export function saveNewsletterDraft(input: {
  id?: string;
  title: string;
  templateKey: string;
  payload: NewsletterDraftPayload;
}): StoredNewsletterDraft {
  const db = getDb();
  const draft: StoredNewsletterDraft = {
    id: input.id ?? randomUUID(),
    title: input.title,
    templateKey: input.templateKey,
    payload: input.payload,
    html: buildNewsletterHtml(input.payload),
    updatedAt: new Date().toISOString(),
  };

  const statement = db.prepare(`
    INSERT INTO newsletter_drafts (id, title, template_key, payload, html, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      template_key = excluded.template_key,
      payload = excluded.payload,
      html = excluded.html,
      updated_at = excluded.updated_at
  `);

  statement.run(
    draft.id,
    draft.title,
    draft.templateKey,
    JSON.stringify(draft.payload),
    draft.html,
    draft.updatedAt,
  );

  return draft;
}
