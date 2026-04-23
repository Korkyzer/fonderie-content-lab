CREATE TABLE `templates` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`kind` text NOT NULL,
	`formation` text,
	`event_name` text,
	`audience` text,
	`platform` text NOT NULL,
	`tone` text NOT NULL,
	`visual_style` text NOT NULL,
	`duration` text NOT NULL,
	`cta` text NOT NULL,
	`structure` text NOT NULL,
	`assets` text NOT NULL,
	`brief_seed` text NOT NULL,
	`archived` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `templates_slug_unique` ON `templates` (`slug`);
--> statement-breakpoint
CREATE TABLE `campaign_kits` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`slug` text NOT NULL,
	`objective` text NOT NULL,
	`formation` text,
	`event_name` text,
	`template_slug` text,
	`source` text NOT NULL,
	`items` text NOT NULL,
	`tokens_used` integer,
	`generated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `campaign_kits_slug_unique` ON `campaign_kits` (`slug`);
