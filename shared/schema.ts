import { pgTable, text, serial, integer, boolean, timestamp, jsonb, date, real, primaryKey, json } from "drizzle-orm/pg-core";
import { relations, type SQL } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import type { JSON as Json } from "drizzle-orm/pg-core";

// =============================================
// TABLE DEFINITIONS - ALL TABLES DEFINED FIRST
// =============================================

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
  clerkUserId: text("clerk_user_id").unique(), // Clerk user ID for authentication
  plan: text("plan").default("starter"), // User's subscription plan: 'starter', 'professional', 'enterprise'
  planActiveUntil: timestamp("plan_active_until"), // When the subscription expires
  polarSubscriptionId: text("polar_subscription_id"), // Polar.sh subscription ID
  isInTrial: boolean("is_in_trial").default(false), // Whether user is in trial period
  trialStartedAt: timestamp("trial_started_at"), // When the trial started
  trialEndsAt: timestamp("trial_ends_at"), // When the trial ends
  trialPlan: text("trial_plan"), // Plan selected for trial: 'starter', 'professional', 'enterprise'
  trialHasPaymentMethod: boolean("trial_has_payment_method").default(false), // Whether payment method was added during trial
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastLoginAt: timestamp("last_login_at"),
  status: text("status").default("active"), // 'active', 'suspended', 'banned'
});

// Forums schema (moved earlier in the file to avoid circular references)
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

// User-forum role assignments for forum-specific roles
export const userForumRoles = pgTable("user_forum_roles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  forumId: integer("forum_id").notNull().references(() => forums.id),
  roleId: integer("role_id").notNull().references(() => roles.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Categories schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Questions schema for forum questions
export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  categoryId: integer("category_id").notNull().references(() => categories.id),
  views: integer("views").default(0),
  isAiGenerated: boolean("is_ai_generated").default(false),
  aiPersonaType: text("ai_persona_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Answers to questions
export const answers = pgTable("answers", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  questionId: integer("question_id").notNull().references(() => questions.id),
  isAiGenerated: boolean("is_ai_generated").default(false),
  aiPersonaType: text("ai_persona_type"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Votes (upvotes/downvotes) for answers
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  answerId: integer("answer_id").notNull().references(() => answers.id),
  isUpvote: boolean("is_upvote").default(true),
});

// AI personas configuration
export const aiPersonas = pgTable("ai_personas", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id), // Owner of the persona
  name: text("name").notNull(),
  type: text("type").notNull(), // 'beginner', 'intermediate', 'expert', 'moderator'
  personality: text("personality"), // Personality traits
  tone: text("tone"), // Communication tone
  responseLength: integer("response_length").default(3), // 1-5 scale
  avatar: text("avatar"),
  description: text("description"),
  expertise: text("expertise"), // Specific domain expertise based on keywords
  keywords: text("keywords").array(), // Keywords this persona specializes in
  active: boolean("active").default(true),
  usageCount: integer("usage_count").default(0), // Number of times this persona has been used
  rating: real("rating").default(4.5), // Average user rating
  responseTime: real("response_time").default(2.0), // Average response time in seconds
  completionRate: integer("completion_rate").default(98), // Percentage of successful completions
  createdAt: timestamp("created_at").defaultNow(),
});

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
  impressions: integer("impressions"), // Estimated impressions
  ctr: real("ctr"), // Click-through rate
  device: text("device"), // mobile, desktop, tablet
  location: text("location"), // Country or region
});

// SEO Page Metrics
export const seoPageMetrics = pgTable("seo_page_metrics", {
  id: serial("id").primaryKey(),
  forumId: integer("forum_id").notNull().references(() => forums.id),
  url: text("url").notNull(),
  incomingLinks: integer("incoming_links"),
  outgoingLinks: integer("outgoing_links"),
  totalWordCount: integer("total_word_count"),
  metaQualityScore: integer("meta_quality_score"), // 0-100 scoring of meta tags quality
  keywordDensity: jsonb("keyword_density"), // JSON of keyword:density pairs
  pageSpeed: integer("page_speed"), // 0-100 page speed score
  mainKeyword: text("main_keyword"),
  semanticScore: integer("semantic_score"), // 0-100 semantic relevance score
  lastAnalyzed: timestamp("last_analyzed"),
  contentQualityScore: integer("content_quality_score"), // 0-100 content quality score
});

