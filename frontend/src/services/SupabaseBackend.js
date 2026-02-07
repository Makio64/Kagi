/**
 * Supabase Backend Service
 * Drop-in replacement for Backend.js mock - same API surface
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

class SupabaseBackend {
	constructor() {
		this.supabase = createClient( supabaseUrl, supabaseKey )
		this.subscribers = new Map()
		this.cache = new Map()
	}

	// ==========================================
	// RESPONSE HELPERS (match Backend.js format)
	// ==========================================

	createResponse( data, meta = {} ) {
		return {
			success: true,
			data,
			meta: { timestamp: Date.now(), ...meta },
			error: null
		}
	}

	createError( message, code = 400 ) {
		return {
			success: false,
			data: null,
			meta: { timestamp: Date.now() },
			error: { message, code }
		}
	}

	// ==========================================
	// AUTH (matches Backend.js auth() surface)
	// ==========================================

	async auth() {
		return {
			login: async ( email, password ) => {
				const { data, error } = await this.supabase.auth.signInWithPassword( {
					email,
					password
				} )

				if ( error ) throw this.createError( error.message, 401 )

				const profile = await this._getProfile( data.user.id )
				const user = this._mapProfile( profile, data.user )

				return this.createResponse( {
					user,
					token: data.session.access_token,
					expiresIn: data.session.expires_in
				} )
			},

			logout: async () => {
				const { error } = await this.supabase.auth.signOut()
				if ( error ) throw this.createError( error.message, 500 )
				return this.createResponse( { message: 'Logged out successfully' } )
			},

			session: async () => {
				const { data: { session }, error } = await this.supabase.auth.getSession()
				if ( error || !session ) throw this.createError( 'Not authenticated', 401 )

				const profile = await this._getProfile( session.user.id )
				const user = this._mapProfile( profile, session.user )

				return this.createResponse( { user, token: session.access_token } )
			},

			refresh: async () => {
				const { data, error } = await this.supabase.auth.refreshSession()
				if ( error ) throw this.createError( 'Not authenticated', 401 )

				return this.createResponse( {
					token: data.session.access_token,
					expiresIn: data.session.expires_in
				} )
			},

			getCurrentUser: async () => {
				const { data: { user } } = await this.supabase.auth.getUser()
				if ( !user ) return this.createResponse( null )

				const profile = await this._getProfile( user.id )
				return this.createResponse( this._mapProfile( profile, user ) )
			},

			verifyMagicLink: async ( codeOrToken ) => {
				let session = null

				console.log( '[SupabaseBackend] Exchanging code for session:', codeOrToken?.substring( 0, 20 ) + '...' )

				// Try PKCE code exchange first (newer Supabase flow)
				const { data, error } = await this.supabase.auth.exchangeCodeForSession( codeOrToken )

				console.log( '[SupabaseBackend] Exchange result:', { hasSession: !!data?.session, error: error?.message } )

				if ( !error && data?.session ) {
					session = data.session
				} else {
					// Fallback: check if session already exists (implicit flow)
					console.log( '[SupabaseBackend] Trying fallback getSession...' )
					const { data: sessionData } = await this.supabase.auth.getSession()
					session = sessionData?.session
					console.log( '[SupabaseBackend] Fallback result:', { hasSession: !!session } )
				}

				if ( !session ) throw this.createError( 'Invalid or expired token', 401 )

				const profile = await this._getProfile( session.user.id )
				const user = this._mapProfile( profile, session.user )

				return this.createResponse( {
					user,
					token: session.access_token,
					expiresIn: session.expires_in
				} )
			},

			sendMagicLink: async ( email ) => {
				const { error } = await this.supabase.auth.signInWithOtp( {
					email,
					options: {
						emailRedirectTo: `${window.location.origin}/login`
					}
				} )

				if ( error ) throw this.createError( error.message, 400 )
				return this.createResponse( { message: 'Magic link sent' } )
			}
		}
	}

	// ==========================================
	// USER INVITATION (Admin feature)
	// ==========================================

	/**
	 * Invite a user with a specific role and mansion assignment
	 * Sends magic link email with pre-configured metadata
	 */
	async inviteUser( { email, name, role, mansionId, unit } ) {
		// Validate required fields
		if ( !email ) throw this.createError( 'Email is required', 400 )
		if ( !role ) throw this.createError( 'Role is required', 400 )

		// Check if user already exists
		const { data: existingProfile } = await this.supabase
			.from( 'profiles' )
			.select( 'id, email' )
			.eq( 'email', email )
			.single()

		if ( existingProfile ) {
			throw this.createError( 'User with this email already exists', 400 )
		}

		// Send magic link with user metadata (role, mansion, etc.)
		const { error } = await this.supabase.auth.signInWithOtp( {
			email,
			options: {
				emailRedirectTo: `${window.location.origin}/login`,
				data: {
					name: name || email.split( '@' )[0],
					role,
					mansion_id: mansionId || null,
					unit: unit || null,
					invited: true,
					invitedAt: new Date().toISOString()
				}
			}
		} )

		if ( error ) throw this.createError( error.message, 400 )

		this.emit( 'user.invited', { email, role, mansionId } )
		return this.createResponse( {
			message: 'Invitation sent successfully',
			email,
			role,
			mansionId
		} )
	}

	// ==========================================
	// ADMIN ENDPOINTS
	// ==========================================

	/**
	 * Get all mansions (admin only)
	 */
	async getMansions() {
		const { data, error, count } = await this.supabase
			.from( 'mansions' )
			.select( '*', { count: 'exact' } )
			.order( 'created_at', { ascending: false } )

		if ( error ) throw this.createError( error.message, 500 )

		return this.createResponse( ( data || [] ).map( m => ( {
			id: m.id,
			name: m.name,
			address: m.address,
			totalUnits: m.total_units,
			subscriptionTier: m.subscription_tier || 'standard',
			settings: m.settings,
			metadata: m.metadata,
			createdAt: m.created_at,
			updatedAt: m.updated_at
		} ) ), { total: count || 0 } )
	}

	/**
	 * Get a user by email address
	 * @param {string} email - The email to look up
	 * @returns {Object} Response with user data or null if not found
	 */
	async getUserByEmail( email ) {
		if ( !email ) {
			return this.createResponse( null )
		}

		const { data, error } = await this.supabase
			.from( 'profiles' )
			.select( '*, mansions(name)' )
			.eq( 'email', email.toLowerCase().trim() )
			.single()

		if ( error && error.code !== 'PGRST116' ) { // PGRST116 = no rows returned
			throw this.createError( error.message, 500 )
		}

		if ( !data ) {
			return this.createResponse( null )
		}

		return this.createResponse( {
			id: data.id,
			email: data.email,
			name: data.name,
			phone: data.phone,
			unit: data.unit,
			role: data.role,
			mansionId: data.mansion_id,
			mansionName: data.mansions?.name || null,
			createdAt: data.created_at
		} )
	}

	/**
	 * Get all users with optional filtering, search, sorting, and pagination
	 * @param {Object|string} options - Options object or mansionId for backward compatibility
	 * @param {string} options.mansionId - Filter by mansion ID
	 * @param {string} options.role - Filter by role
	 * @param {string} options.search - Search by name or email
	 * @param {number} options.page - Page number (1-indexed)
	 * @param {number} options.limit - Items per page
	 * @param {string} options.sort - Sort field (prefix with - for descending)
	 */
	async getUsers( options = {} ) {
		// Backward compatibility: if a string is passed, treat it as mansionId
		if ( typeof options === 'string' || options === null ) {
			options = { mansionId: options }
		}

		const {
			mansionId = null,
			role = null,
			search = null,
			page = 1,
			limit = 25,
			sort = '-createdAt'
		} = options

		let query = this.supabase
			.from( 'profiles' )
			.select( '*, mansions(name)', { count: 'exact' } )

		// Apply mansion filter
		if ( mansionId ) {
			query = query.eq( 'mansion_id', mansionId )
		}

		// Apply role filter
		if ( role ) {
			query = query.eq( 'role', role )
		}

		// Apply search (name, email)
		if ( search && search.trim() ) {
			const searchTerm = search.trim()
			query = query.or( `name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%` )
		}

		// Apply sorting
		const desc = sort.startsWith( '-' )
		const sortField = sort.replace( /^-/, '' ).replace( /([A-Z])/g, '_$1' ).toLowerCase()
		query = query.order( sortField, { ascending: !desc } )

		// Apply pagination
		const start = ( page - 1 ) * limit
		query = query.range( start, start + limit - 1 )

		const { data, error, count } = await query

		if ( error ) throw this.createError( error.message, 500 )

		return this.createResponse( ( data || [] ).map( u => ( {
			id: u.id,
			email: u.email,
			name: u.name,
			phone: u.phone,
			unit: u.unit,
			role: u.role,
			mansionId: u.mansion_id,
			mansionName: u.mansions?.name || null,
			avatar: u.avatar,
			permissions: u.permissions,
			settings: u.settings,
			createdAt: u.created_at,
			updatedAt: u.updated_at
		} ) ), {
			page,
			limit,
			total: count || 0,
			totalPages: Math.ceil( ( count || 0 ) / limit )
		} )
	}

	/**
	 * Update user role and/or mansion assignment
	 */
	async updateUser( userId, { role, mansionId, name, unit, phone } ) {
		const updates = {}
		if ( role !== undefined ) updates.role = role
		if ( mansionId !== undefined ) updates.mansion_id = mansionId
		if ( name !== undefined ) updates.name = name
		if ( unit !== undefined ) updates.unit = unit
		if ( phone !== undefined ) updates.phone = phone

		const { data, error } = await this.supabase
			.from( 'profiles' )
			.update( updates )
			.eq( 'id', userId )
			.select( '*, mansions(name)' )
			.single()

		if ( error ) throw this.createError( error.message, 400 )

		this.emit( 'user.updated', data )
		return this.createResponse( {
			id: data.id,
			email: data.email,
			name: data.name,
			role: data.role,
			mansionId: data.mansion_id,
			mansionName: data.mansions?.name || null,
			unit: data.unit,
			phone: data.phone
		} )
	}

	/**
	 * Delete a user (remove from profiles - auth user remains but cannot access)
	 */
	async deleteUser( userId ) {
		const { error } = await this.supabase
			.from( 'profiles' )
			.delete()
			.eq( 'id', userId )

		if ( error ) throw this.createError( error.message, 400 )

		this.emit( 'user.deleted', { id: userId } )
		return this.createResponse( { message: 'User deleted successfully', id: userId } )
	}

	/**
	 * Get system-wide stats for admin dashboard
	 */
	async getSystemStats() {
		// Subscription tier rates (JPY per unit per month)
		const TIER_RATES = {
			standard: 100,
			professional: 300
		}

		// Calculate date ranges for "this month" and "last month"
		const now = new Date()
		const thisMonthStart = new Date( now.getFullYear(), now.getMonth(), 1 ).toISOString()

		const [mansionsRes, mansionsThisMonthRes, usersRes, usersThisMonthRes, maintenanceRes] = await Promise.all( [
			this.supabase.from( 'mansions' ).select( 'id, total_units, subscription_tier, created_at', { count: 'exact' } ),
			this.supabase.from( 'mansions' ).select( 'id', { count: 'exact' } ).gte( 'created_at', thisMonthStart ),
			this.supabase.from( 'profiles' ).select( 'id, role, created_at', { count: 'exact' } ),
			this.supabase.from( 'profiles' ).select( 'id, role', { count: 'exact' } ).eq( 'role', 'resident' ).gte( 'created_at', thisMonthStart ),
			this.supabase.from( 'maintenance_requests' ).select( 'id, status, priority', { count: 'exact' } )
		] )

		const mansions = mansionsRes.data || []
		const users = usersRes.data || []
		const maintenance = maintenanceRes.data || []

		// Calculate platform revenue based on subscription tiers
		// Revenue = SUM(building.total_units × tier_rate) for all buildings
		const platformRevenue = mansions.reduce( ( total, m ) => {
			const tier = m.subscription_tier || 'standard'
			const rate = TIER_RATES[tier] || TIER_RATES.standard
			return total + ( m.total_units || 0 ) * rate
		}, 0 )

		// Calculate revenue by tier for breakdown
		const revenueByTier = mansions.reduce( ( acc, m ) => {
			const tier = m.subscription_tier || 'standard'
			const rate = TIER_RATES[tier] || TIER_RATES.standard
			const revenue = ( m.total_units || 0 ) * rate
			acc[tier] = ( acc[tier] || 0 ) + revenue
			return acc
		}, {} )

		// Calculate last month's revenue (buildings that existed before this month)
		const mansionsLastMonth = mansions.filter( m =>
			new Date( m.created_at ) < new Date( thisMonthStart )
		)
		const platformRevenueLastMonth = mansionsLastMonth.reduce( ( total, m ) => {
			const tier = m.subscription_tier || 'standard'
			const rate = TIER_RATES[tier] || TIER_RATES.standard
			return total + ( m.total_units || 0 ) * rate
		}, 0 )

		// Calculate percent change from last month
		const percentChange = platformRevenueLastMonth > 0
			? Math.round( ( ( platformRevenue - platformRevenueLastMonth ) / platformRevenueLastMonth ) * 100 )
			: ( platformRevenue > 0 ? 100 : 0 )

		// Count buildings by tier
		const buildingsByTier = {
			standard: mansions.filter( m => ( m.subscription_tier || 'standard' ) === 'standard' ).length,
			professional: mansions.filter( m => m.subscription_tier === 'professional' ).length
		}

		return this.createResponse( {
			buildings: {
				total: mansionsRes.count || 0,
				thisMonth: mansionsThisMonthRes.count || 0,
				byTier: buildingsByTier
			},
			users: {
				total: usersRes.count || 0,
				residents: users.filter( u => u.role === 'resident' ).length,
				admins: users.filter( u => ['admin', 'mansion_admin', 'manager'].includes( u.role ) ).length,
				residentsThisMonth: usersThisMonthRes.count || 0
			},
			maintenance: {
				total: maintenanceRes.count || 0,
				pending: maintenance.filter( m => m.status === 'pending' ).length,
				inProgress: maintenance.filter( m => m.status === 'in_progress' ).length,
				completed: maintenance.filter( m => m.status === 'completed' ).length,
				urgent: maintenance.filter( m => m.priority === 'urgent' ).length
			},
			revenue: {
				total: platformRevenue,
				byTier: revenueByTier,
				totalUnits: mansions.reduce( ( sum, m ) => sum + ( m.total_units || 0 ), 0 ),
				thisMonth: platformRevenue,
				lastMonth: platformRevenueLastMonth,
				percentChange
			}
		} )
	}

	// ==========================================
	// PROFILE HELPERS
	// ==========================================

	_mapProfile( profile, authUser ) {
		if ( !profile ) return null
		return {
			id: profile.id,
			email: profile.email || authUser?.email,
			name: profile.name,
			phone: profile.phone,
			unit: profile.unit,
			mansionId: profile.mansion_id,
			mansionName: profile.mansion_name || null,
			avatar: profile.avatar,
			role: profile.role,
			permissions: profile.permissions || [],
			settings: profile.settings || {},
			metadata: {
				...( profile.metadata || {} ),
				lastLogin: Date.now(),
				created: profile.created_at
			}
		}
	}

	async _getProfile( userId ) {
		const { data, error } = await this.supabase
			.from( 'profiles' )
			.select( '*, mansions(name)' )
			.eq( 'id', userId )
			.single()

		if ( error || !data ) {
			// Profile doesn't exist yet - create it from auth user + invitation metadata
			const { data: { user } } = await this.supabase.auth.getUser()
			if ( !user ) return null

			// Read invitation data from user_metadata (set during invite)
			const metadata = user.user_metadata || {}

			const newProfile = {
				id: user.id,
				email: user.email,
				name: metadata.name || user.email.split( '@' )[0],
				role: metadata.role || 'resident',
				mansion_id: metadata.mansion_id || null,
				unit: metadata.unit || null
			}

			const { data: created } = await this.supabase
				.from( 'profiles' )
				.upsert( newProfile )
				.select( '*, mansions(name)' )
				.single()

			// Flatten mansion name for created profile
			if ( created?.mansions ) {
				created.mansion_name = created.mansions.name
				delete created.mansions
			}

			return created || newProfile
		}

		// Flatten mansion name
		if ( data.mansions ) {
			data.mansion_name = data.mansions.name
			delete data.mansions
		}
		return data
	}

	// ==========================================
	// GENERIC QUERY (matches Backend.js query)
	// ==========================================

	async query( resource, options = {} ) {
		const tableName = this._getTableName( resource )
		let query = this.supabase.from( tableName ).select( '*', { count: 'exact' } )

		// Apply filters
		if ( options.filter ) {
			Object.entries( options.filter ).forEach( ( [key, value] ) => {
				const column = this._toSnakeCase( key )
				if ( Array.isArray( value ) ) {
					query = query.in( column, value )
				} else if ( typeof value === 'object' && value !== null && value.min !== undefined ) {
					query = query.gte( column, value.min ).lte( column, value.max )
				} else {
					query = query.eq( column, value )
				}
			} )
		}

		// Apply search
		if ( options.search ) {
			query = query.or(
				`title.ilike.%${options.search}%,description.ilike.%${options.search}%`
			)
		}

		// Apply sorting
		if ( options.sort ) {
			const desc = options.sort.startsWith( '-' )
			const field = this._toSnakeCase( options.sort.replace( /^-/, '' ) )
			query = query.order( field, { ascending: !desc } )
		} else {
			query = query.order( 'created_at', { ascending: false } )
		}

		// Apply pagination
		const page = options.page || 1
		const limit = options.limit || 20
		const start = ( page - 1 ) * limit
		query = query.range( start, start + limit - 1 )

		const { data, error, count } = await query

		if ( error ) throw this.createError( error.message, 500 )

		const mapped = ( data || [] ).map( item => this._mapItem( resource, item ) )

		return this.createResponse( mapped, {
			page,
			limit,
			total: count || 0,
			totalPages: Math.ceil( ( count || 0 ) / limit )
		} )
	}

	// ==========================================
	// CRUD OPERATIONS
	// ==========================================

	async get( resource, id ) {
		const tableName = this._getTableName( resource )
		const { data, error } = await this.supabase
			.from( tableName )
			.select( '*' )
			.eq( 'id', id )
			.single()

		if ( error ) throw this.createError( `${resource} not found`, 404 )

		return this.createResponse( this._mapItem( resource, data ) )
	}

	async create( resource, payload ) {
		const tableName = this._getTableName( resource )
		const { data: { user } } = await this.supabase.auth.getUser()

		const dbPayload = this._mapToDb( resource, payload, user )

		const { data, error } = await this.supabase
			.from( tableName )
			.insert( dbPayload )
			.select()
			.single()

		if ( error ) throw this.createError( error.message, 400 )

		this.emit( `${resource}.created`, data )
		return this.createResponse( this._mapItem( resource, data ) )
	}

	async update( resource, id, payload ) {
		const tableName = this._getTableName( resource )
		const dbPayload = this._mapToDb( resource, payload )

		const { data, error } = await this.supabase
			.from( tableName )
			.update( dbPayload )
			.eq( 'id', id )
			.select()
			.single()

		if ( error ) throw this.createError( error.message, 400 )

		this.emit( `${resource}.updated`, data )
		return this.createResponse( this._mapItem( resource, data ) )
	}

	async delete( resource, id ) {
		const tableName = this._getTableName( resource )
		const { error } = await this.supabase
			.from( tableName )
			.delete()
			.eq( 'id', id )

		if ( error ) throw this.createError( error.message, 400 )

		this.emit( `${resource}.deleted`, { id } )
		return this.createResponse( { message: 'Deleted successfully', id } )
	}

	// ==========================================
	// CHAINABLE RESOURCE HELPERS
	// ==========================================

	facilities() { return this._createResourceHelper( 'facilities' ) }
	bookings() { return this._createResourceHelper( 'bookings' ) }
	maintenance() { return this._createResourceHelper( 'maintenance' ) }
	bills() { return this._createResourceHelper( 'bills' ) }
	users() { return this._createResourceHelper( 'users' ) }
	documents() { return this._createResourceHelper( 'documents' ) }
	announcements() { return this._createResourceHelper( 'announcements' ) }

	_createResourceHelper( resource ) {
		const self = this
		const helper = {
			_resource: resource,
			_filters: {},
			_sort: null,
			_page: 1,
			_limit: 20,
			_search: null,

			where( field, value ) {
				helper._filters[field] = value
				return helper
			},

			search( query ) {
				helper._search = query
				return helper
			},

			sort( field ) {
				helper._sort = field
				return helper
			},

			include() {
				// Relations handled via Supabase select joins when needed
				return helper
			},

			paginate( page, limit ) {
				helper._page = page
				helper._limit = limit
				return helper
			},

			async get( id ) {
				if ( id ) return await self.get( resource, id )
				return await self.query( resource, {
					filter: helper._filters,
					sort: helper._sort,
					page: helper._page,
					limit: helper._limit,
					search: helper._search
				} )
			},

			async create( data ) {
				return await self.create( resource, data )
			},

			async update( id, data ) {
				return await self.update( resource, id, data )
			},

			async delete( id ) {
				return await self.delete( resource, id )
			}
		}

		return helper
	}

	// ==========================================
	// SPECIALIZED ENDPOINTS
	// ==========================================

	async getDashboard() {
		const { data: { user } } = await this.supabase.auth.getUser()
		if ( !user ) throw this.createError( 'Not authenticated', 401 )

		const profile = await this._getProfile( user.id )
		const mansionId = profile.mansion_id
		const isManager = ['admin', 'manager', 'mansion_admin'].includes( profile.role )
		const now = new Date().toISOString()

		// Build queries based on role
		let bookingsQuery = this.supabase.from( 'bookings' ).select( '*', { count: 'exact' } )
		let maintenanceQuery = this.supabase.from( 'maintenance_requests' ).select( '*', { count: 'exact' } )
		let billsQuery = this.supabase.from( 'bills' ).select( '*', { count: 'exact' } )

		if ( !isManager ) {
			bookingsQuery = bookingsQuery.eq( 'creator_id', user.id )
			maintenanceQuery = maintenanceQuery.eq( 'creator_id', user.id )
			billsQuery = billsQuery.eq( 'assignee_id', user.id )
		} else {
			bookingsQuery = bookingsQuery.eq( 'mansion_id', mansionId )
			maintenanceQuery = maintenanceQuery.eq( 'mansion_id', mansionId )
			billsQuery = billsQuery.eq( 'mansion_id', mansionId )
		}

		const announcementsQuery = this.supabase
			.from( 'announcements' )
			.select( '*' )
			.eq( 'mansion_id', mansionId )
			.eq( 'status', 'active' )
			.or( `expires_at.is.null,expires_at.gt.${now}` )

		const [bookingsRes, maintenanceRes, billsRes, announcementsRes] = await Promise.all( [
			bookingsQuery,
			maintenanceQuery,
			billsQuery,
			announcementsQuery
		] )

		const bookings = bookingsRes.data || []
		const maintenance = maintenanceRes.data || []
		const bills = billsRes.data || []
		const announcements = announcementsRes.data || []

		return this.createResponse( {
			stats: {
				bookings: {
					total: bookings.length,
					upcoming: bookings.filter( b => b.start_date > now ).length,
					active: bookings.filter( b => b.status === 'confirmed' ).length
				},
				maintenance: {
					total: maintenance.length,
					pending: maintenance.filter( m => m.status === 'pending' ).length,
					inProgress: maintenance.filter( m => m.status === 'in_progress' ).length
				},
				bills: {
					total: bills.length,
					unpaid: bills.filter( b => b.status === 'pending' ).length,
					totalAmount: bills
						.filter( b => b.status === 'pending' )
						.reduce( ( sum, b ) => sum + Number( b.amount || 0 ), 0 )
				}
			},
			recentActivity: [
				...bookings.slice( 0, 3 ).map( b => ( { ...this._mapItem( 'bookings', b ), activityType: 'booking' } ) ),
				...maintenance.slice( 0, 3 ).map( m => ( { ...this._mapItem( 'maintenance', m ), activityType: 'maintenance' } ) ),
				...bills.slice( 0, 3 ).map( b => ( { ...this._mapItem( 'bills', b ), activityType: 'bill' } ) )
			]
				.sort( ( a, b ) => new Date( b.dates.created ) - new Date( a.dates.created ) )
				.slice( 0, 5 ),
			announcements: announcements.map( a => this._mapItem( 'announcements', a ) )
		} )
	}

	async getAnalytics( metric ) {
		const { data: { user } } = await this.supabase.auth.getUser()
		if ( !user ) throw this.createError( 'Not authenticated', 401 )

		const profile = await this._getProfile( user.id )
		if ( !['admin', 'manager', 'mansion_admin'].includes( profile.role ) ) {
			throw this.createError( 'Unauthorized', 403 )
		}

		const mansionId = profile.mansion_id

		// Fetch real data for analytics
		const [maintenanceRes, billsRes, bookingsRes] = await Promise.all( [
			this.supabase.from( 'maintenance_requests' ).select( 'status, category, created_at, completed_at' ).eq( 'mansion_id', mansionId ),
			this.supabase.from( 'bills' ).select( 'amount, status, created_at, paid_at' ).eq( 'mansion_id', mansionId ),
			this.supabase.from( 'bookings' ).select( 'facility_id, status, start_date, created_at' ).eq( 'mansion_id', mansionId )
		] )

		const maintenanceData = maintenanceRes.data || []
		const billsData = billsRes.data || []
		const bookingsData = bookingsRes.data || []

		const metrics = {
			occupancy: {
				current: 85,
				trend: this._generateTrend( bookingsData, 'created_at', 30 ),
				breakdown: {}
			},
			revenue: {
				current: billsData.filter( b => b.status === 'paid' ).reduce( ( s, b ) => s + Number( b.amount ), 0 ),
				trend: this._generateTrend( billsData.filter( b => b.status === 'paid' ), 'paid_at', 30 ),
				breakdown: {}
			},
			maintenance: {
				avgResponseTime: this._calcAvgResponseTime( maintenanceData ),
				completionRate: maintenanceData.length > 0
					? Math.round( maintenanceData.filter( m => m.status === 'completed' ).length / maintenanceData.length * 100 )
					: 0,
				trend: this._generateTrend( maintenanceData, 'created_at', 30 ),
				byCategory: this._countByField( maintenanceData, 'category' )
			},
			satisfaction: {
				overall: 4.2,
				trend: [],
				categories: {}
			}
		}

		return this.createResponse( metrics[metric] || metrics )
	}

	async checkAvailability( facilityId, startDate, endDate ) {
		const start = new Date( startDate ).toISOString()
		const end = new Date( endDate ).toISOString()

		const { data, error } = await this.supabase
			.from( 'bookings' )
			.select( 'id, start_date, end_date, creator_id' )
			.eq( 'facility_id', facilityId )
			.neq( 'status', 'cancelled' )
			.lt( 'start_date', end )
			.gt( 'end_date', start )

		if ( error ) throw this.createError( error.message, 500 )

		return this.createResponse( {
			available: ( data || [] ).length === 0,
			conflicts: ( data || [] ).map( c => ( {
				id: c.id,
				start: c.start_date,
				end: c.end_date
			} ) )
		} )
	}

	async getNotifications() {
		const { data: { user } } = await this.supabase.auth.getUser()
		if ( !user ) throw this.createError( 'Not authenticated', 401 )

		const { data, error } = await this.supabase
			.from( 'notifications' )
			.select( '*' )
			.eq( 'user_id', user.id )
			.order( 'created_at', { ascending: false } )
			.limit( 20 )

		if ( error ) throw this.createError( error.message, 500 )

		return this.createResponse( ( data || [] ).map( n => ( {
			id: n.id,
			type: n.type,
			title: n.title,
			message: n.message,
			read: n.read,
			createdAt: n.created_at,
			data: n.data
		} ) ) )
	}

	async markNotificationRead( notificationId ) {
		const { error } = await this.supabase
			.from( 'notifications' )
			.update( { read: true } )
			.eq( 'id', notificationId )

		if ( error ) throw this.createError( error.message, 500 )
		return this.createResponse( { success: true } )
	}

	async uploadFile( file, category = 'general' ) {
		const fileName = `${category}/${Date.now()}_${file.name}`
		const { error } = await this.supabase.storage
			.from( 'kagi-files' )
			.upload( fileName, file )

		if ( error ) throw this.createError( 'Upload failed', 500 )

		const { data: { publicUrl } } = this.supabase.storage
			.from( 'kagi-files' )
			.getPublicUrl( fileName )

		return this.createResponse( {
			id: `file_${Date.now()}`,
			name: file.name,
			size: file.size,
			type: file.type,
			category,
			url: publicUrl,
			uploadedAt: Date.now()
		} )
	}

	async exportData( resource, format = 'json' ) {
		const result = await this.query( resource, { limit: 10000 } )
		const items = result.data || []

		if ( format === 'csv' ) {
			if ( items.length === 0 ) {
				return this.createResponse( { format: 'csv', data: '', filename: `${resource}_export.csv` } )
			}
			const headers = Object.keys( items[0] ).join( ',' )
			const rows = items.map( item =>
				Object.values( item ).map( v => typeof v === 'object' ? JSON.stringify( v ) : v ).join( ',' )
			)
			return this.createResponse( {
				format: 'csv',
				data: [headers, ...rows].join( '\n' ),
				filename: `${resource}_export_${Date.now()}.csv`
			} )
		}

		return this.createResponse( {
			format: 'json',
			data: items,
			filename: `${resource}_export_${Date.now()}.json`
		} )
	}

	async batch( operations ) {
		const results = await Promise.allSettled(
			operations.map( async op => {
				const [resource, id] = op.url.replace( '/api/v1/', '' ).split( '/' )
				switch ( op.method ) {
					case 'GET': return id ? await this.get( resource, id ) : await this.query( resource, op.params )
					case 'POST': return await this.create( resource, op.data )
					case 'PATCH': return await this.update( resource, id, op.data )
					case 'DELETE': return await this.delete( resource, id )
					default: throw this.createError( `Method ${op.method} not supported` )
				}
			} )
		)

		return this.createResponse(
			results.map( r => r.status === 'fulfilled'
				? { success: true, ...r.value }
				: { success: false, error: r.reason }
			)
		)
	}

	// ==========================================
	// EVENT SYSTEM (matches Backend.js)
	// ==========================================

	subscribe( event, callback ) {
		if ( !this.subscribers.has( event ) ) {
			this.subscribers.set( event, [] )
		}
		this.subscribers.get( event ).push( callback )

		return () => {
			const callbacks = this.subscribers.get( event )
			const index = callbacks.indexOf( callback )
			if ( index > -1 ) callbacks.splice( index, 1 )
		}
	}

	emit( event, data ) {
		const callbacks = this.subscribers.get( event )
		if ( callbacks ) callbacks.forEach( cb => cb( data ) )

		const wildcardCallbacks = this.subscribers.get( '*' )
		if ( wildcardCallbacks ) wildcardCallbacks.forEach( cb => cb( { event, data } ) )
	}

	// ==========================================
	// UTILITY / MAPPING METHODS
	// ==========================================

	_getTableName( resource ) {
		const map = {
			users: 'profiles',
			maintenance: 'maintenance_requests'
		}
		return map[resource] || resource
	}

	_toSnakeCase( str ) {
		return str.replace( /[A-Z]/g, letter => `_${letter.toLowerCase()}` )
	}

	_toCamelCase( str ) {
		return str.replace( /_([a-z])/g, ( _, letter ) => letter.toUpperCase() )
	}

	_mapItem( resource, item ) {
		if ( !item ) return null
		const mapped = {}
		Object.entries( item ).forEach( ( [key, value] ) => {
			mapped[this._toCamelCase( key )] = value
		} )

		// Construct the dates object for frontend compatibility
		mapped.dates = {
			created: item.created_at,
			updated: item.updated_at,
			start: item.start_date || undefined,
			end: item.end_date || undefined,
			due: item.due_date || undefined,
			completed: item.completed_at || item.paid_at || undefined
		}

		return mapped
	}

	_mapToDb( resource, payload, user = null ) {
		const dbPayload = {}

		Object.entries( payload ).forEach( ( [key, value] ) => {
			// Skip nested objects that are mapped separately
			if ( ['dates', 'creator', 'facility', 'assignee'].includes( key ) ) return
			dbPayload[this._toSnakeCase( key )] = value
		} )

		// Map dates object if present
		if ( payload.dates ) {
			if ( payload.dates.start ) dbPayload.start_date = new Date( payload.dates.start ).toISOString()
			if ( payload.dates.end ) dbPayload.end_date = new Date( payload.dates.end ).toISOString()
			if ( payload.dates.due ) dbPayload.due_date = new Date( payload.dates.due ).toISOString()
		}

		// Set creator_id from current auth user
		if ( user && !dbPayload.creator_id ) {
			dbPayload.creator_id = user.id
		}

		// Set mansion_id from user profile if not provided
		if ( user && !dbPayload.mansion_id ) {
			// RLS will enforce this, but we set it explicitly for clarity
			// The caller should ensure mansion_id is set
		}

		// Remove undefined values
		Object.keys( dbPayload ).forEach( key => {
			if ( dbPayload[key] === undefined ) delete dbPayload[key]
		} )

		return dbPayload
	}

	// Analytics helpers
	_generateTrend( data, dateField, days ) {
		const trend = []
		const now = Date.now()
		for ( let i = days; i >= 0; i-- ) {
			const dayStart = new Date( now - i * 24 * 60 * 60 * 1000 )
			dayStart.setHours( 0, 0, 0, 0 )
			const dayEnd = new Date( dayStart )
			dayEnd.setHours( 23, 59, 59, 999 )

			const count = data.filter( item => {
				const d = new Date( item[dateField] )
				return d >= dayStart && d <= dayEnd
			} ).length

			trend.push( {
				date: dayStart.toISOString().split( 'T' )[0],
				value: count
			} )
		}
		return trend
	}

	_calcAvgResponseTime( maintenance ) {
		const completed = maintenance.filter( m => m.completed_at && m.created_at )
		if ( completed.length === 0 ) return 0
		const totalHours = completed.reduce( ( sum, m ) => {
			return sum + ( new Date( m.completed_at ) - new Date( m.created_at ) ) / ( 1000 * 60 * 60 )
		}, 0 )
		return Math.round( totalHours / completed.length )
	}

	_countByField( data, field ) {
		return data.reduce( ( acc, item ) => {
			const key = item[field] || 'other'
			acc[key] = ( acc[key] || 0 ) + 1
			return acc
		}, {} )
	}

	// API compatibility
	reset() {
		this.cache.clear()
		return this.createResponse( { message: 'Cache cleared' } )
	}
}

// Create singleton
const backend = new SupabaseBackend()
export { backend as default, SupabaseBackend }
