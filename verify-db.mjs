import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://amvfhtjenuktbhozvyeka.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFtdmZodGplbnVrdGJoenZ5ZWthIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTYzODUzMywiZXhwIjoyMDk1MjE0NTMzfQ.-BfMo8JKVRw_QIcHfd71vYxbEJvv9p2LbdqYSRBOauY";

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyDatabase() {
  try {
    console.log('🔌 Connecting to Supabase...\n');
    
    // Check if we can query the users table (built-in)
    const { data: authUsers, error: authError } = await supabase
      .from('auth.users')
      .select('count', { count: 'exact' });
    
    if (authError) {
      console.log('⚠️  Auth users table check: ' + authError.message);
    } else {
      console.log('✅ Connected to Supabase successfully');
      console.log(`   Auth users count: ${authUsers?.length || 0}`);
    }

    // Check for custom tables
    const tables = [
      'profiles',
      'chamas',
      'memberships',
      'savings_records',
      'loans',
      'meetings',
      'invites',
      'transparency_logs'
    ];

    console.log('\n📊 Checking database schema:\n');
    
    let allTablesExist = true;
    
    for (const table of tables) {
      try {
        const { data, error, count } = await supabase
          .from(table)
          .select('id', { count: 'exact' })
          .limit(1);
        
        if (!error) {
          console.log(`✅ ${table}: EXISTS (${count || 0} rows)`);
        } else if (error.code === '42P01' || error.message.includes('does not exist')) {
          console.log(`❌ ${table}: MISSING`);
          allTablesExist = false;
        } else {
          console.log(`⚠️  ${table}: Error - ${error.message}`);
          allTablesExist = false;
        }
      } catch (e) {
        console.log(`❌ ${table}: Error checking table`);
        allTablesExist = false;
      }
    }

    console.log('\n' + '='.repeat(50));
    if (allTablesExist) {
      console.log('✅ Database is fully set up and ready!');
    } else {
      console.log('❌ Database schema is incomplete. Run migrations via Supabase dashboard.');
      console.log('\nTo fix:');
      console.log('1. Go to Supabase dashboard: https://app.supabase.com');
      console.log('2. Select project: amvfhtjenuktbhozvyeka');
      console.log('3. Go to SQL Editor');
      console.log('4. Run: supabase/migrations/20260525000000_complete_schema.sql');
    }

  } catch (error) {
    console.error('❌ Connection error:', error.message);
    process.exit(1);
  }
}

verifyDatabase();
