/**
 * Supabase Connection Tests
 * Verifies that the Supabase backend is properly configured and connected
 */

const SUPABASE_URL = 'https://mtonlvwabbnupsjqzpwo.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_rekpDEYKm1QHmA5WCMvmAA_mrDGH51E';

describe('Supabase Connection Tests', () => {
  let supabaseClient;

  beforeAll(() => {
    const { createClient } = require('@supabase/supabase-js');
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  });

  test('Supabase client is initialized', () => {
    expect(supabaseClient).toBeDefined();
  });

  test('Supabase URL is valid', () => {
    expect(SUPABASE_URL).toContain('supabase.co');
  });

  test('Supabase anon key is provided', () => {
    expect(SUPABASE_ANON_KEY).toBeTruthy();
    expect(SUPABASE_ANON_KEY.length).toBeGreaterThan(0);
  });

  test('Can query Supabase - test auth tables', async () => {
    try {
      const { data, error } = await supabaseClient
        .from('profiles')
        .select('*')
        .limit(1);

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    } catch (err) {
      expect(err).toBeNull();
    }
  });

  test('Supabase auth endpoint is accessible', async () => {
    try {
      const { data, error } = await supabaseClient.auth.getSession();
      expect(error || data).toBeDefined();
    } catch (err) {
      throw new Error(`Auth endpoint not accessible: ${err.message}`);
    }
  });

  test('Environment variables are properly set', () => {
    expect(process.env.NEXT_PUBLIC_SUPABASE_URL).toBe(SUPABASE_URL);
    expect(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY).toBe(SUPABASE_ANON_KEY);
  });
});
