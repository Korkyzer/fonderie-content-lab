import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable(
  "users",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    role: text("role").notNull(),
    avatarUrl: text("avatar_url"),
    createdAt: text("created_at")
      .notNull()
      .default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => ({
    emailIdx: uniqueIndex("users_email_idx").on(table.email),
  }),
);

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
  priority: text("priority").notNull().default("normal"),
  reviewerId: text("reviewer_id"),
  deadline: text("deadline"),
});

export const kanbanComments = sqliteTable("kanban_comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cardId: integer("card_id").notNull(),
  author: text("author").notNull(),
  content: text("content").notNull(),
  createdAt: text("created_at").notNull(),
});

export const kanbanTransitions = sqliteTable("kanban_transitions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cardId: integer("card_id").notNull(),
  fromStatus: text("from_status"),
  toStatus: text("to_status").notNull(),
  user: text("user").notNull(),
  createdAt: text("created_at").notNull(),
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

export const competitorInsights = sqliteTable("competitor_insights", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  handle: text("handle").notNull(),
  summary: text("summary").notNull(),
  highlights: text("highlights").notNull(),
  opportunity: text("opportunity").notNull(),
  source: text("source").notNull(),
  generatedAt: text("generated_at").notNull(),
});

export const competitorMetrics = sqliteTable("competitor_metrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  handle: text("handle").notNull(),
  platform: text("platform").notNull(),
  weekStart: text("week_start").notNull(),
  posts: integer("posts").notNull(),
  engagementRate: real("engagement_rate").notNull(),
  reach: integer("reach").notNull(),
});

export const competitiveAlerts = sqliteTable("competitive_alerts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  handle: text("handle").notNull(),
  severity: text("severity").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  source: text("source").notNull(),
  dismissed: integer("dismissed", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at").notNull(),
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

<<<<<<< HEAD
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

export const alumni = sqliteTable("alumni", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  graduationYear: integer("graduation_year").notNull(),
  currentRole: text("current_role").notNull(),
  company: text("company").notNull(),
  skills: text("skills").notNull(),
  bio: text("bio").notNull(),
});

export const partners = sqliteTable("partners", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  sector: text("sector").notNull(),
  partnershipType: text("partnership_type").notNull(),
  contactEmail: text("contact_email").notNull(),
  description: text("description").notNull(),
});

export const references = sqliteTable("references", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  url: text("url").notNull(),
  category: text("category").notNull(),
  tags: text("tags").notNull(),
  notes: text("notes").notNull(),
  score: integer("score").notNull(),
  createdAt: text("created_at").notNull(),
});
