/**
 * Supabase Test Clients
 * Creates both anon and admin clients for integration testing
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_KEY

// Client for tests (uses anon key, respects RLS)
export const testClient = createClient( supabaseUrl, supabaseAnonKey )

// Admin client for test setup/cleanup (bypasses RLS)
// Only available if service key is configured
export const adminClient = supabaseServiceKey
	? createClient( supabaseUrl, supabaseServiceKey, {
		auth: {
			autoRefreshToken: false,
			persistSession: false
		}
	} )
	: null

// Check if integration tests can run
export function canRunIntegrationTests() {
	return supabaseUrl?.includes( 'test' ) && supabaseServiceKey
}
