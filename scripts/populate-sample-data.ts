import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
  users, forums, categories, questions, answers,
  aiAgents, leadCaptureForms, crmIntegrations
} from '../shared/schema';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function populateDatabase() {
  console.log('🌱 Starting database population...');

  try {
    // 1. Get existing users or create sample users
    console.log('Getting existing users...');
    const existingUsers = await db.select().from(users).limit(2);
    
    let [user1, user2] = existingUsers;
    
    // Always create sample users to ensure we have proper users for testing
    console.log('Creating sample test users...');
    const usersToCreate = [
      {
        username: 'sample_admin_' + Date.now(),
        password: 'dummy_password_clerk_auth',
        email: `sample.admin.${Date.now()}@testforum.com`,
        displayName: 'Sample Admin',
        clerkUserId: `clerk_sample_admin_${Date.now()}`,
        isAdmin: true,
        roleId: 1,
      },
      {
        username: 'sample_user_' + Date.now(),
        password: 'dummy_password_clerk_auth',
        email: `sample.user.${Date.now()}@testforum.com`,
        displayName: 'Sample User',
        clerkUserId: `clerk_sample_user_${Date.now()}`,
        isAdmin: false,
        roleId: 2,
      }
    ];
    
    const newUsers = await db.insert(users).values(usersToCreate).returning();
    user1 = newUsers[0];
    user2 = newUsers[1];

    console.log(`✅ Using users: ${user1?.displayName || 'NULL'}, ${user2?.displayName || 'NULL'}`);
    console.log(`User1 ID: ${user1?.id}, User2 ID: ${user2?.id}`);

    // 2. Get existing forums or create sample forums
    console.log('Getting existing forums...');
    const existingForums = await db.select().from(forums).limit(2);
    
    let [forum1, forum2] = existingForums;
    
    if (existingForums.length < 2) {
      console.log('Creating additional forums...');
      const forumsToCreate = [];
      
      if (!forum1) {
        forumsToCreate.push({
          name: 'AI & SEO Discussion',
          description: 'Discuss AI-powered SEO strategies and tools',
          slug: 'ai-seo-discussion',
          userId: user1.id,
          isPublic: true,
          themeColor: '#3b82f6',
        });
      }
      
      if (!forum2) {
        forumsToCreate.push({
          name: 'Digital Marketing Hub',
          description: 'Everything about digital marketing trends and techniques',
          slug: 'digital-marketing-hub',
          userId: user1.id,
          isPublic: true,
          themeColor: '#10b981',
        });
      }
      
      if (forumsToCreate.length > 0) {
        const newForums = await db.insert(forums).values(forumsToCreate).returning();
        if (!forum1) forum1 = newForums[0];
        if (!forum2) forum2 = newForums[1] || newForums[0];
      }
    }

    console.log(`✅ Using forums: ${forum1.name}, ${forum2?.name || 'Single forum'}`);

    // Use forum2 as forum1 if we only have one forum
    if (!forum2) forum2 = forum1;

    // 3. Create sample categories
    console.log('Creating categories...');
    console.log(`Forum1 ID: ${forum1.id}, Forum2 ID: ${forum2.id}`);
    
    const categoryData = [
      { name: 'SEO Strategy', slug: 'seo-strategy', forumId: forum1.id },
      { name: 'Content Marketing', slug: 'content-marketing', forumId: forum1.id },
      { name: 'Technical SEO', slug: 'technical-seo', forumId: forum1.id },
      { name: 'Social Media', slug: 'social-media', forumId: forum2.id },
      { name: 'PPC Advertising', slug: 'ppc-advertising', forumId: forum2.id },
    ];
    
    console.log('Category data:', categoryData);

    const createdCategories = await db.insert(categories).values(categoryData).returning();
    console.log(`✅ Created ${createdCategories.length} categories`);

    // 4. Create sample questions
    console.log('Creating questions...');
    const questionData = [
      {
        title: 'What are the best AI tools for SEO content creation?',
        content: 'I\'m looking for recommendations on AI tools that can help with creating SEO-optimized content. What are your experiences with different tools?',
        userId: user2.id,
        categoryId: createdCategories[0].id,
        isAiGenerated: false,
      },
      {
        title: 'How to improve Core Web Vitals for better SEO?',
        content: 'My website has poor Core Web Vitals scores. What are the most effective techniques to improve LCP, FID, and CLS?',
        userId: user2.id,
        categoryId: createdCategories[2].id,
        isAiGenerated: false,
      },
      {
        title: 'Best practices for social media content scheduling?',
        content: 'What tools and strategies do you use for scheduling social media content across multiple platforms?',
        userId: user1.id,
        categoryId: createdCategories[3].id,
        isAiGenerated: false,
      },
      {
        title: 'ROI measurement for PPC campaigns?',
        content: 'How do you accurately measure and optimize ROI for Google Ads and other PPC campaigns?',
        userId: user2.id,
        categoryId: createdCategories[4].id,
        isAiGenerated: false,
      },
      {
        title: 'Content gap analysis techniques?',
        content: 'What methods do you use to identify content gaps in your SEO strategy?',
        userId: user1.id,
        categoryId: createdCategories[1].id,
        isAiGenerated: false,
      }
    ];

    const createdQuestions = await db.insert(questions).values(questionData).returning();
    console.log(`✅ Created ${createdQuestions.length} questions`);

    // 5. Create sample answers
    console.log('Creating answers...');
    const answerData = [
      {
        content: 'I\'ve had great success with Jasper AI and Copy.ai for content creation. They both offer SEO optimization features and can generate content at scale. The key is to use them as a starting point and then add your own expertise and insights.',
        userId: user1.id,
        questionId: createdQuestions[0].id,
      },
      {
        content: 'For Core Web Vitals improvement, focus on these areas: 1) Optimize images with WebP format and lazy loading, 2) Minimize JavaScript and CSS, 3) Use a good CDN, 4) Optimize your hosting, 5) Reduce third-party scripts. Tools like GTmetrix and PageSpeed Insights are essential for monitoring.',
        userId: user1.id,
        questionId: createdQuestions[1].id,
      },
      {
        content: 'I use Buffer and Hootsuite for scheduling. The key is to maintain a consistent posting schedule and use analytics to determine the best times to post for your audience. Don\'t just schedule - engage with your community in real-time too.',
        userId: user2.id,
        questionId: createdQuestions[2].id,
      },
      {
        content: 'For PPC ROI measurement, set up proper conversion tracking first. Use Google Analytics 4 with enhanced ecommerce tracking. Calculate lifetime value, not just immediate conversions. Tools like Google Ads conversion tracking and third-party attribution tools can provide deeper insights.',
        userId: user1.id,
        questionId: createdQuestions[3].id,
      },
      {
        content: 'Content gap analysis is crucial! I use tools like Ahrefs Content Gap tool, SEMrush Keyword Gap, and Google Search Console. Look at what your competitors rank for that you don\'t. Also analyze search intent and user journeys to identify missing content types.',
        userId: user2.id,
        questionId: createdQuestions[4].id,
      }
    ];

    const createdAnswers = await db.insert(answers).values(answerData).returning();
    console.log(`✅ Created ${createdAnswers.length} answers`);

    // 6. Create sample AI personas
    console.log('Creating AI personas...');
    const personaData = [
      {
        name: 'SEO Expert Bot',
        type: 'seo_expert',
        description: 'Specializes in technical SEO and content optimization',
        personality: 'professional',
        tone: 'authoritative',
        responseLength: 250,
        active: true,
        userId: user1.id,
      },
      {
        name: 'Content Creator AI',
        type: 'content_creator',
        description: 'Helps with content marketing and copywriting',
        personality: 'creative',
        tone: 'friendly',
        responseLength: 200,
        active: true,
        userId: user1.id,
      }
    ];

    const createdAgents = await db.insert(aiAgents).values(personaData).returning();
    console.log(`✅ Created ${createdAgents.length} AI agents`);

    // 7. Create sample lead capture forms
    console.log('Creating lead capture forms...');
    const formData = [
      {
        title: 'SEO Newsletter Signup',
        description: 'Get weekly SEO tips and updates',
        thankYouMessage: 'Thank you for subscribing to our SEO newsletter!',
        forumId: forum1.id,
        userId: user1.id,
        isActive: true,
        requiresName: true,
        requiresEmail: true,
        requiresPhone: false,
        requiresCompany: false,
      },
      {
        title: 'Marketing Resources Download',
        description: 'Download our comprehensive marketing guide',
        thankYouMessage: 'Your download link has been sent to your email!',
        forumId: forum2.id,
        userId: user1.id,
        isActive: true,
        requiresName: true,
        requiresEmail: true,
        requiresPhone: false,
        requiresCompany: true,
      }
    ];

    const createdForms = await db.insert(leadCaptureForms).values(formData).returning();
    console.log(`✅ Created ${createdForms.length} lead capture forms`);

    // 8. Create sample CRM integrations
    console.log('Creating CRM integrations...');
    const crmData = [
      {
        provider: 'hubspot',
        apiKey: 'sample_hubspot_key',
        isActive: true,
        forumId: forum1.id,
        userId: user1.id,
        settings: { syncFrequency: 'daily', autoSync: true },
      },
      {
        provider: 'salesforce',
        apiKey: 'sample_salesforce_key',
        isActive: true,
        forumId: forum2.id,
        userId: user1.id,
        settings: { syncFrequency: 'weekly', autoSync: false },
      }
    ];

    const createdCrm = await db.insert(crmIntegrations).values(crmData).returning();
    console.log(`✅ Created ${createdCrm.length} CRM integrations`);

    console.log('🎉 Database population completed successfully!');
    
    // Summary
    console.log('\n📊 Summary:');
    console.log(`- Users: ${2}`);
    console.log(`- Forums: ${2}`);
    console.log(`- Categories: ${createdCategories.length}`);
    console.log(`- Questions: ${createdQuestions.length}`);
    console.log(`- Answers: ${createdAnswers.length}`);
    console.log(`- AI Personas: ${createdPersonas.length}`);
    console.log(`- Lead Forms: ${createdForms.length}`);
    console.log(`- CRM Integrations: ${createdCrm.length}`);

  } catch (error) {
    console.error('❌ Error populating database:', error);
  } finally {
    await sql.end();
  }
}

populateDatabase();