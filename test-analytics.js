import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_n80MTYHEjOte@ep-weathered-base-aeeun4m6-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function testAnalytics() {
  try {
    console.log('Testing analytics data...');
    
    // Get forums
    const forumsResult = await pool.query('SELECT * FROM forums LIMIT 5');
    console.log('Forums:', forumsResult.rows.length);
    forumsResult.rows.forEach(forum => {
      console.log(`- Forum ${forum.id}: ${forum.name} (${forum.domain})`);
    });
    
    // Get users
    const usersResult = await pool.query('SELECT * FROM users LIMIT 5');
    console.log('Users:', usersResult.rows.length);
    usersResult.rows.forEach(user => {
      console.log(`- User ${user.id}: ${user.username} (${user.clerk_user_id})`);
    });
    
    // Get questions and answers for analytics
    const questionsResult = await pool.query('SELECT COUNT(*) FROM questions');
    console.log('Questions count:', questionsResult.rows[0].count);
    
    const answersResult = await pool.query('SELECT COUNT(*) FROM answers');
    console.log('Answers count:', answersResult.rows[0].count);
    
    // Test analytics query
    const analyticsResult = await pool.query(`
      SELECT 
        COUNT(DISTINCT q.id) as total_questions,
        COUNT(DISTINCT a.id) as total_answers,
        COUNT(DISTINCT q.user_id) as unique_questioners,
        COUNT(DISTINCT a.user_id) as unique_answerers
      FROM questions q
      LEFT JOIN answers a ON q.id = a.question_id
      WHERE q.created_at >= NOW() - INTERVAL '30 days'
    `);
    
    console.log('Analytics data:', analyticsResult.rows[0]);
    
  } catch (error) {
    console.error('Analytics test error:', error);
  } finally {
    await pool.end();
  }
}

testAnalytics();
