import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigrations() {
  try {
    console.log('📦 Connecting to Supabase...');
    
    // Test connection
    const { data, error } = await supabase.from('auth.users').select('count()');
    if (error && !error.message.includes('auth.users')) {
      throw error;
    }
    console.log('✅ Connected to Supabase');

    // Read and apply the complete schema migration
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20260525000000_complete_schema.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    console.log('📝 Applying migrations...');
    const { error: migrationError } = await supabase.rpc('exec', { sql: migrationSQL });
    
    if (migrationError) {
      console.error('Migration error:', migrationError);
    } else {
      console.log('✅ Migrations applied successfully!');
    }

    // Verify tables were created
    const tables = [
      'profiles',
      'chamas',
      'memberships',
      'savings_records',
      'loans',
      'meetings',
      'invites'
    ];

    console.log('\n🔍 Verifying database schema...');
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('count()');
      if (!error) {
        console.log(`✅ Table "${table}" exists`);
      } else if (error.code === '42P01') {
        console.log(`❌ Table "${table}" does NOT exist`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

applyMigrations();
