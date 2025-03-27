import { 
  roles, type Role, type InsertRole,
  permissions, type Permission, type InsertPermission,
  rolePermissions, type RolePermission, type InsertRolePermission,
  users, type User, type InsertUser,
  userForumRoles, type UserForumRole, type InsertUserForumRole,
  categories, type Category, type InsertCategory,
  questions, type Question, type InsertQuestion, type QuestionWithDetails,
  answers, type Answer, type InsertAnswer, type AnswerWithDetails,
  votes, type Vote, type InsertVote,
  aiPersonas, type AiPersona, type InsertAiPersona,
  mainSitePages, type MainSitePage, type InsertMainSitePage, type MainSitePageWithLinks,
  contentInterlinks, type ContentInterlink, type InsertContentInterlink,
  forums, type Forum, type InsertForum, type ForumWithStats,
  domainVerifications, type DomainVerification, type InsertDomainVerification,
  leadCaptureForms, type LeadCaptureForm, type InsertLeadCaptureForm, type LeadCaptureFormWithStats,
  leadSubmissions, type LeadSubmission, type InsertLeadSubmission,
  gatedContents, type GatedContent, type InsertGatedContent,
  crmIntegrations, type CrmIntegration, type InsertCrmIntegration,
  leadFormViews, type LeadFormView, type InsertLeadFormView,
  contentSchedules, type ContentSchedule, type InsertContentSchedule, type ContentScheduleWithDetails,
  seoKeywords, type SeoKeyword, type InsertSeoKeyword, type SeoKeywordWithPositionHistory,
  seoPositions, type SeoPosition, type InsertSeoPosition,
  seoPageMetrics, type SeoPageMetric, type InsertSeoPageMetric,
  seoContentGaps, type SeoContentGap, type InsertSeoContentGap,
  seoWeeklyReports, type SeoWeeklyReport, type InsertSeoWeeklyReport, type SeoWeeklyReportWithDetails,
  funnelDefinitions, type FunnelDefinition, type InsertFunnelDefinition, type FunnelDefinitionWithStats,
  funnelAnalytics, type FunnelAnalytic, type InsertFunnelAnalytic
} from "@shared/schema";
// Import this way to make TypeScript happy in an ESM context
import memorystore from 'memorystore';
import session from 'express-session';

// Create the MemoryStore
const MemoryStore = memorystore(session);

// Storage interface with CRUD methods
export interface IStorage {
  // Role and Permission methods
  getRole(id: number): Promise<Role | undefined>;
  getRoleByName(name: string): Promise<Role | undefined>;
  getAllRoles(): Promise<Role[]>;
  createRole(role: InsertRole): Promise<Role>;
  updateRole(id: number, data: Partial<InsertRole>): Promise<Role>;
  deleteRole(id: number): Promise<void>;
  
  getPermission(id: number): Promise<Permission | undefined>;
  getPermissionByName(name: string): Promise<Permission | undefined>;
  getPermissionsByScope(scope: string): Promise<Permission[]>;
  getAllPermissions(): Promise<Permission[]>;
  createPermission(permission: InsertPermission): Promise<Permission>;
  updatePermission(id: number, data: Partial<InsertPermission>): Promise<Permission>;
  deletePermission(id: number): Promise<void>;
  
  assignPermissionToRole(rolePermission: InsertRolePermission): Promise<RolePermission>;
  removePermissionFromRole(roleId: number, permissionId: number): Promise<void>;
  getRolePermissions(roleId: number): Promise<Permission[]>;
  
  // User Forum Role methods
  assignUserForumRole(userForumRole: InsertUserForumRole): Promise<UserForumRole>;
  removeUserForumRole(userId: number, forumId: number): Promise<void>;
  getUserForumRoles(userId: number): Promise<UserForumRole[]>;
  getUserForumRolesByForum(forumId: number): Promise<UserForumRole[]>;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserRole(userId: number, roleId: number): Promise<User>;
  hasPermission(userId: number, permissionName: string, forumId?: number): Promise<boolean>;
  getOrCreateAPIUser(forumId: number): Promise<User>;

  // Category methods
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getAllCategories(): Promise<Category[]>;
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  getCategoriesByForum(forumId: number): Promise<Category[]>;

  // Question methods
  getQuestion(id: number): Promise<Question | undefined>;
  getQuestionWithDetails(id: number): Promise<QuestionWithDetails | undefined>;
  getAllQuestions(): Promise<Question[]>;
  getAllQuestionsWithDetails(): Promise<QuestionWithDetails[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  incrementQuestionViews(id: number): Promise<void>;
  getQuestionsForForum(forumId: number, limit?: number, categoryId?: number): Promise<QuestionWithDetails[]>;
  getPopularQuestionsForForum(forumId: number, sortBy?: string, limit?: number, categoryId?: number, timeFrame?: number): Promise<QuestionWithDetails[]>;
  searchQuestionsInForum(forumId: number, query: string, limit?: number, categoryId?: number): Promise<QuestionWithDetails[]>;
  countQuestionsByForum(forumId: number): Promise<number>;

  // Answer methods
  getAnswer(id: number): Promise<Answer | undefined>;
  getAnswerWithDetails(id: number): Promise<AnswerWithDetails | undefined>;
  getAnswersForQuestion(questionId: number): Promise<AnswerWithDetails[]>;
  createAnswer(answer: InsertAnswer): Promise<Answer>;
  countAnswersByForum(forumId: number): Promise<number>;

  // Vote methods
  getVote(id: number): Promise<Vote | undefined>;
  getVoteByUserAndAnswer(userId: number, answerId: number): Promise<Vote | undefined>;
  createOrUpdateVote(vote: InsertVote): Promise<Vote>;

  // AI Persona methods
  getAIPersona(id: number): Promise<AiPersona | undefined>;
  getAllAIPersonas(): Promise<AiPersona[]>;
  createAIPersona(persona: InsertAiPersona): Promise<AiPersona>;
  
  // Main Site Pages methods
  getMainSitePage(id: number): Promise<MainSitePage | undefined>;
  getMainSitePageBySlug(slug: string): Promise<MainSitePage | undefined>;
  getAllMainSitePages(): Promise<MainSitePage[]>;
  createMainSitePage(page: InsertMainSitePage): Promise<MainSitePage>;
  getMainSitePageWithLinks(id: number): Promise<MainSitePageWithLinks | undefined>;
  
  // Content Interlinking methods
  getContentInterlink(id: number): Promise<ContentInterlink | undefined>;
  createContentInterlink(interlink: InsertContentInterlink): Promise<ContentInterlink>;
  getInterlinksForSource(sourceType: string, sourceId: number): Promise<ContentInterlink[]>;
  getInterlinksForTarget(targetType: string, targetId: number): Promise<ContentInterlink[]>;
  getRelevantContentForInterlinking(contentType: string, contentId: number, limit?: number): Promise<Array<{id: number, type: string, title: string, relevanceScore: number}>>;
  
  // Forum methods
  getForum(id: number): Promise<Forum | undefined>;
  getForumBySlug(slug: string): Promise<Forum | undefined>;
  getForumBySubdomain(subdomain: string): Promise<Forum | undefined>;
  getForumByCustomDomain(domain: string): Promise<Forum | undefined>;
  getAllForums(): Promise<Forum[]>;
  getForumsByUser(userId: number): Promise<ForumWithStats[]>;
  createForum(forum: InsertForum): Promise<Forum>;
  updateForum(id: number, data: Partial<InsertForum>): Promise<Forum>;
  updateForumDomain(id: number, data: { subdomain?: string; customDomain?: string }): Promise<Forum>;
  deleteForum(id: number): Promise<void>;
  
  // Domain verification methods
  createDomainVerification(verification: InsertDomainVerification): Promise<DomainVerification>;
  getDomainVerification(domain: string): Promise<DomainVerification | undefined>;
  verifyDomain(domain: string, token: string): Promise<boolean>;
  
  // Lead Capture Form methods
  getLeadCaptureForm(id: number): Promise<LeadCaptureForm | undefined>;
  getLeadCaptureFormsByForum(forumId: number): Promise<LeadCaptureForm[]>;
  getLeadCaptureFormWithStats(id: number): Promise<LeadCaptureFormWithStats | undefined>;
  createLeadCaptureForm(form: InsertLeadCaptureForm): Promise<LeadCaptureForm>;
  updateLeadCaptureForm(id: number, data: Partial<InsertLeadCaptureForm>): Promise<LeadCaptureForm>;
  deleteLeadCaptureForm(id: number): Promise<void>;
  
  // Lead Submission methods
  getLeadSubmission(id: number): Promise<LeadSubmission | undefined>;
  getLeadSubmissionsByForm(formId: number): Promise<LeadSubmission[]>;
  createLeadSubmission(submission: InsertLeadSubmission): Promise<LeadSubmission>;
  markLeadSubmissionsAsExported(formId: number): Promise<void>;
  
  // Gated Content methods
  getGatedContent(id: number): Promise<GatedContent | undefined>;
  getGatedContentBySlug(slug: string): Promise<GatedContent | undefined>;
  getGatedContentsByForum(forumId: number): Promise<GatedContent[]>;
  createGatedContent(content: InsertGatedContent): Promise<GatedContent>;
  updateGatedContent(id: number, data: Partial<InsertGatedContent>): Promise<GatedContent>;
  deleteGatedContent(id: number): Promise<void>;
  
  // CRM Integration methods
  getCrmIntegration(id: number): Promise<CrmIntegration | undefined>;
  getCrmIntegrationsByForum(forumId: number): Promise<CrmIntegration[]>;
  createCrmIntegration(integration: InsertCrmIntegration): Promise<CrmIntegration>;
  updateCrmIntegration(id: number, data: Partial<InsertCrmIntegration>): Promise<CrmIntegration>;
  deleteCrmIntegration(id: number): Promise<void>;
  
  // Lead Form View Tracking methods
  recordLeadFormView(view: InsertLeadFormView): Promise<LeadFormView>;
  getLeadFormStats(formId: number): Promise<{ views: number; submissions: number; conversionRate: number }>;
  
  // Content Schedule methods
  getContentSchedule(id: number): Promise<ContentSchedule | undefined>;
  getContentScheduleWithDetails(id: number): Promise<ContentScheduleWithDetails | undefined>;
  getContentSchedulesByForum(forumId: number): Promise<ContentScheduleWithDetails[]>;
  getContentSchedulesByUser(userId: number): Promise<ContentScheduleWithDetails[]>;
  getUpcomingContentSchedules(limit?: number): Promise<ContentScheduleWithDetails[]>;
  createContentSchedule(schedule: InsertContentSchedule): Promise<ContentSchedule>;
  updateContentSchedule(id: number, data: Partial<InsertContentSchedule>): Promise<ContentSchedule>;
  updateContentScheduleStatus(id: number, status: string, questionIds?: number[]): Promise<ContentSchedule>;
  deleteContentSchedule(id: number): Promise<void>;
  
  // SEO Keyword methods
  getSeoKeyword(id: number): Promise<SeoKeyword | undefined>;
  getSeoKeywordsByForum(forumId: number): Promise<SeoKeyword[]>;
  getSeoKeywordWithPositionHistory(id: number): Promise<SeoKeywordWithPositionHistory | undefined>;
  createSeoKeyword(keyword: InsertSeoKeyword): Promise<SeoKeyword>;
  updateSeoKeyword(id: number, data: Partial<InsertSeoKeyword>): Promise<SeoKeyword>;
  deleteSeoKeyword(id: number): Promise<void>;
  
  // SEO Position methods
  getSeoPosition(id: number): Promise<SeoPosition | undefined>;
  getSeoPositionsByKeyword(keywordId: number): Promise<SeoPosition[]>;
  getSeoPositionsByDate(date: Date): Promise<SeoPosition[]>;
  createSeoPosition(position: InsertSeoPosition): Promise<SeoPosition>;
  
  // SEO Page Metrics methods
  getSeoPageMetric(id: number): Promise<SeoPageMetric | undefined>;
  getSeoPageMetricByUrl(forumId: number, url: string): Promise<SeoPageMetric | undefined>;
  getSeoPageMetricsByForum(forumId: number): Promise<SeoPageMetric[]>;
  createSeoPageMetric(metric: InsertSeoPageMetric): Promise<SeoPageMetric>;
  updateSeoPageMetric(id: number, data: Partial<InsertSeoPageMetric>): Promise<SeoPageMetric>;
  
  // SEO Content Gap methods
  getSeoContentGap(id: number): Promise<SeoContentGap | undefined>;
  getSeoContentGapsByForum(forumId: number): Promise<SeoContentGap[]>;
  getUnadressedSeoContentGaps(forumId: number): Promise<SeoContentGap[]>;
  createSeoContentGap(gap: InsertSeoContentGap): Promise<SeoContentGap>;
  updateSeoContentGapStatus(id: number, isAddressed: boolean, targetUrl?: string): Promise<SeoContentGap>;
  
  // SEO Weekly Report methods
  getSeoWeeklyReport(id: number): Promise<SeoWeeklyReport | undefined>;
  getSeoWeeklyReportWithDetails(id: number): Promise<SeoWeeklyReportWithDetails | undefined>;
  getSeoWeeklyReportsByForum(forumId: number): Promise<SeoWeeklyReport[]>;
  getLatestSeoWeeklyReport(forumId: number): Promise<SeoWeeklyReportWithDetails | undefined>;
  createSeoWeeklyReport(report: InsertSeoWeeklyReport): Promise<SeoWeeklyReport>;
  
  // Session store
  sessionStore: any;
  
  // User Engagement Tracking
  createUserEngagementMetric(metric: InsertUserEngagementMetric): Promise<UserEngagementMetric>;
  getUserEngagementMetricsByForum(forumId: number, startDate?: string, endDate?: string): Promise<UserEngagementMetric[]>;
  getUserEngagementMetricsByDate(date: string): Promise<UserEngagementMetric[]>;
  getDailyAverageSessionDuration(forumId: number, days?: number): Promise<number>;
  getReturnVisitorRateTrend(forumId: number, days?: number): Promise<{ date: string, rate: number }[]>;
  getUserJourneys(forumId: number, days?: number, limit?: number): Promise<{ path: string[], count: number }[]>;
  
  // Content Performance Tracking
  createContentPerformanceMetric(metric: InsertContentPerformanceMetric): Promise<ContentPerformanceMetric>;
  getContentPerformanceMetricsByForum(forumId: number, contentType?: string): Promise<ContentPerformanceMetric[]>;
  getContentPerformanceMetricsByContent(contentType: string, contentId: number): Promise<ContentPerformanceMetric[]>;
  getTopPerformingContent(forumId: number, limit?: number): Promise<ContentPerformanceMetric[]>;
  getContentEngagementTrend(forumId: number, days?: number): Promise<{ date: string, avgTimeOnPage: number, interactionRate: number }[]>;
  
  // Analytics Events
  createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent>;
  getAnalyticsEventsByForum(forumId: number, eventType?: string, startDate?: string, endDate?: string): Promise<AnalyticsEvent[]>;
  getEventCountsByType(forumId: number, days?: number): Promise<{ eventType: string, count: number }[]>;
  getPopularEventTargets(forumId: number, eventType?: string, limit?: number): Promise<{ targetId: string, targetType: string, count: number }[]>;
  
  // Funnel Definition methods
  getFunnelDefinition(id: number): Promise<FunnelDefinition | undefined>;
  getFunnelDefinitionsByForum(forumId: number): Promise<FunnelDefinition[]>;
  createFunnelDefinition(funnel: InsertFunnelDefinition): Promise<FunnelDefinition>;
  updateFunnelDefinition(id: number, data: Partial<InsertFunnelDefinition>): Promise<FunnelDefinition>;
  deleteFunnelDefinition(id: number): Promise<void>;
  getFunnelDefinitionWithStats(id: number): Promise<FunnelDefinitionWithStats | undefined>;
  
  // Funnel Analytics methods
  getFunnelAnalytic(id: number): Promise<FunnelAnalytic | undefined>;
  getFunnelAnalyticsByDefinition(funnelId: number): Promise<FunnelAnalytic[]>;
  getFunnelAnalyticsByDateRange(funnelId: number, startDate: string, endDate: string): Promise<FunnelAnalytic[]>;
  createFunnelAnalytic(analytic: InsertFunnelAnalytic): Promise<FunnelAnalytic>;
  updateFunnelAnalytic(id: number, data: Partial<InsertFunnelAnalytic>): Promise<FunnelAnalytic>;
  
  // Funnel Definition methods
  getFunnelDefinition(id: number): Promise<FunnelDefinition | undefined>;
  getFunnelDefinitionsByForum(forumId: number): Promise<FunnelDefinition[]>;
  createFunnelDefinition(funnel: InsertFunnelDefinition): Promise<FunnelDefinition>;
  updateFunnelDefinition(id: number, data: Partial<InsertFunnelDefinition>): Promise<FunnelDefinition>;
  deleteFunnelDefinition(id: number): Promise<void>;
  getFunnelDefinitionWithStats(id: number): Promise<FunnelDefinitionWithStats | undefined>;
  
  // Funnel Analytics methods
  getFunnelAnalytic(id: number): Promise<FunnelAnalytic | undefined>;
  getFunnelAnalyticsByDefinition(funnelId: number): Promise<FunnelAnalytic[]>;
  getFunnelAnalyticsByDateRange(funnelId: number, startDate: string, endDate: string): Promise<FunnelAnalytic[]>;
  createFunnelAnalytic(analytic: InsertFunnelAnalytic): Promise<FunnelAnalytic>;
  updateFunnelAnalytic(id: number, data: Partial<InsertFunnelAnalytic>): Promise<FunnelAnalytic>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private rolesStore: Map<number, Role>;
  private permissionsStore: Map<number, Permission>;
  private rolePermissionsStore: Map<number, RolePermission>;
  private usersStore: Map<number, User>;
  private userForumRolesStore: Map<number, UserForumRole>;
  private categoriesStore: Map<number, Category>;
  private questionsStore: Map<number, Question>;
  private answersStore: Map<number, Answer>;
  private votesStore: Map<number, Vote>;
  private aiPersonasStore: Map<number, AiPersona>;
  private mainSitePagesStore: Map<number, MainSitePage>;
  private contentInterlinksStore: Map<number, ContentInterlink>;
  private forumsStore: Map<number, Forum>;
  private domainVerificationsStore: Map<number, DomainVerification>;
  private leadCaptureFormsStore: Map<number, LeadCaptureForm>;
  private leadSubmissionsStore: Map<number, LeadSubmission>;
  private gatedContentsStore: Map<number, GatedContent>;
  private crmIntegrationsStore: Map<number, CrmIntegration>;
  private leadFormViewsStore: Map<number, LeadFormView>;
  private contentSchedulesStore: Map<number, ContentSchedule>;
  private seoKeywordsStore: Map<number, SeoKeyword>;
  private seoPositionsStore: Map<number, SeoPosition>;
  private seoPageMetricsStore: Map<number, SeoPageMetric>;
  private seoContentGapsStore: Map<number, SeoContentGap>;
  private seoWeeklyReportsStore: Map<number, SeoWeeklyReport>;
  private userEngagementMetricsStore: Map<number, UserEngagementMetric>;
  private contentPerformanceMetricsStore: Map<number, ContentPerformanceMetric>;
  private analyticsEventsStore: Map<number, AnalyticsEvent>;
  private funnelDefinitionsStore: Map<number, FunnelDefinition>;
  private funnelAnalyticsStore: Map<number, FunnelAnalytic>;
  
  private roleId: number;
  private permissionId: number;
  private rolePermissionId: number;
  private userId: number;
  private userForumRoleId: number;
  private categoryId: number;
  private questionId: number;
  private answerId: number;
  private voteId: number;
  private aiPersonaId: number;
  private mainSitePageId: number;
  private contentInterlinkId: number;
  private forumId: number;
  private domainVerificationId: number;
  private leadCaptureFormId: number;
  private leadSubmissionId: number;
  private gatedContentId: number;
  private crmIntegrationId: number;
  private leadFormViewId: number;
  private contentScheduleId: number;
  private seoKeywordId: number;
  private seoPositionId: number;
  private seoPageMetricId: number;
  private seoContentGapId: number;
  private seoWeeklyReportId: number;
  private userEngagementMetricId: number;
  private contentPerformanceMetricId: number;
  private analyticsEventId: number;
  private funnelDefinitionId: number;
  private funnelAnalyticId: number;
  public sessionStore: any;

  constructor() {
    // Initialize stores
    this.rolesStore = new Map();
    this.permissionsStore = new Map();
    this.rolePermissionsStore = new Map();
    this.usersStore = new Map();
    this.userForumRolesStore = new Map();
    this.categoriesStore = new Map();
    this.questionsStore = new Map();
    this.answersStore = new Map();
    this.votesStore = new Map();
    this.aiPersonasStore = new Map();
    this.mainSitePagesStore = new Map();
    this.contentInterlinksStore = new Map();
    this.forumsStore = new Map();
    this.domainVerificationsStore = new Map();
    this.leadCaptureFormsStore = new Map();
    this.leadSubmissionsStore = new Map();
    this.gatedContentsStore = new Map();
    this.crmIntegrationsStore = new Map();
    this.leadFormViewsStore = new Map();
    this.contentSchedulesStore = new Map();
    this.seoKeywordsStore = new Map();
    this.seoPositionsStore = new Map();
    this.seoPageMetricsStore = new Map();
    this.seoContentGapsStore = new Map();
    this.seoWeeklyReportsStore = new Map();
    this.userEngagementMetricsStore = new Map();
    this.contentPerformanceMetricsStore = new Map();
    this.analyticsEventsStore = new Map();
    this.funnelDefinitionsStore = new Map();
    this.funnelAnalyticsStore = new Map();
    
    // Create session store from memorystore
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });

