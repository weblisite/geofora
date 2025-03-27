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

// Main site pages schema
export const mainSitePages = pgTable("main_site_pages", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  pageType: text("page_type").notNull(), // e.g., 'product', 'blog', 'landing', etc.
  featuredImage: text("featured_image"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertMainSitePageSchema = createInsertSchema(mainSitePages).pick({
  title: true,
  slug: true,
  content: true,
  metaDescription: true,
  metaKeywords: true,
  pageType: true,
  featuredImage: true,
});

// Content interlinking schema (for bidirectional links between forum content and main site)
export const contentInterlinks = pgTable("content_interlinks", {
  id: serial("id").primaryKey(),
  sourceType: text("source_type").notNull(), // 'question', 'answer', 'main_page'
  sourceId: integer("source_id").notNull(),
  targetType: text("target_type").notNull(), // 'question', 'answer', 'main_page'
  targetId: integer("target_id").notNull(),
  anchorText: text("anchor_text"),
  relevanceScore: integer("relevance_score"),
  createdAt: timestamp("created_at").defaultNow(),
  createdByUserId: integer("created_by_user_id").references(() => users.id),
  automatic: boolean("automatic").default(false), // Whether link was auto-generated
});

export const insertContentInterlinkSchema = createInsertSchema(contentInterlinks).pick({
  sourceType: true,
  sourceId: true,
  targetType: true, 
  targetId: true,
  anchorText: true,
  relevanceScore: true,
  createdByUserId: true,
  automatic: true,
});

export type MainSitePage = typeof mainSitePages.$inferSelect;
export type InsertMainSitePage = z.infer<typeof insertMainSitePageSchema>;

export type ContentInterlink = typeof contentInterlinks.$inferSelect;
export type InsertContentInterlink = z.infer<typeof insertContentInterlinkSchema>;

// Extended type for pages with interlinked content
export type MainSitePageWithLinks = MainSitePage & {
  incomingLinks: ContentInterlink[];
  outgoingLinks: ContentInterlink[];
};

// Forums schema
export const forums = pgTable("forums", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  themeColor: text("theme_color").default("#3B82F6"),
  primaryFont: text("primary_font").default("Inter"),
  secondaryFont: text("secondary_font").default("Roboto"),
  headingFontSize: text("heading_font_size").default("1.5rem"),
  bodyFontSize: text("body_font_size").default("1rem"),
  mainWebsiteUrl: text("main_website_url"),
  subdomain: text("subdomain").unique(),
  customDomain: text("custom_domain").unique(),
  isPublic: boolean("is_public").default(true),
  requiresApproval: boolean("requires_approval").default(false),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertForumSchema = createInsertSchema(forums).pick({
  name: true,
  slug: true,
  description: true,
  themeColor: true,
  primaryFont: true,
  secondaryFont: true,
  headingFontSize: true,
  bodyFontSize: true,
  mainWebsiteUrl: true,
  subdomain: true,
  customDomain: true,
  isPublic: true,
  requiresApproval: true,
  userId: true,
});

// Forum domain verification schema
export const domainVerifications = pgTable("domain_verifications", {
  id: serial("id").primaryKey(),
  forumId: integer("forum_id").notNull().references(() => forums.id),
  domain: text("domain").notNull().unique(),
  verificationToken: text("verification_token").notNull(),
  isVerified: boolean("is_verified").default(false),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertDomainVerificationSchema = createInsertSchema(domainVerifications).pick({
  forumId: true,
  domain: true,
  verificationToken: true,
  isVerified: true,
  verifiedAt: true,
});

// Type exports for forums
export type Forum = typeof forums.$inferSelect;
export type InsertForum = z.infer<typeof insertForumSchema>;

export type DomainVerification = typeof domainVerifications.$inferSelect;
export type InsertDomainVerification = z.infer<typeof insertDomainVerificationSchema>;

// Extended type for forums with stats
export type ForumWithStats = Forum & {
  totalQuestions: number;
  totalAnswers: number;
};
