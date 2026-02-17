import { afterEach, beforeEach, vi } from 'vitest'

// Mock window.location for magic link tests
Object.defineProperty( window, 'location', {
	value: { origin: 'https://test.kagi.com' },
	writable: true
} )

// Mock import.meta.env for Supabase configuration
vi.stubGlobal( 'import', {
	meta: {
		env: {
			VITE_SUPABASE_URL: 'https://test.supabase.co',
			VITE_SUPABASE_ANON_KEY: 'test-anon-key'
		}
	}
} )

beforeEach( () => {
	vi.clearAllMocks()
} )

afterEach( () => {
	vi.resetModules()
} )
