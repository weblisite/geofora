import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, questions, answers } from '../shared/schema';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function minimalPopulate() {
  console.log('🎯 Minimal database population...');

  try {
    // 1. Get or create users
    let existingUsers = await db.select().from(users).limit(2);
    
    let [user1, user2] = existingUsers;
    
    if (!user1) {
      console.log('Creating user1...');
      [user1] = await db.insert(users).values([{
        username: 'seo_expert_' + Date.now(),
        password: 'dummy_password',
        email: `seo.expert.${Date.now()}@example.com`,
        displayName: 'SEO Expert',
        clerkUserId: `clerk_seo_${Date.now()}`,
      }]).returning();
    }
    
    if (!user2) {
      console.log('Creating user2...');
      [user2] = await db.insert(users).values([{
        username: 'content_creator_' + Date.now(),
        password: 'dummy_password',
        email: `content.creator.${Date.now()}@example.com`,
        displayName: 'Content Creator',
        clerkUserId: `clerk_content_${Date.now()}`,
      }]).returning();
    }
    
    console.log(`✅ Using users: ${user1.displayName || user1.username}, ${user2.displayName || user2.username}`);

    // 2. Create sample questions (using categoryId = 1 if it exists, or null)
    console.log('Creating questions...');
    const questionData = [
      {
        title: 'What are the best AI tools for SEO content creation in 2024?',
        content: 'I\'m looking for recommendations on AI tools that can help with creating SEO-optimized content. What are your experiences with different tools like Jasper, Copy.ai, Claude, or ChatGPT for content creation? Which ones provide the best ROI for content marketing?',
        userId: user1.id,
        categoryId: 1, // Using 1 as default category
      },
      {
        title: 'How to improve website Core Web Vitals scores?',
        content: 'My website has poor Core Web Vitals scores, especially LCP (Largest Contentful Paint) and CLS (Cumulative Layout Shift). What are the most effective techniques to improve these metrics for better SEO performance? I\'m using WordPress.',
        userId: user2.id,
        categoryId: 1,
      },
      {
        title: 'Best technical SEO practices for 2024?',
        content: 'What are the current best practices for technical SEO? I\'m particularly interested in schema markup implementation, site speed optimization, and mobile-first indexing strategies. Any recent algorithm updates I should know about?',
        userId: user1.id,
        categoryId: 1,
      },
      {
        title: 'How do you measure SEO ROI effectively?',
        content: 'What metrics and tools do you use to measure the ROI of your SEO efforts? How do you attribute organic traffic to actual business results and revenue? Looking for both free and paid analytics solutions.',
        userId: user2.id,
        categoryId: 1,
      },
      {
        title: 'Content gap analysis - tools and techniques?',
        content: 'What are the best methods and tools for identifying content gaps in your SEO strategy? Looking for both keyword gap analysis and topical gap analysis. What\'s your process for competitor content research?',  
        userId: user1.id,
        categoryId: 1,
      }
    ];

    const createdQuestions = await db.insert(questions).values(questionData).returning();
    console.log(`✅ Created ${createdQuestions.length} questions`);

    // 3. Create sample answers
    console.log('Creating answers...');
    const answerData = [
      {
        content: 'I\'ve had excellent results with Jasper AI and Copy.ai for content creation. They both offer SEO optimization features and can generate content at scale. The key is to use them as a starting point and then add your own expertise and insights. For 2024, I\'d also recommend trying Claude - it\'s particularly good at understanding context and creating more natural-sounding content.',
        userId: user2.id,
        questionId: createdQuestions[0].id,
      },
      {
        content: 'For Core Web Vitals improvement on WordPress, here\'s what worked for me: 1) Switch to a lightweight theme like Astra or GeneratePress, 2) Optimize images with WebP format and lazy loading (use Smush or ShortPixel), 3) Use a good CDN like Cloudflare, 4) Minimize plugins and remove unused ones, 5) Optimize your hosting - consider managed WordPress hosting. Also, avoid layout shifts by setting fixed dimensions for images and ads.',
        userId: user1.id,
        questionId: createdQuestions[1].id,
      },
      {
        content: 'Technical SEO in 2024 should focus on: Schema markup for rich snippets (use Schema Pro or manual implementation), Core Web Vitals optimization, mobile-first indexing preparation, proper XML sitemaps, internal linking structure, HTTPS security, and crawl budget optimization for larger sites. Google\'s helpful content update also means focusing on user experience signals.',
        userId: user2.id,
        questionId: createdQuestions[2].id,
      },
      {
        content: 'For SEO ROI measurement, I use a combination of Google Analytics 4 with enhanced ecommerce tracking, Google Search Console for organic performance data, and tools like SEMrush or Ahrefs for keyword tracking and competitor analysis. The key is setting up proper conversion tracking and calculating lifetime value, not just immediate conversions. I also track brand searches and assisted conversions.',
        userId: user1.id,
        questionId: createdQuestions[3].id,
      },
      {
        content: 'Content gap analysis is crucial for SEO success! My process: 1) Use Ahrefs Content Gap tool and SEMrush Keyword Gap to see what competitors rank for that I don\'t, 2) Analyze Google Search Console data for keyword opportunities, 3) Use Answer The Public for question-based content gaps, 4) Check Reddit and Quora for trending topics in your niche, 5) Analyze user journeys to identify missing content types. Don\'t just look at keywords - look at search intent and content formats too.',
        userId: user2.id,
        questionId: createdQuestions[4].id,
      },
      {
        content: 'Another approach for Core Web Vitals: Use Google PageSpeed Insights and Chrome DevTools to identify specific issues. Often, the biggest gains come from optimizing your largest images and reducing JavaScript execution time. For WordPress sites, consider using a performance plugin like WP Rocket or W3 Total Cache.',
        userId: user1.id,
        questionId: createdQuestions[1].id,
      },
      {
        content: 'Adding to the AI tools discussion - don\'t forget about Writesonic and Surfer SEO. Surfer is particularly good for content optimization based on SERP analysis. Also, consider using AI for content outlines and then having humans write the actual content for better quality and authenticity.',
        userId: user1.id,
        questionId: createdQuestions[0].id,
      }
    ];

    const createdAnswers = await db.insert(answers).values(answerData).returning();
    console.log(`✅ Created ${createdAnswers.length} answers`);

    console.log('\n🎉 Minimal population completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`- Questions: ${createdQuestions.length}`);
    console.log(`- Answers: ${createdAnswers.length}`);
    console.log(`- Users: ${user1.displayName}, ${user2.displayName}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.end();
  }
}

minimalPopulate();