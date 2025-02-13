CREATE TABLE `games_tracker` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_id` integer NOT NULL,
	`category` text NOT NULL,
	`user_id` integer NOT NULL,
	`score` integer,
	`created_at` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `leaderboard` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`score` integer,
	`created_at` text,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `user_preferences` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`preference` text NOT NULL,
	`value` text NOT NULL,
	`created_at` text,
	`updated_at` text
);
--> statement-breakpoint
ALTER TABLE `users_table` ADD `username` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users_table` ADD `level` integer;--> statement-breakpoint
ALTER TABLE `users_table` ADD `points` integer;--> statement-breakpoint
ALTER TABLE `users_table` ADD `avatar` text;--> statement-breakpoint
CREATE UNIQUE INDEX `users_table_username_unique` ON `users_table` (`username`);--> statement-breakpoint
ALTER TABLE `users_table` DROP COLUMN `age`;