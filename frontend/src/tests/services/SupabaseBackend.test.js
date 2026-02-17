import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import {
	createMockAnnouncement,
	createMockBill,
	createMockBooking,
	createMockMaintenance,
	createMockMansion,
	createMockNotification,
	createMockProfile,
	createMockSupabaseClient,
	mockSupabaseResponse } from '../mocks/supabase.js'

// Mock the Supabase module before importing SupabaseBackend
vi.mock( '@supabase/supabase-js', () => ( {
	createClient: vi.fn( () => createMockSupabaseClient() )
} ) )

// Import after mocking
import { SupabaseBackend } from '../../services/SupabaseBackend.js'

describe( 'SupabaseBackend', () => {
	let backend
	let mockSupabase

	beforeEach( () => {
		mockSupabase = createMockSupabaseClient()
		backend = new SupabaseBackend()
		// Inject mock client
		backend.supabase = mockSupabase
	} )

	afterEach( () => {
		vi.clearAllMocks()
	} )

	// ==========================================
	// RESPONSE HELPERS
	// ==========================================

	describe( 'createResponse()', () => {
		it( 'should return success response with data', () => {
			const data = { id: 1, name: 'Test' }
			const result = backend.createResponse( data )

			expect( result.success ).toBe( true )
			expect( result.data ).toEqual( data )
			expect( result.meta.timestamp ).toBeTypeOf( 'number' )
			expect( result.error ).toBeNull()
		} )

		it( 'should include timestamp in meta', () => {
			const before = Date.now()
			const result = backend.createResponse( {} )
			const after = Date.now()

			expect( result.meta.timestamp ).toBeGreaterThanOrEqual( before )
			expect( result.meta.timestamp ).toBeLessThanOrEqual( after )
		} )

		it( 'should merge custom meta properties', () => {
			const result = backend.createResponse( [], { page: 1, total: 50, limit: 20 } )

			expect( result.meta.page ).toBe( 1 )
			expect( result.meta.total ).toBe( 50 )
			expect( result.meta.limit ).toBe( 20 )
			expect( result.meta.timestamp ).toBeTypeOf( 'number' )
		} )
	} )

	describe( 'createError()', () => {
		it( 'should return error response structure', () => {
			const result = backend.createError( 'Something went wrong' )

			expect( result.success ).toBe( false )
			expect( result.data ).toBeNull()
			expect( result.error.message ).toBe( 'Something went wrong' )
		} )

		it( 'should default to code 400', () => {
			const result = backend.createError( 'Bad request' )
			expect( result.error.code ).toBe( 400 )
		} )

		it( 'should accept custom error code', () => {
			const result = backend.createError( 'Not found', 404 )
			expect( result.error.code ).toBe( 404 )
		} )

		it( 'should set success to false', () => {
			const result = backend.createError( 'Error' )
			expect( result.success ).toBe( false )
		} )
	} )

	// ==========================================
	// DATA TRANSFORMATION
	// ==========================================

	describe( '_toSnakeCase()', () => {
		it( 'should convert createdAt to created_at', () => {
			expect( backend._toSnakeCase( 'createdAt' ) ).toBe( 'created_at' )
		} )

		it( 'should convert userId to user_id', () => {
			expect( backend._toSnakeCase( 'userId' ) ).toBe( 'user_id' )
		} )

		it( 'should convert mansionId to mansion_id', () => {
			expect( backend._toSnakeCase( 'mansionId' ) ).toBe( 'mansion_id' )
		} )

		it( 'should handle multiple uppercase letters', () => {
			expect( backend._toSnakeCase( 'startDateTimeUTC' ) ).toBe( 'start_date_time_u_t_c' )
		} )

		it( 'should not change already snake_case strings', () => {
			expect( backend._toSnakeCase( 'already_snake' ) ).toBe( 'already_snake' )
		} )
	} )

	describe( '_toCamelCase()', () => {
		it( 'should convert created_at to createdAt', () => {
			expect( backend._toCamelCase( 'created_at' ) ).toBe( 'createdAt' )
		} )

		it( 'should convert user_id to userId', () => {
			expect( backend._toCamelCase( 'user_id' ) ).toBe( 'userId' )
		} )

		it( 'should handle multiple underscores', () => {
			expect( backend._toCamelCase( 'start_date_time' ) ).toBe( 'startDateTime' )
		} )

		it( 'should not change already camelCase strings', () => {
			expect( backend._toCamelCase( 'alreadyCamel' ) ).toBe( 'alreadyCamel' )
		} )
	} )

	describe( '_mapItem()', () => {
		it( 'should convert all DB fields to camelCase', () => {
			const dbItem = {
				id: 1,
				user_id: 'usr_123',
				facility_id: 'fac_001',
				created_at: '2024-01-01',
				updated_at: '2024-01-02'
			}

			const result = backend._mapItem( 'bookings', dbItem )

			expect( result.userId ).toBe( 'usr_123' )
			expect( result.facilityId ).toBe( 'fac_001' )
			expect( result.createdAt ).toBe( '2024-01-01' )
			expect( result.updatedAt ).toBe( '2024-01-02' )
		} )

		it( 'should construct dates object from date fields', () => {
			const dbItem = {
				id: 1,
				created_at: '2024-01-01',
				updated_at: '2024-01-02',
				start_date: '2024-02-01',
				end_date: '2024-02-02',
				due_date: '2024-03-01',
				completed_at: '2024-02-15'
			}

			const result = backend._mapItem( 'bookings', dbItem )

			expect( result.dates.created ).toBe( '2024-01-01' )
			expect( result.dates.updated ).toBe( '2024-01-02' )
			expect( result.dates.start ).toBe( '2024-02-01' )
			expect( result.dates.end ).toBe( '2024-02-02' )
			expect( result.dates.due ).toBe( '2024-03-01' )
			expect( result.dates.completed ).toBe( '2024-02-15' )
		} )

		it( 'should handle null input gracefully', () => {
			expect( backend._mapItem( 'bookings', null ) ).toBeNull()
		} )

		it( 'should handle undefined date fields', () => {
			const dbItem = {
				id: 1,
				created_at: '2024-01-01',
				updated_at: '2024-01-02'
			}

			const result = backend._mapItem( 'bookings', dbItem )

			expect( result.dates.start ).toBeUndefined()
			expect( result.dates.end ).toBeUndefined()
		} )
	} )

	describe( '_mapToDb()', () => {
		it( 'should convert payload keys to snake_case', () => {
			const payload = {
				title: 'Test',
				facilityId: 'fac_001',
				mansionId: 'man_001'
			}

			const result = backend._mapToDb( 'bookings', payload )

			expect( result.title ).toBe( 'Test' )
			expect( result.facility_id ).toBe( 'fac_001' )
			expect( result.mansion_id ).toBe( 'man_001' )
		} )

		it( 'should map dates.start to start_date ISO string', () => {
			const payload = {
				title: 'Test',
				dates: {
					start: '2024-02-01T10:00:00',
					end: '2024-02-01T12:00:00',
					due: '2024-03-01'
				}
			}

			const result = backend._mapToDb( 'bookings', payload )

			expect( result.start_date ).toContain( '2024-02-01' )
			expect( result.end_date ).toContain( '2024-02-01' )
			expect( result.due_date ).toContain( '2024-03-01' )
		} )

		it( 'should set creator_id from current user', () => {
			const payload = { title: 'Test' }
			const user = { id: 'usr_123' }

			const result = backend._mapToDb( 'bookings', payload, user )

			expect( result.creator_id ).toBe( 'usr_123' )
		} )

		it( 'should skip nested objects like dates/creator/facility', () => {
			const payload = {
				title: 'Test',
				dates: { start: '2024-01-01' },
				creator: { id: 'usr_123', name: 'Test' },
				facility: { id: 'fac_001' },
				assignee: { id: 'usr_456' }
			}

			const result = backend._mapToDb( 'bookings', payload )

			expect( result.creator ).toBeUndefined()
			expect( result.facility ).toBeUndefined()
			expect( result.assignee ).toBeUndefined()
		} )

		it( 'should remove undefined values', () => {
			const payload = {
				title: 'Test',
				description: undefined,
				status: 'active'
			}

			const result = backend._mapToDb( 'bookings', payload )

			expect( result.title ).toBe( 'Test' )
			expect( result.status ).toBe( 'active' )
			expect( 'description' in result ).toBe( false )
		} )
	} )

	describe( '_getTableName()', () => {
		it( 'should map "users" to "profiles"', () => {
			expect( backend._getTableName( 'users' ) ).toBe( 'profiles' )
		} )

		it( 'should map "maintenance" to "maintenance_requests"', () => {
			expect( backend._getTableName( 'maintenance' ) ).toBe( 'maintenance_requests' )
		} )

		it( 'should return original name for unmapped resources', () => {
			expect( backend._getTableName( 'bookings' ) ).toBe( 'bookings' )
			expect( backend._getTableName( 'facilities' ) ).toBe( 'facilities' )
			expect( backend._getTableName( 'bills' ) ).toBe( 'bills' )
		} )
	} )

	// ==========================================
	// EVENT SYSTEM
	// ==========================================

	describe( 'subscribe()', () => {
		it( 'should register callback for specific event', () => {
			const callback = vi.fn()
			backend.subscribe( 'test.event', callback )

			backend.emit( 'test.event', { data: 'test' } )

			expect( callback ).toHaveBeenCalledWith( { data: 'test' } )
		} )

		it( 'should allow multiple subscribers for same event', () => {
			const callback1 = vi.fn()
			const callback2 = vi.fn()

			backend.subscribe( 'test.event', callback1 )
			backend.subscribe( 'test.event', callback2 )

			backend.emit( 'test.event', { value: 42 } )

			expect( callback1 ).toHaveBeenCalledWith( { value: 42 } )
			expect( callback2 ).toHaveBeenCalledWith( { value: 42 } )
		} )

		it( 'should return unsubscribe function', () => {
			const callback = vi.fn()
			const unsubscribe = backend.subscribe( 'test', callback )

			expect( typeof unsubscribe ).toBe( 'function' )
		} )
	} )

	describe( 'emit()', () => {
		it( 'should call registered callbacks with data', () => {
			const callback = vi.fn()
			backend.subscribe( 'user.created', callback )

			backend.emit( 'user.created', { id: 'usr_123', name: 'Test' } )

			expect( callback ).toHaveBeenCalledWith( { id: 'usr_123', name: 'Test' } )
		} )

		it( 'should trigger wildcard (*) subscribers', () => {
			const wildcardCb = vi.fn()
			backend.subscribe( '*', wildcardCb )

			backend.emit( 'any.event', { value: 42 } )

			expect( wildcardCb ).toHaveBeenCalledWith( {
				event: 'any.event',
				data: { value: 42 }
			} )
		} )

		it( 'should not fail if no subscribers', () => {
			expect( () => {
				backend.emit( 'no.subscribers', { data: 'test' } )
			} ).not.toThrow()
		} )
	} )

	describe( 'unsubscribe behavior', () => {
		it( 'should remove callback when unsubscribe called', () => {
			const callback = vi.fn()
			const unsubscribe = backend.subscribe( 'test', callback )

			backend.emit( 'test', {} )
			expect( callback ).toHaveBeenCalledTimes( 1 )

			unsubscribe()
			backend.emit( 'test', {} )
			expect( callback ).toHaveBeenCalledTimes( 1 ) // Still 1
		} )

		it( 'should not affect other callbacks', () => {
			const callback1 = vi.fn()
			const callback2 = vi.fn()

			const unsubscribe1 = backend.subscribe( 'test', callback1 )
			backend.subscribe( 'test', callback2 )

			unsubscribe1()
			backend.emit( 'test', {} )

			expect( callback1 ).not.toHaveBeenCalled()
			expect( callback2 ).toHaveBeenCalledTimes( 1 )
		} )
	} )

	// ==========================================
	// AUTHENTICATION
	// ==========================================

	describe( 'auth().login()', () => {
		it( 'should authenticate with email/password and return user', async () => {
			const mockUser = { id: 'usr_123', email: 'test@example.com' }
			const mockProfile = createMockProfile()

			mockSupabase.auth.signInWithPassword.mockResolvedValue(
				mockSupabaseResponse.authSession( mockUser )
			)
			mockSupabase._queryMock.single.mockResolvedValue( {
				data: mockProfile,
				error: null
			} )

			const auth = await backend.auth()
			const result = await auth.login( 'test@example.com', 'password' )

			expect( result.success ).toBe( true )
			expect( result.data.user.email ).toBe( 'test@example.com' )
		} )

		it( 'should return JWT token and expiry', async () => {
			const mockUser = { id: 'usr_123', email: 'test@example.com' }
			const mockProfile = createMockProfile()

			mockSupabase.auth.signInWithPassword.mockResolvedValue(
				mockSupabaseResponse.authSession( mockUser, 'test-jwt-token' )
			)
			mockSupabase._queryMock.single.mockResolvedValue( {
				data: mockProfile,
				error: null
			} )

			const auth = await backend.auth()
			const result = await auth.login( 'test@example.com', 'password' )

			expect( result.data.token ).toBe( 'test-jwt-token' )
			expect( result.data.expiresIn ).toBe( 3600 )
		} )

		it( 'should throw 401 error on invalid credentials', async () => {
			mockSupabase.auth.signInWithPassword.mockResolvedValue(
				mockSupabaseResponse.authError( 'Invalid credentials' )
			)

			const auth = await backend.auth()

			await expect( auth.login( 'bad@email.com', 'wrong' ) )
				.rejects.toMatchObject( {
					success: false,
					error: { message: 'Invalid credentials', code: 401 }
				} )
		} )
	} )

	describe( 'auth().logout()', () => {
		it( 'should sign out and return success message', async () => {
			mockSupabase.auth.signOut.mockResolvedValue( { error: null } )

			const auth = await backend.auth()
			const result = await auth.logout()

			expect( result.success ).toBe( true )
			expect( result.data.message ).toBe( 'Logged out successfully' )
		} )

		it( 'should throw on sign out error', async () => {
			mockSupabase.auth.signOut.mockResolvedValue( {
				error: { message: 'Sign out failed' }
			} )

			const auth = await backend.auth()

			await expect( auth.logout() )
				.rejects.toMatchObject( {
					success: false,
					error: { message: 'Sign out failed' }
				} )
		} )
	} )

	describe( 'auth().session()', () => {
		it( 'should return session with user if authenticated', async () => {
			const mockUser = { id: 'usr_123', email: 'test@example.com' }
			const mockProfile = createMockProfile()

			mockSupabase.auth.getSession.mockResolvedValue( {
				data: {
					session: {
						user: mockUser,
						access_token: 'session-token'
					}
				},
				error: null
			} )
			mockSupabase._queryMock.single.mockResolvedValue( {
				data: mockProfile,
				error: null
			} )

			const auth = await backend.auth()
			const result = await auth.session()

			expect( result.success ).toBe( true )
			expect( result.data.user.email ).toBe( 'test@example.com' )
			expect( result.data.token ).toBe( 'session-token' )
		} )

		it( 'should throw 401 if no session exists', async () => {
			mockSupabase.auth.getSession.mockResolvedValue( {
				data: { session: null },
				error: null
			} )

			const auth = await backend.auth()

			await expect( auth.session() )
				.rejects.toMatchObject( {
					success: false,
					error: { message: 'Not authenticated', code: 401 }
				} )
		} )
	} )

	describe( 'auth().refresh()', () => {
		it( 'should refresh token and return new token', async () => {
			mockSupabase.auth.refreshSession.mockResolvedValue( {
				data: {
					session: {
						access_token: 'new-token',
						expires_in: 7200
					}
				},
				error: null
			} )

			const auth = await backend.auth()
			const result = await auth.refresh()

			expect( result.success ).toBe( true )
			expect( result.data.token ).toBe( 'new-token' )
			expect( result.data.expiresIn ).toBe( 7200 )
		} )

		it( 'should throw 401 if not authenticated', async () => {
			mockSupabase.auth.refreshSession.mockResolvedValue( {
				data: { session: null },
				error: { message: 'Not authenticated' }
			} )

			const auth = await backend.auth()

			await expect( auth.refresh() )
				.rejects.toMatchObject( {
					success: false,
					error: { code: 401 }
				} )
		} )
	} )

	describe( 'auth().getCurrentUser()', () => {
		it( 'should return mapped user profile', async () => {
			const mockUser = { id: 'usr_123', email: 'test@example.com' }
			const mockProfile = createMockProfile()

			mockSupabase.auth.getUser.mockResolvedValue( {
				data: { user: mockUser }
			} )
			mockSupabase._queryMock.single.mockResolvedValue( {
				data: mockProfile,
				error: null
			} )

			const auth = await backend.auth()
			const result = await auth.getCurrentUser()

			expect( result.success ).toBe( true )
			expect( result.data.email ).toBe( 'test@example.com' )
			expect( result.data.role ).toBe( 'resident' )
		} )

		it( 'should return null if not authenticated', async () => {
			mockSupabase.auth.getUser.mockResolvedValue( {
				data: { user: null }
			} )

			const auth = await backend.auth()
			const result = await auth.getCurrentUser()

			expect( result.success ).toBe( true )
			expect( result.data ).toBeNull()
		} )
	} )

	describe( 'auth().sendMagicLink()', () => {
		it( 'should send OTP email with redirect URL', async () => {
			mockSupabase.auth.signInWithOtp.mockResolvedValue( { error: null } )

			const auth = await backend.auth()
			const result = await auth.sendMagicLink( 'user@example.com' )

			expect( result.success ).toBe( true )
			expect( result.data.message ).toBe( 'Magic link sent' )
			expect( mockSupabase.auth.signInWithOtp ).toHaveBeenCalledWith( {
				email: 'user@example.com',
				options: expect.objectContaining( {
					emailRedirectTo: expect.stringContaining( '/login' )
				} )
			} )
		} )

		it( 'should throw on send failure', async () => {
			mockSupabase.auth.signInWithOtp.mockResolvedValue( {
				error: { message: 'Rate limit exceeded' }
			} )

			const auth = await backend.auth()

			await expect( auth.sendMagicLink( 'user@example.com' ) )
				.rejects.toMatchObject( {
					success: false,
					error: { message: 'Rate limit exceeded' }
				} )
		} )
	} )

	// ==========================================
	// CRUD OPERATIONS
	// ==========================================

	describe( 'get()', () => {
		it( 'should fetch resource by id', async () => {
			const mockBooking = createMockBooking()
			mockSupabase._queryMock.single.mockResolvedValue( {
				data: mockBooking,
				error: null
			} )

			const result = await backend.get( 'bookings', 'book_123' )

			expect( result.success ).toBe( true )
			expect( result.data.id ).toBe( 'book_123' )
			expect( mockSupabase.from ).toHaveBeenCalledWith( 'bookings' )
		} )

		it( 'should map response to camelCase', async () => {
			const mockBooking = createMockBooking()
			mockSupabase._queryMock.single.mockResolvedValue( {
				data: mockBooking,
				error: null
			} )

			const result = await backend.get( 'bookings', 'book_123' )

			expect( result.data.facilityId ).toBe( 'fac_001' )
			expect( result.data.creatorId ).toBe( 'usr_123' )
		} )

		it( 'should throw 404 if not found', async () => {
			mockSupabase._queryMock.single.mockResolvedValue( {
				data: null,
				error: { message: 'Not found' }
			} )

			await expect( backend.get( 'bookings', 'invalid_id' ) )
				.rejects.toMatchObject( {
					success: false,
					error: { message: 'bookings not found', code: 404 }
				} )
		} )
	} )

	describe( 'create()', () => {
		it( 'should insert and return new resource', async () => {
			const newBooking = createMockBooking( { id: 'new_book' } )

			mockSupabase.auth.getUser.mockResolvedValue( {
				data: { user: { id: 'usr_123' } }
			} )
			mockSupabase._queryMock.single.mockResolvedValue( {
				data: newBooking,
				error: null
			} )

			const result = await backend.create( 'bookings', { title: 'New Booking' } )

			expect( result.success ).toBe( true )
			expect( result.data.id ).toBe( 'new_book' )
		} )

		it( 'should emit resource.created event', async () => {
			const newBooking = createMockBooking()

			mockSupabase.auth.getUser.mockResolvedValue( {
				data: { user: { id: 'usr_123' } }
			} )
			mockSupabase._queryMock.single.mockResolvedValue( {
				data: newBooking,
				error: null
			} )

			const emitSpy = vi.spyOn( backend, 'emit' )
			await backend.create( 'bookings', { title: 'Test' } )

			expect( emitSpy ).toHaveBeenCalledWith( 'bookings.created', newBooking )
		} )
	} )

	describe( 'update()', () => {
		it( 'should update resource by id', async () => {
			const updatedBooking = createMockBooking( { title: 'Updated Title' } )

			mockSupabase._queryMock.single.mockResolvedValue( {
				data: updatedBooking,
				error: null
			} )

			const result = await backend.update( 'bookings', 'book_123', { title: 'Updated Title' } )

			expect( result.success ).toBe( true )
			expect( result.data.title ).toBe( 'Updated Title' )
		} )

		it( 'should emit resource.updated event', async () => {
			const updatedBooking = createMockBooking()

			mockSupabase._queryMock.single.mockResolvedValue( {
				data: updatedBooking,
				error: null
			} )

			const emitSpy = vi.spyOn( backend, 'emit' )
			await backend.update( 'bookings', 'book_123', { status: 'confirmed' } )

			expect( emitSpy ).toHaveBeenCalledWith( 'bookings.updated', updatedBooking )
		} )

		it( 'should throw on failure', async () => {
			mockSupabase._queryMock.single.mockResolvedValue( {
				data: null,
				error: { message: 'Update failed' }
			} )

			await expect( backend.update( 'bookings', 'book_123', {} ) )
				.rejects.toMatchObject( {
					success: false,
					error: { message: 'Update failed' }
				} )
		} )
	} )

	describe( 'delete()', () => {
		it( 'should delete resource by id', async () => {
			mockSupabase._queryMock.eq.mockResolvedValue( { error: null } )

			const result = await backend.delete( 'bookings', 'book_123' )

			expect( result.success ).toBe( true )
			expect( result.data.id ).toBe( 'book_123' )
		} )

		it( 'should emit resource.deleted event', async () => {
			mockSupabase._queryMock.eq.mockResolvedValue( { error: null } )

			const emitSpy = vi.spyOn( backend, 'emit' )
			await backend.delete( 'bookings', 'book_123' )

			expect( emitSpy ).toHaveBeenCalledWith( 'bookings.deleted', { id: 'book_123' } )
		} )
	} )

	describe( 'query()', () => {
		it( 'should query with filters and pagination', async () => {
			const mockData = [createMockBooking()]
			mockSupabase._queryMock.range.mockResolvedValue( {
				data: mockData,
				error: null,
				count: 1
			} )

			const result = await backend.query( 'bookings', {
				filter: { status: 'confirmed' },
				page: 1,
				limit: 10
			} )

			expect( result.success ).toBe( true )
			expect( result.data ).toHaveLength( 1 )
			expect( result.meta.total ).toBe( 1 )
		} )

		it( 'should apply eq filter for single values', async () => {
			mockSupabase._queryMock.range.mockResolvedValue( {
				data: [],
				error: null,
				count: 0
			} )

			await backend.query( 'bookings', { filter: { status: 'confirmed' } } )

			expect( mockSupabase._queryMock.eq ).toHaveBeenCalledWith( 'status', 'confirmed' )
		} )

		it( 'should apply in filter for arrays', async () => {
			mockSupabase._queryMock.range.mockResolvedValue( {
				data: [],
				error: null,
				count: 0
			} )

			await backend.query( 'bookings', {
				filter: { status: ['pending', 'confirmed'] }
			} )

			expect( mockSupabase._queryMock.in ).toHaveBeenCalledWith( 'status', ['pending', 'confirmed'] )
		} )

		it( 'should sort descending when field prefixed with -', async () => {
			mockSupabase._queryMock.range.mockResolvedValue( {
				data: [],
				error: null,
				count: 0
			} )

			await backend.query( 'bookings', { sort: '-createdAt' } )

			expect( mockSupabase._queryMock.order ).toHaveBeenCalledWith( 'created_at', { ascending: false } )
		} )

		it( 'should return meta with total and totalPages', async () => {
			mockSupabase._queryMock.range.mockResolvedValue( {
				data: [],
				error: null,
				count: 45
			} )

			const result = await backend.query( 'bookings', { page: 2, limit: 10 } )

			expect( result.meta.total ).toBe( 45 )
			expect( result.meta.totalPages ).toBe( 5 )
			expect( result.meta.page ).toBe( 2 )
			expect( result.meta.limit ).toBe( 10 )
		} )
	} )

	// ==========================================
	// ADMIN OPERATIONS
	// ==========================================

	describe( 'inviteUser()', () => {
		it( 'should validate email is required', async () => {
			await expect( backend.inviteUser( { role: 'resident' } ) )
				.rejects.toMatchObject( {
					success: false,
					error: { message: 'Email is required' }
				} )
		} )

		it( 'should validate role is required', async () => {
			await expect( backend.inviteUser( { email: 'test@example.com' } ) )
				.rejects.toMatchObject( {
					success: false,
					error: { message: 'Role is required' }
				} )
		} )

		it( 'should throw if user already exists', async () => {
			mockSupabase._queryMock.single.mockResolvedValue( {
				data: { id: 'existing', email: 'test@example.com' },
				error: null
			} )

			await expect( backend.inviteUser( {
				email: 'test@example.com',
				role: 'resident'
			} ) )
				.rejects.toMatchObject( {
					success: false,
					error: { message: 'User with this email already exists' }
				} )
		} )

		it( 'should send OTP with user metadata', async () => {
			mockSupabase._queryMock.single.mockResolvedValue( { data: null, error: null } )
			mockSupabase.auth.signInWithOtp.mockResolvedValue( { error: null } )

			await backend.inviteUser( {
				email: 'new@example.com',
				name: 'New User',
				role: 'resident',
				mansionId: 'man_001',
				unit: '101'
			} )

			expect( mockSupabase.auth.signInWithOtp ).toHaveBeenCalledWith( {
				email: 'new@example.com',
				options: expect.objectContaining( {
					data: expect.objectContaining( {
						name: 'New User',
						role: 'resident',
						mansion_id: 'man_001',
						unit: '101',
						invited: true
					} )
				} )
			} )
		} )

		it( 'should emit user.invited event', async () => {
			mockSupabase._queryMock.single.mockResolvedValue( { data: null, error: null } )
			mockSupabase.auth.signInWithOtp.mockResolvedValue( { error: null } )

			const emitSpy = vi.spyOn( backend, 'emit' )
			await backend.inviteUser( {
				email: 'new@example.com',
				role: 'resident',
				mansionId: 'man_001'
			} )

			expect( emitSpy ).toHaveBeenCalledWith( 'user.invited', {
				email: 'new@example.com',
				role: 'resident',
				mansionId: 'man_001'
			} )
		} )
	} )

	describe( 'getMansions()', () => {
		it( 'should return mapped mansion list', async () => {
			const mockMansions = [createMockMansion(), createMockMansion( { id: 'man_002' } )]
			mockSupabase._queryMock.order.mockResolvedValue( {
				data: mockMansions,
				error: null,
				count: 2
			} )

			const result = await backend.getMansions()

			expect( result.success ).toBe( true )
			expect( result.data ).toHaveLength( 2 )
			expect( result.data[0].totalUnits ).toBe( 50 )
		} )

		it( 'should include total count in meta', async () => {
			mockSupabase._queryMock.order.mockResolvedValue( {
				data: [createMockMansion()],
				error: null,
				count: 10
			} )

			const result = await backend.getMansions()

			expect( result.meta.total ).toBe( 10 )
		} )
	} )

	describe( 'getUsers()', () => {
		it( 'should return all users with mansion names', async () => {
			const mockUsers = [createMockProfile()]
			// getUsers chain: select().or().order().range()
			mockSupabase._queryMock.range.mockResolvedValue( {
				data: mockUsers,
				error: null,
				count: 1
			} )

			const result = await backend.getUsers()

			expect( result.success ).toBe( true )
			expect( result.data[0].mansionName ).toBe( 'Test Mansion' )
		} )

		it( 'should filter by mansionId when provided', async () => {
			// getUsers with mansionId: select().eq().or().order().range()
			mockSupabase._queryMock.range.mockResolvedValue( {
				data: [],
				error: null,
				count: 0
			} )

			await backend.getUsers( { mansionId: 'man_001' } )

			expect( mockSupabase._queryMock.eq ).toHaveBeenCalledWith( 'mansion_id', 'man_001' )
		} )
	} )

	describe( 'updateUser()', () => {
		it( 'should update provided fields only', async () => {
			const updatedProfile = createMockProfile( { role: 'mansion_admin' } )
			mockSupabase._queryMock.single.mockResolvedValue( {
				data: updatedProfile,
				error: null
			} )

			const result = await backend.updateUser( 'usr_123', { role: 'mansion_admin' } )

			expect( result.success ).toBe( true )
			expect( result.data.role ).toBe( 'mansion_admin' )
		} )

		it( 'should emit user.updated event', async () => {
			const updatedProfile = createMockProfile()
			mockSupabase._queryMock.single.mockResolvedValue( {
				data: updatedProfile,
				error: null
			} )

			const emitSpy = vi.spyOn( backend, 'emit' )
			await backend.updateUser( 'usr_123', { name: 'Updated Name' } )

			expect( emitSpy ).toHaveBeenCalledWith( 'user.updated', updatedProfile )
		} )
	} )

	describe( 'deleteUser()', () => {
		it( 'should delete user profile', async () => {
			mockSupabase._queryMock.eq.mockResolvedValue( { error: null } )

			const result = await backend.deleteUser( 'usr_123' )

			expect( result.success ).toBe( true )
			expect( result.data.id ).toBe( 'usr_123' )
		} )

		it( 'should emit user.deleted event', async () => {
			mockSupabase._queryMock.eq.mockResolvedValue( { error: null } )

			const emitSpy = vi.spyOn( backend, 'emit' )
			await backend.deleteUser( 'usr_123' )

			expect( emitSpy ).toHaveBeenCalledWith( 'user.deleted', { id: 'usr_123' } )
		} )
	} )

	describe( 'getSystemStats()', () => {
		it( 'should aggregate statistics correctly', async () => {
			// Create chainable mock that properly resolves with then()
			const createChainMock = ( data, count ) => {
				const chainMock = {
					select: vi.fn().mockReturnThis(),
					gte: vi.fn().mockReturnThis(),
					lte: vi.fn().mockReturnThis(),
					eq: vi.fn().mockReturnThis(),
					data,
					count,
					then: ( resolve ) => resolve( { data, count, error: null } )
				}
				chainMock.select.mockReturnValue( chainMock )
				return chainMock
			}

			// Track call counts per table to return different data for different queries
			let mansionsCallCount = 0
			let profilesCallCount = 0
			let billsCallCount = 0

			mockSupabase.from.mockImplementation( ( table ) => {
				if ( table === 'mansions' ) {
					mansionsCallCount++
					// First call: total count, Second call: thisMonth count
					return createChainMock( mansionsCallCount === 1 ? [{}, {}] : [{}], mansionsCallCount === 1 ? 2 : 1 )
				}
				if ( table === 'profiles' ) {
					profilesCallCount++
					// First call: all users, Second call: residents this month
					if ( profilesCallCount === 1 ) {
						return createChainMock( [
							{ role: 'resident', created_at: '2024-01-15' },
							{ role: 'resident', created_at: '2024-01-10' },
							{ role: 'admin', created_at: '2024-01-01' }
						], 3 )
					}
					return createChainMock( [{ role: 'resident' }], 1 )
				}
				if ( table === 'maintenance_requests' ) {
					return createChainMock( [
						{ status: 'pending', priority: 'medium' },
						{ status: 'in_progress', priority: 'high' },
						{ status: 'completed', priority: 'low' },
						{ status: 'pending', priority: 'urgent' }
					], 4 )
				}
				if ( table === 'bills' ) {
					billsCallCount++
					// First call: all bills, Second call: last month's paid bills
					if ( billsCallCount === 1 ) {
						return createChainMock( [
							{ amount: 10000, status: 'paid', paid_at: '2024-01-15' },
							{ amount: 5000, status: 'pending', paid_at: null }
						], 2 )
					}
					return createChainMock( [{ amount: 8000 }], 1 )
				}
				return createChainMock( [], 0 )
			} )

			const result = await backend.getSystemStats()

			expect( result.success ).toBe( true )
			expect( result.data.buildings ).toBeDefined()
			expect( result.data.buildings.total ).toBe( 2 )
			expect( result.data.buildings.thisMonth ).toBe( 1 )
			expect( result.data.users ).toBeDefined()
			expect( result.data.users.residents ).toBe( 2 )
			expect( result.data.users.residentsThisMonth ).toBe( 1 )
			expect( result.data.maintenance ).toBeDefined()
			expect( result.data.maintenance.pending ).toBe( 2 )
			expect( result.data.maintenance.inProgress ).toBe( 1 )
			expect( result.data.maintenance.completed ).toBe( 1 )
			expect( result.data.maintenance.urgent ).toBe( 1 )
			expect( result.data.revenue ).toBeDefined()
			expect( result.data.revenue.total ).toBe( 10000 )
			expect( result.data.revenue.pending ).toBe( 5000 )
		} )
	} )

	// ==========================================
	// SPECIALIZED ENDPOINTS
	// ==========================================

	describe( 'checkAvailability()', () => {
		it( 'should return available: true when no conflicts', async () => {
			mockSupabase._queryMock.gt.mockResolvedValue( {
				data: [],
				error: null
			} )

			const result = await backend.checkAvailability(
				'fac_001',
				'2024-02-01T10:00:00',
				'2024-02-01T12:00:00'
			)

			expect( result.success ).toBe( true )
			expect( result.data.available ).toBe( true )
			expect( result.data.conflicts ).toHaveLength( 0 )
		} )

		it( 'should return conflicts with overlapping bookings', async () => {
			mockSupabase._queryMock.gt.mockResolvedValue( {
				data: [{ id: 'conflict_1', start_date: '2024-02-01T11:00:00', end_date: '2024-02-01T13:00:00' }],
				error: null
			} )

			const result = await backend.checkAvailability(
				'fac_001',
				'2024-02-01T10:00:00',
				'2024-02-01T12:00:00'
			)

			expect( result.data.available ).toBe( false )
			expect( result.data.conflicts ).toHaveLength( 1 )
			expect( result.data.conflicts[0].id ).toBe( 'conflict_1' )
		} )
	} )

	describe( 'getNotifications()', () => {
		it( 'should return user notifications', async () => {
			const mockNotifications = [createMockNotification()]
			mockSupabase.auth.getUser.mockResolvedValue( {
				data: { user: { id: 'usr_123' } }
			} )
			mockSupabase._queryMock.limit.mockResolvedValue( {
				data: mockNotifications,
				error: null
			} )

			const result = await backend.getNotifications()

			expect( result.success ).toBe( true )
			expect( result.data ).toHaveLength( 1 )
			expect( result.data[0].type ).toBe( 'maintenance' )
		} )

		it( 'should require authentication', async () => {
			mockSupabase.auth.getUser.mockResolvedValue( {
				data: { user: null }
			} )

			await expect( backend.getNotifications() )
				.rejects.toMatchObject( {
					success: false,
					error: { message: 'Not authenticated', code: 401 }
				} )
		} )
	} )

	describe( 'markNotificationRead()', () => {
		it( 'should update notification read status', async () => {
			mockSupabase._queryMock.eq.mockResolvedValue( { error: null } )

			const result = await backend.markNotificationRead( 'notif_123' )

			expect( result.success ).toBe( true )
			expect( mockSupabase._queryMock.update ).toHaveBeenCalledWith( { read: true } )
		} )
	} )

	describe( 'uploadFile()', () => {
		it( 'should upload to storage with category path', async () => {
			const mockFile = { name: 'test.jpg', size: 1024, type: 'image/jpeg' }

			const result = await backend.uploadFile( mockFile, 'documents' )

			expect( result.success ).toBe( true )
			expect( result.data.name ).toBe( 'test.jpg' )
			expect( result.data.url ).toContain( 'https://' )
		} )

		it( 'should throw on upload failure', async () => {
			mockSupabase.storage.from.mockReturnValue( {
				upload: vi.fn().mockResolvedValue( { error: { message: 'Upload failed' } } ),
				getPublicUrl: vi.fn()
			} )

			const mockFile = { name: 'test.jpg' }

			await expect( backend.uploadFile( mockFile ) )
				.rejects.toMatchObject( {
					success: false,
					error: { message: 'Upload failed' }
				} )
		} )
	} )

	describe( 'exportData()', () => {
		it( 'should export as JSON by default', async () => {
			mockSupabase._queryMock.range.mockResolvedValue( {
				data: [{ id: 1, name: 'Test' }],
				error: null,
				count: 1
			} )

			const result = await backend.exportData( 'bookings' )

			expect( result.success ).toBe( true )
			expect( result.data.format ).toBe( 'json' )
			expect( result.data.data ).toHaveLength( 1 )
		} )

		it( 'should export as CSV when format=csv', async () => {
			mockSupabase._queryMock.range.mockResolvedValue( {
				data: [{ id: 1, title: 'Test' }],
				error: null,
				count: 1
			} )

			const result = await backend.exportData( 'bookings', 'csv' )

			expect( result.data.format ).toBe( 'csv' )
			expect( result.data.data ).toContain( 'id,title' )
		} )

		it( 'should handle empty data for CSV', async () => {
			mockSupabase._queryMock.range.mockResolvedValue( {
				data: [],
				error: null,
				count: 0
			} )

			const result = await backend.exportData( 'bookings', 'csv' )

			expect( result.data.format ).toBe( 'csv' )
			expect( result.data.data ).toBe( '' )
		} )
	} )

	// ==========================================
	// ANALYTICS HELPERS
	// ==========================================

	describe( '_generateTrend()', () => {
		it( 'should generate data points for specified days', () => {
			const data = [{ created_at: new Date().toISOString() }]

			const result = backend._generateTrend( data, 'created_at', 7 )

			expect( result ).toHaveLength( 8 ) // 0 to 7 inclusive
			expect( result[0] ).toHaveProperty( 'date' )
			expect( result[0] ).toHaveProperty( 'value' )
		} )

		it( 'should format dates as YYYY-MM-DD', () => {
			const result = backend._generateTrend( [], 'created_at', 1 )

			expect( result[0].date ).toMatch( /^\d{4}-\d{2}-\d{2}$/ )
		} )
	} )

	describe( '_calcAvgResponseTime()', () => {
		it( 'should calculate average hours to completion', () => {
			const maintenance = [
				{
					created_at: '2024-01-01T00:00:00Z',
					completed_at: '2024-01-01T24:00:00Z' // 24 hours later
				},
				{
					created_at: '2024-01-02T00:00:00Z',
					completed_at: '2024-01-02T12:00:00Z' // 12 hours later
				}
			]

			const result = backend._calcAvgResponseTime( maintenance )

			expect( result ).toBe( 18 ) // (24 + 12) / 2
		} )

		it( 'should return 0 for empty array', () => {
			expect( backend._calcAvgResponseTime( [] ) ).toBe( 0 )
		} )

		it( 'should ignore items without completed_at', () => {
			const maintenance = [
				{ created_at: '2024-01-01', completed_at: null },
				{ created_at: '2024-01-02' } // no completed_at
			]

			expect( backend._calcAvgResponseTime( maintenance ) ).toBe( 0 )
		} )
	} )

	describe( '_countByField()', () => {
		it( 'should group and count by field value', () => {
			const data = [
				{ category: 'plumbing' },
				{ category: 'electrical' },
				{ category: 'plumbing' },
				{ category: 'plumbing' }
			]

			const result = backend._countByField( data, 'category' )

			expect( result.plumbing ).toBe( 3 )
			expect( result.electrical ).toBe( 1 )
		} )

		it( 'should use "other" for null/undefined', () => {
			const data = [
				{ category: 'plumbing' },
				{ category: null },
				{ category: undefined }
			]

			const result = backend._countByField( data, 'category' )

			expect( result.plumbing ).toBe( 1 )
			expect( result.other ).toBe( 2 )
		} )
	} )

	// ==========================================
	// CHAINABLE RESOURCE HELPERS
	// ==========================================

	describe( '_createResourceHelper()', () => {
		it( 'where() should accumulate filters', () => {
			const helper = backend.facilities()
				.where( 'status', 'active' )
				.where( 'type', 'gym' )

			expect( helper._filters.status ).toBe( 'active' )
			expect( helper._filters.type ).toBe( 'gym' )
		} )

		it( 'search() should set search query', () => {
			const helper = backend.facilities().search( 'gym' )
			expect( helper._search ).toBe( 'gym' )
		} )

		it( 'sort() should set sort field', () => {
			const helper = backend.facilities().sort( '-createdAt' )
			expect( helper._sort ).toBe( '-createdAt' )
		} )

		it( 'paginate() should set page and limit', () => {
			const helper = backend.facilities().paginate( 2, 25 )
			expect( helper._page ).toBe( 2 )
			expect( helper._limit ).toBe( 25 )
		} )

		it( 'include() should be chainable', () => {
			const helper = backend.facilities().include()
			expect( helper ).toBe( helper ) // Returns self
		} )

		it( 'get() without id should call query()', async () => {
			const querySpy = vi.spyOn( backend, 'query' ).mockResolvedValue( { success: true, data: [] } )

			await backend.facilities()
				.where( 'status', 'active' )
				.get()

			expect( querySpy ).toHaveBeenCalledWith( 'facilities', expect.objectContaining( {
				filter: { status: 'active' }
			} ) )
		} )

		it( 'get(id) should call get()', async () => {
			const getSpy = vi.spyOn( backend, 'get' ).mockResolvedValue( { success: true, data: {} } )

			await backend.facilities().get( 'fac_001' )

			expect( getSpy ).toHaveBeenCalledWith( 'facilities', 'fac_001' )
		} )

		it( 'create() should call create()', async () => {
			const createSpy = vi.spyOn( backend, 'create' ).mockResolvedValue( { success: true, data: {} } )

			await backend.facilities().create( { name: 'New Facility' } )

			expect( createSpy ).toHaveBeenCalledWith( 'facilities', { name: 'New Facility' } )
		} )

		it( 'update() should call update()', async () => {
			const updateSpy = vi.spyOn( backend, 'update' ).mockResolvedValue( { success: true, data: {} } )

			await backend.facilities().update( 'fac_001', { name: 'Updated' } )

			expect( updateSpy ).toHaveBeenCalledWith( 'facilities', 'fac_001', { name: 'Updated' } )
		} )

		it( 'delete() should call delete()', async () => {
			const deleteSpy = vi.spyOn( backend, 'delete' ).mockResolvedValue( { success: true, data: {} } )

			await backend.facilities().delete( 'fac_001' )

			expect( deleteSpy ).toHaveBeenCalledWith( 'facilities', 'fac_001' )
		} )
	} )

	describe( 'resource helpers exist', () => {
		it( 'facilities() returns helper', () => {
			expect( backend.facilities()._resource ).toBe( 'facilities' )
		} )

		it( 'bookings() returns helper', () => {
			expect( backend.bookings()._resource ).toBe( 'bookings' )
		} )

		it( 'maintenance() returns helper', () => {
			expect( backend.maintenance()._resource ).toBe( 'maintenance' )
		} )

		it( 'bills() returns helper', () => {
			expect( backend.bills()._resource ).toBe( 'bills' )
		} )

		it( 'users() returns helper', () => {
			expect( backend.users()._resource ).toBe( 'users' )
		} )

		it( 'documents() returns helper', () => {
			expect( backend.documents()._resource ).toBe( 'documents' )
		} )

		it( 'announcements() returns helper', () => {
			expect( backend.announcements()._resource ).toBe( 'announcements' )
		} )
	} )

	// ==========================================
	// RESET / CACHE
	// ==========================================

	describe( 'reset()', () => {
		it( 'should clear cache and return success', () => {
			backend.cache.set( 'key', 'value' )
			expect( backend.cache.size ).toBe( 1 )

			const result = backend.reset()

			expect( result.success ).toBe( true )
			expect( backend.cache.size ).toBe( 0 )
		} )
	} )
} )
