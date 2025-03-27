import { 
  users, type User, type InsertUser,
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
  contentSchedules, type ContentSchedule, type InsertContentSchedule, type ContentScheduleWithDetails
} from "@shared/schema";
// Import this way to make TypeScript happy in an ESM context
import memorystore from 'memorystore';
import session from 'express-session';

// Create the MemoryStore
const MemoryStore = memorystore(session);

// Storage interface with CRUD methods
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Category methods
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  getAllCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Question methods
  getQuestion(id: number): Promise<Question | undefined>;
  getQuestionWithDetails(id: number): Promise<QuestionWithDetails | undefined>;
  getAllQuestions(): Promise<Question[]>;
  getAllQuestionsWithDetails(): Promise<QuestionWithDetails[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  incrementQuestionViews(id: number): Promise<void>;

  // Answer methods
  getAnswer(id: number): Promise<Answer | undefined>;
  getAnswerWithDetails(id: number): Promise<AnswerWithDetails | undefined>;
  getAnswersForQuestion(questionId: number): Promise<AnswerWithDetails[]>;
  createAnswer(answer: InsertAnswer): Promise<Answer>;

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
  
  // Session store
  sessionStore: any;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private usersStore: Map<number, User>;
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
  
  private userId: number;
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
  public sessionStore: any;

  constructor() {
    this.usersStore = new Map();
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
    
    // Create session store from memorystore
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });

    this.userId = 1;
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

    // Initialize with sample data
    this.initSampleData();
  }

  private initSampleData() {
    // Create sample users
    const users = [
      { 
        username: "admin", 
        password: "admin123", 
        email: "admin@forumai.com", 
        displayName: "Admin",
        avatar: "https://i.pravatar.cc/150?img=1",
        isAdmin: true,
        role: "admin"
      },
      { 
        username: "sarah_t", 
        password: "sarah123", 
        email: "sarah@example.com", 
        displayName: "Sarah T.",
        avatar: "https://i.pravatar.cc/150?img=5",
        isAdmin: false,
        role: "expert"
      },
      { 
        username: "michael_r", 
        password: "michael123", 
        email: "michael@example.com", 
        displayName: "Michael R.",
        avatar: "https://i.pravatar.cc/150?img=12",
        isAdmin: false,
        role: "expert"
      },
      { 
        username: "jennifer_l", 
        password: "jennifer123", 
        email: "jennifer@example.com", 
        displayName: "Jennifer L.",
        avatar: "https://i.pravatar.cc/150?img=16",
        isAdmin: false,
        role: "premium"
      },
      { 
        username: "ai_beginner", 
        password: "aibegin123", 
        email: "ai_beginner@forumai.com", 
        displayName: "AI Beginner",
        avatar: "https://i.pravatar.cc/150?img=25",
        isAdmin: false,
        role: "beginner",
        isAI: true
      },
      { 
        username: "ai_expert", 
        password: "aiexpert123", 
        email: "ai_expert@forumai.com", 
        displayName: "AI Expert",
        avatar: "https://i.pravatar.cc/150?img=35",
        isAdmin: false,
        role: "expert",
        isAI: true
      }
    ];

    users.forEach(user => this.createUser(user));

    // Create sample categories
    const categories = [
      { name: "All Topics", slug: "all-topics", description: "All forum topics" },
      { name: "Product Features", slug: "product-features", description: "Discussions about product features" },
      { name: "Integrations", slug: "integrations", description: "How to integrate with other tools" },
      { name: "Best Practices", slug: "best-practices", description: "Best practices and tips" },
      { name: "Troubleshooting", slug: "troubleshooting", description: "Help with common issues" },
      { name: "Industry News", slug: "industry-news", description: "Latest updates in the industry" }
    ];

    categories.forEach(category => this.createCategory(category));

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

    personas.forEach(persona => this.createAIPersona(persona));

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

    questions.forEach(question => this.createQuestion(question));

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

    answers.forEach(answer => this.createAnswer(answer));

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

    votes.forEach(vote => this.createOrUpdateVote(vote));
    
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
    
    mainSitePages.forEach(page => this.createMainSitePage(page));
    
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
    
    contentInterlinks.forEach(interlink => this.createContentInterlink(interlink));
    
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
    
    forums.forEach(forum => this.createForum(forum));
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

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser = { ...user, id };
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
}

export const storage = new MemStorage();
