import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  displayName: text("display_name"),
  profileTitle: text("profile_title"),
  score: integer("score").default(0),
  rank: integer("rank").default(0)
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").notNull(),
  color: text("color")
});

export const insertCategorySchema = createInsertSchema(categories);

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  categoryId: integer("category_id").notNull(),
  text: text("text").notNull(),
  difficulty: text("difficulty").notNull(),
  explanation: text("explanation")
});

export const insertQuestionSchema = createInsertSchema(questions);

export const options = pgTable("options", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull(),
  text: text("text").notNull(),
  isCorrect: boolean("is_correct").notNull()
});

export const insertOptionSchema = createInsertSchema(options);

export const quizAttempts = pgTable("quiz_attempts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  categoryId: integer("category_id").notNull(),
  score: integer("score").notNull(),
  correctAnswers: integer("correct_answers").notNull(),
  totalQuestions: integer("total_questions").notNull(),
  timeTaken: integer("time_taken").notNull(),
  completedAt: timestamp("completed_at").notNull()
});

export const insertQuizAttemptSchema = createInsertSchema(quizAttempts);

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  requirement: text("requirement").notNull()
});

export const insertAchievementSchema = createInsertSchema(achievements);

export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  achievementId: integer("achievement_id").notNull(),
  unlockedAt: timestamp("unlocked_at").notNull()
});

export const insertUserAchievementSchema = createInsertSchema(userAchievements);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type Category = typeof categories.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Option = typeof options.$inferSelect;
export type QuizAttempt = typeof quizAttempts.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
export type UserAchievement = typeof userAchievements.$inferSelect;

export type QuestionWithOptions = Question & {
  options: Option[];
};

export type Quiz = {
  category: Category;
  questions: QuestionWithOptions[];
};
