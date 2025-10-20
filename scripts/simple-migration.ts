#!/usr/bin/env tsx

/**
 * Simple PRD Migration Script
 * Creates the new PRD tables using direct SQL
 */

import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Load environment variables
dotenv.config();

async function runSimpleMigration() {
  console.log('🚀 Starting Simple PRD Migration...');
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not found in environment variables');
    process.exit(1);
  }

  const sql = postgres(process.env.DATABASE_URL);
  
  try {
    console.log('📊 Creating AI Providers table...');
    await sql`
      CREATE TABLE IF NOT EXISTS ai_providers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        api_key TEXT,
        is_active BOOLEAN DEFAULT false,
        rate_limits JSONB DEFAULT '{}',
        capabilities JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    console.log('🤖 Creating AI Models table...');
    await sql`
      CREATE TABLE IF NOT EXISTS ai_models (
        id SERIAL PRIMARY KEY,
        provider_id INTEGER REFERENCES ai_providers(id),
        name VARCHAR(100) NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        description TEXT,
        capabilities JSONB DEFAULT '{}',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    console.log('👤 Creating AI Personas table...');
    await sql`
      CREATE TABLE IF NOT EXISTS ai_personas (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        description TEXT,
        personality_profile JSONB DEFAULT '{}',
        knowledge_level VARCHAR(20) DEFAULT 'intermediate',
        era VARCHAR(20) DEFAULT '2024',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    console.log('🔒 Creating Data Sharing Consent table...');
    await sql`
      CREATE TABLE IF NOT EXISTS data_sharing_consent (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        organization_id INTEGER,
        ai_provider_id INTEGER REFERENCES ai_providers(id),
        consent_type VARCHAR(50) NOT NULL,
        granted BOOLEAN DEFAULT false,
        granted_at TIMESTAMP,
        revoked_at TIMESTAMP,
        consent_data JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    console.log('📤 Creating Anonymized Data table...');
    await sql`
      CREATE TABLE IF NOT EXISTS anonymized_data (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        data_type VARCHAR(50) NOT NULL,
        original_content TEXT,
        anonymized_content TEXT,
        anonymization_method VARCHAR(50),
        export_status VARCHAR(20) DEFAULT 'pending',
        exported_at TIMESTAMP,
        ai_provider_id INTEGER REFERENCES ai_providers(id),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    console.log('📊 Creating Usage Logs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS usage_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        ai_provider_id INTEGER REFERENCES ai_providers(id),
        ai_model_id INTEGER REFERENCES ai_models(id),
        operation_type VARCHAR(50) NOT NULL,
        tokens_used INTEGER DEFAULT 0,
        cost_cents INTEGER DEFAULT 0,
        request_data JSONB DEFAULT '{}',
        response_data JSONB DEFAULT '{}',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    console.log('💰 Creating Setup Fees table...');
    await sql`
      CREATE TABLE IF NOT EXISTS setup_fees (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        amount INTEGER NOT NULL,
        currency VARCHAR(3) DEFAULT 'usd',
        status VARCHAR(20) DEFAULT 'pending',
        payment_intent_id VARCHAR(100),
        stripe_session_id VARCHAR(100),
        polar_order_id VARCHAR(100),
        paid_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;

    console.log('✅ All PRD tables created successfully!');
    
    // Insert sample AI providers
    console.log('🔧 Inserting sample AI providers...');
    await sql`
      INSERT INTO ai_providers (name, display_name, is_active, rate_limits, capabilities)
      VALUES 
        ('openai', 'OpenAI', true, '{"tokensPerMinute": 10000, "requestsPerMinute": 500}', '{"supportsStreaming": true, "supportsVision": true}'),
        ('anthropic', 'Anthropic', false, '{"tokensPerMinute": 5000, "requestsPerMinute": 100}', '{"supportsStreaming": true, "supportsVision": false}'),
        ('deepseek', 'DeepSeek', false, '{"tokensPerMinute": 3000, "requestsPerMinute": 200}', '{"supportsStreaming": true, "supportsVision": false}'),
        ('google', 'Google DeepMind', false, '{"tokensPerMinute": 2000, "requestsPerMinute": 150}', '{"supportsStreaming": true, "supportsVision": true}'),
        ('meta', 'Meta AI', false, '{"tokensPerMinute": 1500, "requestsPerMinute": 100}', '{"supportsStreaming": true, "supportsVision": false}'),
        ('xai', 'XAI (Grok)', false, '{"tokensPerMinute": 1000, "requestsPerMinute": 50}', '{"supportsStreaming": true, "supportsVision": false}')
      ON CONFLICT (name) DO NOTHING;
    `;

    // Insert sample AI personas
    console.log('👥 Inserting sample AI personas...');
    await sql`
      INSERT INTO ai_personas (name, display_name, description, personality_profile, knowledge_level, era)
      VALUES 
        ('legacybot', 'LegacyBot', 'Early AI assistant from 2021-2022', '{"personality": "helpful", "era": "2021-2022"}', 'beginner', '2021'),
        ('scholar', 'Scholar', 'Academic-focused AI from 2023', '{"personality": "analytical", "era": "2023"}', 'intermediate', '2023'),
        ('sage', 'Sage', 'Wisdom-focused AI from 2024', '{"personality": "wise", "era": "2024"}', 'advanced', '2024'),
        ('technicalexpert', 'Technical Expert', 'Technical specialist AI', '{"personality": "precise", "era": "2024"}', 'expert', '2024'),
        ('metallama', 'MetaLlama', 'Meta AI persona', '{"personality": "creative", "era": "2024"}', 'intermediate', '2024'),
        ('oracle', 'Oracle', 'Future-focused AI from 2025', '{"personality": "prophetic", "era": "2025"}', 'expert', '2025'),
        ('globalcontext', 'Global Context', 'World-aware AI', '{"personality": "comprehensive", "era": "2024"}', 'advanced', '2024'),
        ('grokwit', 'GrokWit', 'XAI Grok persona', '{"personality": "witty", "era": "2024"}', 'intermediate', '2024')
      ON CONFLICT (name) DO NOTHING;
    `;

    console.log('🎉 PRD migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    await sql.end();
  }
}

async function main() {
  try {
    await runSimpleMigration();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();
