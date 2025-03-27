import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Roles schema with defined role types
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Individual permissions that can be assigned to roles
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  scope: text("scope").notNull(), // 'global', 'forum', 'category', 'thread'
  action: text("action").notNull(), // 'create', 'read', 'update', 'delete', 'moderate'
  createdAt: timestamp("created_at").defaultNow(),
});

// Junction table for role-permission relationships
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").notNull().references(() => roles.id),
  permissionId: integer("permission_id").notNull().references(() => permissions.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  displayName: text("display_name"),
  avatar: text("avatar"),
  isAdmin: boolean("is_admin").default(false), // Kept for backward compatibility
  isAI: boolean("is_ai").default(false),
  roleId: integer("role_id").references(() => roles.id), // Reference to the roles table
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
  status: text("status").default("active"), // 'active', 'suspended', 'banned'
});

// User-forum role assignments for forum-specific roles
export const userForumRoles = pgTable("user_forum_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  forumId: integer("forum_id").notNull().references(() => forums.id),
  roleId: integer("role_id").notNull().references(() => roles.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertRoleSchema = createInsertSchema(roles).pick({
  name: true,
  description: true,
});

export const insertPermissionSchema = createInsertSchema(permissions).pick({
  name: true,
  description: true,
  scope: true,
  action: true,
});

export const insertRolePermissionSchema = createInsertSchema(rolePermissions).pick({
  roleId: true,
  permissionId: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  displayName: true,
  avatar: true,
  isAI: true,
  roleId: true,
  status: true,
});

export const insertUserForumRoleSchema = createInsertSchema(userForumRoles).pick({
  userId: true,
  forumId: true,
  roleId: true,
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
export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;

export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type UserForumRole = typeof userForumRoles.$inferSelect;
export type InsertUserForumRole = z.infer<typeof insertUserForumRoleSchema>;

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

// SEO Keywords tracking schema
export const seoKeywords = pgTable("seo_keywords", {
  id: serial("id").primaryKey(),
  forumId: integer("forum_id").notNull().references(() => forums.id),
  keyword: text("keyword").notNull(),
  url: text("url").notNull(), // URL being tracked for this keyword
  searchVolume: integer("search_volume"),
  difficulty: integer("difficulty"), // 0-100 scale indicating how competitive the keyword is
  priority: integer("priority").default(0), // 0-10 scale for prioritizing keywords
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastCheckedAt: timestamp("last_checked_at"),
  notes: text("notes"),
  serp_features: text("serp_features"), // JSON string of SERP features (featured snippets, image packs, etc.)
  intent: text("intent"), // informational, navigational, commercial, transactional
  stage: text("stage"), // awareness, consideration, decision
});

// SEO Positions tracking schema - historical record of keyword positions
export const seoPositions = pgTable("seo_positions", {
  id: serial("id").primaryKey(),
  keywordId: integer("keyword_id").notNull().references(() => seoKeywords.id),
  position: integer("position").notNull(),
  date: date("date").notNull(),
  previousPosition: integer("previous_position"),
  change: integer("change"), // + or - number indicating the change from previous check
  clicks: integer("clicks"), // Estimated clicks from this keyword (from Search Console)
  impressions: integer("impressions"), // Estimated impressions from this keyword
  ctr: real("ctr"), // Click-through rate as a decimal (0.0-1.0)
  device: text("device").default("desktop"), // desktop, mobile, tablet
  location: text("location").default("global"), // Country or region code
});

// SEO Page metrics schema
export const seoPageMetrics = pgTable("seo_page_metrics", {
  id: serial("id").primaryKey(),
  forumId: integer("forum_id").notNull().references(() => forums.id),
  url: text("url").notNull(), // Relative URL of the page
  incomingLinks: integer("incoming_links").default(0), // Count of internal links to this page
  outgoingLinks: integer("outgoing_links").default(0), // Count of internal links from this page
  totalWordCount: integer("total_word_count"), 
  metaQualityScore: real("meta_quality_score"), // Score 0-1 for meta title/description quality
  keywordDensity: jsonb("keyword_density"), // JSON of keyword density data
  readabilityScore: real("readability_score"), // Score 0-100 based on readability metrics
  pageSpeed: jsonb("page_speed"), // JSON object with page speed metrics
  organicTraffic: integer("organic_traffic"), // Estimated monthly organic traffic
  lastAnalyzedAt: timestamp("last_analyzed_at"),
  contentQualityScore: real("content_quality_score"), // AI-scored metric for overall content quality
});

// SEO Content gaps schema
export const seoContentGaps = pgTable("seo_content_gaps", {
  id: serial("id").primaryKey(),
  forumId: integer("forum_id").notNull().references(() => forums.id),
  topic: text("topic").notNull(), // The topic with identified gap
  competitorCoverage: text("competitor_coverage"), // How competitors are covering this topic
  searchVolume: integer("search_volume"), 
  opportunityScore: integer("opportunity_score"), // 0-100 scale for potential impact
  recommendedKeywords: text("recommended_keywords"), // JSON string of recommended keywords
  contentSuggestion: text("content_suggestion"), // AI suggestion for content to fill gap
  isAddressed: boolean("is_addressed").default(false), // Whether this gap has been addressed
  targetUrl: text("target_url"), // URL of created content addressing the gap (if any)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SEO Weekly reports schema
export const seoWeeklyReports = pgTable("seo_weekly_reports", {
  id: serial("id").primaryKey(),
  forumId: integer("forum_id").notNull().references(() => forums.id),
  reportDate: date("report_date").notNull(),
  avgPosition: real("avg_position"), 
  topTenKeywords: integer("top_ten_keywords"), // Count of keywords in top 10
  topThreeKeywords: integer("top_three_keywords"), // Count of keywords in top 3
  totalKeywords: integer("total_keywords"), 
  organicTraffic: integer("organic_traffic"),
  previousOrganicTraffic: integer("previous_organic_traffic"),
  trafficChange: real("traffic_change"), // Percentage change in traffic
  topPerformingUrls: jsonb("top_performing_urls"), // JSON object of top URLs
  topRisingKeywords: jsonb("top_rising_keywords"), // JSON object of keywords with biggest gains
  topDecliningKeywords: jsonb("top_declining_keywords"), // JSON object of keywords with biggest losses
  recommendedActions: text("recommended_actions"), // AI-generated recommendations
  reportData: jsonb("report_data"), // Full JSON data for the report
});

// Schemas for inserting data
export const insertSeoKeywordSchema = createInsertSchema(seoKeywords).pick({
  forumId: true,
  keyword: true,
  url: true,
  searchVolume: true,
  difficulty: true,
  priority: true,
  isActive: true,
  notes: true,
  serp_features: true,
  intent: true,
  stage: true,
});

export const insertSeoPositionSchema = createInsertSchema(seoPositions).pick({
  keywordId: true,
  position: true,
  date: true,
  previousPosition: true,
  change: true,
  clicks: true,
  impressions: true,
  ctr: true,
  device: true,
  location: true,
});

export const insertSeoPageMetricSchema = createInsertSchema(seoPageMetrics).pick({
  forumId: true,
  url: true,
  incomingLinks: true,
  outgoingLinks: true,
  totalWordCount: true,
  metaQualityScore: true,
  keywordDensity: true,
  readabilityScore: true,
  pageSpeed: true,
  organicTraffic: true,
  contentQualityScore: true,
});

export const insertSeoContentGapSchema = createInsertSchema(seoContentGaps).pick({
  forumId: true,
  topic: true,
  competitorCoverage: true,
  searchVolume: true,
  opportunityScore: true,
  recommendedKeywords: true,
  contentSuggestion: true,
  isAddressed: true,
  targetUrl: true,
});

export const insertSeoWeeklyReportSchema = createInsertSchema(seoWeeklyReports).pick({
  forumId: true,
  reportDate: true,
  avgPosition: true,
  topTenKeywords: true,
  topThreeKeywords: true,
  totalKeywords: true,
  organicTraffic: true,
  previousOrganicTraffic: true,
  trafficChange: true,
  topPerformingUrls: true,
  topRisingKeywords: true,
  topDecliningKeywords: true,
  recommendedActions: true,
  reportData: true,
});

// Type exports for SEO
export type SeoKeyword = typeof seoKeywords.$inferSelect;
export type InsertSeoKeyword = z.infer<typeof insertSeoKeywordSchema>;

export type SeoPosition = typeof seoPositions.$inferSelect;
export type InsertSeoPosition = z.infer<typeof insertSeoPositionSchema>;

export type SeoPageMetric = typeof seoPageMetrics.$inferSelect;
export type InsertSeoPageMetric = z.infer<typeof insertSeoPageMetricSchema>;

export type SeoContentGap = typeof seoContentGaps.$inferSelect;
export type InsertSeoContentGap = z.infer<typeof insertSeoContentGapSchema>;

export type SeoWeeklyReport = typeof seoWeeklyReports.$inferSelect;
export type InsertSeoWeeklyReport = z.infer<typeof insertSeoWeeklyReportSchema>;

// Extended types for frontend use
export type SeoKeywordWithPositionHistory = SeoKeyword & {
  positionHistory: SeoPosition[];
  latestPosition?: SeoPosition;
};

export type SeoWeeklyReportWithDetails = SeoWeeklyReport & {
  keywordMovements: {
    rising: {keyword: string, change: number, position: number}[];
    declining: {keyword: string, change: number, position: number}[];
    new: {keyword: string, position: number}[];
  };
};

// Lead Capture Forms schema
export const leadCaptureForms = pgTable("lead_capture_forms", {
  id: serial("id").primaryKey(),
  forumId: integer("forum_id").notNull().references(() => forums.id),
  name: text("name").notNull(),
  description: text("description"),
  formFields: text("form_fields").notNull(), // JSON encoded string of field definitions
  submitButtonText: text("submit_button_text").default("Submit"),
  successMessage: text("success_message").default("Thank you for your submission!"),
  redirectUrl: text("redirect_url"), // Optional URL to redirect after form submission
  isActive: boolean("is_active").default(true),
  formType: text("form_type").default("inline"), // inline, popup, gated
  gatedContentId: integer("gated_content_id"), // If this is a gated content form, reference to content
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLeadCaptureFormSchema = createInsertSchema(leadCaptureForms).pick({
  forumId: true,
  name: true,
  description: true,
  formFields: true,
  submitButtonText: true,
  successMessage: true,
  redirectUrl: true,
  isActive: true,
  formType: true,
  gatedContentId: true,
});

// Lead Capture Submissions schema
export const leadSubmissions = pgTable("lead_submissions", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").notNull().references(() => leadCaptureForms.id),
  formData: text("form_data").notNull(), // JSON encoded string of form submission data
  email: text("email").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  isExported: boolean("is_exported").default(false), // Track if exported to CRM
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLeadSubmissionSchema = createInsertSchema(leadSubmissions).pick({
  formId: true,
  formData: true,
  email: true,
  firstName: true,
  lastName: true,
  ipAddress: true,
  userAgent: true,
  isExported: true,
});

// Gated Content schema
export const gatedContents = pgTable("gated_contents", {
  id: serial("id").primaryKey(),
  forumId: integer("forum_id").notNull().references(() => forums.id),
  title: text("title").notNull(),
  description: text("description"),
  teaser: text("teaser").notNull(), // Content preview shown before form submission
  content: text("content").notNull(), // Full content revealed after form submission
  formId: integer("form_id").references(() => leadCaptureForms.id),
  isActive: boolean("is_active").default(true),
  contentType: text("content_type").default("article"), // article, guide, whitepaper, video, etc.
  featuredImage: text("featured_image"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertGatedContentSchema = createInsertSchema(gatedContents).pick({
  forumId: true,
  title: true,
  description: true,
  teaser: true,
  content: true,
  formId: true,
  isActive: true,
  contentType: true,
  featuredImage: true,
  metaDescription: true,
  metaKeywords: true,
  slug: true,
});

// CRM Integration schema
export const crmIntegrations = pgTable("crm_integrations", {
  id: serial("id").primaryKey(),
  forumId: integer("forum_id").notNull().references(() => forums.id),
  provider: text("provider").notNull(), // mailchimp, hubspot, salesforce, etc.
  apiKey: text("api_key"), // Encrypted API key
  apiSecret: text("api_secret"), // Encrypted API secret if needed
  listId: text("list_id"), // Target list or audience ID in the CRM
  webhookUrl: text("webhook_url"), // Optional webhook for data sync
  mappingRules: text("mapping_rules"), // JSON encoded field mapping rules
  isActive: boolean("is_active").default(true),
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertCrmIntegrationSchema = createInsertSchema(crmIntegrations).pick({
  forumId: true,
  provider: true,
  apiKey: true,
  apiSecret: true,
  listId: true,
  webhookUrl: true,
  mappingRules: true,
  isActive: true,
  lastSyncedAt: true,
});

// Lead Form View Tracking schema
export const leadFormViews = pgTable("lead_form_views", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").notNull().references(() => leadCaptureForms.id),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  referrer: text("referrer"),
  isConversion: boolean("is_conversion").default(false), // Whether view led to submission
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLeadFormViewSchema = createInsertSchema(leadFormViews).pick({
  formId: true,
  ipAddress: true,
  userAgent: true,
  referrer: true,
  isConversion: true,
});

// Type exports for lead capture
export type LeadCaptureForm = typeof leadCaptureForms.$inferSelect;
export type InsertLeadCaptureForm = z.infer<typeof insertLeadCaptureFormSchema>;

export type LeadSubmission = typeof leadSubmissions.$inferSelect;
export type InsertLeadSubmission = z.infer<typeof insertLeadSubmissionSchema>;

export type GatedContent = typeof gatedContents.$inferSelect;
export type InsertGatedContent = z.infer<typeof insertGatedContentSchema>;

export type CrmIntegration = typeof crmIntegrations.$inferSelect;
export type InsertCrmIntegration = z.infer<typeof insertCrmIntegrationSchema>;

export type LeadFormView = typeof leadFormViews.$inferSelect;
export type InsertLeadFormView = z.infer<typeof insertLeadFormViewSchema>;

// Extended types for lead capture forms with stats
export type LeadCaptureFormWithStats = LeadCaptureForm & {
  totalViews: number;
  totalSubmissions: number;
  conversionRate: number;
};

// Content Schedule schema
export const contentSchedules = pgTable("content_schedules", {
  id: serial("id").primaryKey(),
  forumId: integer("forum_id").notNull().references(() => forums.id),
  title: text("title").notNull(),
  contentType: text("content_type").notNull(), // "question", "answer", "both"
  keyword: text("keyword").notNull(),
  scheduledFor: timestamp("scheduled_for").notNull(),
  personaType: text("persona_type").default("expert"), // "beginner", "intermediate", "expert", "moderator"
  status: text("status").default("scheduled"), // "scheduled", "published", "failed", "cancelled"
  isRecurring: boolean("is_recurring").default(false),
  recurrencePattern: text("recurrence_pattern"), // JSON string with recurrence details
  categoryId: integer("category_id").references(() => categories.id),
  questionsCount: integer("questions_count").default(1),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  publishedAt: timestamp("published_at"),
  questionIds: text("question_ids"), // JSON array of created question IDs
});

export const insertContentScheduleSchema = createInsertSchema(contentSchedules).pick({
  forumId: true,
  title: true,
  contentType: true,
  keyword: true,
  scheduledFor: true,
  personaType: true,
  status: true,
  isRecurring: true,
  recurrencePattern: true,
  categoryId: true,
  questionsCount: true,
  userId: true,
});

export type ContentSchedule = typeof contentSchedules.$inferSelect;
export type InsertContentSchedule = z.infer<typeof insertContentScheduleSchema>;

// Extended type for content schedules with status info
export type ContentScheduleWithDetails = ContentSchedule & {
  forum: Forum;
  category?: Category;
  questionsGenerated?: number;
  answersGenerated?: number;
};
