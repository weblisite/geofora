/**
 * Supabase Setup Script
 * 
 * This script orchestrates the setup process for Supabase integration:
 * 1. Checks Supabase connectivity and function availability
 * 2. Creates the exec_sql function if it doesn't exist
 * 3. Executes the schema creation SQL
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import readline from 'readline';

/**
 * Mask a string for output (show only first and last few characters)
 */
function maskString(str) {
  if (!str) return '<empty>';
  
  if (str.length <= 8) {
    return '********';
  }
  
  return `${str.substring(0, 3)}...${str.substring(str.length - 3)}`;
}

/**
 * Get Supabase credentials from environment variables
 */
function getSupabaseCredentials() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_KEY;
  
  if (!url || !key) {
    console.error('❌ Error: Missing SUPABASE_URL or SUPABASE_KEY environment variables');
    console.error('Please set these variables and try again.');
    process.exit(1);
  }
  
  return { url, key };
}

/**
 * Create a Supabase client for the setup process
 */
function createSupabaseClient() {
  const { url, key } = getSupabaseCredentials();
  
  console.log(`Supabase URL: ${maskString(url)}`);
  console.log(`Supabase Key: ${maskString(key)}`);
  
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  });
}

/**
 * Check if the exec_sql function exists in Supabase
 */
async function checkExecSqlFunction() {
  console.log('Checking for exec_sql function...');
  
  const supabase = createSupabaseClient();
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      query_text: 'SELECT 1 as test'
    });
    
    if (error) {
      if (error.message.includes('function exec_sql') && 
          error.message.includes('does not exist')) {
        console.log('ℹ️ The exec_sql function does not exist yet.');
        return false;
      } else {
        console.log(`❌ Error testing exec_sql function: ${error.message}`);
        return false;
      }
    }
    
    console.log('✅ exec_sql function already exists!');
    return true;
  } catch (error) {
    console.log(`❌ Error checking exec_sql function: ${error.message}`);
    return false;
  }
}

/**
 * Create the exec_sql function in Supabase
 */
async function createExecSqlFunction() {
  console.log('Creating exec_sql function...');
  
  try {
    const sqlContent = fs.readFileSync('./create-exec-sql-function.sql', 'utf8');
    
    const supabase = createSupabaseClient();
    
    // Execute SQL queries for each statement
    const queries = sqlContent.split(';').filter(q => q.trim());
    
    for (const query of queries) {
      if (!query.trim()) continue;
      
      const { data, error } = await supabase.from('_disable_rls_for_sql').select('*');
      
      // Here we expect an error with permission denied - it's normal
      // Supabase doesn't allow executing arbitrary SQL but executing RPC
      // functions is allowed
      
      // For the create function SQL, we'll need to use Supabase's dashboard SQL editor
      console.log('To create the exec_sql function:');
      console.log('1. Log into your Supabase dashboard');
      console.log('2. Navigate to the SQL Editor');
      console.log('3. Create a new query');
      console.log('4. Paste the following SQL:');
      console.log('----------------------');
      console.log(sqlContent);
      console.log('----------------------');
      console.log('5. Run the query');
      
      await confirm('Have you executed the SQL in the Supabase dashboard? (y/n)');
      
      // Verify the function was created
      const exists = await checkExecSqlFunction();
      if (exists) {
        console.log('✅ exec_sql function created successfully!');
        return true;
      } else {
        console.log('❌ exec_sql function was not created.');
        return false;
      }
    }
  } catch (error) {
    console.error(`❌ Error creating exec_sql function: ${error.message}`);
    return false;
  }
}

/**
 * Execute the schema creation SQL
 */
