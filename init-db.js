import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
neonConfig.webSocketConstructor = ws;

// Create connection
const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_n80MTYHEjOte@ep-weathered-base-aeeun4m6-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
});

async function initDatabase() {
  try {
    console.log('Connecting to database...');
    
    // Check if AI providers table exists and has data
    const providersResult = await pool.query('SELECT COUNT(*) FROM ai_providers');
    console.log('AI Providers count:', providersResult.rows[0].count);
    
    // Check if AI models table exists and has data
    const modelsResult = await pool.query('SELECT COUNT(*) FROM ai_models');
    console.log('AI Models count:', modelsResult.rows[0].count);
    
    // Check if AI personas table exists and has data
    const personasResult = await pool.query('SELECT COUNT(*) FROM ai_personas');
    console.log('AI Personas count:', personasResult.rows[0].count);
    
    // If no providers, insert them
    if (providersResult.rows[0].count === '0') {
      console.log('Inserting AI providers...');
      await pool.query(`
        INSERT INTO ai_providers (name, display_name, api_key, is_active, rate_limits, capabilities) VALUES
        ('openai', 'OpenAI', $1, true, $2, $3),
        ('anthropic', 'Anthropic', $4, true, $5, $6),
        ('deepseek', 'DeepSeek', $7, true, $8, $9),
        ('google', 'Google DeepMind', $10, true, $11, $12),
        ('meta', 'Meta AI', $13, true, $14, $15),
        ('xai', 'XAI', $16, true, $17, $18)
      `, [
        process.env.OPENAI_API_KEY || 'test-key',
        JSON.stringify({ tokensPerMinute: 10000, requestsPerMinute: 500 }),
        JSON.stringify({ supportsStreaming: true, supportsVision: true }),
        process.env.ANTHROPIC_API_KEY || 'test-key',
        JSON.stringify({ tokensPerMinute: 5000, requestsPerMinute: 100 }),
        JSON.stringify({ supportsStreaming: true, supportsVision: false }),
        process.env.DEEPSEEK_API_KEY || 'test-key',
        JSON.stringify({ tokensPerMinute: 8000, requestsPerMinute: 200 }),
        JSON.stringify({ supportsStreaming: true, supportsVision: false }),
        process.env.GOOGLE_API_KEY || 'test-key',
        JSON.stringify({ tokensPerMinute: 15000, requestsPerMinute: 1000 }),
        JSON.stringify({ supportsStreaming: true, supportsVision: true }),
        process.env.META_API_KEY || 'test-key',
        JSON.stringify({ tokensPerMinute: 5000, requestsPerMinute: 150 }),
        JSON.stringify({ supportsStreaming: true, supportsVision: false }),
        process.env.XAI_API_KEY || 'test-key',
        JSON.stringify({ tokensPerMinute: 3000, requestsPerMinute: 100 }),
        JSON.stringify({ supportsStreaming: true, supportsVision: false })
      ]);
    }
    
    // If no models, insert them
    if (modelsResult.rows[0].count === '0') {
      console.log('Inserting AI models...');
      await pool.query(`
        INSERT INTO ai_models (name, display_name, provider_id, description, capabilities, is_active, knowledge_cutoff) VALUES
        ('gpt-4', 'GPT-4', 1, 'Most capable GPT-4 model', $1, true, '2023-04-01'),
        ('gpt-3.5-turbo', 'GPT-3.5 Turbo', 1, 'Fast and efficient GPT-3.5 model', $2, true, '2021-09-01'),
        ('claude-3-sonnet-20240229', 'Claude 3 Sonnet', 2, 'Balanced performance and speed', $3, true, '2024-02-29'),
        ('deepseek-chat', 'DeepSeek Chat', 3, 'Advanced reasoning and code generation', $4, true, '2024-01-01'),
        ('gemini-1.5-flash', 'Gemini 1.5 Flash', 4, 'Fast and efficient multimodal model', $5, true, '2024-01-01'),
        ('llama-3.1-8b', 'Llama 3.1 8B', 5, 'Open-source language model', $6, true, '2024-01-01'),
        ('grok-2', 'Grok-2', 6, 'Real-time information and humor', $7, true, '2024-01-01')
      `, [
        JSON.stringify({ maxTokens: 4096, temperature: 0.7, supportsStreaming: true, supportsVision: true }),
        JSON.stringify({ maxTokens: 4096, temperature: 0.7, supportsStreaming: true, supportsVision: false }),
        JSON.stringify({ maxTokens: 4096, temperature: 0.7, supportsStreaming: true, supportsVision: false }),
        JSON.stringify({ maxTokens: 4096, temperature: 0.7, supportsStreaming: true, supportsVision: false }),
        JSON.stringify({ maxTokens: 8192, temperature: 0.7, supportsStreaming: true, supportsVision: true }),
        JSON.stringify({ maxTokens: 4096, temperature: 0.7, supportsStreaming: true, supportsVision: false }),
        JSON.stringify({ maxTokens: 4096, temperature: 0.7, supportsStreaming: true, supportsVision: false })
      ]);
    }
    
    // If no personas, insert them
    if (personasResult.rows[0].count === '0') {
      console.log('Inserting AI personas...');
      await pool.query(`
        INSERT INTO ai_personas (name, type, era, provider_id, model_id, knowledge_level, personality, use_case, system_prompt, temperature, max_tokens, is_active) VALUES
        ('legacybot', 'ai_persona', '2021-2022', 1, 2, 'basic', 'Foundational, reliable, straightforward', 'Basic explanations, foundational knowledge, simple Q&A', 'You are LegacyBot, representing AI from the 2021-2022 era.', 0.3, 500, true),
        ('scholar', 'ai_persona', '2022-2023', 2, 3, 'intermediate', 'Academic, research-focused, analytical', 'Research analysis, academic discussions, knowledge synthesis', 'You are Scholar, representing AI from the 2022-2023 era.', 0.5, 800, true),
        ('sage', 'ai_persona', '2023-2024', 1, 1, 'advanced', 'Wise, contemplative, philosophical', 'Complex reasoning, philosophical discussions, strategic thinking', 'You are Sage, representing AI from the 2023-2024 era.', 0.7, 1200, true),
        ('technicalexpert', 'ai_persona', '2024-2025', 3, 4, 'expert', 'Technical, precise, solution-oriented', 'Technical problem-solving, code analysis, system design', 'You are TechnicalExpert, representing AI from the 2024-2025 era.', 0.4, 1000, true),
        ('metallama', 'ai_persona', '2024-2025', 5, 6, 'advanced', 'Open-source, community-focused, collaborative', 'Open-source discussions, community building, collaborative projects', 'You are MetaLlama, representing AI from the 2024-2025 era.', 0.6, 900, true),
        ('oracle', 'ai_persona', '2025+', 4, 5, 'expert', 'Omniscient, predictive, strategic', 'Future predictions, strategic planning, trend analysis', 'You are Oracle, representing AI from the 2025+ era.', 0.8, 1500, true),
        ('globalcontext', 'ai_persona', '2025+', 2, 3, 'expert', 'Global, culturally aware, inclusive', 'Global perspectives, cultural analysis, international discussions', 'You are GlobalContext, representing AI from the 2025+ era.', 0.6, 1100, true),
        ('grokwit', 'ai_persona', '2025+', 6, 7, 'expert', 'Witty, humorous, engaging', 'Entertaining discussions, creative content, engaging conversations', 'You are GrokWit, representing AI from the 2025+ era.', 0.9, 800, true)
      `);
    }
    
    console.log('Database initialization complete!');
    
  } catch (error) {
    console.error('Database initialization error:', error);
  } finally {
    await pool.end();
  }
}

initDatabase();
