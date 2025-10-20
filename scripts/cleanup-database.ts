/**
 * Database Cleanup Migration Script
 * Removes legacy aiAgents table and migrates data to aiPersonas system
 */

import { db } from '../server/db';
import { aiAgents, aiPersonas, aiProviders, aiModels } from '../shared/schema';
import { eq, sql } from 'drizzle-orm';

export async function cleanupDatabaseSchema() {
  console.log('🧹 Starting database cleanup migration...');

  try {
    // Step 1: Check if aiAgents table has any data
    const existingAgents = await db.select().from(aiAgents);
    console.log(`📊 Found ${existingAgents.length} existing AI agents`);

    // Step 2: Migrate data from aiAgents to aiPersonas if needed
    if (existingAgents.length > 0) {
      console.log('🔄 Migrating AI agents to personas...');
      
      // Get default AI provider and model
      const defaultProvider = await db.select().from(aiProviders).limit(1);
      const defaultModel = await db.select().from(aiModels).limit(1);
      
      if (defaultProvider.length === 0 || defaultModel.length === 0) {
        console.log('⚠️ No default AI provider or model found, skipping migration');
      } else {
        // Migrate each agent to a persona
        for (const agent of existingAgents) {
          const personaData = {
            name: agent.name.toLowerCase().replace(/\s+/g, '_'),
            era: '2024', // Default era
            providerId: defaultProvider[0].id,
            modelId: defaultModel[0].id,
            knowledgeLevel: mapAgentTypeToKnowledgeLevel(agent.type),
            personality: agent.personality || 'helpful and knowledgeable',
            useCase: agent.expertise || 'general assistance',
            systemPrompt: generateSystemPrompt(agent),
            temperature: 0.7,
            maxTokens: agent.responseLength ? agent.responseLength * 200 : 1000,
            isActive: agent.active,
            createdAt: agent.createdAt || new Date(),
          };

          await db.insert(aiPersonas).values(personaData);
          console.log(`✅ Migrated agent: ${agent.name}`);
        }
      }
    }

    // Step 3: Drop the legacy aiAgents table
    console.log('🗑️ Dropping legacy aiAgents table...');
    await db.execute(sql`DROP TABLE IF EXISTS ai_agents CASCADE`);
    console.log('✅ Legacy aiAgents table dropped');

    // Step 4: Clean up any orphaned references
    console.log('🧽 Cleaning up orphaned references...');
    
    // Update any questions that reference aiAgents
    await db.execute(sql`
      UPDATE questions 
      SET ai_agent_type = NULL 
      WHERE ai_agent_type IS NOT NULL
    `);
    
    // Update any answers that reference aiAgents
    await db.execute(sql`
      UPDATE answers 
      SET ai_agent_type = NULL 
      WHERE ai_agent_type IS NOT NULL
    `);

    console.log('✅ Orphaned references cleaned up');

    // Step 5: Verify cleanup
    console.log('🔍 Verifying cleanup...');
    
    // Check if aiAgents table still exists
    const tableExists = await db.execute(sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'ai_agents'
      )
    `);
    
    if (tableExists.rows[0]?.exists) {
      console.log('❌ aiAgents table still exists');
    } else {
      console.log('✅ aiAgents table successfully removed');
    }

    console.log('🎉 Database cleanup migration completed successfully!');

  } catch (error) {
    console.error('❌ Database cleanup migration failed:', error);
    throw error;
  }
}

function mapAgentTypeToKnowledgeLevel(agentType: string): string {
  const typeMap: Record<string, string> = {
    'beginner': 'basic',
    'intermediate': 'intermediate', 
    'expert': 'advanced',
    'smart': 'advanced',
    'genius': 'expert',
    'intelligent': 'expert',
    'moderator': 'intermediate',
  };
  
  return typeMap[agentType] || 'intermediate';
}

function generateSystemPrompt(agent: any): string {
  const basePrompt = `You are ${agent.name}, a ${agent.type} AI assistant.`;
  
  if (agent.personality) {
    return `${basePrompt} Your personality: ${agent.personality}.`;
  }
  
  if (agent.expertise) {
    return `${basePrompt} You specialize in: ${agent.expertise}.`;
  }
  
  return `${basePrompt} You are helpful, knowledgeable, and provide accurate information.`;
}

// Run the migration if this script is executed directly
if (require.main === module) {
  cleanupDatabaseSchema()
    .then(() => {
      console.log('✅ Migration completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}
