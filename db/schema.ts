import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const contentItems = sqliteTable("content_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  format: text("format").notNull(),
  platform: text("platform").notNull(),
  campaign: text("campaign").notNull(),
  persona: text("persona").notNull(),
  status: text("status").notNull(),
  dueDate: text("due_date").notNull(),
  publishedAt: text("published_at"),
  owner: text("owner").notNull(),
  aiScore: integer("ai_score"),
  brandScore: integer("brand_score"),
});

export const brandRules = sqliteTable("brand_rules", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  category: text("category").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  severity: text("severity").notNull(),
  expectedValue: text("expected_value").notNull(),
  status: text("status").notNull(),
});

export const kanbanCards = sqliteTable("kanban_cards", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  columnId: text("column_id").notNull(),
  title: text("title").notNull(),
  platform: text("platform").notNull(),
  persona: text("persona").notNull(),
  campaign: text("campaign").notNull(),
  assignee: text("assignee").notNull(),
  dueDate: text("due_date").notNull(),
  aiProgress: integer("ai_progress"),
  brandScore: integer("brand_score"),
});

export const calendarEvents = sqliteTable("calendar_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  eventType: text("event_type").notNull(),
  platform: text("platform").notNull(),
  campaign: text("campaign").notNull(),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  location: text("location"),
  aiSuggestion: text("ai_suggestion"),
});

export const competitors = sqliteTable("competitors", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  handle: text("handle").notNull(),
  primaryPlatform: text("primary_platform").notNull(),
  monthlyPosts: integer("monthly_posts").notNull(),
  deltaPercent: real("delta_percent").notNull(),
  positioning: text("positioning").notNull(),
  opportunity: text("opportunity").notNull(),
});

export const prompts = sqliteTable("prompts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  category: text("category").notNull(),
  rating: real("rating").notNull(),
  monthlyUsage: integer("monthly_usage").notNull(),
  variables: text("variables").notNull(),
  body: text("body").notNull(),
  author: text("author").notNull(),
});

export const personas = sqliteTable("personas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  audienceSize: text("audience_size").notNull(),
  performance: text("performance").notNull(),
  toneOfVoice: text("tone_of_voice").notNull(),
  preferredPlatforms: text("preferred_platforms").notNull(),
  vocabularyYes: text("vocabulary_yes").notNull(),
  vocabularyNo: text("vocabulary_no").notNull(),
  bestHour: text("best_hour").notNull(),
});
