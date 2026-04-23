CREATE TABLE `alumni` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`graduation_year` integer NOT NULL,
	`current_role` text NOT NULL,
	`company` text NOT NULL,
	`skills` text NOT NULL,
	`bio` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `partners` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`sector` text NOT NULL,
	`partnership_type` text NOT NULL,
	`contact_email` text NOT NULL,
	`description` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `references` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`url` text NOT NULL,
	`category` text NOT NULL,
	`tags` text NOT NULL,
	`notes` text NOT NULL,
	`score` integer NOT NULL,
	`created_at` text NOT NULL
);
