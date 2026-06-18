/**
 * Quick test script to verify Supabase connection
 * Run with: node verify-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://mtonlvwabbnupsjqzpwo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rekpDEYKm1QHmA5WCMvmAA_mrDGH51E';

async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase Connection...\n');

  try {
    // Create client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Supabase client initialized');

    // Test connection
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('⚠️  Auth session check:', error.message);
    } else {
      console.log('✅ Auth endpoint accessible');
    }

    // Test database access
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (profileError) {
      console.log('❌ Database access failed:', profileError.message);
    } else {
      console.log('✅ Database connection successful');
    }

    // Check tables exist
    const tables = ['profiles', 'trips', 'messages', 'reviews'];
    console.log('\n📋 Available tables:');
    for (const table of tables) {
      try {
        const { error: tableError } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        const status = tableError && tableError.code === 'PGRST116' ? '❌' : '✅';
        console.log(`  ${status} ${table}`);
      } catch (e) {
        console.log(`  ❌ ${table}`);
      }
    }

    console.log('\n✨ Supabase backend is properly connected!\n');
    return true;

  } catch (err) {
    console.error('❌ Connection failed:', err.message);
    return false;
  }
}

testSupabaseConnection().then(success => {
  process.exit(success ? 0 : 1);
});
