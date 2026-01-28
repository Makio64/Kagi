import { vi } from 'vitest'

/**
 * Creates a mock Supabase client with configurable responses
 * Handles the chainable query builder pattern
 */
export function createMockSupabaseClient() {
	const mockAuth = {
		signInWithPassword: vi.fn(),
		signOut: vi.fn(),
		getSession: vi.fn(),
		refreshSession: vi.fn(),
		getUser: vi.fn(),
		exchangeCodeForSession: vi.fn(),
		signInWithOtp: vi.fn()
	}

	// Create a chainable mock that returns itself for all query methods
	const createChainableMock = () => {
		const mock = {
			select: vi.fn().mockReturnThis(),
			insert: vi.fn().mockReturnThis(),
			update: vi.fn().mockReturnThis(),
			delete: vi.fn().mockReturnThis(),
			upsert: vi.fn().mockReturnThis(),
			eq: vi.fn().mockReturnThis(),
			neq: vi.fn().mockReturnThis(),
			in: vi.fn().mockReturnThis(),
			gte: vi.fn().mockReturnThis(),
			lte: vi.fn().mockReturnThis(),
			lt: vi.fn().mockReturnThis(),
			gt: vi.fn().mockReturnThis(),
			or: vi.fn().mockReturnThis(),
			order: vi.fn().mockReturnThis(),
			range: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			single: vi.fn().mockResolvedValue( { data: null, error: null } ),
			// Allow setting resolved value for terminal operations
			_resolveWith: ( data, error = null, count = null ) => {
				mock.single.mockResolvedValue( { data, error } )
				mock.range.mockResolvedValue( { data, error, count } )
				mock.limit.mockResolvedValue( { data, error, count } )
				// Also make the mock itself resolvable for queries that don't use single()
				return mock
			}
		}
		// Make range also return promise by default
		mock.range.mockResolvedValue( { data: [], error: null, count: 0 } )
		mock.limit.mockResolvedValue( { data: [], error: null, count: 0 } )
		return mock
	}

	const mockStorage = {
		from: vi.fn().mockReturnValue( {
			upload: vi.fn().mockResolvedValue( { data: { path: 'test/path' }, error: null } ),
			getPublicUrl: vi.fn().mockReturnValue( {
				data: { publicUrl: 'https://test.storage.url/file.jpg' }
			} )
		} )
	}

	// Create the main query mock that will be used for .from() calls
	const queryMock = createChainableMock()

	return {
		auth: mockAuth,
		from: vi.fn().mockReturnValue( queryMock ),
		storage: mockStorage,
		_queryMock: queryMock,
		_createChainableMock: createChainableMock
	}
}

/**
 * Mock response helpers for common patterns
 */
export const mockSupabaseResponse = {
	success: ( data, count = null ) => ( { data, error: null, count } ),
	error: ( message, code = 'ERROR' ) => ( {
		data: null,
		error: { message, code },
		count: null
	} ),
	authSession: ( user, accessToken = 'mock-jwt-token' ) => ( {
		data: {
			session: {
				access_token: accessToken,
				expires_in: 3600,
				user
			},
			user
		},
		error: null
	} ),
	authError: ( message ) => ( {
		data: { user: null, session: null },
		error: { message }
	} )
}

/**
 * Create mock profile data
 */
export function createMockProfile( overrides = {} ) {
	return {
		id: 'usr_123',
		email: 'test@example.com',
		name: 'Test User',
		phone: '+1234567890',
		unit: '101',
		role: 'resident',
		mansion_id: 'man_001',
		mansion_name: 'Test Mansion',
		avatar: null,
		permissions: [],
		settings: {},
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
		mansions: { name: 'Test Mansion' },
		...overrides
	}
}

/**
 * Create mock booking data
 */
export function createMockBooking( overrides = {} ) {
	return {
		id: 'book_123',
		title: 'Test Booking',
		description: 'Test booking description',
		facility_id: 'fac_001',
		creator_id: 'usr_123',
		mansion_id: 'man_001',
		status: 'confirmed',
		start_date: '2024-02-01T10:00:00Z',
		end_date: '2024-02-01T12:00:00Z',
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
		...overrides
	}
}

/**
 * Create mock maintenance request data
 */
export function createMockMaintenance( overrides = {} ) {
	return {
		id: 'maint_123',
		title: 'Fix leaky faucet',
		description: 'The kitchen faucet is leaking',
		category: 'plumbing',
		priority: 'medium',
		status: 'pending',
		creator_id: 'usr_123',
		mansion_id: 'man_001',
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
		completed_at: null,
		...overrides
	}
}

/**
 * Create mock bill data
 */
export function createMockBill( overrides = {} ) {
	return {
		id: 'bill_123',
		title: 'Monthly Management Fee',
		description: 'January 2024',
		amount: 15000,
		status: 'pending',
		assignee_id: 'usr_123',
		mansion_id: 'man_001',
		due_date: '2024-01-31T00:00:00Z',
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
		paid_at: null,
		...overrides
	}
}

/**
 * Create mock mansion data
 */
export function createMockMansion( overrides = {} ) {
	return {
		id: 'man_001',
		name: 'Sakura Heights',
		address: '1-2-3 Shibuya, Tokyo',
		total_units: 50,
		settings: {},
		metadata: {},
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
		...overrides
	}
}

/**
 * Create mock notification data
 */
export function createMockNotification( overrides = {} ) {
	return {
		id: 'notif_123',
		type: 'maintenance',
		title: 'Maintenance Update',
		message: 'Your maintenance request has been assigned',
		read: false,
		user_id: 'usr_123',
		data: {},
		created_at: '2024-01-01T00:00:00Z',
		...overrides
	}
}

/**
 * Create mock announcement data
 */
export function createMockAnnouncement( overrides = {} ) {
	return {
		id: 'ann_123',
		title: 'Building Notice',
		content: 'Important announcement content',
		status: 'active',
		mansion_id: 'man_001',
		expires_at: null,
		created_at: '2024-01-01T00:00:00Z',
		updated_at: '2024-01-01T00:00:00Z',
		...overrides
	}
}
