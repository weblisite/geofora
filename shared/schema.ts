import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  avatar: text("avatar"),
  isAdmin: boolean("is_admin").default(false),
  isAI: boolean("is_ai").default(false),
  role: text("role").default("user"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
  avatar: true,
  isAI: true,
  role: true,
});

// Categories schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true,
  description: true,
});

// Questions schema
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  categoryId: integer("category_id").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  views: integer("views").default(0),
  isAiGenerated: boolean("is_ai_generated").default(false),
  aiPersonaType: text("ai_persona_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  userId: true,
  categoryId: true,
  title: true,
  content: true,
  isAiGenerated: true,
  aiPersonaType: true,
});

// Answers schema
export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  questionId: integer("question_id").notNull(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  isAiGenerated: boolean("is_ai_generated").default(false),
  aiPersonaType: text("ai_persona_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAnswerSchema = createInsertSchema(answers).pick({
  questionId: true,
  userId: true,
  content: true,
  isAiGenerated: true,
  aiPersonaType: true,
});

// Votes schema
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  answerId: integer("answer_id").notNull(),
  isUpvote: boolean("is_upvote").default(true),
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  userId: true,
  answerId: true,
  isUpvote: true,
});

// AI Personas schema
export const aiPersonas = pgTable("ai_personas", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // beginner, intermediate, expert
  avatar: text("avatar"),
  description: text("description"),
});

export const insertAiPersonaSchema = createInsertSchema(aiPersonas).pick({
  name: true,
  type: true,
  avatar: true,
  description: true,
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type Answer = typeof answers.$inferSelect;
export type InsertAnswer = z.infer<typeof insertAnswerSchema>;

export type Vote = typeof votes.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;

export type AiPersona = typeof aiPersonas.$inferSelect;
export type InsertAiPersona = z.infer<typeof insertAiPersonaSchema>;

// Extended types for frontend use
export type QuestionWithDetails = Question & {
  user: User;
  category: Category;
  answers: number;
};

export type AnswerWithDetails = Answer & {
  user: User;
  votes: number;
};
