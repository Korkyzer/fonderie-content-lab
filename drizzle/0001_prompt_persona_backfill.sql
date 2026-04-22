ALTER TABLE `prompts` ADD `slug` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `prompts` ADD `description` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `prompts` ADD `audience` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `prompts` ADD `platform` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `prompts` ADD `tone` text NOT NULL DEFAULT 'purple';
--> statement-breakpoint
ALTER TABLE `prompts` ADD `favorite` integer DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE `prompts` ADD `created_at` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `prompts` ADD `updated_at` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `personas` ADD `slug` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `personas` ADD `label` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `personas` ADD `avatar_initial` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `personas` ADD `avatar_color` text NOT NULL DEFAULT 'purple';
--> statement-breakpoint
ALTER TABLE `personas` ADD `age_range` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `personas` ADD `location_label` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `personas` ADD `education_level` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `personas` ADD `goals` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `personas` ADD `pain_points` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `personas` ADD `key_messages` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `personas` ADD `engagement_rate` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `personas` ADD `top_content` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `personas` ADD `recommendations` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `personas` ADD `sample_brief` text NOT NULL DEFAULT '';
--> statement-breakpoint
ALTER TABLE `personas` ADD `sample_copy` text NOT NULL DEFAULT '';
