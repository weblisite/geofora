import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
neonConfig.webSocketConstructor = ws;

const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_n80MTYHEjOte@ep-weathered-base-aeeun4m6-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const result = await pool.query('SELECT COUNT(*) FROM ai_personas');
    console.log('AI Personas count:', result.rows[0].count);
    
    // Test personas query with joins
    const personasResult = await pool.query(`
      SELECT 
        ap.id,
        ap.name,
        ap.era,
        ap.provider_id,
        ap.model_id,
        ap.knowledge_level,
        ap.personality,
        ap.use_case,
        ap.system_prompt,
        ap.temperature,
        ap.max_tokens,
        ap.is_active,
        p.name as provider_name,
        m.name as model_name
      FROM ai_personas ap
      LEFT JOIN ai_providers p ON ap.provider_id = p.id
      LEFT JOIN ai_models m ON ap.model_id = m.id
      WHERE ap.is_active = true
    `);
    
    console.log('Personas query result:', personasResult.rows.length, 'personas found');
    personasResult.rows.forEach(persona => {
      console.log(`- ${persona.name} (${persona.provider_name}/${persona.model_name})`);
    });
    
  } catch (error) {
    console.error('Database test error:', error);
  } finally {
    await pool.end();
  }
}

testDatabase();