async function executeSchema() {
  console.log('Executing schema creation SQL...');
  
  try {
    const sqlContent = fs.readFileSync('./supabase-schema.sql', 'utf8');
    
    // Split the SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    console.log(`Found ${statements.length} SQL statements to execute.`);
    
    const supabase = createSupabaseClient();
    
    let successCount = 0;
    let failureCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { data, error } = await supabase.rpc('exec_sql', {
          query_text: stmt
        });
        
        if (error) {
          console.error(`❌ Error executing statement ${i + 1}: ${error.message}`);
          failureCount++;
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully.`);
          successCount++;
        }
      } catch (error) {
        console.error(`❌ Error executing statement ${i + 1}: ${error.message}`);
        failureCount++;
      }
    }
    
    console.log(`Schema creation completed with ${successCount} successful statements and ${failureCount} failures.`);
    return failureCount === 0;
  } catch (error) {
    console.error(`❌ Error executing schema: ${error.message}`);
    return false;
  }
}

/**
 * Check if required tables exist
 */
async function checkTables() {
  console.log('Checking for required tables...');
  
  const supabase = createSupabaseClient();
  
  // Sample table check - adjust based on your schema
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      query_text: `
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = 'users'
        ) as exists
      `
    });
    
    if (error) {
      console.error(`❌ Error checking tables: ${error.message}`);
      return false;
    }
    
    const exists = data && data[0] && data[0].exists;
    
    if (exists) {
      console.log('✅ Required tables exist in the database.');
      return true;
    } else {
      console.log('❌ Required tables do not exist in the database.');
      return false;
    }
  } catch (error) {
    console.error(`❌ Error checking tables: ${error.message}`);
    return false;
  }
}

/**
 * Prompt user for confirmation
 */
async function confirm(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(`${question} `, answer => {
      rl.close();
      resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
    });
  });
}

/**
 * Main setup function
 */
async function setupSupabase() {
  console.log('🚀 Starting Supabase setup...');
  console.log('==============================');
  
  // Step 1: Check connection
  console.log('\n📋 Step 1: Checking Supabase connection');
  const supabase = createSupabaseClient();
  
  try {
    const { data, error } = await supabase.from('_prisma_migrations').select('*').limit(1);
    
    // Tables might not exist yet, so certain errors are expected
    if (error && error.code !== 'PGRST116') {
      console.log('❌ Connection test failed:');
      console.log(`Error: ${error.message} (${error.code})`);
      
      if (!await confirm('Connection failed. Continue anyway? (y/n)')) {
        process.exit(1);
      }
    } else {
      console.log('✅ Successfully connected to Supabase!');
    }
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:');
    console.error(error.message);
    
    if (!await confirm('Connection failed. Continue anyway? (y/n)')) {
      process.exit(1);
    }
  }
  
  // Step 2: Check and create exec_sql function if needed
  console.log('\n📋 Step 2: Setting up exec_sql function');
  const execSqlExists = await checkExecSqlFunction();
  
  if (!execSqlExists) {
    const funcCreated = await createExecSqlFunction();
    if (!funcCreated) {
      console.error('❌ Failed to create exec_sql function.');
      if (!await confirm('Continue anyway? (y/n)')) {
        process.exit(1);
      }
    }
  }
  
  // Step 3: Execute schema creation
  console.log('\n📋 Step 3: Creating database schema');
  
  // Check if supabase-schema.sql exists
  if (!fs.existsSync('./supabase-schema.sql')) {
    console.error('❌ Schema file (supabase-schema.sql) not found.');
    console.error('Please create the schema file before running this script.');
    process.exit(1);
  }
  
  if (await confirm('This will execute SQL statements that may modify the database. Continue? (y/n)')) {
    const schemaCreated = await executeSchema();
    if (!schemaCreated) {
      console.error('❌ Failed to create schema.');
      if (!await confirm('Continue anyway? (y/n)')) {
        process.exit(1);
      }
    }
  } else {
    console.log('Skipping schema creation.');
  }
  
  // Step 4: Verify setup
  console.log('\n📋 Step 4: Verifying setup');
  const tablesExist = await checkTables();
  
  if (!tablesExist) {
    console.error('❌ Setup verification failed.');
    console.error('Some required tables do not exist in the database.');
    
    if (!await confirm('Continue anyway? (y/n)')) {
      process.exit(1);
    }
  }
  
  // Success
  console.log('\n🎉 Supabase setup completed!');
  console.log('You can now use Supabase for your application.');
}

// Run the setup
setupSupabase().catch(err => {
  console.error('Unexpected error during setup:', err);
  process.exit(1);
});