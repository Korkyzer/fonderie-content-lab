CREATE TABLE `competitor_insights` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`handle` text NOT NULL,
	`summary` text NOT NULL,
	`highlights` text NOT NULL,
	`opportunity` text NOT NULL,
	`source` text NOT NULL,
	`generated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `competitor_metrics` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`handle` text NOT NULL,
	`platform` text NOT NULL,
	`week_start` text NOT NULL,
	`posts` integer NOT NULL,
	`engagement_rate` real NOT NULL,
	`reach` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `competitive_alerts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`handle` text NOT NULL,
	`severity` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`source` text NOT NULL,
	`dismissed` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);
