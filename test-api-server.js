import express from 'express';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

neonConfig.webSocketConstructor = ws;

const app = express();
app.use(express.json());

// Create database connection
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_n80MTYHEjOte@ep-weathered-base-aeeun4m6-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

// Test analytics endpoint
app.get('/api/analytics/dashboard-stats/:period', async (req, res) => {
  try {
    const period = req.params.period || "30d";
    const forumId = req.query.forumId ? parseInt(req.query.forumId) : 38; // Use first forum
    
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    if (period === "7d") {
      startDate.setDate(endDate.getDate() - 7);
    } else if (period === "30d") {
      startDate.setDate(endDate.getDate() - 30);
    } else if (period === "90d") {
      startDate.setDate(endDate.getDate() - 90);
    } else {
      startDate.setDate(endDate.getDate() - 30);
    }
    
    // Get analytics data
    const result = await pool.query(`
      SELECT 
        COUNT(DISTINCT q.id) as total_questions,
        COUNT(DISTINCT a.id) as total_answers,
        COUNT(DISTINCT q.user_id) as unique_questioners,
        COUNT(DISTINCT a.user_id) as unique_answerers,
        COUNT(DISTINCT v.id) as total_votes
      FROM questions q
      LEFT JOIN answers a ON q.id = a.question_id
      LEFT JOIN votes v ON a.id = v.answer_id
      WHERE q.created_at >= $1 AND q.created_at <= $2
    `, [startDate, endDate]);
    
    const stats = result.rows[0];
    
    res.json({
      success: true,
      data: {
        totalQuestions: parseInt(stats.total_questions) || 0,
        totalAnswers: parseInt(stats.total_answers) || 0,
        uniqueUsers: parseInt(stats.unique_questioners) + parseInt(stats.unique_answerers) || 0,
        totalVotes: parseInt(stats.total_votes) || 0,
        period: period,
        forumId: forumId
      }
    });
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test personas endpoint
app.get('/api/personas', async (req, res) => {
  try {
    const result = await pool.query(`
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
    
    const personas = result.rows.map(persona => ({
      id: persona.id,
      name: persona.name,
      era: persona.era,
      provider: persona.provider_name,
      model: persona.model_name,
      knowledgeLevel: persona.knowledge_level,
      personality: persona.personality,
      useCase: persona.use_case,
      systemPrompt: persona.system_prompt,
      temperature: persona.temperature,
      maxTokens: persona.max_tokens,
      isActive: persona.is_active
    }));
    
    res.json({
      success: true,
      data: personas
    });
    
  } catch (error) {
    console.error('Personas error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Test AI providers endpoint
app.get('/api/ai/providers', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        name,
        display_name,
        is_active,
        rate_limits,
        capabilities
      FROM ai_providers
      WHERE is_active = true
    `);
    
    const providers = result.rows.map(provider => ({
      id: provider.id,
      name: provider.name,
      displayName: provider.display_name,
      isActive: provider.is_active,
      rateLimits: provider.rate_limits,
      capabilities: provider.capabilities
    }));
    
    res.json({
      success: true,
      data: providers
    });
    
  } catch (error) {
    console.error('AI providers error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

const PORT = 4002;
app.listen(PORT, () => {
  console.log(`Test API server running on port ${PORT}`);
});