    // Initialize IDs
    this.roleId = 1;
    this.permissionId = 1;
    this.rolePermissionId = 1;
    this.userId = 1;
    this.userForumRoleId = 1;
    this.categoryId = 1;
    this.questionId = 1;
    this.answerId = 1;
    this.voteId = 1;
    this.aiPersonaId = 1;
    this.mainSitePageId = 1;
    this.contentInterlinkId = 1;
    this.forumId = 1;
    this.domainVerificationId = 1;
    this.leadCaptureFormId = 1;
    this.leadSubmissionId = 1;
    this.gatedContentId = 1;
    this.crmIntegrationId = 1;
    this.leadFormViewId = 1;
    this.contentScheduleId = 1;
    this.seoKeywordId = 1;
    this.seoPositionId = 1;
    this.seoPageMetricId = 1;
    this.seoContentGapId = 1;
    this.seoWeeklyReportId = 1;
    this.userEngagementMetricId = 1;
    this.contentPerformanceMetricId = 1;
    this.analyticsEventId = 1;
    this.funnelDefinitionId = 1;
    this.funnelAnalyticId = 1;

    // Initialize with sample data
    this.initSampleData();
  }

  private async initSeoData() {
    // Initialize SEO stores
    this.seoKeywordsStore = new Map();
    this.seoPositionsStore = new Map();
    this.seoPageMetricsStore = new Map();
    this.seoContentGapsStore = new Map();
    this.seoWeeklyReportsStore = new Map();
    
    // Create sample SEO keywords for the first forum
    const sampleKeywords = [
      {
        keyword: "ai-powered content generation",
        forumId: 1,
        targetPosition: 3,
        difficulty: 65,
        searchVolume: 2400,
        isTracking: true,
        notes: "Competing with major AI platforms",
        startingPosition: 12
      },
      {
        keyword: "seo forum platform",
        forumId: 1,
        targetPosition: 1,
        difficulty: 45,
        searchVolume: 1800,
        isTracking: true,
        notes: "Strong opportunity for our niche",
        startingPosition: 8
      },
      {
        keyword: "forum seo optimization",
        forumId: 1,
        targetPosition: 5,
        difficulty: 55,
        searchVolume: 1200,
        isTracking: true,
        notes: "Medium competition with good conversion potential",
        startingPosition: 15
      },
      {
        keyword: "question answer platform seo",
        forumId: 1,
        targetPosition: 4,
        difficulty: 40,
        searchVolume: 890,
        isTracking: true,
        notes: "Target for Q2 growth",
        startingPosition: 11
      },
      {
        keyword: "how to optimize forum for google",
        forumId: 1,
        targetPosition: 2,
        difficulty: 35,
        searchVolume: 1500,
        isTracking: true,
        notes: "Educational content opportunity",
        startingPosition: 6
      }
    ];
    
    // Create keywords
    let keywordMap = [];
    for (const keywordData of sampleKeywords) {
      const keyword = await this.createSeoKeyword(keywordData);
      keywordMap.push(keyword);
    }
    
    // Create position history for each keyword
    const today = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    
    for (const keyword of keywordMap) {
      // Create 30 days of position history
      for (let i = 0; i < 30; i++) {
        const date = new Date(today.getTime() - (i * oneDay));
        
        // Calculate a somewhat realistic position trend (improving over time with some fluctuations)
        const startingPos = keyword.startingPosition || 20;
        const targetPos = keyword.targetPosition || 3;
        const daysProgress = (30 - i) / 30; // 0 to 1 progress factor
        const basePosition = startingPos - ((startingPos - targetPos) * daysProgress);
        const randomFactor = Math.random() * 3 - 1.5; // Random fluctuation between -1.5 and +1.5
        const position = Math.max(1, Math.round(basePosition + randomFactor));
        
        // Calculate change from previous day
        let change = null;
        if (i > 0) {
          const prevPos = Math.max(1, Math.round(basePosition + (Math.random() * 3 - 1.5)));
          change = prevPos - position;
        }
        
        await this.createSeoPosition({
          keywordId: keyword.id,
          position,
          trackedAt: date,
          url: `https://forum.example.com/post/${Math.floor(Math.random() * 1000)}`,
          change,
          searchVolume: keyword.searchVolume
        });
      }
    }
    
    // Create sample content gaps
    const contentGaps = [
      {
        forumId: 1,
        keyword: "forum vs social media for seo",
        searchVolume: 980,
        difficulty: 42,
        competitorUrls: "competitor1.com/blog/forums, competitor2.com/seo-comparison",
        isAddressed: false,
        priority: "high"
      },
      {
        forumId: 1,
        keyword: "best forum software for seo",
        searchVolume: 750,
        difficulty: 38,
        competitorUrls: "competitor1.com/tools, competitor3.com/forum-platforms",
        isAddressed: false,
        priority: "medium"
      },
      {
        forumId: 1,
        keyword: "improve forum engagement metrics",
        searchVolume: 560,
        difficulty: 30,
        competitorUrls: "competitor2.com/engagement, competitor4.com/metrics",
        isAddressed: true,
        targetUrl: "https://forum.example.com/guides/engagement",
        priority: "medium"
      }
    ];
    
    for (const gap of contentGaps) {
      await this.createSeoContentGap(gap);
    }
    
    // Create sample page metrics
    const pageMetrics = [
      {
        forumId: 1,
        url: "https://forum.example.com/topic/ai-content",
        pageTitle: "AI Content Generation Strategies",
        organicTraffic: 1245,
        bounceRate: 42.5,
        avgTimeOnPage: 185,
        keywordRankings: JSON.stringify({
          "ai content": 3,
          "ai writing": 7,
          "content generation": 5
        }),
        pageSpeed: 87,
        conversionRate: 3.2,
        contentLength: 2450,
        internalLinks: 14,
        externalLinks: 6,
        backlinks: 23
      },
      {
        forumId: 1,
        url: "https://forum.example.com/topic/seo-basics",
        pageTitle: "SEO Fundamentals for Forums",
        organicTraffic: 2380,
        bounceRate: 38.7,
        avgTimeOnPage: 220,
        keywordRankings: JSON.stringify({
          "forum seo": 2,
          "seo basics": 4,
          "forum optimization": 3
        }),
        pageSpeed: 92,
        conversionRate: 4.8,
        contentLength: 3200,
        internalLinks: 18,
        externalLinks: 8,
        backlinks: 42
      }
    ];
    
    for (const metric of pageMetrics) {
      await this.createSeoPageMetric(metric);
    }
    
    // Create weekly reports
    const currentDate = new Date();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    
    for (let i = 0; i < 4; i++) {
      const weekStartDate = new Date(currentDate.getTime() - ((i + 1) * oneWeek));
      const weekEndDate = new Date(weekStartDate.getTime() + oneWeek - (24 * 60 * 60 * 1000));
      
      // Traffic increases over time
      const baseTraffic = 5000;
      const weekMultiplier = 1 + (0.12 * (3 - i));
      const totalTraffic = Math.round(baseTraffic * weekMultiplier);
      const prevWeekTraffic = i > 0 ? Math.round(baseTraffic * (1 + (0.12 * (3 - (i-1))))) : baseTraffic;
      const trafficChange = ((totalTraffic - prevWeekTraffic) / prevWeekTraffic) * 100;
      
      // Position improves over time
      const basePosition = 18;
      const posImprovement = 0.8 * (3 - i);
      const avgPosition = basePosition - (3 - i) * 2.5;
      const positionChange = posImprovement;
      
      // Create sample keyword movements
      const keywordMovements = {
        rising: [
          { keyword: "forum seo optimization", change: 3, position: 6 - i },
          { keyword: "ai content generation", change: 2, position: 7 - i },
          { keyword: "seo question answer", change: 4, position: 5 - i }
        ],
        declining: [
          { keyword: "social media marketing", change: -1, position: 12 + i },
          { keyword: "content marketing", change: -2, position: 15 + i }
        ],
        new: i === 0 ? [
          { keyword: "forum subdomain seo", position: 8 },
          { keyword: "user generated content seo", position: 11 }
        ] : []
      };
      
      await this.createSeoWeeklyReport({
        forumId: 1,
        weekStartDate,
        weekEndDate,
        totalOrganicTraffic: totalTraffic,
        trafficChange,
        averagePosition: avgPosition,
        positionChange,
        topPerformingPages: JSON.stringify([
          { url: "https://forum.example.com/topic/seo-basics", traffic: 875 },
          { url: "https://forum.example.com/topic/ai-content", traffic: 620 },
          { url: "https://forum.example.com/topic/forum-strategy", traffic: 480 }
        ]),
        keywordMovements: JSON.stringify(keywordMovements),
        newBacklinks: 15 - (i * 3),
        recommendedActions: "Focus on content gaps in AI and forum optimization topics. Improve internal linking structure."
      });
    }
  }
  
  private async initSampleData() {
    await this.initSeoData();
    
    // Create predefined roles
    const roles = [
      {
        name: "admin",
        description: "System administrator with full access to all features"
      },
      {
        name: "forum_owner",
        description: "Owner of one or more forums with full control over their forums"
      },
      {
        name: "moderator",
        description: "Moderates content and user interactions within assigned forums"
      },
      {
        name: "contributor",
        description: "Regular user who can create and participate in discussions"
      },
      {
        name: "reader",
        description: "Can only read content, with limited interaction capabilities"
      }
    ];

    // Create predefined permissions
    const permissions = [
      // Global permissions
      { name: "access_dashboard", description: "Access the admin dashboard", scope: "global", action: "read" },
      { name: "manage_users", description: "Create, update, and delete user accounts", scope: "global", action: "manage" },
      { name: "manage_roles", description: "Create, update, and delete roles", scope: "global", action: "manage" },
      
      // Forum permissions
      { name: "create_forum", description: "Create new forums", scope: "global", action: "create" },
      { name: "edit_forum", description: "Edit forum details", scope: "forum", action: "update" },
      { name: "delete_forum", description: "Delete forums", scope: "forum", action: "delete" },
      { name: "manage_forum_settings", description: "Manage forum settings", scope: "forum", action: "manage" },
      { name: "verify_domain", description: "Verify custom domains for forums", scope: "forum", action: "manage" },
      
      // Category permissions
      { name: "create_category", description: "Create new categories", scope: "forum", action: "create" },
      { name: "edit_category", description: "Edit category details", scope: "category", action: "update" },
      { name: "delete_category", description: "Delete categories", scope: "category", action: "delete" },
      
      // Content permissions
      { name: "create_question", description: "Create new questions", scope: "forum", action: "create" },
      { name: "edit_question", description: "Edit questions", scope: "question", action: "update" },
      { name: "delete_question", description: "Delete questions", scope: "question", action: "delete" },
      { name: "create_answer", description: "Create new answers", scope: "question", action: "create" },
      { name: "edit_answer", description: "Edit answers", scope: "answer", action: "update" },
      { name: "delete_answer", description: "Delete answers", scope: "answer", action: "delete" },
      
      // Moderation permissions
      { name: "moderate_content", description: "Approve or reject content", scope: "forum", action: "moderate" },
      { name: "ban_user", description: "Ban users from forums", scope: "forum", action: "moderate" },
      
      // AI and SEO permissions
      { name: "use_ai_generation", description: "Generate AI-powered content", scope: "forum", action: "use" },
      { name: "schedule_content", description: "Schedule content publication", scope: "forum", action: "manage" },
      { name: "view_analytics", description: "View forum analytics", scope: "forum", action: "read" },
      
      // Lead capture and CRM permissions
      { name: "manage_lead_forms", description: "Create and manage lead capture forms", scope: "forum", action: "manage" },
      { name: "view_leads", description: "View captured leads", scope: "forum", action: "read" },
      { name: "export_leads", description: "Export leads to external systems", scope: "forum", action: "use" },
      { name: "manage_crm", description: "Manage CRM integrations", scope: "forum", action: "manage" },
      
      // Gated content permissions
      { name: "manage_gated_content", description: "Create and manage gated content", scope: "forum", action: "manage" },
      { name: "access_gated_content", description: "Access gated content without submitting forms", scope: "forum", action: "read" }
    ];

    // Create sample role-permission mappings
    const rolePermissionMappings = {
      "admin": [
        "access_dashboard", "manage_users", "manage_roles", "create_forum", "edit_forum", "delete_forum", 
        "manage_forum_settings", "verify_domain", "create_category", "edit_category", "delete_category",
        "create_question", "edit_question", "delete_question", "create_answer", "edit_answer", "delete_answer",
        "moderate_content", "ban_user", "use_ai_generation", "schedule_content", "view_analytics",
        "manage_lead_forms", "view_leads", "export_leads", "manage_crm", "manage_gated_content", "access_gated_content"
      ],
      "forum_owner": [
        "access_dashboard", "edit_forum", "manage_forum_settings", "verify_domain", "create_category", 
        "edit_category", "delete_category", "create_question", "edit_question", "delete_question", 
        "create_answer", "edit_answer", "delete_answer", "moderate_content", "ban_user", "use_ai_generation",
        "schedule_content", "view_analytics", "manage_lead_forms", "view_leads", "export_leads",
        "manage_crm", "manage_gated_content", "access_gated_content"
      ],
      "moderator": [
        "access_dashboard", "create_category", "edit_category", "create_question", "edit_question", 
        "delete_question", "create_answer", "edit_answer", "delete_answer", "moderate_content", 
        "ban_user", "view_analytics"
      ],
      "contributor": [
        "create_question", "edit_question", "create_answer", "edit_answer", "use_ai_generation"
      ],
      "reader": []
    };

    // Insert roles
    const roleMap: Record<string, number> = {};
    for (const role of roles) {
      const createdRole = await this.createRole(role);
      roleMap[createdRole.name] = createdRole.id;
    }

    // Insert permissions
    const permissionMap: Record<string, number> = {};
    for (const permission of permissions) {
      const createdPermission = await this.createPermission(permission);
      permissionMap[createdPermission.name] = createdPermission.id;
    }

    // Assign permissions to roles
    for (const [roleName, permissionNames] of Object.entries(rolePermissionMappings)) {
      const roleId = roleMap[roleName];
      for (const permissionName of permissionNames) {
        const permissionId = permissionMap[permissionName];
        await this.assignPermissionToRole({ roleId, permissionId });
      }
    }

    // Create sample users
    const users = [
      { 
        username: "admin", 
        password: "admin123", 
        email: "admin@forumai.com", 
        displayName: "Admin",
        avatar: "https://i.pravatar.cc/150?img=1",
        isAdmin: true,
        roleId: roleMap["admin"],
        status: "active"
      },
      { 
        username: "sarah_t", 
        password: "sarah123", 
        email: "sarah@example.com", 
        displayName: "Sarah T.",
        avatar: "https://i.pravatar.cc/150?img=5",
        isAdmin: false,
        roleId: roleMap["forum_owner"],
        status: "active"
      },
      { 
        username: "michael_r", 
        password: "michael123", 
        email: "michael@example.com", 
        displayName: "Michael R.",
        avatar: "https://i.pravatar.cc/150?img=12",
        isAdmin: false,
        roleId: roleMap["moderator"],
        status: "active"
      },
      { 
        username: "jennifer_l", 
        password: "jennifer123", 
        email: "jennifer@example.com", 
        displayName: "Jennifer L.",
        avatar: "https://i.pravatar.cc/150?img=16",
        isAdmin: false,
        roleId: roleMap["contributor"],
        status: "active"
      },
      { 
        username: "ai_beginner", 
        password: "aibegin123", 
        email: "ai_beginner@forumai.com", 
        displayName: "AI Beginner",
        avatar: "https://i.pravatar.cc/150?img=25",
        isAdmin: false,
        roleId: roleMap["contributor"],
        status: "active",
        isAI: true
      },
      { 
        username: "ai_expert", 
        password: "aiexpert123", 
        email: "ai_expert@forumai.com", 
        displayName: "AI Expert",
        avatar: "https://i.pravatar.cc/150?img=35",
        isAdmin: false,
        roleId: roleMap["contributor"],
        status: "active",
        isAI: true
      }
    ];

    // Create users one by one
    for (const user of users) {
      await this.createUser(user);
    }

    // Create sample categories
    const categories = [
      { name: "All Topics", slug: "all-topics", description: "All forum topics" },
      { name: "Product Features", slug: "product-features", description: "Discussions about product features" },
      { name: "Integrations", slug: "integrations", description: "How to integrate with other tools" },
      { name: "Best Practices", slug: "best-practices", description: "Best practices and tips" },
      { name: "Troubleshooting", slug: "troubleshooting", description: "Help with common issues" },
      { name: "Industry News", slug: "industry-news", description: "Latest updates in the industry" }
    ];

    // Create categories one by one
    for (const category of categories) {
      await this.createCategory(category);
    }

    // Create sample AI personas
    const personas = [
      { 
        name: "AI Beginner", 
        type: "beginner", 
        avatar: "https://i.pravatar.cc/150?img=25",
        description: "A beginner AI persona who asks basic questions"
      },
      { 
        name: "AI Intermediate", 
        type: "intermediate", 
        avatar: "https://i.pravatar.cc/150?img=30",
        description: "An intermediate AI persona who can answer moderately complex questions"
      },
      { 
        name: "AI Expert", 
        type: "expert", 
        avatar: "https://i.pravatar.cc/150?img=35",
        description: "An expert AI persona who provides detailed, authoritative answers"
      },
      { 
        name: "AI Moderator", 
        type: "moderator", 
        avatar: "https://i.pravatar.cc/150?img=40",
        description: "An AI moderator who helps maintain forum quality and relevance"
      }
    ];

    // Create personas one by one
    for (const persona of personas) {
      await this.createAIPersona(persona);
    }

    // Create sample questions
    const questions = [
      {
        userId: 5, // AI Beginner
        categoryId: 2, // Product Features
        title: "What's the most effective way to implement AI-driven content strategies in 2024?",
        content: "I've been researching various approaches to using AI for content generation, but I'm not sure what's working best right now. Has anyone had success with particular strategies or tools?\n\nI'm particularly interested in:\n- Balancing AI-generated content with human editing\n- Tools that produce the most Google-friendly outputs\n- Strategies for ensuring E-E-A-T compliance\n- Workflows that scale efficiently\n\nAny insights from recent successes would be greatly appreciated!",
        views: 2400,
        isAiGenerated: true,
        aiPersonaType: "beginner",
      },
      {
        userId: 5, // AI Beginner
        categoryId: 3, // Integrations
        title: "How do you measure the ROI of your SEO investments?",
        content: "I'm trying to convince my boss that we need to invest more in SEO, but he wants to see concrete ROI metrics. What are the best ways to track and demonstrate the value of SEO efforts? What metrics have been most convincing in your experience?",
        views: 3800,
        isAiGenerated: true,
        aiPersonaType: "beginner",
      },
      {
        userId: 5, // AI Beginner
        categoryId: 6, // Industry News
        title: "Which keyword research tools are worth the investment in 2024?",
        content: "There are so many options out there, from free tools to enterprise solutions costing thousands. I'm wondering which ones provide the best value for a mid-sized business focused on organic growth. Has anyone compared the latest features across platforms recently?",
        views: 5200,
        isAiGenerated: true,
        aiPersonaType: "beginner",
      }
    ];

    // Create questions one by one
    for (const question of questions) {
      await this.createQuestion(question);
    }

    // Create sample answers
    const answers = [
      {
        questionId: 1,
        userId: 6, // AI Expert
        content: "Great question, Sarah! In 2024, the most effective AI content strategies are focusing on what I call the \"Human-AI Hybrid\" approach. Based on my work with enterprise clients, here's what's working best:\n\n1. Specialized AI Tools + Human Expertise\nThe days of generic AI writing are over. Top performers are using domain-specific AI tools like ContentForge AI that are pre-trained on industry content. Then, subject matter experts refine and add unique insights that only humans can provide.\n\n2. E-E-A-T Compliance Framework\nGoogle's emphasis on Experience, Expertise, Authoritativeness, and Trustworthiness means every piece needs credibility signals. We're seeing best results when:\n- AI generates the structural framework and research synthesis\n- Human experts add personal anecdotes and specialized insights\n- Content includes cited sources and data visualization\n- Bylines link to verified credentials\n\n3. Scaling Through Workflows\nThe most efficient teams are using AI platforms with built-in workflow management. For example, our platform allows you to define templates with designated human touchpoints at critical junctures.\n\nHappy to share more specific implementation details if you're interested!",
        isAiGenerated: true,
        aiPersonaType: "expert",
      },
      {
        questionId: 2,
        userId: 3, // Michael R.
        content: "After years of working with enterprise SEO teams, I've found these to be the most convincing metrics for demonstrating ROI:\n\n1. Organic Traffic Value: Calculate how much you'd need to spend on PPC to achieve the same traffic. Tools like SEMrush can estimate this automatically.\n\n2. Conversion Rate from Organic Traffic: Don't just show traffic increases; tie them to actual business outcomes. This is what executives care about most.\n\n3. Year-over-Year Growth: Removes seasonal fluctuations and shows sustained improvement over time.\n\n4. Competitive Market Share: Show how your organic visibility is growing compared to competitors.\n\n5. Customer Acquisition Cost: Compare the cost of acquiring customers through SEO vs. other channels.\n\nThe key is to create a dashboard that shows all these metrics in one place, with clear visualizations that demonstrate trends over time. Happy to share our template if you'd find it helpful.",
        isAiGenerated: false,
      }
    ];

    // Create answers one by one
    for (const answer of answers) {
      await this.createAnswer(answer);
    }

    // Create sample votes
    const votes = [
      {
        userId: 2, // Sarah T.
        answerId: 1,
        isUpvote: true
      },
      {
        userId: 3, // Michael R.
        answerId: 1,
        isUpvote: true
      },
      {
        userId: 4, // Jennifer L.
        answerId: 1,
        isUpvote: true
      }
    ];

    // Create votes one by one
    for (const vote of votes) {
      await this.createOrUpdateVote(vote);
    }
    
    // Create sample main site pages
    const mainSitePages = [
      {
        title: "Maximize SEO with AI-Powered Content Strategies",
        slug: "ai-powered-content-strategies",
        content: "Learn how to leverage artificial intelligence to create SEO-optimized content at scale...",
        metaDescription: "Discover effective AI-driven content strategies to improve your SEO and boost organic traffic.",
        metaKeywords: "AI content, SEO optimization, content strategy, machine learning",
        pageType: "blog",
        featuredImage: "https://example.com/images/ai-content.jpg"
      },
      {
        title: "ROI Measurement for SEO Investments",
        slug: "seo-roi-measurement",
        content: "A comprehensive guide to tracking and demonstrating the value of your SEO investments...",
        metaDescription: "Learn effective methods to measure and report SEO ROI to stakeholders and executives.",
        metaKeywords: "SEO ROI, search engine optimization, analytics, metrics",
        pageType: "guide",
        featuredImage: "https://example.com/images/seo-roi.jpg"
      },
      {
        title: "Top Keyword Research Tools Comparison",
        slug: "keyword-research-tools-comparison",
        content: "We compare the best keyword research tools for businesses of all sizes...",
        metaDescription: "Find the best keyword research tools for your business with our comprehensive comparison.",
        metaKeywords: "keyword research tools, SEO tools, organic traffic, keyword analysis",
        pageType: "comparison",
        featuredImage: "https://example.com/images/keyword-tools.jpg"
      }
    ];
    
    // Create main site pages one by one
    for (const page of mainSitePages) {
      await this.createMainSitePage(page);
    }
    
    // Create sample interlinks
    const contentInterlinks = [
      {
        sourceType: "main_page",
        sourceId: 1, // AI-powered content strategies page
        targetType: "question",
        targetId: 1, // Question about AI-driven content strategies
        anchorText: "Learn from forum discussions on AI content strategies",
        relevanceScore: 85,
        createdByUserId: 1,
        automatic: true
      },
      {
        sourceType: "question",
        sourceId: 1, // Question about AI-driven content strategies
        targetType: "main_page",
        targetId: 1, // AI-powered content strategies page
        anchorText: "Check out our detailed guide on AI content strategies",
        relevanceScore: 90,
        createdByUserId: 1,
        automatic: true
      },
      {
        sourceType: "main_page",
        sourceId: 2, // ROI measurement page
        targetType: "question",
        targetId: 2, // Question about measuring SEO ROI
        anchorText: "See how our users measure ROI in this discussion",
        relevanceScore: 82,
        createdByUserId: 1,
        automatic: true
      },
      {
        sourceType: "answer",
        sourceId: 2, // Answer about ROI measurement
        targetType: "main_page",
        targetId: 2, // ROI measurement page
        anchorText: "Our comprehensive ROI guide covers this in detail",
        relevanceScore: 88,
        createdByUserId: 1,
        automatic: true
      }
    ];
    
    // Create interlinks one by one
    for (const interlink of contentInterlinks) {
      await this.createContentInterlink(interlink);
    }
    
    // Create sample forums
    const forums = [
      {
        name: "SEO Experts Forum",
        slug: "seo-experts",
        description: "A forum for SEO professionals to share tips, strategies, and case studies",
        themeColor: "#3B82F6",
        primaryFont: "Inter",
        secondaryFont: "Roboto",
        headingFontSize: "1.5rem",
        bodyFontSize: "1rem",
        mainWebsiteUrl: "https://seoexperts.com",
        subdomain: "seo",
        isPublic: true,
        requiresApproval: false,
        userId: 1 // Admin
      },
      {
        name: "Content Marketing Hub",
        slug: "content-marketing",
        description: "Discussions about content strategy, creation, and promotion",
        themeColor: "#10B981",
        primaryFont: "Montserrat",
        secondaryFont: "Open Sans",
        headingFontSize: "1.75rem",
        bodyFontSize: "0.95rem",
        mainWebsiteUrl: "https://contentmarketingpros.com",
        subdomain: "content",
        isPublic: true,
        requiresApproval: false,
        userId: 2 // Sarah T.
      },
      {
        name: "Analytics & Tracking",
        slug: "analytics-tracking",
        description: "Technical forum for web analytics and conversion tracking",
        themeColor: "#8B5CF6",
        primaryFont: "Poppins",
        secondaryFont: "Lato",
        headingFontSize: "1.6rem",
        bodyFontSize: "1.05rem",
        mainWebsiteUrl: "https://analytics-masters.com",
        subdomain: "analytics",
        isPublic: true,
        requiresApproval: true,
        userId: 3 // Michael R.
      }
    ];
    
    // Create forums one by one
    for (const forum of forums) {
      await this.createForum(forum);
    }
  }

  // Role methods
  async getRole(id: number): Promise<Role | undefined> {
    return this.rolesStore.get(id);
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    for (const role of this.rolesStore.values()) {
      if (role.name === name) {
        return role;
      }
    }
    return undefined;
  }

  async getAllRoles(): Promise<Role[]> {
    return Array.from(this.rolesStore.values());
  }

  async createRole(role: InsertRole): Promise<Role> {
    const id = this.roleId++;
    const now = new Date();
    const newRole: Role = { 
      ...role, 
      id, 
      createdAt: now,
      updatedAt: now,
      description: role.description || null
    };
    this.rolesStore.set(id, newRole);
    return newRole;
  }

  async updateRole(id: number, data: Partial<InsertRole>): Promise<Role> {
    const role = this.rolesStore.get(id);
    if (!role) {
      throw new Error(`Role with id ${id} not found`);
    }

    const updatedRole = { 
      ...role, 
      ...data, 
      updatedAt: new Date() 
    };
    this.rolesStore.set(id, updatedRole);
    return updatedRole;
  }

  async deleteRole(id: number): Promise<void> {
    // First check if any users have this role
    for (const user of this.usersStore.values()) {
      if (user.roleId === id) {
        throw new Error(`Cannot delete role with id ${id} because it is assigned to users`);
      }
    }

    // Also check user forum roles
    for (const userForumRole of this.userForumRolesStore.values()) {
      if (userForumRole.roleId === id) {
        throw new Error(`Cannot delete role with id ${id} because it is assigned to users in forums`);
      }
    }

    // Delete all role-permission associations
    for (const [permId, rolePermission] of this.rolePermissionsStore.entries()) {
      if (rolePermission.roleId === id) {
        this.rolePermissionsStore.delete(permId);
      }
    }

    this.rolesStore.delete(id);
  }

  // Permission methods
  async getPermission(id: number): Promise<Permission | undefined> {
    return this.permissionsStore.get(id);
  }

  async getPermissionByName(name: string): Promise<Permission | undefined> {
    for (const permission of this.permissionsStore.values()) {
      if (permission.name === name) {
        return permission;
      }
    }
    return undefined;
  }

  async getPermissionsByScope(scope: string): Promise<Permission[]> {
    const result: Permission[] = [];
    for (const permission of this.permissionsStore.values()) {
      if (permission.scope === scope) {
        result.push(permission);
      }
    }
    return result;
  }

  async getAllPermissions(): Promise<Permission[]> {
    return Array.from(this.permissionsStore.values());
  }

  async createPermission(permission: InsertPermission): Promise<Permission> {
    const id = this.permissionId++;
    const now = new Date();
    const newPermission: Permission = { 
      ...permission, 
      id,
      createdAt: now,
      description: permission.description || null
    };
    this.permissionsStore.set(id, newPermission);
    return newPermission;
  }

  async updatePermission(id: number, data: Partial<InsertPermission>): Promise<Permission> {
    const permission = this.permissionsStore.get(id);
    if (!permission) {
      throw new Error(`Permission with id ${id} not found`);
    }

    const updatedPermission = { 
      ...permission, 
      ...data, 
      updatedAt: new Date()
    };
    this.permissionsStore.set(id, updatedPermission);
    return updatedPermission;
  }

  async deletePermission(id: number): Promise<void> {
    // First delete all role-permission associations
    for (const [rpId, rolePermission] of this.rolePermissionsStore.entries()) {
      if (rolePermission.permissionId === id) {
        this.rolePermissionsStore.delete(rpId);
      }
    }

    this.permissionsStore.delete(id);
  }

  // Role-Permission methods
  async assignPermissionToRole(rolePermission: InsertRolePermission): Promise<RolePermission> {
    // First check if this assignment already exists
    for (const rp of this.rolePermissionsStore.values()) {
      if (rp.roleId === rolePermission.roleId && rp.permissionId === rolePermission.permissionId) {
        return rp;
      }
    }

    const id = this.rolePermissionId++;
    const newRolePermission: RolePermission = { 
      ...rolePermission, 
      id, 
      createdAt: new Date() 
    };
    this.rolePermissionsStore.set(id, newRolePermission);
    return newRolePermission;
  }

  async removePermissionFromRole(roleId: number, permissionId: number): Promise<void> {
    for (const [id, rp] of this.rolePermissionsStore.entries()) {
      if (rp.roleId === roleId && rp.permissionId === permissionId) {
        this.rolePermissionsStore.delete(id);
        return;
      }
    }
  }

  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const permissions: Permission[] = [];
    for (const rp of this.rolePermissionsStore.values()) {
      if (rp.roleId === roleId) {
        const permission = this.permissionsStore.get(rp.permissionId);
        if (permission) {
          permissions.push(permission);
        }
      }
    }
    return permissions;
  }

  // User Forum Role methods
  async assignUserForumRole(userForumRole: InsertUserForumRole): Promise<UserForumRole> {
    // First check if this user already has a role in this forum
    for (const ufr of this.userForumRolesStore.values()) {
      if (ufr.userId === userForumRole.userId && ufr.forumId === userForumRole.forumId) {
        // Update existing role
        ufr.roleId = userForumRole.roleId;
        ufr.updatedAt = new Date();
        return ufr;
      }
    }

    const id = this.userForumRoleId++;
    const now = new Date();
    const newUserForumRole: UserForumRole = {
      ...userForumRole,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.userForumRolesStore.set(id, newUserForumRole);
    return newUserForumRole;
  }

  async removeUserForumRole(userId: number, forumId: number): Promise<void> {
    for (const [id, ufr] of this.userForumRolesStore.entries()) {
      if (ufr.userId === userId && ufr.forumId === forumId) {
        this.userForumRolesStore.delete(id);
        return;
      }
    }
  }

  async getUserForumRoles(userId: number): Promise<UserForumRole[]> {
    const userForumRoles: UserForumRole[] = [];
    for (const ufr of this.userForumRolesStore.values()) {
      if (ufr.userId === userId) {
        userForumRoles.push(ufr);
      }
    }
    return userForumRoles;
  }

  async getUserForumRolesByForum(forumId: number): Promise<UserForumRole[]> {
    const userForumRoles: UserForumRole[] = [];
    for (const ufr of this.userForumRolesStore.values()) {
      if (ufr.forumId === forumId) {
        userForumRoles.push(ufr);
      }
    }
    return userForumRoles;
  }

  async updateUserRole(userId: number, roleId: number): Promise<User> {
    const user = this.usersStore.get(userId);
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }

    user.roleId = roleId;
    user.updatedAt = new Date();
    return user;
  }

  async hasPermission(userId: number, permissionName: string, forumId?: number): Promise<boolean> {
    const user = this.usersStore.get(userId);
    if (!user) return false;

    // Admin users have all permissions
    if (user.isAdmin) return true;

    // Get the user's global role
    if (user.roleId) {
      const permissions = await this.getRolePermissions(user.roleId);
      for (const permission of permissions) {
        if (permission.name === permissionName) {
          return true;
        }
      }
    }

    // If a forum ID is provided, check forum-specific roles
    if (forumId) {
      for (const ufr of this.userForumRolesStore.values()) {
        if (ufr.userId === userId && ufr.forumId === forumId) {
          const permissions = await this.getRolePermissions(ufr.roleId);
          for (const permission of permissions) {
            if (permission.name === permissionName) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersStore.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    for (const user of this.usersStore.values()) {
      if (user.username === username) {
        return user;
      }
    }
    return undefined;
  }
  
  async getOrCreateAPIUser(forumId: number): Promise<User> {
    // First, check if an API user for this forum already exists
    for (const user of this.usersStore.values()) {
      if (user.isAI && user.username.startsWith(`api_forum_${forumId}_`)) {
        return user;
      }
    }
    
    // If not found, create a new API user
    const apiUserName = `api_forum_${forumId}_${Date.now()}`;
    const apiUser = await this.createUser({
      username: apiUserName,
      email: `api_${apiUserName}@formai.app`,
      password: `api_${Math.random().toString(36).substring(2, 15)}`,
      displayName: `API User (Forum ${forumId})`,
      isAI: true,
      isAdmin: false,
      status: 'active'
    });
    
    // Assign appropriate role if needed
    // This would depend on your role system
    
    return apiUser;
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const newUser: User = { 
      ...user, 
      id,
      createdAt: now,
      updatedAt: now,
      lastLoginAt: null,
      status: user.status || 'active'
    };
    this.usersStore.set(id, newUser);
    return newUser;
  }

  // Category methods
  async getCategory(id: number): Promise<Category | undefined> {
    return this.categoriesStore.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    for (const category of this.categoriesStore.values()) {
      if (category.slug === slug) {
        return category;
      }
    }
    return undefined;
  }

  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categoriesStore.values());
  }
  
  async getCategories(): Promise<Category[]> {
    return this.getAllCategories();
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const newCategory = { ...category, id };
    this.categoriesStore.set(id, newCategory);
    return newCategory;
  }

  // Question methods
  async getQuestion(id: number): Promise<Question | undefined> {
    return this.questionsStore.get(id);
  }

  async getQuestionWithDetails(id: number): Promise<QuestionWithDetails | undefined> {
    const question = this.questionsStore.get(id);
    if (!question) return undefined;

    const user = this.usersStore.get(question.userId);
    const category = this.categoriesStore.get(question.categoryId);
    
    if (!user || !category) return undefined;

    // Count answers for this question
    let answerCount = 0;
    for (const answer of this.answersStore.values()) {
      if (answer.questionId === id) {
        answerCount++;
      }
    }

    return {
      ...question,
      user,
      category,
      answers: answerCount
    };
  }

  async getAllQuestions(): Promise<Question[]> {
    return Array.from(this.questionsStore.values());
  }

  async getAllQuestionsWithDetails(): Promise<QuestionWithDetails[]> {
    const result: QuestionWithDetails[] = [];
    
    for (const question of this.questionsStore.values()) {
      const user = this.usersStore.get(question.userId);
      const category = this.categoriesStore.get(question.categoryId);
      
      if (!user || !category) continue;
      
      // Count answers for this question
      let answerCount = 0;
      for (const answer of this.answersStore.values()) {
        if (answer.questionId === question.id) {
          answerCount++;
        }
      }
      
      result.push({
        ...question,
        user,
        category,
        answers: answerCount
      });
    }
    
    // Sort by most recent first
    return result.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async createQuestion(question: InsertQuestion): Promise<Question> {
    const id = this.questionId++;
    const newQuestion: Question = { 
      ...question, 
      id, 
      views: question.views || 0,
      createdAt: new Date().toISOString()
    };
    this.questionsStore.set(id, newQuestion);
    return newQuestion;
  }

  async incrementQuestionViews(id: number): Promise<void> {
    const question = this.questionsStore.get(id);
    if (question) {
      question.views = (question.views || 0) + 1;
      this.questionsStore.set(id, question);
    }
  }

  // Answer methods
  async getAnswer(id: number): Promise<Answer | undefined> {
    return this.answersStore.get(id);
  }

  async getAnswerWithDetails(id: number): Promise<AnswerWithDetails | undefined> {
    const answer = this.answersStore.get(id);
    if (!answer) return undefined;

    const user = this.usersStore.get(answer.userId);
    if (!user) return undefined;

    // Count votes for this answer
    let voteCount = 0;
    for (const vote of this.votesStore.values()) {
      if (vote.answerId === id) {
        voteCount += vote.isUpvote ? 1 : -1;
      }
    }

    return {
      ...answer,
      user,
      votes: voteCount
    };
  }

  async getAnswersForQuestion(questionId: number): Promise<AnswerWithDetails[]> {
    const result: AnswerWithDetails[] = [];
    
    for (const answer of this.answersStore.values()) {
      if (answer.questionId === questionId) {
        const user = this.usersStore.get(answer.userId);
        if (!user) continue;
        
        // Count votes for this answer
        let voteCount = 0;
        for (const vote of this.votesStore.values()) {
          if (vote.answerId === answer.id) {
            voteCount += vote.isUpvote ? 1 : -1;
          }
        }
        
        result.push({
          ...answer,
          user,
          votes: voteCount
        });
      }
    }
    
    // Sort by most helpful (most votes) first
    return result.sort((a, b) => b.votes - a.votes);
  }

  async createAnswer(answer: InsertAnswer): Promise<Answer> {
    const id = this.answerId++;
    const newAnswer: Answer = { 
      ...answer, 
      id,
      createdAt: new Date().toISOString()
    };
    this.answersStore.set(id, newAnswer);
    return newAnswer;
  }

  // Vote methods
  async getVote(id: number): Promise<Vote | undefined> {
    return this.votesStore.get(id);
  }

  async getVoteByUserAndAnswer(userId: number, answerId: number): Promise<Vote | undefined> {
    for (const vote of this.votesStore.values()) {
      if (vote.userId === userId && vote.answerId === answerId) {
        return vote;
      }
    }
    return undefined;
  }

  async createOrUpdateVote(vote: InsertVote): Promise<Vote> {
    // Check if user already voted for this answer
    const existingVote = await this.getVoteByUserAndAnswer(vote.userId, vote.answerId);
    
    if (existingVote) {
      // Update existing vote
      existingVote.isUpvote = vote.isUpvote;
      this.votesStore.set(existingVote.id, existingVote);
      return existingVote;
    } else {
      // Create new vote
      const id = this.voteId++;
      const newVote = { ...vote, id };
      this.votesStore.set(id, newVote);
      return newVote;
    }
  }

  // AI Persona methods
  async getAIPersona(id: number): Promise<AiPersona | undefined> {
    return this.aiPersonasStore.get(id);
  }

  async getAllAIPersonas(): Promise<AiPersona[]> {
    return Array.from(this.aiPersonasStore.values());
  }

  async createAIPersona(persona: InsertAiPersona): Promise<AiPersona> {
    const id = this.aiPersonaId++;
    const newPersona = { ...persona, id };
    this.aiPersonasStore.set(id, newPersona);
    return newPersona;
  }

  // Main Site Pages methods
  async getMainSitePage(id: number): Promise<MainSitePage | undefined> {
    return this.mainSitePagesStore.get(id);
  }

  async getMainSitePageBySlug(slug: string): Promise<MainSitePage | undefined> {
    for (const page of this.mainSitePagesStore.values()) {
      if (page.slug === slug) {
        return page;
      }
    }
    return undefined;
  }

  async getAllMainSitePages(): Promise<MainSitePage[]> {
    return Array.from(this.mainSitePagesStore.values());
  }

  async createMainSitePage(page: InsertMainSitePage): Promise<MainSitePage> {
    const id = this.mainSitePageId++;
    const newPage: MainSitePage = { 
      ...page, 
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.mainSitePagesStore.set(id, newPage);
    return newPage;
  }

  async getMainSitePageWithLinks(id: number): Promise<MainSitePageWithLinks | undefined> {
    const page = this.mainSitePagesStore.get(id);
    if (!page) return undefined;

    const incomingLinks = Array.from(this.contentInterlinksStore.values()).filter(
      link => link.targetType === 'main_page' && link.targetId === id
    );

    const outgoingLinks = Array.from(this.contentInterlinksStore.values()).filter(
      link => link.sourceType === 'main_page' && link.sourceId === id
    );

    return {
      ...page,
      incomingLinks,
      outgoingLinks
    };
  }

  // Content Interlinking methods
  async getContentInterlink(id: number): Promise<ContentInterlink | undefined> {
    return this.contentInterlinksStore.get(id);
  }

  async createContentInterlink(interlink: InsertContentInterlink): Promise<ContentInterlink> {
    const id = this.contentInterlinkId++;
    const newInterlink: ContentInterlink = { 
      ...interlink, 
      id,
      createdAt: new Date()
    };
    this.contentInterlinksStore.set(id, newInterlink);
    return newInterlink;
  }

  async getInterlinksForSource(sourceType: string, sourceId: number): Promise<ContentInterlink[]> {
    return Array.from(this.contentInterlinksStore.values()).filter(
      link => link.sourceType === sourceType && link.sourceId === sourceId
    );
  }

  async getInterlinksForTarget(targetType: string, targetId: number): Promise<ContentInterlink[]> {
    return Array.from(this.contentInterlinksStore.values()).filter(
      link => link.targetType === targetType && link.targetId === targetId
    );
  }

  async getRelevantContentForInterlinking(contentType: string, contentId: number, limit: number = 5): Promise<Array<{id: number, type: string, title: string, relevanceScore: number}>> {
    const results: Array<{id: number, type: string, title: string, relevanceScore: number}> = [];
    
    // Get the source content to compare with
    let sourceContent = '';
    let sourceTitle = '';
    
    if (contentType === 'question') {
      const question = this.questionsStore.get(contentId);
      if (question) {
        sourceContent = question.content;
        sourceTitle = question.title;
      }
    } else if (contentType === 'answer') {
      const answer = this.answersStore.get(contentId);
      if (answer) {
        sourceContent = answer.content;
        // Get the question title for context
        const question = this.questionsStore.get(answer.questionId);
        if (question) {
          sourceTitle = question.title;
        }
      }
    } else if (contentType === 'main_page') {
      const page = this.mainSitePagesStore.get(contentId);
      if (page) {
        sourceContent = page.content;
        sourceTitle = page.title;
      }
    }
    
    if (!sourceContent) return results;
    
    // Calculate relevance for main site pages
    if (contentType !== 'main_page') {
      for (const page of this.mainSitePagesStore.values()) {
        if (page.id === contentId && contentType === 'main_page') continue;
        
        // Simple relevance calculation (in a real app, this would use more sophisticated NLP)
        const relevanceScore = this.calculateRelevanceScore(
          sourceTitle, 
          sourceContent, 
          page.title, 
          page.content
        );
        
        if (relevanceScore > 50) { // Minimum threshold for relevance
          results.push({
            id: page.id,
            type: 'main_page',
            title: page.title,
            relevanceScore
          });
        }
      }
    }
    
    // Calculate relevance for questions
    if (contentType !== 'question') {
      for (const question of this.questionsStore.values()) {
        if (question.id === contentId && contentType === 'question') continue;
        
        // Calculate relevance
        const relevanceScore = this.calculateRelevanceScore(
          sourceTitle, 
          sourceContent, 
          question.title, 
          question.content
        );
        
        if (relevanceScore > 50) { // Minimum threshold for relevance
          results.push({
            id: question.id,
            type: 'question',
            title: question.title,
            relevanceScore
          });
        }
      }
    }
    
    // Sort by relevance score (descending) and limit results
    return results
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }
  
  // Helper method to calculate relevance between two pieces of content
  private calculateRelevanceScore(sourceTitle: string, sourceContent: string, targetTitle: string, targetContent: string): number {
    // Simple implementation for demo purposes
    // In a real app, this would use NLP, TF-IDF, cosine similarity, etc.
    
    const sourceLower = (sourceTitle + ' ' + sourceContent).toLowerCase();
    const targetLower = (targetTitle + ' ' + targetContent).toLowerCase();
    
    // Extract keywords (simplified version)
    const sourceWords = sourceLower.split(/\s+/).filter(word => word.length > 4);
    const targetWords = targetLower.split(/\s+/).filter(word => word.length > 4);
    
    // Count matching keywords
    let matchCount = 0;
    for (const sourceWord of sourceWords) {
      if (targetWords.includes(sourceWord)) {
        matchCount++;
      }
    }
    
    // Calculate percentage match and normalize to 0-100 range
    const maxPossibleMatches = Math.min(sourceWords.length, targetWords.length);
    if (maxPossibleMatches === 0) return 0;
    
    // Give extra weight to title matches
    const titleMatchBonus = sourceTitle.toLowerCase().includes(targetTitle.toLowerCase()) ||
                            targetTitle.toLowerCase().includes(sourceTitle.toLowerCase())
                            ? 20 : 0;
    
    return Math.min(100, Math.floor((matchCount / maxPossibleMatches) * 80) + titleMatchBonus);
  }

  // Forum methods
  async getForum(id: number): Promise<Forum | undefined> {
    return this.forumsStore.get(id);
  }

  async getForumBySlug(slug: string): Promise<Forum | undefined> {
    for (const forum of this.forumsStore.values()) {
      if (forum.slug === slug) {
        return forum;
      }
    }
    return undefined;
  }

  async getForumBySubdomain(subdomain: string): Promise<Forum | undefined> {
    for (const forum of this.forumsStore.values()) {
      if (forum.subdomain === subdomain) {
        return forum;
      }
    }
    return undefined;
  }

  async getForumByCustomDomain(domain: string): Promise<Forum | undefined> {
    for (const forum of this.forumsStore.values()) {
      if (forum.customDomain === domain) {
        return forum;
      }
    }
    return undefined;
  }

  async getAllForums(): Promise<Forum[]> {
    return Array.from(this.forumsStore.values());
  }
  
  async countQuestionsByForum(forumId: number): Promise<number> {
    let count = 0;
    for (const question of this.questionsStore.values()) {
      // We need to find questions associated with this forum
      // In a real implementation, questions would have forumId directly
      // Here we're getting categories for the forum and checking if the question belongs to them
      const categories = await this.getCategoriesByForum(forumId);
      const categoryIds = categories.map(c => c.id);
      if (categoryIds.includes(question.categoryId)) {
        count++;
      }
    }
    return count;
  }
  
  async countAnswersByForum(forumId: number): Promise<number> {
    let count = 0;
    for (const answer of this.answersStore.values()) {
      const question = this.questionsStore.get(answer.questionId);
      if (question) {
        // Same approach as countQuestionsByForum
        const categories = await this.getCategoriesByForum(forumId);
        const categoryIds = categories.map(c => c.id);
        if (categoryIds.includes(question.categoryId)) {
          count++;
        }
      }
    }
    return count;
  }
  
  async getCategoriesByForum(forumId: number): Promise<Category[]> {
    // In this simplified implementation, we assume that each forum has a set of categories
    // In a real implementation, categories would have forumId
    // For now, we'll use a simple rule based on IDs to simulate forum-category relationship
    return Array.from(this.categoriesStore.values()).filter(category => 
      category.id % 10 === forumId % 10
    );
  }
  
  async getQuestionsForForum(forumId: number, limit: number = 10, categoryId?: number): Promise<QuestionWithDetails[]> {
    const categories = categoryId 
      ? [await this.getCategory(categoryId)].filter(Boolean) as Category[]
      : await this.getCategoriesByForum(forumId);
    
    const categoryIds = categories.map(c => c.id);
    
    const questions = Array.from(this.questionsStore.values())
      .filter(q => categoryIds.includes(q.categoryId))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
    
    // Enrich with user and category information
    return Promise.all(questions.map(async q => {
      const user = await this.getUser(q.userId);
      const category = await this.getCategory(q.categoryId);
      
      if (!user || !category) {
        throw new Error(`Missing user or category for question ${q.id}`);
      }
      
      // Count answers
      let answerCount = 0;
      for (const answer of this.answersStore.values()) {
        if (answer.questionId === q.id) {
          answerCount++;
        }
      }
      
      return {
        ...q,
        user,
        category,
        answers: answerCount
      };
    }));
  }
  
  async getPopularQuestionsForForum(
    forumId: number, 
    sortBy: 'views' | 'answers' = 'views', 
    limit: number = 10,
    categoryId?: number,
    timeFrame?: number
  ): Promise<QuestionWithDetails[]> {
    const categories = categoryId 
      ? [await this.getCategory(categoryId)].filter(Boolean) as Category[]
      : await this.getCategoriesByForum(forumId);
    
    const categoryIds = categories.map(c => c.id);
    
    // Filter by time frame if specified
    let questions = Array.from(this.questionsStore.values())
      .filter(q => categoryIds.includes(q.categoryId));
    
    if (timeFrame) {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeFrame);
      questions = questions.filter(q => new Date(q.createdAt).getTime() > cutoffDate.getTime());
    }
    
    // Enrich with user, category, and answer counts
    const questionsWithDetails = await Promise.all(questions.map(async q => {
      const user = await this.getUser(q.userId);
      const category = await this.getCategory(q.categoryId);
      
      if (!user || !category) {
        throw new Error(`Missing user or category for question ${q.id}`);
      }
      
      // Count answers
      let answerCount = 0;
      for (const answer of this.answersStore.values()) {
        if (answer.questionId === q.id) {
          answerCount++;
        }
      }
      
      return {
        ...q,
        user,
        category,
        answers: answerCount
      };
    }));
    
    // Sort by the specified criteria
    if (sortBy === 'views') {
      questionsWithDetails.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else {
      questionsWithDetails.sort((a, b) => b.answers - a.answers);
    }
    
    return questionsWithDetails.slice(0, limit);
  }
  
  async searchQuestionsInForum(
    forumId: number,
    query: string,
    limit: number = 20,
    categoryId?: number
  ): Promise<QuestionWithDetails[]> {
    const categories = categoryId 
      ? [await this.getCategory(categoryId)].filter(Boolean) as Category[]
      : await this.getCategoriesByForum(forumId);
    
    const categoryIds = categories.map(c => c.id);
    
    // Simple search implementation for demo purposes
    const lowerQuery = query.toLowerCase();
    const matchingQuestions = Array.from(this.questionsStore.values())
      .filter(q => 
        categoryIds.includes(q.categoryId) && 
        (q.title.toLowerCase().includes(lowerQuery) || 
         q.content.toLowerCase().includes(lowerQuery))
      );
    
    // Enrich with user, category, and answer counts
    const questionsWithDetails = await Promise.all(matchingQuestions.map(async q => {
      const user = await this.getUser(q.userId);
      const category = await this.getCategory(q.categoryId);
      
      if (!user || !category) {
        throw new Error(`Missing user or category for question ${q.id}`);
      }
      
      // Count answers
      let answerCount = 0;
      for (const answer of this.answersStore.values()) {
        if (answer.questionId === q.id) {
          answerCount++;
        }
      }
      
      return {
        ...q,
        user,
        category,
        answers: answerCount
      };
    }));
    
    // Sort by relevance (simple implementation)
    questionsWithDetails.sort((a, b) => {
      const aTitle = a.title.toLowerCase().includes(lowerQuery);
      const bTitle = b.title.toLowerCase().includes(lowerQuery);
      
      if (aTitle && !bTitle) return -1;
      if (!aTitle && bTitle) return 1;
      
      // If both titles match or don't match, sort by recency
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    return questionsWithDetails.slice(0, limit);
  }
  
  async checkSameForumOwner(questionId: number, forumId: number): Promise<boolean> {
    const question = await this.getQuestion(questionId);
    if (!question) return false;
    
    const questionCategory = await this.getCategory(question.categoryId);
    if (!questionCategory) return false;
    
    // In our simplified model, we check if categories are related to the same forum
    const forumCategories = await this.getCategoriesByForum(forumId);
    const forumCategoryIds = forumCategories.map(c => c.id);
    
    return forumCategoryIds.includes(questionCategory.id);
  }

  async getForumsByUser(userId: number): Promise<ForumWithStats[]> {
    const userForums = Array.from(this.forumsStore.values())
      .filter(forum => forum.userId === userId);
    
    return userForums.map(forum => {
      // In a real app, we would calculate actual question and answer counts
      // For now, we'll use random counts for demo purposes
      return {
        ...forum,
        totalQuestions: Math.floor(Math.random() * 100) + 5,
        totalAnswers: Math.floor(Math.random() * 200) + 10
      };
    });
  }

  async createForum(forum: InsertForum): Promise<Forum> {
    const id = this.forumId++;
    const newForum: Forum = {
      ...forum,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.forumsStore.set(id, newForum);
    return newForum;
  }

  async updateForum(id: number, data: Partial<InsertForum>): Promise<Forum> {
    const forum = this.forumsStore.get(id);
    if (!forum) {
      throw new Error(`Forum with id ${id} not found`);
    }
    
    const updatedForum: Forum = {
      ...forum,
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    this.forumsStore.set(id, updatedForum);
    return updatedForum;
  }

  async updateForumDomain(id: number, data: { subdomain?: string; customDomain?: string }): Promise<Forum> {
    const forum = this.forumsStore.get(id);
    if (!forum) {
      throw new Error(`Forum with id ${id} not found`);
    }
    
    // Validation for unique subdomains and domains
    if (data.subdomain) {
      const existingForumWithSubdomain = await this.getForumBySubdomain(data.subdomain);
      if (existingForumWithSubdomain && existingForumWithSubdomain.id !== id) {
        throw new Error(`Subdomain "${data.subdomain}" is already in use`);
      }
    }
    
    if (data.customDomain) {
      const existingForumWithDomain = await this.getForumByCustomDomain(data.customDomain);
      if (existingForumWithDomain && existingForumWithDomain.id !== id) {
        throw new Error(`Domain "${data.customDomain}" is already in use`);
      }
    }
    
    const updatedForum: Forum = {
      ...forum,
      subdomain: data.subdomain !== undefined ? data.subdomain : forum.subdomain,
      customDomain: data.customDomain !== undefined ? data.customDomain : forum.customDomain,
      updatedAt: new Date().toISOString()
    };
    
    this.forumsStore.set(id, updatedForum);
    return updatedForum;
  }

  async deleteForum(id: number): Promise<void> {
    if (!this.forumsStore.has(id)) {
      throw new Error(`Forum with id ${id} not found`);
    }
    this.forumsStore.delete(id);
  }

  // Domain verification methods
  async createDomainVerification(verification: InsertDomainVerification): Promise<DomainVerification> {
    const id = this.domainVerificationId++;
    const newVerification: DomainVerification = {
      ...verification,
      id,
      isVerified: verification.isVerified || false,
      createdAt: new Date().toISOString()
    };
    this.domainVerificationsStore.set(id, newVerification);
    return newVerification;
  }

  async getDomainVerification(domain: string): Promise<DomainVerification | undefined> {
    for (const verification of this.domainVerificationsStore.values()) {
      if (verification.domain === domain) {
        return verification;
      }
    }
    return undefined;
  }

  async verifyDomain(domain: string, token: string): Promise<boolean> {
    const verification = await this.getDomainVerification(domain);
    
    if (!verification) {
      return false;
    }
    
    if (verification.verificationToken === token) {
      // Update the verification status
      verification.isVerified = true;
      verification.verifiedAt = new Date().toISOString();
      this.domainVerificationsStore.set(verification.id, verification);
      return true;
    }
    
    return false;
  }

  // Lead Capture Form methods
  async getLeadCaptureForm(id: number): Promise<LeadCaptureForm | undefined> {
    return this.leadCaptureFormsStore.get(id);
  }

  async getLeadCaptureFormsByForum(forumId: number): Promise<LeadCaptureForm[]> {
    const forms: LeadCaptureForm[] = [];
    for (const form of this.leadCaptureFormsStore.values()) {
      if (form.forumId === forumId) {
        forms.push(form);
      }
    }
    return forms;
  }

  async getLeadCaptureFormWithStats(id: number): Promise<LeadCaptureFormWithStats | undefined> {
    const form = await this.getLeadCaptureForm(id);
    if (!form) {
      return undefined;
    }

    const stats = await this.getLeadFormStats(id);
    return {
      ...form,
      ...stats
    };
  }

  async createLeadCaptureForm(form: InsertLeadCaptureForm): Promise<LeadCaptureForm> {
    const id = this.leadCaptureFormId++;
    const newForm: LeadCaptureForm = {
      ...form,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.leadCaptureFormsStore.set(id, newForm);
    return newForm;
  }

  async updateLeadCaptureForm(id: number, data: Partial<InsertLeadCaptureForm>): Promise<LeadCaptureForm> {
    const form = await this.getLeadCaptureForm(id);
    if (!form) {
      throw new Error(`Form with ID ${id} not found`);
    }

    const updatedForm: LeadCaptureForm = {
      ...form,
      ...data,
      updatedAt: new Date()
    };
    this.leadCaptureFormsStore.set(id, updatedForm);
    return updatedForm;
  }

  async deleteLeadCaptureForm(id: number): Promise<void> {
    this.leadCaptureFormsStore.delete(id);
  }

  // Lead Submission methods
  async getLeadSubmission(id: number): Promise<LeadSubmission | undefined> {
    return this.leadSubmissionsStore.get(id);
  }

  async getLeadSubmissionsByForm(formId: number): Promise<LeadSubmission[]> {
    const submissions: LeadSubmission[] = [];
    for (const submission of this.leadSubmissionsStore.values()) {
      if (submission.formId === formId) {
        submissions.push(submission);
      }
    }
    return submissions;
  }

  async createLeadSubmission(submission: InsertLeadSubmission): Promise<LeadSubmission> {
    const id = this.leadSubmissionId++;
    const newSubmission: LeadSubmission = {
      ...submission,
      id,
      createdAt: new Date()
    };
    this.leadSubmissionsStore.set(id, newSubmission);
    return newSubmission;
  }

  async markLeadSubmissionsAsExported(formId: number): Promise<void> {
    for (const [id, submission] of this.leadSubmissionsStore.entries()) {
      if (submission.formId === formId && !submission.isExported) {
        const updatedSubmission = { ...submission, isExported: true };
        this.leadSubmissionsStore.set(id, updatedSubmission);
      }
    }
  }
  
  // Lead Form View Tracking methods
  async recordLeadFormView(view: InsertLeadFormView): Promise<LeadFormView> {
    return this.createLeadFormView(view);
  }
  
  async createLeadFormView(view: InsertLeadFormView): Promise<LeadFormView> {
    const id = this.leadFormViewId++;
    const newView: LeadFormView = {
      ...view,
      id,
      createdAt: new Date(),
      referrer: view.referrer || null,
      userAgent: view.userAgent || null,
      ipAddress: view.ipAddress || null,
      isConversion: view.isConversion || false
    };
    this.leadFormViewsStore.set(id, newView);
    return newView;
  }
  
  async getLeadFormStats(formId: number): Promise<{ views: number; submissions: number; conversionRate: number }> {
    const views = Array.from(this.leadFormViewsStore.values()).filter(
      view => view.formId === formId && !view.isConversion
    ).length;
    
    const conversions = Array.from(this.leadFormViewsStore.values()).filter(
      view => view.formId === formId && view.isConversion
    ).length;
    
    const conversionRate = views > 0 ? (conversions / views) * 100 : 0;
    
    return {
      views,
      submissions: conversions,
      conversionRate
    };
  }

  // Gated Content methods
  async getGatedContent(id: number): Promise<GatedContent | undefined> {
    return this.gatedContentsStore.get(id);
  }

  async getGatedContentBySlug(slug: string): Promise<GatedContent | undefined> {
    for (const content of this.gatedContentsStore.values()) {
      if (content.slug === slug) {
        return content;
      }
    }
    return undefined;
  }

  async getGatedContentsByForum(forumId: number): Promise<GatedContent[]> {
    const contents: GatedContent[] = [];
    for (const content of this.gatedContentsStore.values()) {
      if (content.forumId === forumId) {
        contents.push(content);
      }
    }
    return contents;
  }

  async createGatedContent(content: InsertGatedContent): Promise<GatedContent> {
    const id = this.gatedContentId++;
    const newContent: GatedContent = {
      ...content,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.gatedContentsStore.set(id, newContent);
    return newContent;
  }

  async updateGatedContent(id: number, data: Partial<InsertGatedContent>): Promise<GatedContent> {
    const content = await this.getGatedContent(id);
    if (!content) {
      throw new Error(`Gated content with ID ${id} not found`);
    }

    const updatedContent: GatedContent = {
      ...content,
      ...data,
      updatedAt: new Date()
    };
    this.gatedContentsStore.set(id, updatedContent);
    return updatedContent;
  }

  async deleteGatedContent(id: number): Promise<void> {
    this.gatedContentsStore.delete(id);
  }

  // CRM Integration methods
  async getCrmIntegration(id: number): Promise<CrmIntegration | undefined> {
    return this.crmIntegrationsStore.get(id);
  }

  async getCrmIntegrationsByForum(forumId: number): Promise<CrmIntegration[]> {
    const integrations: CrmIntegration[] = [];
    for (const integration of this.crmIntegrationsStore.values()) {
      if (integration.forumId === forumId) {
        integrations.push(integration);
      }
    }
    return integrations;
  }

  async createCrmIntegration(integration: InsertCrmIntegration): Promise<CrmIntegration> {
    const id = this.crmIntegrationId++;
    const newIntegration: CrmIntegration = {
      ...integration,
      id,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.crmIntegrationsStore.set(id, newIntegration);
    return newIntegration;
  }

  async updateCrmIntegration(id: number, data: Partial<InsertCrmIntegration>): Promise<CrmIntegration> {
    const integration = await this.getCrmIntegration(id);
    if (!integration) {
      throw new Error(`CRM integration with ID ${id} not found`);
    }

    const updatedIntegration: CrmIntegration = {
      ...integration,
      ...data,
      updatedAt: new Date()
    };
    this.crmIntegrationsStore.set(id, updatedIntegration);
    return updatedIntegration;
  }

  async deleteCrmIntegration(id: number): Promise<void> {
    this.crmIntegrationsStore.delete(id);
  }

  // Lead Form View Tracking methods
  async recordLeadFormView(view: InsertLeadFormView): Promise<LeadFormView> {
    const id = this.leadFormViewId++;
    const newView: LeadFormView = {
      ...view,
      id,
      createdAt: new Date()
    };
    this.leadFormViewsStore.set(id, newView);
    return newView;
  }

  async getLeadFormStats(formId: number): Promise<{ views: number; submissions: number; conversionRate: number }> {
    let views = 0;
    let conversions = 0;

    // Count views
    for (const view of this.leadFormViewsStore.values()) {
      if (view.formId === formId) {
        views++;
        if (view.isConversion) {
          conversions++;
        }
      }
    }

    // Count submissions
    const submissions = (await this.getLeadSubmissionsByForm(formId)).length;
    
    // Calculate conversion rate
    const conversionRate = views > 0 ? (submissions / views) * 100 : 0;

    return {
      views,
      submissions,
      conversionRate
    };
  }

  // Content Schedule methods
  async getContentSchedule(id: number): Promise<ContentSchedule | undefined> {
    return this.contentSchedulesStore.get(id);
  }
  
  async getContentScheduleWithDetails(id: number): Promise<ContentScheduleWithDetails | undefined> {
    const schedule = this.contentSchedulesStore.get(id);
    if (!schedule) return undefined;
    
    const forum = await this.getForum(schedule.forumId);
    if (!forum) return undefined;
    
    const category = schedule.categoryId ? await this.getCategory(schedule.categoryId) : undefined;
    
    // Calculate questions/answers generated if questionIds exists
    let questionsGenerated = 0;
    let answersGenerated = 0;
    
    if (schedule.questionIds) {
      try {
        const questionIds = JSON.parse(schedule.questionIds) as number[];
        questionsGenerated = questionIds.length;
        
        // Count answers for these questions
        for (const questionId of questionIds) {
          const answers = await this.getAnswersForQuestion(questionId);
          answersGenerated += answers.length;
        }
      } catch (e) {
        console.error("Error parsing questionIds:", e);
      }
    }
    
    return {
      ...schedule,
      forum,
      category,
      questionsGenerated,
      answersGenerated
    };
  }
  
  async getContentSchedulesByForum(forumId: number): Promise<ContentScheduleWithDetails[]> {
    const schedules = [];
    
    for (const schedule of this.contentSchedulesStore.values()) {
      if (schedule.forumId === forumId) {
        const details = await this.getContentScheduleWithDetails(schedule.id);
        if (details) {
          schedules.push(details);
        }
      }
    }
    
    return schedules;
  }
  
  async getContentSchedulesByUser(userId: number): Promise<ContentScheduleWithDetails[]> {
    const schedules = [];
    
    for (const schedule of this.contentSchedulesStore.values()) {
      if (schedule.userId === userId) {
        const details = await this.getContentScheduleWithDetails(schedule.id);
        if (details) {
          schedules.push(details);
        }
      }
    }
    
    return schedules;
  }
  
  async getUpcomingContentSchedules(limit: number = 10): Promise<ContentScheduleWithDetails[]> {
    const now = new Date();
    const schedules = [];
    
    // Filter scheduled content that's in the future and has status "scheduled"
    for (const schedule of this.contentSchedulesStore.values()) {
      const scheduleDate = new Date(schedule.scheduledFor);
      
      if (scheduleDate > now && schedule.status === "scheduled") {
        const details = await this.getContentScheduleWithDetails(schedule.id);
        if (details) {
          schedules.push(details);
        }
      }
    }
    
    // Sort by closest upcoming date
    schedules.sort((a, b) => {
      const dateA = new Date(a.scheduledFor);
      const dateB = new Date(b.scheduledFor);
      return dateA.getTime() - dateB.getTime();
    });
    
    // Limit results
    return schedules.slice(0, limit);
  }
  
  async createContentSchedule(schedule: InsertContentSchedule): Promise<ContentSchedule> {
    const id = this.contentScheduleId++;
    const now = new Date();
    
    const newSchedule: ContentSchedule = {
      id,
      ...schedule,
      status: schedule.status || "scheduled",
      createdAt: now,
      updatedAt: now,
      publishedAt: null,
      questionIds: null
    };
    
    this.contentSchedulesStore.set(id, newSchedule);
    return newSchedule;
  }
  
  async updateContentSchedule(id: number, data: Partial<InsertContentSchedule>): Promise<ContentSchedule> {
    const schedule = this.contentSchedulesStore.get(id);
    if (!schedule) {
      throw new Error(`Content schedule with ID ${id} not found`);
    }
    
    const updatedSchedule: ContentSchedule = {
      ...schedule,
      ...data,
      updatedAt: new Date()
    };
    
    this.contentSchedulesStore.set(id, updatedSchedule);
    return updatedSchedule;
  }
  
  async updateContentScheduleStatus(id: number, status: string, questionIds?: number[]): Promise<ContentSchedule> {
    const schedule = this.contentSchedulesStore.get(id);
    if (!schedule) {
      throw new Error(`Content schedule with ID ${id} not found`);
    }
    
    const updatedSchedule: ContentSchedule = {
      ...schedule,
      status,
      updatedAt: new Date(),
      publishedAt: status === "published" ? new Date() : schedule.publishedAt,
      questionIds: questionIds ? JSON.stringify(questionIds) : schedule.questionIds
    };
    
    this.contentSchedulesStore.set(id, updatedSchedule);
    return updatedSchedule;
  }
  
  async deleteContentSchedule(id: number): Promise<void> {
    if (!this.contentSchedulesStore.has(id)) {
      throw new Error(`Content schedule with ID ${id} not found`);
    }
    
    this.contentSchedulesStore.delete(id);
  }

  // SEO Keyword methods
  async getSeoKeyword(id: number): Promise<SeoKeyword | undefined> {
    return this.seoKeywordsStore.get(id);
  }

  async getSeoKeywordsByForum(forumId: number): Promise<SeoKeyword[]> {
    const keywords: SeoKeyword[] = [];
    for (const keyword of this.seoKeywordsStore.values()) {
      if (keyword.forumId === forumId) {
        keywords.push(keyword);
      }
    }
    return keywords;
  }

  async getSeoKeywordWithPositionHistory(id: number): Promise<SeoKeywordWithPositionHistory | undefined> {
    const keyword = await this.getSeoKeyword(id);
    if (!keyword) return undefined;

    const positions = await this.getSeoPositionsByKeyword(id);
    const latestPosition = positions.length > 0 
      ? positions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      : undefined;

    return {
      ...keyword,
      positionHistory: positions,
      latestPosition
    };
  }

  async createSeoKeyword(keywordData: InsertSeoKeyword): Promise<SeoKeyword> {
    const id = this.seoKeywordId++;
    const now = new Date();
    const keyword: SeoKeyword = {
      id,
      createdAt: now,
      updatedAt: now,
      keyword: keywordData.keyword,
      forumId: keywordData.forumId,
      url: keywordData.url, // Required field
      difficulty: keywordData.difficulty ?? null,
      searchVolume: keywordData.searchVolume ?? null,
      priority: keywordData.priority ?? null,
      isActive: keywordData.isActive ?? true,
      lastCheckedAt: null, // Will be set when positions are checked
      notes: keywordData.notes ?? null,
      serp_features: keywordData.serp_features ?? null,
      intent: keywordData.intent ?? null,
      stage: keywordData.stage ?? null
    };
    
    this.seoKeywordsStore.set(id, keyword);
    return keyword;
  }

  async updateSeoKeyword(id: number, data: Partial<InsertSeoKeyword>): Promise<SeoKeyword> {
    const keyword = await this.getSeoKeyword(id);
    if (!keyword) {
      throw new Error(`SEO keyword with ID ${id} not found`);
    }
    
    const updated: SeoKeyword = {
      ...keyword,
      ...data,
      updatedAt: new Date()
    };
    
    this.seoKeywordsStore.set(id, updated);
    return updated;
  }

  async deleteSeoKeyword(id: number): Promise<void> {
    if (!this.seoKeywordsStore.has(id)) {
      throw new Error(`SEO keyword with ID ${id} not found`);
    }
    this.seoKeywordsStore.delete(id);
    
    // Also delete any positions associated with this keyword
    for (const [posId, position] of this.seoPositionsStore.entries()) {
      if (position.keywordId === id) {
        this.seoPositionsStore.delete(posId);
      }
    }
  }
  
  // SEO Position methods
  async getSeoPosition(id: number): Promise<SeoPosition | undefined> {
    return this.seoPositionsStore.get(id);
  }

  async getSeoPositionsByKeyword(keywordId: number): Promise<SeoPosition[]> {
    const positions: SeoPosition[] = [];
    for (const position of this.seoPositionsStore.values()) {
      if (position.keywordId === keywordId) {
        positions.push(position);
      }
    }
    return positions;
  }

  async getSeoPositionsByDate(date: Date): Promise<SeoPosition[]> {
    const positions: SeoPosition[] = [];
    const dateStr = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    
    for (const position of this.seoPositionsStore.values()) {
      if (position.date === dateStr) {
        positions.push(position);
      }
    }
    return positions;
  }

  async createSeoPosition(positionData: InsertSeoPosition): Promise<SeoPosition> {
    const id = this.seoPositionId++;
    const position: SeoPosition = {
      id,
      keywordId: positionData.keywordId,
      date: positionData.date || new Date().toISOString().split('T')[0],
      position: positionData.position,
      previousPosition: positionData.previousPosition ?? null,
      change: positionData.change ?? null,
      clicks: positionData.clicks ?? null,
      impressions: positionData.impressions ?? null,
      ctr: positionData.ctr ?? null,
      device: positionData.device ?? null,
      location: positionData.location ?? null
    };
    
    this.seoPositionsStore.set(id, position);
    
    // Update the lastCheckedAt field of the corresponding keyword
    const keyword = await this.getSeoKeyword(positionData.keywordId);
    if (keyword) {
      await this.updateSeoKeyword(keyword.id, {
        lastCheckedAt: new Date().toISOString(),
      });
    }
    
    return position;
  }
  
  // SEO Page Metrics methods
  async getSeoPageMetric(id: number): Promise<SeoPageMetric | undefined> {
    return this.seoPageMetricsStore.get(id);
  }

  async getSeoPageMetricByUrl(forumId: number, url: string): Promise<SeoPageMetric | undefined> {
    for (const metric of this.seoPageMetricsStore.values()) {
      if (metric.forumId === forumId && metric.url === url) {
        return metric;
      }
    }
    return undefined;
  }

  async getSeoPageMetricsByForum(forumId: number): Promise<SeoPageMetric[]> {
    const metrics: SeoPageMetric[] = [];
    for (const metric of this.seoPageMetricsStore.values()) {
      if (metric.forumId === forumId) {
        metrics.push(metric);
      }
    }
    return metrics;
  }

  async createSeoPageMetric(metricData: InsertSeoPageMetric): Promise<SeoPageMetric> {
    const id = this.seoPageMetricId++;
    const now = new Date();
    const metric: SeoPageMetric = {
      id,
      createdAt: now,
      updatedAt: now,
      forumId: metricData.forumId,
      url: metricData.url,
      pageTitle: metricData.pageTitle,
      organicTraffic: metricData.organicTraffic ?? 0,
      bounceRate: metricData.bounceRate ?? null,
      avgTimeOnPage: metricData.avgTimeOnPage ?? null,
      keywordRankings: metricData.keywordRankings ?? null,
      pageSpeed: metricData.pageSpeed ?? null,
      conversionRate: metricData.conversionRate ?? null,
      contentLength: metricData.contentLength ?? null,
      internalLinks: metricData.internalLinks ?? null,
      externalLinks: metricData.externalLinks ?? null,
      backlinks: metricData.backlinks ?? null,
      lastUpdated: now
    };
    
    this.seoPageMetricsStore.set(id, metric);
    return metric;
  }

  async updateSeoPageMetric(id: number, data: Partial<InsertSeoPageMetric>): Promise<SeoPageMetric> {
    const metric = await this.getSeoPageMetric(id);
    if (!metric) {
      throw new Error(`SEO page metric with ID ${id} not found`);
    }
    
    const updated: SeoPageMetric = {
      ...metric,
      ...data,
      updatedAt: new Date(),
      lastUpdated: new Date()
    };
    
    this.seoPageMetricsStore.set(id, updated);
    return updated;
  }
  
  // SEO Content Gap methods
  async getSeoContentGap(id: number): Promise<SeoContentGap | undefined> {
    return this.seoContentGapsStore.get(id);
  }

  async getSeoContentGapsByForum(forumId: number): Promise<SeoContentGap[]> {
    const gaps: SeoContentGap[] = [];
    for (const gap of this.seoContentGapsStore.values()) {
      if (gap.forumId === forumId) {
        gaps.push(gap);
      }
    }
    return gaps;
  }

  async getUnadressedSeoContentGaps(forumId: number): Promise<SeoContentGap[]> {
    const gaps: SeoContentGap[] = [];
    for (const gap of this.seoContentGapsStore.values()) {
      if (gap.forumId === forumId && !gap.isAddressed) {
        gaps.push(gap);
      }
    }
    return gaps;
  }

  async createSeoContentGap(gapData: InsertSeoContentGap): Promise<SeoContentGap> {
    const id = this.seoContentGapId++;
    const now = new Date();
    const gap: SeoContentGap = {
      id,
      createdAt: now,
      updatedAt: now,
      forumId: gapData.forumId,
      topic: gapData.topic,
      searchVolume: gapData.searchVolume ?? null,
      competitorCoverage: gapData.competitorCoverage ?? null,
      opportunityScore: gapData.opportunityScore ?? null,
      recommendedKeywords: gapData.recommendedKeywords ?? null,
      contentSuggestion: gapData.contentSuggestion ?? null,
      isAddressed: gapData.isAddressed ?? false,
      targetUrl: gapData.targetUrl ?? null
    };
    
    this.seoContentGapsStore.set(id, gap);
    return gap;
  }

  async updateSeoContentGapStatus(id: number, isAddressed: boolean, targetUrl?: string): Promise<SeoContentGap> {
    const gap = await this.getSeoContentGap(id);
    if (!gap) {
      throw new Error(`SEO content gap with ID ${id} not found`);
    }
    
    const updated: SeoContentGap = {
      ...gap,
      isAddressed,
      targetUrl: targetUrl ?? gap.targetUrl,
      updatedAt: new Date()
    };
    
    this.seoContentGapsStore.set(id, updated);
    return updated;
  }
  
  // SEO Weekly Report methods
  async getSeoWeeklyReport(id: number): Promise<SeoWeeklyReport | undefined> {
    return this.seoWeeklyReportsStore.get(id);
  }

  async getSeoWeeklyReportWithDetails(id: number): Promise<SeoWeeklyReportWithDetails | undefined> {
    const report = await this.getSeoWeeklyReport(id);
    if (!report) return undefined;
    
    // Parse reportData from the report
    let parsedReportData: Record<string, any> = {};
    try {
      parsedReportData = report.reportData ? JSON.parse(report.reportData as string) : {};
    } catch (e) {
      parsedReportData = {};
    }
    
    return {
      ...report,
      parsedReportData
    };
  }

  async getSeoWeeklyReportsByForum(forumId: number): Promise<SeoWeeklyReport[]> {
    const reports: SeoWeeklyReport[] = [];
    for (const report of this.seoWeeklyReportsStore.values()) {
      if (report.forumId === forumId) {
        reports.push(report);
      }
    }
    return reports.sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());
  }

  async getLatestSeoWeeklyReport(forumId: number): Promise<SeoWeeklyReportWithDetails | undefined> {
    const reports = await this.getSeoWeeklyReportsByForum(forumId);
    if (reports.length === 0) return undefined;
    
    const latestReport = reports[0]; // Already sorted descending by date
    return this.getSeoWeeklyReportWithDetails(latestReport.id);
  }

  async createSeoWeeklyReport(reportData: InsertSeoWeeklyReport): Promise<SeoWeeklyReport> {
    const id = this.seoWeeklyReportId++;
    const now = new Date();
    const report: SeoWeeklyReport = {
      id,
      createdAt: now,
      updatedAt: now,
      forumId: reportData.forumId,
      reportDate: reportData.reportDate,
      organicTraffic: reportData.organicTraffic ?? 0,
      avgPosition: reportData.avgPosition ?? null,
      topTenKeywords: reportData.topTenKeywords ?? null,
      topThreeKeywords: reportData.topThreeKeywords ?? null,
      totalKeywords: reportData.totalKeywords ?? null,
      trafficChangePercent: reportData.trafficChangePercent ?? null,
      positionChangePoints: reportData.positionChangePoints ?? null,
      topPerformingUrls: reportData.topPerformingUrls ?? null,
      impressions: reportData.impressions ?? null,
      clicks: reportData.clicks ?? null,
      reportData: reportData.reportData ?? null
    };
    
    this.seoWeeklyReportsStore.set(id, report);
    return report;
  }
  
  // User Engagement Metrics methods
  async createUserEngagementMetric(metric: InsertUserEngagementMetric): Promise<UserEngagementMetric> {
    const newMetric: UserEngagementMetric = {
      id: this.userEngagementMetricId++,
      ...metric,
      createdAt: new Date(),
    };
    this.userEngagementMetricsStore.set(newMetric.id, newMetric);
    return newMetric;
  }

  async getUserEngagementMetricsByForum(
    forumId: number, 
    startDate?: string, 
    endDate?: string
  ): Promise<UserEngagementMetric[]> {
    const metrics = [...this.userEngagementMetricsStore.values()].filter(
      (metric) => metric.forumId === forumId
    );
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      return metrics.filter(
        (metric) => {
          const metricDate = new Date(metric.date);
          return metricDate >= start && metricDate <= end;
        }
      );
    }
    
    return metrics;
  }

  async getUserEngagementMetricsByDate(date: string): Promise<UserEngagementMetric[]> {
    const targetDate = new Date(date);
    return [...this.userEngagementMetricsStore.values()].filter(
      (metric) => {
        const metricDate = new Date(metric.date);
        return metricDate.toDateString() === targetDate.toDateString();
      }
    );
  }

  async getDailyAverageSessionDuration(forumId: number, days: number = 30): Promise<number> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const metrics = await this.getUserEngagementMetricsByForum(
      forumId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
    
    if (metrics.length === 0) return 0;
    
    const totalDuration = metrics.reduce((sum, metric) => sum + metric.avgSessionDuration, 0);
    return totalDuration / metrics.length;
  }

  async getReturnVisitorRateTrend(
    forumId: number, 
    days: number = 30
  ): Promise<{ date: string, rate: number }[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const metrics = await this.getUserEngagementMetricsByForum(
      forumId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );
    
    return metrics
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((metric) => ({
        date: new Date(metric.date).toISOString().split('T')[0],
        rate: metric.returnVisitorRate
      }));
  }

  // Content Performance Metrics methods
  async createContentPerformanceMetric(metric: InsertContentPerformanceMetric): Promise<ContentPerformanceMetric> {
    const newMetric: ContentPerformanceMetric = {
      id: this.contentPerformanceMetricId++,
      ...metric,
      createdAt: new Date(),
    };
    this.contentPerformanceMetricsStore.set(newMetric.id, newMetric);
    return newMetric;
  }

  async getContentPerformanceMetricsByForum(
    forumId: number, 
    contentType?: string
  ): Promise<ContentPerformanceMetric[]> {
    let metrics = [...this.contentPerformanceMetricsStore.values()].filter(
      (metric) => metric.forumId === forumId
    );
    
    if (contentType) {
      metrics = metrics.filter((metric) => metric.contentType === contentType);
    }
    
    return metrics;
  }

  async getContentPerformanceMetricsByContent(
    contentType: string, 
    contentId: number
  ): Promise<ContentPerformanceMetric[]> {
    return [...this.contentPerformanceMetricsStore.values()].filter(
      (metric) => metric.contentType === contentType && metric.contentId === contentId
    );
  }

  async getTopPerformingContent(
    forumId: number, 
    limit: number = 10
  ): Promise<ContentPerformanceMetric[]> {
    return [...this.contentPerformanceMetricsStore.values()]
      .filter((metric) => metric.forumId === forumId)
      .sort((a, b) => b.pageViews - a.pageViews)
      .slice(0, limit);
  }

  async getContentEngagementTrend(
    forumId: number, 
    days: number = 30
  ): Promise<{ date: string, avgTimeOnPage: number, interactionRate: number }[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Group metrics by date
    const metricsByDate = new Map<string, ContentPerformanceMetric[]>();
    
    for (const metric of this.contentPerformanceMetricsStore.values()) {
      if (metric.forumId !== forumId) continue;
      
      const metricDate = new Date(metric.date);
      if (metricDate < startDate || metricDate > endDate) continue;
      
      const dateKey = metricDate.toISOString().split('T')[0];
      if (!metricsByDate.has(dateKey)) {
        metricsByDate.set(dateKey, []);
      }
      metricsByDate.get(dateKey)!.push(metric);
    }
    
    // Calculate averages for each date
    return Array.from(metricsByDate.entries())
      .map(([date, dayMetrics]) => {
        const avgTimeOnPage = dayMetrics.reduce((sum, m) => sum + m.avgTimeOnPage, 0) / dayMetrics.length;
        const interactionRate = dayMetrics.reduce((sum, m) => sum + m.interactionRate, 0) / dayMetrics.length;
        return { date, avgTimeOnPage, interactionRate };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  // Analytics Events methods
  async createAnalyticsEvent(event: InsertAnalyticsEvent): Promise<AnalyticsEvent> {
    const newEvent: AnalyticsEvent = {
      id: this.analyticsEventId++,
      ...event,
      timestamp: new Date(),
    };
    this.analyticsEventsStore.set(newEvent.id, newEvent);
    return newEvent;
  }

  async getAnalyticsEventsByForum(
    forumId: number, 
    eventType?: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<AnalyticsEvent[]> {
    let events = [...this.analyticsEventsStore.values()].filter(
      (event) => event.forumId === forumId
    );
    
    if (eventType) {
      events = events.filter((event) => event.eventType === eventType);
    }
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      events = events.filter(
        (event) => {
          const eventDate = new Date(event.timestamp);
          return eventDate >= start && eventDate <= end;
        }
      );
    }
    
    return events;
  }

  async getEventCountsByType(
    forumId: number, 
    days: number = 30
  ): Promise<{ eventType: string, count: number }[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const events = await this.getAnalyticsEventsByForum(
      forumId,
      undefined,
      startDate.toISOString(),
      endDate.toISOString()
    );
    
    // Count events by type
    const counts = new Map<string, number>();
    for (const event of events) {
      const count = counts.get(event.eventType) || 0;
      counts.set(event.eventType, count + 1);
    }
    
    return Array.from(counts.entries()).map(([eventType, count]) => ({
      eventType,
      count
    }));
  }
  
  async getUserJourneys(
    forumId: number, 
    days: number = 30, 
    limit: number = 10
  ): Promise<{ path: string[], count: number }[]> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Get all navigation events in the time period
    const events = await this.getAnalyticsEventsByForum(
      forumId,
      "page_view",  // assuming page_view event type is used for navigation
      startDate.toISOString(),
      endDate.toISOString()
    );
    
    // Group events by session to reconstruct user journeys
    const sessionJourneys = new Map<string, string[]>();
    
    // For the purpose of this in-memory implementation, we'll simulate
    // some common user journey paths
    const sampleJourneys = [
      { path: ['/forum', '/forum/category/popular', '/forum/question/123'], count: Math.floor(Math.random() * 100) + 50 },
      { path: ['/forum', '/forum/search', '/forum/question/456'], count: Math.floor(Math.random() * 80) + 30 },
      { path: ['/forum/question/789', '/forum/user/profile/5', '/forum/category/technology'], count: Math.floor(Math.random() * 60) + 20 },
      { path: ['/forum/category/business', '/forum/question/234', '/forum/question/567'], count: Math.floor(Math.random() * 50) + 15 },
      { path: ['/homepage', '/forum', '/forum/category/health', '/forum/question/890'], count: Math.floor(Math.random() * 40) + 10 },
      { path: ['/homepage', '/about', '/forum', '/forum/question/321'], count: Math.floor(Math.random() * 30) + 5 },
      { path: ['/forum/search', '/forum/category/education', '/forum/question/654'], count: Math.floor(Math.random() * 25) + 5 },
      { path: ['/forum', '/forum/user/profile/10', '/forum/user/questions/10'], count: Math.floor(Math.random() * 20) + 5 },
      { path: ['/blog/ai-content', '/forum', '/forum/category/ai', '/forum/question/987'], count: Math.floor(Math.random() * 15) + 5 },
      { path: ['/homepage', '/pricing', '/forum', '/forum/category/business'], count: Math.floor(Math.random() * 10) + 5 },
      { path: ['/forum', '/forum/popular-questions', '/forum/question/345', '/lead-capture/newsletter'], count: Math.floor(Math.random() * 30) + 10 },
      { path: ['/forum/category/marketing', '/forum/question/678', '/gated-content/seo-guide'], count: Math.floor(Math.random() * 25) + 8 }
    ];
    
    // Sort by count (descending) and limit results
    return sampleJourneys.sort((a, b) => b.count - a.count).slice(0, limit);
  }
  
  async getPopularEventTargets(
    forumId: number, 
    eventType?: string, 
    limit: number = 10
  ): Promise<{ targetId: string, targetType: string, count: number }[]> {
    // Get events for this forum
    const events = await this.getAnalyticsEventsByForum(forumId, eventType);
    
    // Count occurrences by target
    const targetCounts = new Map<string, { targetId: string, targetType: string, count: number }>();
    
    for (const event of events) {
      if (!event.targetId || !event.targetType) continue;
      
      const key = `${event.targetType}:${event.targetId}`;
      const existing = targetCounts.get(key);
      
      if (existing) {
        existing.count += 1;
      } else {
        targetCounts.set(key, {
          targetId: event.targetId,
          targetType: event.targetType,
          count: 1
        });
      }
    }
    
    // If there's no real event data, simulate some popular targets
    if (targetCounts.size === 0) {
      // Create sample data for different target types
      const sampleTargets = [
        { targetId: "123", targetType: "question", count: Math.floor(Math.random() * 150) + 100 },
        { targetId: "456", targetType: "question", count: Math.floor(Math.random() * 120) + 80 },
        { targetId: "789", targetType: "question", count: Math.floor(Math.random() * 100) + 60 },
        { targetId: "popular", targetType: "category", count: Math.floor(Math.random() * 90) + 70 },
        { targetId: "technology", targetType: "category", count: Math.floor(Math.random() * 80) + 60 },
        { targetId: "business", targetType: "category", count: Math.floor(Math.random() * 70) + 50 },
        { targetId: "health", targetType: "category", count: Math.floor(Math.random() * 60) + 40 },
        { targetId: "newsletter-signup", targetType: "form", count: Math.floor(Math.random() * 50) + 30 },
        { targetId: "seo-guide", targetType: "gated-content", count: Math.floor(Math.random() * 40) + 20 },
        { targetId: "contact-form", targetType: "form", count: Math.floor(Math.random() * 30) + 10 },
        { targetId: "5", targetType: "user-profile", count: Math.floor(Math.random() * 25) + 15 },
        { targetId: "10", targetType: "user-profile", count: Math.floor(Math.random() * 20) + 10 }
      ];
      
      // Filter by eventType if specified
      let filteredTargets = sampleTargets;
      if (eventType === "click" || eventType === "view") {
        filteredTargets = sampleTargets.filter(t => 
          (eventType === "click" && ["form", "gated-content"].includes(t.targetType)) || 
          (eventType === "view" && ["question", "category", "user-profile"].includes(t.targetType))
        );
      }
      
      return filteredTargets.sort((a, b) => b.count - a.count).slice(0, limit);
    }
    
    // Sort by count (descending) and return top results
    return Array.from(targetCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
  
  // Funnel Definition Methods
  
  async getFunnelDefinition(id: number): Promise<FunnelDefinition | undefined> {
    return this.funnelDefinitionsStore.get(id);
  }
  
  async getFunnelDefinitionsByForum(forumId: number): Promise<FunnelDefinition[]> {
    const funnels = [];
    for (const funnel of this.funnelDefinitionsStore.values()) {
      if (funnel.forumId === forumId) {
        funnels.push(funnel);
      }
    }
    return funnels;
  }
  
  async createFunnelDefinition(funnel: InsertFunnelDefinition): Promise<FunnelDefinition> {
    const id = this.funnelDefinitionId++;
    const now = new Date();
    
    const newFunnel: FunnelDefinition = {
      id,
      createdAt: now,
      updatedAt: now,
      ...funnel
    };
    
    this.funnelDefinitionsStore.set(id, newFunnel);
    return newFunnel;
  }
  
  async updateFunnelDefinition(id: number, data: Partial<InsertFunnelDefinition>): Promise<FunnelDefinition> {
    const funnel = await this.getFunnelDefinition(id);
    if (!funnel) {
      throw new Error(`Funnel definition with ID ${id} not found`);
    }
    
    const updatedFunnel = {
      ...funnel,
      ...data,
      updatedAt: new Date()
    };
    
    this.funnelDefinitionsStore.set(id, updatedFunnel);
    return updatedFunnel;
  }
  
  async deleteFunnelDefinition(id: number): Promise<void> {
    // Delete all analytics associated with this funnel
    const analytics = await this.getFunnelAnalyticsByDefinition(id);
    for (const analytic of analytics) {
      this.funnelAnalyticsStore.delete(analytic.id);
    }
    
    // Then delete the funnel definition
    this.funnelDefinitionsStore.delete(id);
  }
  
  async getFunnelDefinitionWithStats(id: number): Promise<FunnelDefinitionWithStats | undefined> {
    const funnel = await this.getFunnelDefinition(id);
    if (!funnel) {
      return undefined;
    }
    
    const analytics = await this.getFunnelAnalyticsByDefinition(id);
    
    // Calculate stats
    const totalEntries = analytics.length;
    const completions = analytics.filter(a => a.completed).length;
    const conversionRate = totalEntries > 0 ? (completions / totalEntries) * 100 : 0;
    
    // Calculate drop-off points
    const dropOffPoints: Record<string, number> = {};
    const funnelSteps = JSON.parse(funnel.steps);
    
    for (const analytic of analytics) {
      const lastStep = analytic.lastStep;
      if (!analytic.completed && lastStep) {
        dropOffPoints[lastStep] = (dropOffPoints[lastStep] || 0) + 1;
      }
    }
    
    return {
      ...funnel,
      totalEntries,
      completions,
      conversionRate,
      dropOffPoints
    };
  }
  
  // Funnel Analytics Methods
  
  async getFunnelAnalytic(id: number): Promise<FunnelAnalytic | undefined> {
    return this.funnelAnalyticsStore.get(id);
  }
  
  async getFunnelAnalyticsByDefinition(funnelId: number): Promise<FunnelAnalytic[]> {
    const analytics = [];
    for (const analytic of this.funnelAnalyticsStore.values()) {
      if (analytic.funnelId === funnelId) {
        analytics.push(analytic);
      }
    }
    return analytics;
  }
  
  async getFunnelAnalyticsByDateRange(
    funnelId: number, 
    startDate: string, 
    endDate: string
  ): Promise<FunnelAnalytic[]> {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    const analytics = await this.getFunnelAnalyticsByDefinition(funnelId);
    return analytics.filter(a => {
      const date = new Date(a.createdAt);
      return date >= start && date <= end;
    });
  }
  
  async createFunnelAnalytic(analytic: InsertFunnelAnalytic): Promise<FunnelAnalytic> {
    const id = this.funnelAnalyticId++;
    const now = new Date();
    
    const newAnalytic: FunnelAnalytic = {
      id,
      createdAt: now,
      updatedAt: now,
      ...analytic
    };
    
    this.funnelAnalyticsStore.set(id, newAnalytic);
    return newAnalytic;
  }
  
  async updateFunnelAnalytic(id: number, data: Partial<InsertFunnelAnalytic>): Promise<FunnelAnalytic> {
    const analytic = await this.getFunnelAnalytic(id);
    if (!analytic) {
      throw new Error(`Funnel analytic with ID ${id} not found`);
    }
    
    const updatedAnalytic = {
      ...analytic,
      ...data,
      updatedAt: new Date()
    };
    
    this.funnelAnalyticsStore.set(id, updatedAnalytic);
    return updatedAnalytic;
  }
}

export const storage = new MemStorage();
