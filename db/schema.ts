import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users_table', {
	id: int().primaryKey({ autoIncrement: true }),
	name: text().notNull(),
	username: text().notNull().unique(),
	level: int().$default(() => 1),
	email: text().notNull().unique(),
	points: int().$default(() => 0),
	avatar: text().$default(() => '👤'),
});

export const GamesTracker = sqliteTable('games_tracker', {
	id: int().primaryKey({ autoIncrement: true }),
	game_id: int().notNull(),
	category: text().notNull(),
	user_id: int().notNull(),
	score: int().$default(() => 0),
	created_at: text().$default(() => new Date().toISOString()),
	updated_at: text().$default(() => new Date().toISOString()),
});

export const Leaderboard = sqliteTable('leaderboard', {
	id: int().primaryKey({ autoIncrement: true }),
	user_id: int().notNull(),
	score: int().$default(() => 0),
	created_at: text().$default(() => new Date().toISOString()),
	updated_at: text().$default(() => new Date().toISOString()),
});

export const UserPreferences = sqliteTable('user_preferences', {
	id: int().primaryKey({ autoIncrement: true }),
	user_id: int().notNull(),
	preference: text().notNull(),
	value: text().notNull(),
	created_at: text().$default(() => new Date().toISOString()),
	updated_at: text().$default(() => new Date().toISOString()),
});
