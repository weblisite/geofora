import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { users, categories, questions, answers } from '../shared/schema';
import * as dotenv from 'dotenv';

dotenv.config();

const sql = postgres(process.env.DATABASE_URL!);
const db = drizzle(sql);

async function createSimpleData() {
  console.log('📝 Creating simple test data...');

  try {
    // 1. Get existing users
    const existingUsers = await db.select().from(users).limit(2);
    console.log(`Found ${existingUsers.length} existing users`);
    
    if (existingUsers.length < 2) {
      console.log('Need at least 2 users, but schema might be complex. Let me use what we have...');
    }
    
    const user1 = existingUsers[0];
    const user2 = existingUsers[1] || existingUsers[0]; // Use same user if only one exists
    
    console.log(`✅ Using users: ${user1.username}, ${user2.username}`);

    // 2. Get existing forum ID
    const forumResult = await sql`SELECT id FROM forums LIMIT 1`;
    const forumId = forumResult[0]?.id;
    
    if (!forumId) {
      throw new Error('No forum found');
    }
    
    console.log(`✅ Using forum ID: ${forumId}`);

    // 3. Insert category with forum_id
    console.log('Creating category directly...');
    await sql`INSERT INTO categories (name, slug, forum_id) VALUES ('General Discussion', 'general-discussion', ${forumId}) ON CONFLICT (slug) DO NOTHING`;
    
    // Get the category
    const categoryResult = await sql`SELECT id FROM categories WHERE slug = 'general-discussion' LIMIT 1`;
    const categoryId = categoryResult[0]?.id;
    
    if (!categoryId) {
      throw new Error('Failed to create/find category');
    }
    
    console.log(`✅ Using category ID: ${categoryId}`);

    // 3. Create questions directly with SQL
    console.log('Creating questions...');
    const questionInsertResult = await sql`
      INSERT INTO questions (title, content, user_id, category_id)
      VALUES 
        ('What are the best AI tools for SEO?', 'Looking for AI tools to help with SEO content creation and optimization.', ${user1.id}, ${categoryId}),
        ('How to improve Core Web Vitals?', 'My website has poor Core Web Vitals scores. Need help improving LCP and CLS.', ${user2.id}, ${categoryId}),
        ('Best technical SEO practices?', 'What are the current best practices for technical SEO in 2024?', ${user1.id}, ${categoryId})
      RETURNING id, title
    `;
    
    console.log(`✅ Created ${questionInsertResult.length} questions`);

    // 4. Create answers with SQL
    console.log('Creating answers...');
    const answerInsertResult = await sql`
      INSERT INTO answers (content, user_id, question_id)
      VALUES 
        ('I recommend Jasper AI and Copy.ai for content creation. They both offer great SEO features.', ${user2.id}, ${questionInsertResult[0].id}),
        ('For Core Web Vitals, focus on image optimization, CDN usage, and reducing JavaScript.', ${user1.id}, ${questionInsertResult[1].id}),
        ('Technical SEO should focus on schema markup, site speed, and proper internal linking.', ${user2.id}, ${questionInsertResult[2].id})
      RETURNING id
    `;
    
    console.log(`✅ Created ${answerInsertResult.length} answers`);

    console.log('\n🎉 Simple data creation completed!');
    console.log(`📊 Summary:`);
    console.log(`- Category: General Discussion`);
    console.log(`- Questions: ${questionInsertResult.length}`);
    console.log(`- Answers: ${answerInsertResult.length}`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.end();
  }
}

createSimpleData();