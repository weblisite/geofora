import { eq, and, sql, desc, asc, like, or, gte, lte } from 'drizzle-orm';
import { db, connection } from './db';
import { supabase } from './supabase';
import { 
  roles, permissions, rolePermissions, users, userForumRoles,
  categories, questions, answers, votes, aiPersonas,
  mainSitePages, contentInterlinks, forums, domainVerifications,
  leadCaptureForms, leadSubmissions, gatedContents, crmIntegrations,
  leadFormViews, contentSchedules, seoKeywords, seoPositions,
  seoPageMetrics, seoContentGaps, seoWeeklyReports,
  funnelDefinitions, funnelAnalytics, userEngagementMetrics,
  contentPerformanceMetrics, analyticsEvents
} from '@shared/schema';
import type {
  Role, InsertRole, Permission, InsertPermission,
  RolePermission, InsertRolePermission, User, InsertUser,
  UserForumRole, InsertUserForumRole, Category, InsertCategory,
  Question, InsertQuestion, QuestionWithDetails, Answer, InsertAnswer,
  AnswerWithDetails, Vote, InsertVote, AiPersona, InsertAiPersona,
  MainSitePage, InsertMainSitePage, MainSitePageWithLinks,
  ContentInterlink, InsertContentInterlink, Forum, InsertForum,
  ForumWithStats, DomainVerification, InsertDomainVerification,
  LeadCaptureForm, InsertLeadCaptureForm, LeadCaptureFormWithStats,
  LeadSubmission, InsertLeadSubmission, GatedContent, InsertGatedContent,
  CrmIntegration, InsertCrmIntegration, LeadFormView, InsertLeadFormView,
  ContentSchedule, InsertContentSchedule, ContentScheduleWithDetails,
  SeoKeyword, InsertSeoKeyword, SeoKeywordWithPositionHistory,
  SeoPosition, InsertSeoPosition, SeoPageMetric, InsertSeoPageMetric,
  SeoContentGap, InsertSeoContentGap, SeoWeeklyReport, InsertSeoWeeklyReport,
  SeoWeeklyReportWithDetails, FunnelDefinition, InsertFunnelDefinition,
  FunnelDefinitionWithStats, FunnelAnalytic, InsertFunnelAnalytic,
  InsertUserEngagementMetric, UserEngagementMetric,
  InsertContentPerformanceMetric, ContentPerformanceMetric,
  InsertAnalyticsEvent, AnalyticsEvent
} from '@shared/schema';
import { IStorage } from './storage';
import connectPgSimple from 'connect-pg-simple';
import session from 'express-session';
import { log } from './vite';

