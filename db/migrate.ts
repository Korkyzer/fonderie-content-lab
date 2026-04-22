import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";

import { migrate } from "drizzle-orm/better-sqlite3/migrator";

import { db, sqlite } from "@/db/index";

const PROMPT_BACKFILL_COLUMNS = [
  "slug",
  "description",
  "audience",
  "platform",
  "tone",
  "favorite",
  "created_at",
  "updated_at",
] as const;

const PERSONA_BACKFILL_COLUMNS = [
  "slug",
  "label",
  "avatar_initial",
  "avatar_color",
  "age_range",
  "location_label",
  "education_level",
  "goals",
  "pain_points",
  "key_messages",
  "engagement_rate",
  "top_content",
  "recommendations",
  "sample_brief",
  "sample_copy",
] as const;

type TableInfoRow = {
  name: string;
};

function tableExists(tableName: string): boolean {
  const row = sqlite
    .prepare(
      "select name from sqlite_master where type = 'table' and name = ? limit 1",
    )
    .get(tableName);

  return row !== undefined;
}

function getColumnSet(tableName: string): Set<string> {
  if (!tableExists(tableName)) {
    return new Set();
  }

  const rows = sqlite.prepare(`pragma table_info(\`${tableName}\`)`).all() as TableInfoRow[];
  return new Set(rows.map((row) => row.name));
}

function hasBackfillColumns(tableName: string, columns: readonly string[]): boolean {
  const availableColumns = getColumnSet(tableName);
  return columns.every((column) => availableColumns.has(column));
}

function getMigrationHash(fileName: string): string {
  const filePath = path.join(process.cwd(), "drizzle", fileName);
  const contents = readFileSync(filePath, "utf8");
  return createHash("sha256").update(contents).digest("hex");
}

function ensureBackfillMigrationIsTracked(): void {
  if (!tableExists("__drizzle_migrations")) {
    return;
  }

  const backfillHash = getMigrationHash("0001_prompt_persona_backfill.sql");
  const applied = sqlite
    .prepare("select 1 from __drizzle_migrations where hash = ? limit 1")
    .get(backfillHash);

  if (applied) {
    return;
  }

  const promptsReady = hasBackfillColumns("prompts", PROMPT_BACKFILL_COLUMNS);
  const personasReady = hasBackfillColumns("personas", PERSONA_BACKFILL_COLUMNS);

  if (!promptsReady || !personasReady) {
    return;
  }

  sqlite
    .prepare("insert into __drizzle_migrations (hash, created_at) values (?, ?)")
    .run(backfillHash, Date.now());
}

ensureBackfillMigrationIsTracked();
migrate(db, { migrationsFolder: "./drizzle" });
sqlite.close();
