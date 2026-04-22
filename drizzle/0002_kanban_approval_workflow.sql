ALTER TABLE `kanban_cards` ADD `priority` text NOT NULL DEFAULT 'normal';
--> statement-breakpoint
ALTER TABLE `kanban_cards` ADD `reviewer_id` text;
--> statement-breakpoint
ALTER TABLE `kanban_cards` ADD `deadline` text;
--> statement-breakpoint
CREATE TABLE `kanban_comments` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `card_id` integer NOT NULL,
  `author` text NOT NULL,
  `content` text NOT NULL,
  `created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `kanban_transitions` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `card_id` integer NOT NULL,
  `from_status` text,
  `to_status` text NOT NULL,
  `user` text NOT NULL,
  `created_at` text NOT NULL
);