export class SupabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    const PgSessionStore = connectPgSimple(session);
    
    // Create a connection string from Supabase URL
    const connectionString = process.env.SUPABASE_URL && process.env.SUPABASE_KEY ? 
      `${process.env.SUPABASE_URL.replace('https://', 'postgres://postgres:')}${process.env.SUPABASE_KEY}@db.${process.env.SUPABASE_URL.replace('https://', '')}.supabase.co:5432/postgres` : 
      '';
      
    this.sessionStore = new PgSessionStore({
      conObject: {
        connectionString: connectionString,
        ssl: { rejectUnauthorized: false },
      },
      createTableIfMissing: true,
    });
    
    log('Supabase storage initialized with session store');
  }

  // =========================================
  // Role and Permission methods
  // =========================================
  
  async getRole(id: number): Promise<Role | undefined> {
    const results = await db.select().from(roles).where(eq(roles.id, id));
    return results.length ? results[0] : undefined;
  }

  async getRoleByName(name: string): Promise<Role | undefined> {
    const results = await db.select().from(roles).where(eq(roles.name, name));
    return results.length ? results[0] : undefined;
  }

  async getAllRoles(): Promise<Role[]> {
    return db.select().from(roles);
  }

  async createRole(role: InsertRole): Promise<Role> {
    const results = await db.insert(roles).values(role).returning();
    return results[0];
  }

  async updateRole(id: number, data: Partial<InsertRole>): Promise<Role> {
    const results = await db.update(roles).set(data).where(eq(roles.id, id)).returning();
    return results[0];
  }

  async deleteRole(id: number): Promise<void> {
    await db.delete(roles).where(eq(roles.id, id));
  }

  async getPermission(id: number): Promise<Permission | undefined> {
    const results = await db.select().from(permissions).where(eq(permissions.id, id));
    return results.length ? results[0] : undefined;
  }

  async getPermissionByName(name: string): Promise<Permission | undefined> {
    const results = await db.select().from(permissions).where(eq(permissions.name, name));
    return results.length ? results[0] : undefined;
  }

  async getPermissionsByScope(scope: string): Promise<Permission[]> {
    return db.select().from(permissions).where(eq(permissions.scope, scope));
  }

  async getAllPermissions(): Promise<Permission[]> {
    return db.select().from(permissions);
  }

  async createPermission(permission: InsertPermission): Promise<Permission> {
    const results = await db.insert(permissions).values(permission).returning();
    return results[0];
  }

  async updatePermission(id: number, data: Partial<InsertPermission>): Promise<Permission> {
    const results = await db.update(permissions).set(data).where(eq(permissions.id, id)).returning();
    return results[0];
  }

  async deletePermission(id: number): Promise<void> {
    await db.delete(permissions).where(eq(permissions.id, id));
  }

  async assignPermissionToRole(rolePermission: InsertRolePermission): Promise<RolePermission> {
    const results = await db.insert(rolePermissions).values(rolePermission).returning();
    return results[0];
  }

  async removePermissionFromRole(roleId: number, permissionId: number): Promise<void> {
    await db.delete(rolePermissions)
      .where(and(
        eq(rolePermissions.roleId, roleId),
        eq(rolePermissions.permissionId, permissionId)
      ));
  }

  async getRolePermissions(roleId: number): Promise<Permission[]> {
    const query = db
      .select({
        id: permissions.id,
        name: permissions.name,
        description: permissions.description,
        scope: permissions.scope,
        action: permissions.action,
        createdAt: permissions.createdAt
      })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(rolePermissions.roleId, roleId));

    return query;
  }

  // =========================================
  // User Forum Role methods
  // =========================================
  
  async assignUserForumRole(userForumRole: InsertUserForumRole): Promise<UserForumRole> {
    const results = await db.insert(userForumRoles).values(userForumRole).returning();
    return results[0];
  }

  async removeUserForumRole(userId: number, forumId: number): Promise<void> {
    await db.delete(userForumRoles)
      .where(and(
        eq(userForumRoles.userId, userId),
        eq(userForumRoles.forumId, forumId)
      ));
  }

  async getUserForumRoles(userId: number): Promise<UserForumRole[]> {
    return db.select().from(userForumRoles).where(eq(userForumRoles.userId, userId));
  }

  async getUserForumRolesByForum(forumId: number): Promise<UserForumRole[]> {
    return db.select().from(userForumRoles).where(eq(userForumRoles.forumId, forumId));
  }

  // =========================================
  // User methods 
  // =========================================
  
  async getUser(id: number): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.id, id));
    return results.length ? results[0] : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const results = await db.select().from(users).where(eq(users.username, username));
    return results.length ? results[0] : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    // First create a Supabase auth user if using email auth
    try {
      if (user.email && user.password) {
        const { data, error } = await supabase.auth.signUp({
          email: user.email,
          password: user.password, // We still pass the hashed password to supabase
        });

        if (error) {
          log(`Error creating Supabase user: ${error.message}`);
          throw error;
        }

        // If Supabase user creation successful, continue with DB user creation
        const results = await db.insert(users).values({
          ...user,
          // Optional: store Supabase UID for reference
          // This would require adding a supabaseUserId field to the User schema
        }).returning();

        return results[0];
      } else {
        // For cases where user creation doesn't use email/password (like AI users)
        const results = await db.insert(users).values(user).returning();
        return results[0];
      }
    } catch (error) {
      log(`Error in createUser: ${error.message}`);
      throw error;
    }
  }

  async updateUserRole(userId: number, roleId: number): Promise<User> {
    const results = await db.update(users)
      .set({ roleId })
      .where(eq(users.id, userId))
      .returning();
    return results[0];
  }

  async hasPermission(userId: number, permissionName: string, forumId?: number): Promise<boolean> {
    try {
      const user = await this.getUser(userId);
      if (!user) return false;

      // If user is admin, they have all permissions
      if (user.isAdmin) return true;

      // Check user's global role permissions
      if (user.roleId) {
        const rolePermissions = await this.getRolePermissions(user.roleId);
        if (rolePermissions.some(p => p.name === permissionName)) {
          return true;
        }
      }

      // If forumId provided, check forum-specific permissions
      if (forumId) {
        const userForumRoles = await db.select()
          .from(userForumRoles)
          .where(and(
            eq(userForumRoles.userId, userId),
            eq(userForumRoles.forumId, forumId)
          ));

        if (userForumRoles.length > 0) {
          for (const userForumRole of userForumRoles) {
            const rolePermissions = await this.getRolePermissions(userForumRole.roleId);
            if (rolePermissions.some(p => p.name === permissionName)) {
              return true;
            }
          }
        }
      }

      return false;
    } catch (error) {
      log(`Error checking permissions: ${error}`);
      return false;
    }
  }

  async getOrCreateAPIUser(forumId: number): Promise<User> {
    try {
      // Look for existing AI user for this forum
      const results = await db.select().from(users)
        .where(and(
          eq(users.isAI, true),
          sql`exists (
            select 1 from ${userForumRoles}
            where ${userForumRoles.userId} = ${users.id}
            and ${userForumRoles.forumId} = ${forumId}
          )`
        ));

      if (results.length > 0) {
        return results[0];
      }

      // Create new AI user
      const forum = await this.getForum(forumId);
      if (!forum) {
        throw new Error(`Forum with ID ${forumId} not found`);
      }

      const aiUser: InsertUser = {
        username: `ai_${forum.slug}_${Date.now()}`,
        password: crypto.randomUUID(), // Random password
        email: `ai_${forum.slug}_${Date.now()}@example.com`,
        displayName: `AI Assistant (${forum.name})`,
        isAI: true,
      };

      const newUser = await this.createUser(aiUser);

      // Assign AI user to forum with appropriate role
      // First, find or create an AI role
      let aiRole = await this.getRoleByName('ai_assistant');
      if (!aiRole) {
        aiRole = await this.createRole({
          name: 'ai_assistant',
          description: 'AI Assistant with limited permissions',
        });

        // Create and assign basic permissions for AI
        const answerPermission = await this.getPermissionByName('answer_questions') || 
          await this.createPermission({
            name: 'answer_questions',
            description: 'Can post answers to questions',
            scope: 'forum',
            action: 'create',
          });

        await this.assignPermissionToRole({
          roleId: aiRole.id,
          permissionId: answerPermission.id,
        });
      }

      // Assign AI user to forum
      await this.assignUserForumRole({
        userId: newUser.id,
        forumId: forumId,
        roleId: aiRole.id,
      });

      return newUser;
    } catch (error) {
      log(`Error creating API user: ${error}`);
      throw error;
    }
  }

  // Implement the rest of the methods required by IStorage interface...
  // This will include the Category, Question, Answer, Vote, etc. methods
  // Using the db object with Drizzle ORM as in the PostgresStorage implementation

  // In the interest of brevity, we're showing a partial implementation here.
  // You would continue implementing all the methods from IStorage
  // using the Supabase SDK where appropriate (especially for auth and storage)
  // and the Drizzle ORM for database operations.

  // =========================================
  // Category methods
  // =========================================
  
  async getCategory(id: number): Promise<Category | undefined> {
    const results = await db.select().from(categories).where(eq(categories.id, id));
    return results.length ? results[0] : undefined;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const results = await db.select().from(categories).where(eq(categories.slug, slug));
    return results.length ? results[0] : undefined;
  }

  async getAllCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async getCategories(): Promise<Category[]> {
    return db.select().from(categories);
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const results = await db.insert(categories).values(category).returning();
    return results[0];
  }

  async getCategoriesByForum(forumId: number): Promise<Category[]> {
    // Assuming categories are associated with forums through a forumId field
    return db.select().from(categories).where(eq(categories.forumId as any, forumId));
  }

  // Continue implementing remaining methods...
}