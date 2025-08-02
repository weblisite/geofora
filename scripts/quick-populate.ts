import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, forums, categories, questions, answers } from '../shared/schema';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function quickPopulate() {
  console.log('🚀 Quick database population...');

  try {
    // 1. Get existing data
    const existingForums = await db.select().from(forums).limit(1);
    const existingUsers = await db.select().from(users).limit(2);
    
    if (existingForums.length === 0) {
      console.log('❌ No forums found. Please create a forum first.');
      return;
    }
    
    const forum = existingForums[0];
    console.log(`✅ Using forum: ${forum.name} (ID: ${forum.id})`);
    
    let user1, user2;
    if (existingUsers.length >= 2) {
      [user1, user2] = existingUsers;
    } else {
      // Create users if needed
      const newUsers = await db.insert(users).values([
        {
          username: 'test_user1_' + Date.now(),
          password: 'dummy_password',
          email: `test1.${Date.now()}@example.com`,
          displayName: 'Test User 1',
          clerkUserId: `clerk_test1_${Date.now()}`,
        },
        {
          username: 'test_user2_' + Date.now(),
          password: 'dummy_password',
          email: `test2.${Date.now()}@example.com`,
          displayName: 'Test User 2', 
          clerkUserId: `clerk_test2_${Date.now()}`,
        }
      ]).returning();
      [user1, user2] = newUsers;
    }
    
    console.log(`✅ Using users: ${user1.displayName}, ${user2.displayName}`);

    // 2. Create simple categories (without forumId since schema doesn't support it)
    const existingCategories = await db.select().from(categories);
    let categoryList = existingCategories;
    
    if (existingCategories.length === 0) {
      console.log('Creating categories...');
      categoryList = await db.insert(categories).values([
        { name: 'General Discussion', slug: 'general-discussion' },
        { name: 'SEO Tips', slug: 'seo-tips' },
        { name: 'Tech Support', slug: 'tech-support' },
      ]).returning();
      console.log(`✅ Created ${categoryList.length} categories`);
    } else {
      console.log(`✅ Using existing ${categoryList.length} categories`);
    }

    // 3. Create sample questions
    console.log('Creating questions...');
    const questionData = [
      {
        title: 'What are the best AI tools for SEO content creation?',
        content: 'I\'m looking for recommendations on AI tools that can help with creating SEO-optimized content. What are your experiences with different tools like Jasper, Copy.ai, or ChatGPT for content creation?',
        userId: user1.id,
        categoryId: categoryList[0].id,
      },
      {
        title: 'How to improve website Core Web Vitals?',
        content: 'My website has poor Core Web Vitals scores, especially LCP and CLS. What are the most effective techniques to improve these metrics for better SEO performance?',
        userId: user2.id,
        categoryId: categoryList[1].id,
      },
      {
        title: 'Best practices for technical SEO in 2024?',
        content: 'What are the current best practices for technical SEO? I\'m particularly interested in schema markup, site speed optimization, and mobile-first indexing.',
        userId: user1.id,
        categoryId: categoryList[1].id,
      },
      {
        title: 'How to measure SEO ROI effectively?',
        content: 'What metrics and tools do you use to measure the ROI of your SEO efforts? How do you attribute organic traffic to actual business results?',
        userId: user2.id,
        categoryId: categoryList[0].id,
      },
      {
        title: 'Content gap analysis techniques?',
        content: 'What are the best methods and tools for identifying content gaps in your SEO strategy? Looking for both free and paid solutions.',
        userId: user1.id,
        categoryId: categoryList[2].id,
      }
    ];

    const createdQuestions = await db.insert(questions).values(questionData).returning();
    console.log(`✅ Created ${createdQuestions.length} questions`);

    // 4. Create sample answers
    console.log('Creating answers...');
    const answerData = [
      {
        content: 'I\'ve had great success with Jasper AI and Copy.ai for content creation. They both offer SEO optimization features and can generate content at scale. The key is to use them as a starting point and then add your own expertise and insights. ChatGPT is also excellent for brainstorming and creating outlines.',
        userId: user2.id,
        questionId: createdQuestions[0].id,
      },
      {
        content: 'For Core Web Vitals improvement, focus on these areas: 1) Optimize images with WebP format and lazy loading, 2) Minimize JavaScript and CSS, 3) Use a good CDN like Cloudflare, 4) Optimize your hosting (consider faster servers), 5) Reduce third-party scripts. Tools like GTmetrix and PageSpeed Insights are essential for monitoring.',
        userId: user1.id,
        questionId: createdQuestions[1].id,
      },
      {
        content: 'Technical SEO in 2024 should focus on: Schema markup for rich snippets, Core Web Vitals optimization, mobile-first indexing, XML sitemaps, internal linking structure, and HTTPS security. Don\'t forget about crawl budget optimization for larger sites.',
        userId: user2.id,
        questionId: createdQuestions[2].id,
      },
      {
        content: 'For SEO ROI measurement, I use Google Analytics 4 with enhanced ecommerce tracking, Google Search Console for organic performance, and tools like SEMrush or Ahrefs for keyword tracking. Set up proper conversion tracking and calculate lifetime value, not just immediate conversions.',
        userId: user1.id,
        questionId: createdQuestions[3].id,
      },
      {
        content: 'Content gap analysis is crucial! I use Ahrefs Content Gap tool, SEMrush Keyword Gap, and Google Search Console data. Look at what your competitors rank for that you don\'t. Also analyze search intent and user journeys to identify missing content types. Answer The Public is great for question-based content gaps.',
        userId: user2.id,
        questionId: createdQuestions[4].id,
      },
      {
        content: 'Another approach for Core Web Vitals is to audit your current plugins and themes. Many WordPress sites see huge improvements just by switching to a lightweight theme like Astra or GeneratePress and removing unnecessary plugins.',
        userId: user1.id,
        questionId: createdQuestions[1].id,
      }
    ];

    const createdAnswers = await db.insert(answers).values(answerData).returning();
    console.log(`✅ Created ${createdAnswers.length} answers`);

    console.log('\n🎉 Quick population completed successfully!');
    console.log(`- Categories: ${categoryList.length}`);
    console.log(`- Questions: ${createdQuestions.length}`);
    console.log(`- Answers: ${createdAnswers.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.end();
  }
}

quickPopulate();