// SEO Content Gaps - identifies content that should be created based on competitor coverage
export const seoContentGaps = pgTable("seo_content_gaps", {
  id: serial("id").primaryKey(),
  forumId: integer("forum_id").notNull().references(() => forums.id),
  topic: text("topic").notNull(),
  searchVolume: integer("search_volume"),
  competitorCoverage: text("competitor_coverage"),
  opportunityScore: integer("opportunity_score"), // 0-100 score indicating the value of covering this topic
  recommendedKeywords: text("recommended_keywords"),
  contentSuggestion: text("content_suggestion"),
  isAddressed: boolean("is_addressed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// SEO Weekly Reports
export const seoWeeklyReports = pgTable("seo_weekly_reports", {
  id: serial("id").primaryKey(),
  forumId: integer("forum_id").notNull().references(() => forums.id),
  reportDate: date("report_date").notNull(),
  organicTraffic: integer("organic_traffic"),
  avgPosition: real("avg_position"),
  topTenKeywords: integer("top_ten_keywords"),
  topThreeKeywords: integer("top_three_keywords"),
  newKeywords: integer("new_keywords"),
  lostKeywords: integer("lost_keywords"),
  rankingImproved: integer("ranking_improved"),
  rankingDeclined: integer("ranking_declined"),
  impressions: integer("impressions"),
  clicks: integer("clicks"),
  ctr: real("ctr"),
  reportData: jsonb("report_data"), // Additional data in JSON format
});

// User engagement metrics
export const userEngagementMetrics = pgTable("user_engagement_metrics", {
  id: serial("id").primaryKey(),
  forumId: integer("forum_id").notNull().references(() => forums.id),
  date: date("date").notNull(),
  totalVisits: integer("total_visits"),
  uniqueVisitors: integer("unique_visitors"),
  pageViews: integer("page_views"),
  avgSessionDuration: real("avg_session_duration"),
  bounceRate: real("bounce_rate"),
  newUsers: integer("new_users"),
  returningUsers: integer("returning_users"),
  topReferrers: jsonb("top_referrers"), // JSON array of referrers
  deviceBreakdown: jsonb("device_breakdown"), // JSON of device:percentage pairs
  eventsTriggered: jsonb("events_triggered"), // JSON of event:count pairs
  activeUsers: integer("active_users"),
  conversionRate: real("conversion_rate"),
  questionViews: integer("question_views"),
  answerEngagements: integer("answer_engagements"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Content performance metrics
export const contentPerformanceMetrics = pgTable("content_performance_metrics", {
  id: serial("id").primaryKey(),
  forumId: integer("forum_id").notNull().references(() => forums.id),
  contentType: text("content_type").notNull(), // 'question', 'answer', 'page'
  contentId: integer("content_id").notNull(),
  title: text("title"),
  url: text("url"),
  impressions: integer("impressions"),
  clicks: integer("clicks"),
  ctr: real("ctr"),
  avgPosition: real("avg_position"),
  socialShares: integer("social_shares"),
  backlinks: integer("backlinks"),
  engagementRate: real("engagement_rate"),
  conversionRate: real("conversion_rate"),
  avgTimeOnContent: real("avg_time_on_content"),
  scoreDate: date("score_date").notNull(),
  performance: jsonb("performance"), // JSON with various performance metrics
  createdAt: timestamp("created_at").defaultNow(),
});

// Analytics events for tracking user behavior
export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  forumId: integer("forum_id").notNull().references(() => forums.id),
  userId: integer("user_id").references(() => users.id),
  eventType: text("event_type").notNull(), // 'page_view', 'click', 'search', etc.
  eventCategory: text("event_category"), // 'navigation', 'content', 'form', etc.
  eventAction: text("event_action"), // 'submit', 'view', 'click', etc.
  eventLabel: text("event_label"), // Additional context
  eventValue: integer("event_value"), // Numeric value if applicable
  sessionId: text("session_id"),
  timestamp: timestamp("timestamp").defaultNow(),
  deviceType: text("device_type"),
  browserInfo: text("browser_info"),
  ipAddress: text("ip_address"),
  referrer: text("referrer"),
  pageUrl: text("page_url"),
  additionalData: jsonb("additional_data"), // Any additional event data
});

// Funnel definition for conversion tracking
export const funnelDefinitions = pgTable("funnel_definitions", {
  id: serial("id").primaryKey(),
  forumId: integer("forum_id").notNull().references(() => forums.id),
  name: text("name").notNull(),
  description: text("description"),
  steps: jsonb("steps").notNull(), // JSON array of step definitions
  conversionGoal: text("conversion_goal").notNull(), // e.g., 'form_submit', 'question_ask'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  targetConversionRate: real("target_conversion_rate"),
  funnelType: text("funnel_type"), // 'lead_generation', 'engagement', etc.
  additionalSettings: jsonb("additional_settings"),
});

// Funnel analytics for tracking performance of defined funnels
export const funnelAnalytics = pgTable("funnel_analytics", {
  id: serial("id").primaryKey(),
  funnelId: integer("funnel_id").notNull().references(() => funnelDefinitions.id),
  date: date("date").notNull(),
  entrances: integer("entrances"),
  stepConversions: jsonb("step_conversions"), // JSON with conversion counts per step
  completions: integer("completions"),
  conversionRate: real("conversion_rate"),
  avgTimeToConversion: real("avg_time_to_conversion"),
  dropOffPoints: jsonb("drop_off_points"), // JSON with info about where users drop off
  segmentData: jsonb("segment_data"), // JSON for user segment performance
  revenueGenerated: real("revenue_generated"),
  costPerConversion: real("cost_per_conversion"),
  deviceBreakdown: jsonb("device_breakdown"),
  sourceBreakdown: jsonb("source_breakdown"),
  notes: text("notes"),
});

// Gated content - defined before leadCaptureForms to avoid circular reference
export const gatedContents = pgTable("gated_contents", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  content: text("content").notNull(),
  teaser: text("teaser").notNull(), // Preview content shown before form submission
  slug: text("slug").notNull().unique(),
  forumId: integer("forum_id").notNull().references(() => forums.id),
  contentType: text("content_type"), // 'whitepaper', 'ebook', 'webinar', etc.
  featuredImage: text("featured_image"),
  downloadFile: text("download_file"),
  metaDescription: text("meta_description"),
  metaKeywords: text("meta_keywords"),
  formId: integer("form_id"),  // Will be set up with proper relation later
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lead capture forms
export const leadCaptureForms = pgTable("lead_capture_forms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  forumId: integer("forum_id").notNull().references(() => forums.id),
  isActive: boolean("is_active").default(true),
  formFields: text("form_fields").notNull(), // JSON string of field definitions
  submitButtonText: text("submit_button_text"),
  successMessage: text("success_message"),
  redirectUrl: text("redirect_url"),
  formType: text("form_type"), // 'popup', 'inline', 'sidebar', etc.
  gatedContentId: integer("gated_content_id").references(() => gatedContents.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lead submissions
export const leadSubmissions = pgTable("lead_submissions", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").notNull().references(() => leadCaptureForms.id),
  email: text("email").notNull(),
  formData: text("form_data").notNull(), // JSON string of form data
  firstName: text("first_name"),
  lastName: text("last_name"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  isExported: boolean("is_exported").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// CRM integrations
export const crmIntegrations = pgTable("crm_integrations", {
  id: serial("id").primaryKey(),
  forumId: integer("forum_id").notNull().references(() => forums.id),
  provider: text("provider").notNull(), // 'mailchimp', 'hubspot', 'salesforce', etc.
  isActive: boolean("is_active").default(true),
  apiKey: text("api_key"),
  apiSecret: text("api_secret"),
  listId: text("list_id"),
  webhookUrl: text("webhook_url"),
  mappingRules: text("mapping_rules"), // JSON string of field mappings
  lastSyncedAt: timestamp("last_synced_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lead form views (for tracking conversion rates)
export const leadFormViews = pgTable("lead_form_views", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").notNull().references(() => leadCaptureForms.id),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  isConversion: boolean("is_conversion").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Content scheduling
export const contentSchedules = pgTable("content_schedules", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  forumId: integer("forum_id").notNull().references(() => forums.id),
  categoryId: integer("category_id").references(() => categories.id),
  title: text("title").notNull(),
  contentType: text("content_type").notNull(), // 'question', 'answer', 'both'
  keyword: text("keyword").notNull(), // Target keyword for the content
  content: text("content"), // Draft or template content
  scheduledFor: timestamp("scheduled_for").notNull(),
  publishedAt: timestamp("published_at"),
  status: text("status").default("scheduled"), // 'scheduled', 'published', 'failed'
  aiPersonaType: text("ai_persona_type"), // Type of AI persona to use if AI-generated
  qualitySettings: jsonb("quality_settings"), // JSON of quality settings
  targetWordCount: integer("target_word_count"),
  numberOfAnswers: integer("number_of_answers").default(1), // How many AI answers to generate
  questionIds: text("question_ids"), // Comma-separated IDs of generated questions
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ================================================
// INSERT SCHEMAS - AFTER ALL TABLES ARE DEFINED
// ================================================

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
  plan: true,
  planActiveUntil: true,
  polarSubscriptionId: true,
  clerkUserId: true,
});

export const insertUserForumRoleSchema = createInsertSchema(userForumRoles).pick({
  userId: true,
  forumId: true,
  roleId: true,
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  slug: true,
  description: true,
});

export const insertQuestionSchema = createInsertSchema(questions).pick({
  title: true,
  content: true,
  userId: true,
  categoryId: true,
  isAiGenerated: true,
  aiPersonaType: true,
});

export const insertAnswerSchema = createInsertSchema(answers).pick({
  content: true,
  userId: true,
  questionId: true,
  isAiGenerated: true,
  aiPersonaType: true,
});

export const insertVoteSchema = createInsertSchema(votes).pick({
  userId: true,
  answerId: true,
  isUpvote: true,
});

export const insertAiPersonaSchema = createInsertSchema(aiPersonas).pick({
  name: true,
  type: true,
  avatar: true,
  description: true,
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

export const insertDomainVerificationSchema = createInsertSchema(domainVerifications).pick({
  forumId: true,
  domain: true,
  verificationToken: true,
  isVerified: true,
  verifiedAt: true,
});

export const insertLeadCaptureFormSchema = createInsertSchema(leadCaptureForms).pick({
  name: true,
  description: true,
  forumId: true,
  isActive: true,
  formFields: true,
  submitButtonText: true,
  successMessage: true,
  redirectUrl: true,
  formType: true,
  gatedContentId: true,
});

export const insertLeadSubmissionSchema = createInsertSchema(leadSubmissions).pick({
  formId: true,
  email: true,
  formData: true,
  firstName: true,
  lastName: true,
  userAgent: true,
  ipAddress: true,
  isExported: true,
});

export const insertGatedContentSchema = createInsertSchema(gatedContents).pick({
  title: true,
  description: true,
  content: true,
  teaser: true,
  slug: true,
  forumId: true,
  contentType: true,
  featuredImage: true,
  downloadFile: true,
  metaDescription: true,
  metaKeywords: true,
  formId: true,
});

export const insertCrmIntegrationSchema = createInsertSchema(crmIntegrations).pick({
  forumId: true,
  provider: true,
  isActive: true,
  apiKey: true,
  apiSecret: true,
  listId: true,
  webhookUrl: true,
  mappingRules: true,
});

export const insertLeadFormViewSchema = createInsertSchema(leadFormViews).pick({
  formId: true,
  referrer: true,
  userAgent: true,
  ipAddress: true,
  isConversion: true,
});

export const insertContentScheduleSchema = createInsertSchema(contentSchedules).pick({
  userId: true,
  forumId: true,
  categoryId: true,
  title: true,
  contentType: true,
  keyword: true,
  content: true,
  scheduledFor: true,
  status: true,
  aiPersonaType: true,
  qualitySettings: true,
  targetWordCount: true,
  numberOfAnswers: true,
});

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
  pageSpeed: true,
  mainKeyword: true,
  semanticScore: true,
  lastAnalyzed: true,
  contentQualityScore: true,
});

export const insertSeoContentGapSchema = createInsertSchema(seoContentGaps).pick({
  forumId: true,
  topic: true,
  searchVolume: true,
  competitorCoverage: true,
  opportunityScore: true,
  recommendedKeywords: true,
  contentSuggestion: true,
  isAddressed: true,
});

export const insertSeoWeeklyReportSchema = createInsertSchema(seoWeeklyReports).pick({
  forumId: true,
  reportDate: true,
  organicTraffic: true,
  avgPosition: true,
  topTenKeywords: true,
  topThreeKeywords: true,
  newKeywords: true,
  lostKeywords: true,
  rankingImproved: true,
  rankingDeclined: true,
  impressions: true,
  clicks: true,
  ctr: true,
  reportData: true,
});

export const insertUserEngagementMetricsSchema = createInsertSchema(userEngagementMetrics).pick({
  forumId: true,
  date: true,
  totalVisits: true,
  uniqueVisitors: true,
  pageViews: true,
  avgSessionDuration: true,
  bounceRate: true,
  newUsers: true,
  returningUsers: true,
  topReferrers: true,
  deviceBreakdown: true,
  eventsTriggered: true,
  activeUsers: true,
  conversionRate: true,
  questionViews: true,
  answerEngagements: true,
});

export const insertContentPerformanceMetricsSchema = createInsertSchema(contentPerformanceMetrics).pick({
  forumId: true,
  contentType: true,
  contentId: true,
  title: true,
  url: true,
  impressions: true,
  clicks: true,
  ctr: true,
  avgPosition: true,
  socialShares: true,
  backlinks: true,
  engagementRate: true,
  conversionRate: true,
  avgTimeOnContent: true,
  scoreDate: true,
  performance: true,
});

export const insertAnalyticsEventSchema = createInsertSchema(analyticsEvents).pick({
  forumId: true,
  userId: true,
  eventType: true,
  eventCategory: true,
  eventAction: true,
  eventLabel: true,
  eventValue: true,
  sessionId: true,
  timestamp: true,
  deviceType: true,
  browserInfo: true,
  ipAddress: true,
  referrer: true,
  pageUrl: true,
  additionalData: true,
});

export const insertFunnelDefinitionSchema = createInsertSchema(funnelDefinitions).pick({
  forumId: true,
  name: true,
  description: true,
  steps: true,
  conversionGoal: true,
  isActive: true,
  targetConversionRate: true,
  funnelType: true,
  additionalSettings: true,
});

export const insertFunnelAnalyticsSchema = createInsertSchema(funnelAnalytics).pick({
  funnelId: true,
  date: true,
  entrances: true,
  stepConversions: true,
  completions: true,
  conversionRate: true,
  avgTimeToConversion: true,
  dropOffPoints: true,
  segmentData: true,
  revenueGenerated: true,
  costPerConversion: true,
  deviceBreakdown: true,
  sourceBreakdown: true,
  notes: true,
});

// =======================================
// TYPE DEFINITIONS - AFTER INSERT SCHEMAS
// =======================================

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

export type MainSitePage = typeof mainSitePages.$inferSelect;
export type InsertMainSitePage = z.infer<typeof insertMainSitePageSchema>;

export type ContentInterlink = typeof contentInterlinks.$inferSelect;
export type InsertContentInterlink = z.infer<typeof insertContentInterlinkSchema>;

export type Forum = typeof forums.$inferSelect;
export type InsertForum = z.infer<typeof insertForumSchema>;

export type DomainVerification = typeof domainVerifications.$inferSelect;
export type InsertDomainVerification = z.infer<typeof insertDomainVerificationSchema>;

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

export type UserEngagementMetric = typeof userEngagementMetrics.$inferSelect;
export type InsertUserEngagementMetric = z.infer<typeof insertUserEngagementMetricsSchema>;

export type ContentPerformanceMetric = typeof contentPerformanceMetrics.$inferSelect;
export type InsertContentPerformanceMetric = z.infer<typeof insertContentPerformanceMetricsSchema>;

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = z.infer<typeof insertAnalyticsEventSchema>;

export type FunnelDefinition = typeof funnelDefinitions.$inferSelect;
export type InsertFunnelDefinition = z.infer<typeof insertFunnelDefinitionSchema>;

export type FunnelAnalytic = typeof funnelAnalytics.$inferSelect;
export type InsertFunnelAnalytic = z.infer<typeof insertFunnelAnalyticsSchema>;

export type ContentSchedule = typeof contentSchedules.$inferSelect;
export type InsertContentSchedule = z.infer<typeof insertContentScheduleSchema>;

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

export type MainSitePageWithLinks = MainSitePage & {
  incomingLinks: ContentInterlink[];
  outgoingLinks: ContentInterlink[];
};

export type ForumWithStats = Forum & {
  totalQuestions: number;
  totalAnswers: number;
};

export type SeoKeywordWithPositionHistory = SeoKeyword & {
  positionHistory: SeoPosition[];
  latestPosition?: SeoPosition;
};

export type SeoWeeklyReportWithDetails = SeoWeeklyReport & {
  parsedReportData: Record<string, any>;
};

export type LeadCaptureFormWithStats = LeadCaptureForm & {
  totalViews: number;
  totalSubmissions: number;
  conversionRate: number;
};

export type FunnelDefinitionWithStats = FunnelDefinition & {
  totalEntries: number;
  completions: number;
  conversionRate: number;
  dropOffPoints: Record<string, number>;
};

export type ContentScheduleWithDetails = ContentSchedule & {
  forum: Forum;
  category?: Category;
  questionsGenerated?: number;
  answersGenerated?: number;
};

// ==================================================
// RELATIONS - ALL TABLES AND TYPES MUST BE DEFINED ABOVE
// ==================================================

// Role relations
export const rolesRelations = relations(roles, ({ many }) => ({
  permissions: many(rolePermissions),
  users: many(users),
  userForumRoles: many(userForumRoles),
}));

// Permission relations
export const permissionsRelations = relations(permissions, ({ many }) => ({
  roles: many(rolePermissions),
}));

// Role-Permission junction relations
export const rolePermissionsRelations = relations(rolePermissions, ({ one }) => ({
  role: one(roles, {
    fields: [rolePermissions.roleId],
    references: [roles.id],
  }),
  permission: one(permissions, {
    fields: [rolePermissions.permissionId],
    references: [permissions.id],
  }),
}));

// User relations
export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  questions: many(questions),
  answers: many(answers),
  votes: many(votes),
  forums: many(forums),
  userForumRoles: many(userForumRoles),
  contentInterlinks: many(contentInterlinks, { relationName: "createdByUser" }),
  contentSchedules: many(contentSchedules),
}));

// User-Forum-Role relations
export const userForumRolesRelations = relations(userForumRoles, ({ one }) => ({
  user: one(users, {
    fields: [userForumRoles.userId],
    references: [users.id],
  }),
  forum: one(forums, {
    fields: [userForumRoles.forumId],
    references: [forums.id],
  }),
  role: one(roles, {
    fields: [userForumRoles.roleId],
    references: [roles.id],
  }),
}));

// Category relations
export const categoriesRelations = relations(categories, ({ many }) => ({
  questions: many(questions),
  contentSchedules: many(contentSchedules),
}));

// Question relations
export const questionsRelations = relations(questions, ({ one, many }) => ({
  user: one(users, {
    fields: [questions.userId],
    references: [users.id],
  }),
  category: one(categories, {
    fields: [questions.categoryId],
    references: [categories.id],
  }),
  answers: many(answers),
}));

// Answer relations
export const answersRelations = relations(answers, ({ one, many }) => ({
  question: one(questions, {
    fields: [answers.questionId],
    references: [questions.id],
  }),
  user: one(users, {
    fields: [answers.userId],
    references: [users.id],
  }),
  votes: many(votes),
}));

// Vote relations
export const votesRelations = relations(votes, ({ one }) => ({
  user: one(users, {
    fields: [votes.userId],
    references: [users.id],
  }),
  answer: one(answers, {
    fields: [votes.answerId],
    references: [answers.id],
  }),
}));

// Content interlink relations
export const contentInterlinksRelations = relations(contentInterlinks, ({ one }) => ({
  createdByUser: one(users, {
    fields: [contentInterlinks.createdByUserId],
    references: [users.id],
    relationName: "createdByUser",
  }),
}));

// Forum relations
export const forumsRelations = relations(forums, ({ one, many }) => ({
  owner: one(users, {
    fields: [forums.userId],
    references: [users.id],
  }),
  userForumRoles: many(userForumRoles),
  domainVerifications: many(domainVerifications),
  leadCaptureForms: many(leadCaptureForms),
  gatedContents: many(gatedContents),
  crmIntegrations: many(crmIntegrations),
  contentSchedules: many(contentSchedules),
  seoKeywords: many(seoKeywords),
  seoContentGaps: many(seoContentGaps),
  seoPageMetrics: many(seoPageMetrics),
  userEngagementMetrics: many(userEngagementMetrics),
  contentPerformanceMetrics: many(contentPerformanceMetrics),
  analyticsEvents: many(analyticsEvents),
  funnelDefinitions: many(funnelDefinitions),
}));

// Domain verification relations
export const domainVerificationsRelations = relations(domainVerifications, ({ one }) => ({
  forum: one(forums, {
    fields: [domainVerifications.forumId],
    references: [forums.id],
  }),
}));

// Lead capture form relations
export const leadCaptureFormsRelations = relations(leadCaptureForms, ({ one, many }) => ({
  forum: one(forums, {
    fields: [leadCaptureForms.forumId],
    references: [forums.id],
  }),
  submissions: many(leadSubmissions),
  views: many(leadFormViews),
  gatedContent: one(gatedContents, {
    fields: [leadCaptureForms.gatedContentId],
    references: [gatedContents.id],
  }),
}));

// Lead submission relations
export const leadSubmissionsRelations = relations(leadSubmissions, ({ one }) => ({
  form: one(leadCaptureForms, {
    fields: [leadSubmissions.formId],
    references: [leadCaptureForms.id],
  }),
}));

// Lead form view relations
export const leadFormViewsRelations = relations(leadFormViews, ({ one }) => ({
  form: one(leadCaptureForms, {
    fields: [leadFormViews.formId],
    references: [leadCaptureForms.id],
  }),
}));

// Gated content relations
export const gatedContentsRelations = relations(gatedContents, ({ one, many }) => ({
  forum: one(forums, {
    fields: [gatedContents.forumId],
    references: [forums.id],
  }),
  leadCaptureForms: many(leadCaptureForms),
}));

// CRM integration relations
export const crmIntegrationsRelations = relations(crmIntegrations, ({ one }) => ({
  forum: one(forums, {
    fields: [crmIntegrations.forumId],
    references: [forums.id],
  }),
}));

// Content schedule relations
export const contentSchedulesRelations = relations(contentSchedules, ({ one }) => ({
  forum: one(forums, {
    fields: [contentSchedules.forumId],
    references: [forums.id],
  }),
  category: one(categories, {
    fields: [contentSchedules.categoryId],
    references: [categories.id],
  }),
  user: one(users, {
    fields: [contentSchedules.userId],
    references: [users.id],
  }),
}));

// SEO Keyword relations
export const seoKeywordsRelations = relations(seoKeywords, ({ one, many }) => ({
  forum: one(forums, {
    fields: [seoKeywords.forumId],
    references: [forums.id],
  }),
  positions: many(seoPositions),
}));

// SEO Position relations
export const seoPositionsRelations = relations(seoPositions, ({ one }) => ({
  keyword: one(seoKeywords, {
    fields: [seoPositions.keywordId],
    references: [seoKeywords.id],
  }),
}));

// SEO Page Metrics relations
export const seoPageMetricsRelations = relations(seoPageMetrics, ({ one }) => ({
  forum: one(forums, {
    fields: [seoPageMetrics.forumId],
    references: [forums.id],
  }),
}));

// SEO Content Gap relations
export const seoContentGapsRelations = relations(seoContentGaps, ({ one }) => ({
  forum: one(forums, {
    fields: [seoContentGaps.forumId],
    references: [forums.id],
  }),
}));

// User Engagement Metrics relations
export const userEngagementMetricsRelations = relations(userEngagementMetrics, ({ one }) => ({
  forum: one(forums, {
    fields: [userEngagementMetrics.forumId],
    references: [forums.id],
  }),
}));

// Analytics Events relations
export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  forum: one(forums, {
    fields: [analyticsEvents.forumId],
    references: [forums.id],
  }),
  user: one(users, {
    fields: [analyticsEvents.userId],
    references: [users.id],
  }),
}));

// Content Performance Metrics relations
export const contentPerformanceMetricsRelations = relations(contentPerformanceMetrics, ({ one }) => ({
  forum: one(forums, {
    fields: [contentPerformanceMetrics.forumId],
    references: [forums.id],
  }),
}));

// Funnel Definitions relations
export const funnelDefinitionsRelations = relations(funnelDefinitions, ({ one, many }) => ({
  forum: one(forums, {
    fields: [funnelDefinitions.forumId],
    references: [forums.id],
  }),
  analytics: many(funnelAnalytics),
}));

// Funnel Analytics relations
export const funnelAnalyticsRelations = relations(funnelAnalytics, ({ one }) => ({
  funnel: one(funnelDefinitions, {
    fields: [funnelAnalytics.funnelId],
    references: [funnelDefinitions.id],
  }),
}));