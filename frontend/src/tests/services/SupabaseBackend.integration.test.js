/**
 * SupabaseBackend Integration Tests
 *
 * These tests run against a REAL Supabase test project to verify:
 * - Auth flows work with actual Supabase
 * - CRUD operations hit the database
 * - RLS policies work as expected
 * - Complex queries execute correctly
 *
 * Prerequisites:
 * - Create a test Supabase project with same schema
 * - Configure .env.test with test project credentials
 *
 * Run: pnpm test:integration
 */
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest'

import { SupabaseBackend } from '../../services/SupabaseBackend'
import { adminClient, canRunIntegrationTests, testClient } from '../helpers/supabaseTestClient'
import {
	cleanupTestData,
	createTestFacility,
	createTestMansion,
	createTestUser,
	deleteTestUser,
	seedTestScenario
} from '../helpers/testDataCleanup'

// Skip entire suite if integration tests cannot run
const SKIP_INTEGRATION = !canRunIntegrationTests()

describe.skipIf( SKIP_INTEGRATION )( 'SupabaseBackend Integration Tests', () => {
	let backend
	let testData

	// ==========================================
	// SETUP & TEARDOWN
	// ==========================================

	beforeAll( async () => {
		// Clean slate before tests
		await cleanupTestData()

		// Seed initial test data
		testData = await seedTestScenario()
	}, 30000 ) // 30s timeout for setup

	afterAll( async () => {
		// Clean up after all tests
		await cleanupTestData()
	}, 30000 )

	beforeEach( () => {
		// Fresh backend instance for each test
		backend = new SupabaseBackend()
		backend.supabase = testClient
	} )

	afterEach( async () => {
		// Sign out after each test to ensure clean auth state
		try {
			await testClient.auth.signOut()
		} catch {
			// Ignore sign out errors
		}
	} )

	// ==========================================
	// AUTHENTICATION TESTS
	// ==========================================

	describe( 'Authentication', () => {
		it( 'should sign in with valid credentials', async () => {
			const auth = await backend.auth()
			const result = await auth.login( 'resident@test.com', 'test-password-123' )

			expect( result.success ).toBe( true )
			expect( result.data.user ).toBeDefined()
			expect( result.data.user.email ).toBe( 'resident@test.com' )
			expect( result.data.token ).toBeDefined()
		} )

		it( 'should fail sign in with invalid password', async () => {
			const auth = await backend.auth()

			await expect(
				auth.login( 'resident@test.com', 'wrong-password' )
			).rejects.toMatchObject( {
				success: false,
				error: { code: 401 }
			} )
		} )

		it( 'should fail sign in with non-existent user', async () => {
			const auth = await backend.auth()

			await expect(
				auth.login( 'nonexistent@test.com', 'any-password' )
			).rejects.toMatchObject( {
				success: false,
				error: { code: 401 }
			} )
		} )

		it( 'should get current session after login', async () => {
			const auth = await backend.auth()
			await auth.login( 'resident@test.com', 'test-password-123' )

			const session = await auth.session()

			expect( session.success ).toBe( true )
			expect( session.data.user.email ).toBe( 'resident@test.com' )
			expect( session.data.token ).toBeDefined()
		} )

		it( 'should fail to get session when not logged in', async () => {
			const auth = await backend.auth()

			await expect( auth.session() ).rejects.toMatchObject( {
				success: false,
				error: { code: 401 }
			} )
		} )

		it( 'should sign out successfully', async () => {
			const auth = await backend.auth()
			await auth.login( 'resident@test.com', 'test-password-123' )

			const result = await auth.logout()

			expect( result.success ).toBe( true )

			// Verify session is gone
			await expect( auth.session() ).rejects.toMatchObject( {
				success: false,
				error: { code: 401 }
			} )
		} )

		it( 'should get current user with profile data', async () => {
			const auth = await backend.auth()
			await auth.login( 'resident@test.com', 'test-password-123' )

			const result = await auth.getCurrentUser()

			expect( result.success ).toBe( true )
			expect( result.data.email ).toBe( 'resident@test.com' )
			expect( result.data.role ).toBe( 'resident' )
			expect( result.data.mansionId ).toBe( testData.mansion.id )
		} )

		it( 'should refresh session token', async () => {
			const auth = await backend.auth()
			const loginResult = await auth.login( 'resident@test.com', 'test-password-123' )
			const originalToken = loginResult.data.token

			const refreshResult = await auth.refresh()

			expect( refreshResult.success ).toBe( true )
			expect( refreshResult.data.token ).toBeDefined()
			// Note: Token might be same if refresh window hasn't passed
		} )
	} )

	// ==========================================
	// CRUD OPERATIONS TESTS
	// ==========================================

	describe( 'CRUD Operations', () => {
		beforeEach( async () => {
			// Login as resident for CRUD tests
			const auth = await backend.auth()
			await auth.login( 'resident@test.com', 'test-password-123' )
		} )

		describe( 'Bookings', () => {
			let createdBookingId

			it( 'should create a booking', async () => {
				const bookingData = {
					facilityId: testData.facility.id,
					mansionId: testData.mansion.id,
					title: 'Test Meeting',
					dates: {
						start: new Date( Date.now() + 86400000 ).toISOString(), // Tomorrow
						end: new Date( Date.now() + 90000000 ).toISOString()
					},
					status: 'pending'
				}

				const result = await backend.create( 'bookings', bookingData )

				expect( result.success ).toBe( true )
				expect( result.data.id ).toBeDefined()
				expect( result.data.title ).toBe( 'Test Meeting' )
				expect( result.data.facilityId ).toBe( testData.facility.id )

				createdBookingId = result.data.id
			} )

			it( 'should read a booking by ID', async () => {
				// First create a booking
				const createResult = await backend.create( 'bookings', {
					facilityId: testData.facility.id,
					mansionId: testData.mansion.id,
					title: 'Read Test Booking',
					dates: {
						start: new Date( Date.now() + 86400000 ).toISOString(),
						end: new Date( Date.now() + 90000000 ).toISOString()
					},
					status: 'pending'
				} )

				const result = await backend.get( 'bookings', createResult.data.id )

				expect( result.success ).toBe( true )
				expect( result.data.title ).toBe( 'Read Test Booking' )
			} )

			it( 'should update a booking', async () => {
				// Create then update
				const createResult = await backend.create( 'bookings', {
					facilityId: testData.facility.id,
					mansionId: testData.mansion.id,
					title: 'Original Title',
					dates: {
						start: new Date( Date.now() + 86400000 ).toISOString(),
						end: new Date( Date.now() + 90000000 ).toISOString()
					},
					status: 'pending'
				} )

				const result = await backend.update( 'bookings', createResult.data.id, {
					title: 'Updated Title',
					status: 'confirmed'
				} )

				expect( result.success ).toBe( true )
				expect( result.data.title ).toBe( 'Updated Title' )
				expect( result.data.status ).toBe( 'confirmed' )
			} )

			it( 'should delete a booking', async () => {
				// Create then delete
				const createResult = await backend.create( 'bookings', {
					facilityId: testData.facility.id,
					mansionId: testData.mansion.id,
					title: 'To Delete',
					dates: {
						start: new Date( Date.now() + 86400000 ).toISOString(),
						end: new Date( Date.now() + 90000000 ).toISOString()
					},
					status: 'pending'
				} )

				const result = await backend.delete( 'bookings', createResult.data.id )

				expect( result.success ).toBe( true )

				// Verify it's gone
				await expect(
					backend.get( 'bookings', createResult.data.id )
				).rejects.toMatchObject( {
					success: false,
					error: { code: 404 }
				} )
			} )
		} )

		describe( 'Maintenance Requests', () => {
			it( 'should create a maintenance request', async () => {
				const result = await backend.create( 'maintenance', {
					mansionId: testData.mansion.id,
					title: 'Leaky Faucet',
					description: 'Kitchen faucet is dripping',
					category: 'plumbing',
					priority: 'medium',
					status: 'pending'
				} )

				expect( result.success ).toBe( true )
				expect( result.data.title ).toBe( 'Leaky Faucet' )
				expect( result.data.category ).toBe( 'plumbing' )
				expect( result.data.priority ).toBe( 'medium' )
			} )

			it( 'should query maintenance requests with filters', async () => {
				// Create multiple requests
				await backend.create( 'maintenance', {
					mansionId: testData.mansion.id,
					title: 'Urgent Issue',
					description: 'Test',
					category: 'electrical',
					priority: 'urgent',
					status: 'pending'
				} )

				await backend.create( 'maintenance', {
					mansionId: testData.mansion.id,
					title: 'Low Priority',
					description: 'Test',
					category: 'general',
					priority: 'low',
					status: 'pending'
				} )

				// Query with filter
				const result = await backend.query( 'maintenance', {
					filter: { priority: 'urgent' }
				} )

				expect( result.success ).toBe( true )
				result.data.forEach( item => {
					expect( item.priority ).toBe( 'urgent' )
				} )
			} )
		} )
	} )

	// ==========================================
	// RLS (Row Level Security) TESTS
	// ==========================================

	describe( 'Row Level Security', () => {
		it( 'should only allow user to see their own bookings', async () => {
			// Login as resident and create a booking
			const auth = await backend.auth()
			await auth.login( 'resident@test.com', 'test-password-123' )

			await backend.create( 'bookings', {
				facilityId: testData.facility.id,
				mansionId: testData.mansion.id,
				title: 'Resident Booking',
				dates: {
					start: new Date( Date.now() + 86400000 ).toISOString(),
					end: new Date( Date.now() + 90000000 ).toISOString()
				},
				status: 'pending'
			} )

			// Query bookings - should only see own bookings
			const result = await backend.query( 'bookings' )

			expect( result.success ).toBe( true )
			// All bookings should belong to the logged-in user
			result.data.forEach( booking => {
				expect( booking.creatorId ).toBe( testData.resident.id )
			} )
		} )

		it( 'should allow mansion admin to see all bookings in their mansion', async () => {
			// Login as mansion admin
			const auth = await backend.auth()
			await auth.login( 'admin@test.com', 'test-password-123' )

			// Query bookings - admin should see mansion's bookings
			const result = await backend.query( 'bookings' )

			expect( result.success ).toBe( true )
			// Admin can see bookings from their mansion (including resident's bookings)
		} )

		it( 'should prevent user from updating another user bookings', async () => {
			// Create booking as admin
			const auth = await backend.auth()
			await auth.login( 'admin@test.com', 'test-password-123' )

			const adminBooking = await backend.create( 'bookings', {
				facilityId: testData.facility.id,
				mansionId: testData.mansion.id,
				title: 'Admin Booking',
				dates: {
					start: new Date( Date.now() + 172800000 ).toISOString(),
					end: new Date( Date.now() + 176400000 ).toISOString()
				},
				status: 'confirmed'
			} )

			// Logout and login as resident
			await auth.logout()
			await auth.login( 'resident@test.com', 'test-password-123' )

			// Try to update admin's booking - should fail due to RLS
			await expect(
				backend.update( 'bookings', adminBooking.data.id, { title: 'Hacked' } )
			).rejects.toMatchObject( {
				success: false
			} )
		} )
	} )

	// ==========================================
	// COMPLEX QUERIES TESTS
	// ==========================================

	describe( 'Complex Queries', () => {
		beforeAll( async () => {
			// Seed multiple bookings for query tests
			const auth = { login: testClient.auth.signInWithPassword.bind( testClient.auth ) }
			await testClient.auth.signInWithPassword( {
				email: 'resident@test.com',
				password: 'test-password-123'
			} )

			// Create bookings with different dates and statuses via admin
			const bookings = [
				{ status: 'confirmed', daysFromNow: 1 },
				{ status: 'confirmed', daysFromNow: 2 },
				{ status: 'pending', daysFromNow: 3 },
				{ status: 'pending', daysFromNow: 4 },
				{ status: 'cancelled', daysFromNow: 5 }
			]

			for ( const b of bookings ) {
				await adminClient.from( 'bookings' ).insert( {
					facility_id: testData.facility.id,
					mansion_id: testData.mansion.id,
					creator_id: testData.resident.id,
					title: `Query Test Booking ${b.status}`,
					start_date: new Date( Date.now() + b.daysFromNow * 86400000 ).toISOString(),
					end_date: new Date( Date.now() + b.daysFromNow * 86400000 + 3600000 ).toISOString(),
					status: b.status
				} )
			}
		} )

		beforeEach( async () => {
			const auth = await backend.auth()
			await auth.login( 'resident@test.com', 'test-password-123' )
		} )

		it( 'should filter by status', async () => {
			const result = await backend.query( 'bookings', {
				filter: { status: 'confirmed' }
			} )

			expect( result.success ).toBe( true )
			expect( result.data.length ).toBeGreaterThan( 0 )
			result.data.forEach( booking => {
				expect( booking.status ).toBe( 'confirmed' )
			} )
		} )

		it( 'should filter by multiple values (array)', async () => {
			const result = await backend.query( 'bookings', {
				filter: { status: ['confirmed', 'pending'] }
			} )

			expect( result.success ).toBe( true )
			result.data.forEach( booking => {
				expect( ['confirmed', 'pending'] ).toContain( booking.status )
			} )
		} )

		it( 'should sort by date ascending', async () => {
			const result = await backend.query( 'bookings', {
				sort: 'createdAt'
			} )

			expect( result.success ).toBe( true )
			expect( result.data.length ).toBeGreaterThan( 1 )

			// Verify ascending order
			for ( let i = 1; i < result.data.length; i++ ) {
				const prev = new Date( result.data[i - 1].dates.created )
				const curr = new Date( result.data[i].dates.created )
				expect( prev <= curr ).toBe( true )
			}
		} )

		it( 'should sort by date descending', async () => {
			const result = await backend.query( 'bookings', {
				sort: '-createdAt'
			} )

			expect( result.success ).toBe( true )
			expect( result.data.length ).toBeGreaterThan( 1 )

			// Verify descending order
			for ( let i = 1; i < result.data.length; i++ ) {
				const prev = new Date( result.data[i - 1].dates.created )
				const curr = new Date( result.data[i].dates.created )
				expect( prev >= curr ).toBe( true )
			}
		} )

		it( 'should paginate results', async () => {
			const page1 = await backend.query( 'bookings', {
				page: 1,
				limit: 2
			} )

			expect( page1.success ).toBe( true )
			expect( page1.data.length ).toBeLessThanOrEqual( 2 )
			expect( page1.meta.page ).toBe( 1 )
			expect( page1.meta.limit ).toBe( 2 )
			expect( page1.meta.total ).toBeGreaterThan( 0 )
			expect( page1.meta.totalPages ).toBeDefined()

			if ( page1.meta.totalPages > 1 ) {
				const page2 = await backend.query( 'bookings', {
					page: 2,
					limit: 2
				} )

				expect( page2.success ).toBe( true )
				expect( page2.meta.page ).toBe( 2 )

				// Ensure different data on different pages
				const page1Ids = page1.data.map( b => b.id )
				const page2Ids = page2.data.map( b => b.id )
				const overlap = page1Ids.filter( id => page2Ids.includes( id ) )
				expect( overlap.length ).toBe( 0 )
			}
		} )

		it( 'should search by title', async () => {
			const result = await backend.query( 'bookings', {
				search: 'Query Test'
			} )

			expect( result.success ).toBe( true )
			result.data.forEach( booking => {
				expect( booking.title.toLowerCase() ).toContain( 'query test' )
			} )
		} )

		it( 'should combine filter, sort, and pagination', async () => {
			const result = await backend.query( 'bookings', {
				filter: { status: 'confirmed' },
				sort: '-createdAt',
				page: 1,
				limit: 10
			} )

			expect( result.success ).toBe( true )

			// Verify filter applied
			result.data.forEach( booking => {
				expect( booking.status ).toBe( 'confirmed' )
			} )

			// Verify sorted
			for ( let i = 1; i < result.data.length; i++ ) {
				const prev = new Date( result.data[i - 1].dates.created )
				const curr = new Date( result.data[i].dates.created )
				expect( prev >= curr ).toBe( true )
			}

			// Verify pagination metadata
			expect( result.meta.page ).toBe( 1 )
			expect( result.meta.limit ).toBe( 10 )
		} )
	} )

	// ==========================================
	// CHAINABLE RESOURCE HELPERS TESTS
	// ==========================================

	describe( 'Chainable Resource Helpers', () => {
		beforeEach( async () => {
			const auth = await backend.auth()
			await auth.login( 'resident@test.com', 'test-password-123' )
		} )

		it( 'should use bookings() helper with chaining', async () => {
			const result = await backend.bookings()
				.where( 'status', 'confirmed' )
				.sort( '-createdAt' )
				.paginate( 1, 5 )
				.get()

			expect( result.success ).toBe( true )
			result.data.forEach( booking => {
				expect( booking.status ).toBe( 'confirmed' )
			} )
		} )

		it( 'should create via chainable helper', async () => {
			const result = await backend.bookings().create( {
				facilityId: testData.facility.id,
				mansionId: testData.mansion.id,
				title: 'Chainable Create Test',
				dates: {
					start: new Date( Date.now() + 259200000 ).toISOString(),
					end: new Date( Date.now() + 262800000 ).toISOString()
				},
				status: 'pending'
			} )

			expect( result.success ).toBe( true )
			expect( result.data.title ).toBe( 'Chainable Create Test' )
		} )

		it( 'should get by ID via chainable helper', async () => {
			// Create first
			const created = await backend.bookings().create( {
				facilityId: testData.facility.id,
				mansionId: testData.mansion.id,
				title: 'Get By ID Test',
				dates: {
					start: new Date( Date.now() + 345600000 ).toISOString(),
					end: new Date( Date.now() + 349200000 ).toISOString()
				},
				status: 'pending'
			} )

			const result = await backend.bookings().get( created.data.id )

			expect( result.success ).toBe( true )
			expect( result.data.id ).toBe( created.data.id )
			expect( result.data.title ).toBe( 'Get By ID Test' )
		} )

		it( 'should use maintenance() helper', async () => {
			await backend.maintenance().create( {
				mansionId: testData.mansion.id,
				title: 'Chainable Maintenance Test',
				description: 'Test description',
				category: 'general',
				priority: 'low',
				status: 'pending'
			} )

			const result = await backend.maintenance()
				.where( 'priority', 'low' )
				.get()

			expect( result.success ).toBe( true )
			const found = result.data.find( m => m.title === 'Chainable Maintenance Test' )
			expect( found ).toBeDefined()
		} )
	} )

	// ==========================================
	// ADMIN OPERATIONS TESTS
	// ==========================================

	describe( 'Admin Operations', () => {
		beforeEach( async () => {
			// Login as mansion admin
			const auth = await backend.auth()
			await auth.login( 'admin@test.com', 'test-password-123' )
		} )

		it( 'should get users for a mansion', async () => {
			const result = await backend.getUsers( { mansionId: testData.mansion.id } )

			expect( result.success ).toBe( true )
			expect( result.data.length ).toBeGreaterThan( 0 )

			// All users should be from this mansion
			result.data.forEach( user => {
				expect( user.mansionId ).toBe( testData.mansion.id )
			} )
		} )

		it( 'should get users filtered by role', async () => {
			const result = await backend.getUsers( {
				mansionId: testData.mansion.id,
				role: 'resident'
			} )

			expect( result.success ).toBe( true )
			result.data.forEach( user => {
				expect( user.role ).toBe( 'resident' )
			} )
		} )

		it( 'should search users by name or email', async () => {
			const result = await backend.getUsers( {
				mansionId: testData.mansion.id,
				search: 'resident'
			} )

			expect( result.success ).toBe( true )
			result.data.forEach( user => {
				const matchesSearch =
					user.name?.toLowerCase().includes( 'resident' ) ||
					user.email?.toLowerCase().includes( 'resident' )
				expect( matchesSearch ).toBe( true )
			} )
		} )

		it( 'should get mansions list', async () => {
			const result = await backend.getMansions()

			expect( result.success ).toBe( true )
			expect( result.data.length ).toBeGreaterThan( 0 )

			const testMansion = result.data.find( m => m.id === testData.mansion.id )
			expect( testMansion ).toBeDefined()
			expect( testMansion.name ).toBe( 'Test Mansion' )
		} )

		it( 'should update user details', async () => {
			const result = await backend.updateUser( testData.resident.id, {
				name: 'Updated Resident Name',
				unit: '101'
			} )

			expect( result.success ).toBe( true )
			expect( result.data.name ).toBe( 'Updated Resident Name' )
			expect( result.data.unit ).toBe( '101' )
		} )
	} )

	// ==========================================
	// SPECIALIZED ENDPOINTS TESTS
	// ==========================================

	describe( 'Specialized Endpoints', () => {
		beforeEach( async () => {
			const auth = await backend.auth()
			await auth.login( 'resident@test.com', 'test-password-123' )
		} )

		it( 'should get dashboard data', async () => {
			const result = await backend.getDashboard()

			expect( result.success ).toBe( true )
			expect( result.data.stats ).toBeDefined()
			expect( result.data.stats.bookings ).toBeDefined()
			expect( result.data.stats.maintenance ).toBeDefined()
			expect( result.data.stats.bills ).toBeDefined()
			expect( result.data.recentActivity ).toBeDefined()
			expect( Array.isArray( result.data.announcements ) ).toBe( true )
		} )

		it( 'should check availability', async () => {
			const startDate = new Date( Date.now() + 604800000 ) // 7 days from now
			const endDate = new Date( Date.now() + 608400000 )

			const result = await backend.checkAvailability(
				testData.facility.id,
				startDate.toISOString(),
				endDate.toISOString()
			)

			expect( result.success ).toBe( true )
			expect( typeof result.data.available ).toBe( 'boolean' )
			expect( Array.isArray( result.data.conflicts ) ).toBe( true )
		} )

		it( 'should detect booking conflicts', async () => {
			// Create a booking
			const bookingStart = new Date( Date.now() + 691200000 ) // 8 days from now
			const bookingEnd = new Date( Date.now() + 694800000 )

			await backend.create( 'bookings', {
				facilityId: testData.facility.id,
				mansionId: testData.mansion.id,
				title: 'Conflict Test Booking',
				dates: {
					start: bookingStart.toISOString(),
					end: bookingEnd.toISOString()
				},
				status: 'confirmed'
			} )

			// Check availability for overlapping time
			const result = await backend.checkAvailability(
				testData.facility.id,
				new Date( bookingStart.getTime() + 1800000 ).toISOString(), // 30 min after start
				new Date( bookingEnd.getTime() + 1800000 ).toISOString()
			)

			expect( result.success ).toBe( true )
			expect( result.data.available ).toBe( false )
			expect( result.data.conflicts.length ).toBeGreaterThan( 0 )
		} )

		it( 'should get notifications', async () => {
			const result = await backend.getNotifications()

			expect( result.success ).toBe( true )
			expect( Array.isArray( result.data ) ).toBe( true )
		} )

		it( 'should get analytics (mansion admin)', async () => {
			// Login as admin for analytics
			const auth = await backend.auth()
			await auth.logout()
			await auth.login( 'admin@test.com', 'test-password-123' )

			const result = await backend.getAnalytics( 'maintenance' )

			expect( result.success ).toBe( true )
			expect( result.data.avgResponseTime ).toBeDefined()
			expect( result.data.completionRate ).toBeDefined()
		} )

		it( 'should export data as JSON', async () => {
			const result = await backend.exportData( 'bookings', 'json' )

			expect( result.success ).toBe( true )
			expect( result.data.format ).toBe( 'json' )
			expect( Array.isArray( result.data.data ) ).toBe( true )
			expect( result.data.filename ).toContain( 'bookings_export' )
			expect( result.data.filename ).toContain( '.json' )
		} )

		it( 'should export data as CSV', async () => {
			const result = await backend.exportData( 'bookings', 'csv' )

			expect( result.success ).toBe( true )
			expect( result.data.format ).toBe( 'csv' )
			expect( typeof result.data.data ).toBe( 'string' )
			expect( result.data.filename ).toContain( '.csv' )
		} )
	} )

	// ==========================================
	// EVENT SYSTEM TESTS
	// ==========================================

	describe( 'Event System', () => {
		beforeEach( async () => {
			const auth = await backend.auth()
			await auth.login( 'resident@test.com', 'test-password-123' )
		} )

		it( 'should emit events on create', async () => {
			const events = []
			backend.subscribe( 'bookings.created', data => events.push( data ) )

			await backend.create( 'bookings', {
				facilityId: testData.facility.id,
				mansionId: testData.mansion.id,
				title: 'Event Test Booking',
				dates: {
					start: new Date( Date.now() + 777600000 ).toISOString(),
					end: new Date( Date.now() + 781200000 ).toISOString()
				},
				status: 'pending'
			} )

			expect( events.length ).toBe( 1 )
			expect( events[0].title ).toBe( 'Event Test Booking' )
		} )

		it( 'should emit events on update', async () => {
			const events = []
			backend.subscribe( 'bookings.updated', data => events.push( data ) )

			const created = await backend.create( 'bookings', {
				facilityId: testData.facility.id,
				mansionId: testData.mansion.id,
				title: 'Update Event Test',
				dates: {
					start: new Date( Date.now() + 864000000 ).toISOString(),
					end: new Date( Date.now() + 867600000 ).toISOString()
				},
				status: 'pending'
			} )

			await backend.update( 'bookings', created.data.id, { status: 'confirmed' } )

			expect( events.length ).toBe( 1 )
			expect( events[0].status ).toBe( 'confirmed' )
		} )

		it( 'should emit events on delete', async () => {
			const events = []
			backend.subscribe( 'bookings.deleted', data => events.push( data ) )

			const created = await backend.create( 'bookings', {
				facilityId: testData.facility.id,
				mansionId: testData.mansion.id,
				title: 'Delete Event Test',
				dates: {
					start: new Date( Date.now() + 950400000 ).toISOString(),
					end: new Date( Date.now() + 954000000 ).toISOString()
				},
				status: 'pending'
			} )

			await backend.delete( 'bookings', created.data.id )

			expect( events.length ).toBe( 1 )
			expect( events[0].id ).toBe( created.data.id )
		} )

		it( 'should support wildcard subscribers', async () => {
			const events = []
			backend.subscribe( '*', data => events.push( data ) )

			await backend.create( 'maintenance', {
				mansionId: testData.mansion.id,
				title: 'Wildcard Test',
				description: 'Test',
				category: 'general',
				priority: 'low',
				status: 'pending'
			} )

			expect( events.length ).toBe( 1 )
			expect( events[0].event ).toBe( 'maintenance.created' )
		} )

		it( 'should unsubscribe correctly', async () => {
			const events = []
			const unsubscribe = backend.subscribe( 'bookings.created', data => events.push( data ) )

			unsubscribe()

			await backend.create( 'bookings', {
				facilityId: testData.facility.id,
				mansionId: testData.mansion.id,
				title: 'Unsubscribe Test',
				dates: {
					start: new Date( Date.now() + 1036800000 ).toISOString(),
					end: new Date( Date.now() + 1040400000 ).toISOString()
				},
				status: 'pending'
			} )

			expect( events.length ).toBe( 0 )
		} )
	} )
} )
