CREATE TABLE IF NOT EXISTS `brand_rules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`category` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`severity` text NOT NULL,
	`expected_value` text NOT NULL,
	`status` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `calendar_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`event_type` text NOT NULL,
	`platform` text NOT NULL,
	`campaign` text NOT NULL,
	`start_date` text NOT NULL,
	`end_date` text NOT NULL,
	`location` text,
	`ai_suggestion` text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `competitors` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`handle` text NOT NULL,
	`primary_platform` text NOT NULL,
	`monthly_posts` integer NOT NULL,
	`delta_percent` real NOT NULL,
	`positioning` text NOT NULL,
	`opportunity` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `content_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`format` text NOT NULL,
	`platform` text NOT NULL,
	`campaign` text NOT NULL,
	`persona` text NOT NULL,
	`status` text NOT NULL,
	`due_date` text NOT NULL,
	`published_at` text,
	`owner` text NOT NULL,
	`ai_score` integer,
	`brand_score` integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `kanban_cards` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`column_id` text NOT NULL,
	`title` text NOT NULL,
	`platform` text NOT NULL,
	`persona` text NOT NULL,
	`campaign` text NOT NULL,
	`assignee` text NOT NULL,
	`due_date` text NOT NULL,
	`ai_progress` integer,
	`brand_score` integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `personas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`label` text NOT NULL,
	`avatar_initial` text NOT NULL,
	`avatar_color` text NOT NULL,
	`audience_size` text NOT NULL,
	`performance` text NOT NULL,
	`tone_of_voice` text NOT NULL,
	`age_range` text NOT NULL,
	`location_label` text NOT NULL,
	`education_level` text NOT NULL,
	`preferred_platforms` text NOT NULL,
	`vocabulary_yes` text NOT NULL,
	`vocabulary_no` text NOT NULL,
	`goals` text NOT NULL,
	`pain_points` text NOT NULL,
	`key_messages` text NOT NULL,
	`engagement_rate` text NOT NULL,
	`best_hour` text NOT NULL,
	`top_content` text NOT NULL,
	`recommendations` text NOT NULL,
	`sample_brief` text NOT NULL,
	`sample_copy` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS `prompts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text NOT NULL,
	`audience` text NOT NULL,
	`platform` text NOT NULL,
	`tone` text NOT NULL,
	`rating` real NOT NULL,
	`monthly_usage` integer NOT NULL,
	`variables` text NOT NULL,
	`body` text NOT NULL,
	`author` text NOT NULL,
	`favorite` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
