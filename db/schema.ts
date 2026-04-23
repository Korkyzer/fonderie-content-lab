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
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  audience: text("audience").notNull(),
  platform: text("platform").notNull(),
  tone: text("tone").notNull(),
  rating: real("rating").notNull(),
  monthlyUsage: integer("monthly_usage").notNull(),
  variables: text("variables").notNull(),
  body: text("body").notNull(),
  author: text("author").notNull(),
  favorite: integer("favorite", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const personas = sqliteTable("personas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  label: text("label").notNull(),
  avatarInitial: text("avatar_initial").notNull(),
  avatarColor: text("avatar_color").notNull(),
  audienceSize: text("audience_size").notNull(),
  performance: text("performance").notNull(),
  toneOfVoice: text("tone_of_voice").notNull(),
  ageRange: text("age_range").notNull(),
  locationLabel: text("location_label").notNull(),
  educationLevel: text("education_level").notNull(),
  // TODO(fcl-12): normalize persona list fields into child tables if this
  // moves beyond seeded demo data. The current CSV storage keeps the shipping
  // scope small, but it blocks relational filtering and referential integrity.
  preferredPlatforms: text("preferred_platforms").notNull(),
  vocabularyYes: text("vocabulary_yes").notNull(),
  vocabularyNo: text("vocabulary_no").notNull(),
  goals: text("goals").notNull(),
  painPoints: text("pain_points").notNull(),
  keyMessages: text("key_messages").notNull(),
  engagementRate: text("engagement_rate").notNull(),
  bestHour: text("best_hour").notNull(),
  topContent: text("top_content").notNull(),
  recommendations: text("recommendations").notNull(),
  sampleBrief: text("sample_brief").notNull(),
  sampleCopy: text("sample_copy").notNull(),
});

export const templates = sqliteTable("templates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  kind: text("kind").notNull(),
  formation: text("formation"),
  eventName: text("event_name"),
  audience: text("audience"),
  platform: text("platform").notNull(),
  tone: text("tone").notNull(),
  visualStyle: text("visual_style").notNull(),
  duration: text("duration").notNull(),
  cta: text("cta").notNull(),
  structure: text("structure").notNull(),
  assets: text("assets").notNull(),
  briefSeed: text("brief_seed").notNull(),
  archived: integer("archived", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const campaignKits = sqliteTable("campaign_kits", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull(),
  objective: text("objective").notNull(),
  formation: text("formation"),
  eventName: text("event_name"),
  templateSlug: text("template_slug"),
  source: text("source").notNull(),
  items: text("items").notNull(),
  tokensUsed: integer("tokens_used"),
  generatedAt: text("generated_at").notNull(),
});
