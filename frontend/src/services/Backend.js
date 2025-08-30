/**
 * Modern Mock Backend Service
 * A clean, REST-compliant API mock for development
 */

class Backend {
	constructor( options = {} ) {
		this.config = {
			delay: options.delay || 200,
			errorRate: options.errorRate || 0,
			persist: options.persist !== false,
			seed: options.seed || 'kagi-dev',
			baseURL: options.baseURL || '/api/v1',
			debug: options.debug || false
		}

		this.cache = new Map()
		this.subscribers = new Map()
		this.storage = this.config.persist ? localStorage : new Map()

		// Initialize mock data
		this.initializeData()

		// Bind methods
		this.auth = this.auth.bind( this )
		this.query = this.query.bind( this )
		this.subscribe = this.subscribe.bind( this )
		this.emit = this.emit.bind( this )
	}

	// Initialize mock data
	initializeData() {
		if ( !this.getStoredData( 'initialized' ) ) {
			this.seedDatabase()
			this.setStoredData( 'initialized', true )
		}
	}

	// Seed database with initial data
	seedDatabase() {
		const now = Date.now()

		// Users
		const users = [
			{
				id: 'usr_admin_001',
				email: 'admin@kagi.com',
				profile: {
					name: 'Admin User',
					avatar: 'https://i.pravatar.cc/150?u=admin',
					phone: '+81-3-1234-5678'
				},
				role: 'admin',
				permissions: ['*'],
				settings: { theme: 'dark', language: 'en', notifications: true },
				metadata: { lastLogin: now, created: now - 30 * 24 * 60 * 60 * 1000 }
			},
			{
				id: 'usr_manager_001',
				email: 'manager@dresser.com',
				profile: {
					name: 'Tanaka Hiroshi',
					avatar: 'https://i.pravatar.cc/150?u=manager',
					phone: '+81-3-2345-6789',
					unit: 'Office'
				},
				role: 'manager',
				permissions: ['manage_residents', 'manage_facilities', 'view_analytics'],
				settings: { theme: 'light', language: 'ja', notifications: true },
				metadata: { lastLogin: now - 3600000, created: now - 60 * 24 * 60 * 60 * 1000 }
			},
			{
				id: 'usr_resident_001',
				email: 'john.doe@example.com',
				profile: {
					name: 'John Doe',
					avatar: 'https://i.pravatar.cc/150?u=john',
					phone: '+81-90-1234-5678',
					unit: 'A-501'
				},
				role: 'resident',
				permissions: ['view_bills', 'book_facilities', 'submit_maintenance'],
				settings: { theme: 'light', language: 'en', notifications: true },
				metadata: { lastLogin: now - 7200000, created: now - 90 * 24 * 60 * 60 * 1000 }
			},
			{
				id: 'usr_resident_002',
				email: 'yuki.tanaka@example.jp',
				profile: {
					name: '田中 由紀',
					avatar: 'https://i.pravatar.cc/150?u=yuki',
					phone: '+81-80-9876-5432',
					unit: 'B-302'
				},
				role: 'resident',
				permissions: ['view_bills', 'book_facilities', 'submit_maintenance'],
				settings: { theme: 'auto', language: 'ja', notifications: false },
				metadata: { lastLogin: now - 86400000, created: now - 120 * 24 * 60 * 60 * 1000 }
			}
		]

		// Facilities
		const facilities = [
			{
				id: 'fac_gym_001',
				type: 'facility',
				title: 'Fitness Center',
				description: 'Fully equipped gym with modern equipment',
				status: 'active',
				category: 'amenity',
				images: ['https://picsum.photos/800/600?random=gym'],
				capacity: 20,
				rules: ['No loud music', 'Clean equipment after use', 'Wear appropriate attire'],
				hours: { open: '06:00', close: '22:00' },
				pricing: { hourly: 0, deposit: 0 },
				metadata: {
					equipment: ['Treadmills', 'Weights', 'Yoga mats'],
					lastMaintenance: now - 7 * 24 * 60 * 60 * 1000
				}
			},
			{
				id: 'fac_pool_001',
				type: 'facility',
				title: 'Swimming Pool',
				description: '25m heated indoor pool',
				status: 'active',
				category: 'amenity',
				images: ['https://picsum.photos/800/600?random=pool'],
				capacity: 30,
				rules: ['Shower before entering', 'No diving', 'Children must be supervised'],
				hours: { open: '07:00', close: '21:00' },
				pricing: { hourly: 500, deposit: 0 },
				metadata: {
					temperature: 28,
					depth: { shallow: 1.2, deep: 2.0 },
					lastCleaning: now - 24 * 60 * 60 * 1000
				}
			},
			{
				id: 'fac_meeting_001',
				type: 'facility',
				title: 'Conference Room A',
				description: 'Meeting room with projector and whiteboard',
				status: 'active',
				category: 'business',
				images: ['https://picsum.photos/800/600?random=meeting'],
				capacity: 12,
				rules: ['Book in advance', 'Clean after use'],
				hours: { open: '08:00', close: '20:00' },
				pricing: { hourly: 1000, deposit: 0 },
				metadata: {
					equipment: ['Projector', 'Whiteboard', 'Conference phone', 'WiFi'],
					lastBooked: now - 3 * 60 * 60 * 1000
				}
			},
			{
				id: 'fac_party_001',
				type: 'facility',
				title: 'Party Room',
				description: 'Spacious room for events and celebrations',
				status: 'active',
				category: 'event',
				images: ['https://picsum.photos/800/600?random=party'],
				capacity: 50,
				rules: ['No loud music after 22:00', 'Clean up required', 'Deposit required'],
				hours: { open: '10:00', close: '23:00' },
				pricing: { hourly: 3000, deposit: 10000 },
				metadata: {
					features: ['Kitchen', 'Sound system', 'Tables', 'Chairs'],
					popularDays: ['Friday', 'Saturday', 'Sunday']
				}
			}
		]

		// Bookings
		const bookings = [
			{
				id: 'book_001',
				type: 'booking',
				title: 'Gym Session',
				description: 'Morning workout',
				status: 'confirmed',
				priority: 'medium',
				tags: ['fitness', 'recurring'],
				facility: facilities[0],
				creator: users[2],
				dates: {
					created: now - 2 * 24 * 60 * 60 * 1000,
					updated: now - 2 * 24 * 60 * 60 * 1000,
					start: now + 24 * 60 * 60 * 1000,
					end: now + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000
				},
				metadata: {
					recurring: 'weekly',
					participants: 1,
					notes: 'Regular morning session'
				}
			},
			{
				id: 'book_002',
				type: 'booking',
				title: 'Pool Reservation',
				description: 'Swimming lessons',
				status: 'confirmed',
				priority: 'high',
				tags: ['pool', 'lessons'],
				facility: facilities[1],
				creator: users[3],
				dates: {
					created: now - 5 * 24 * 60 * 60 * 1000,
					updated: now - 5 * 24 * 60 * 60 * 1000,
					start: now + 3 * 24 * 60 * 60 * 1000,
					end: now + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000
				},
				metadata: {
					instructor: 'Yamada-san',
					participants: 3,
					level: 'beginner'
				}
			}
		]

		// Maintenance Requests
		const maintenance = [
			{
				id: 'maint_001',
				type: 'maintenance',
				title: 'Leaking Faucet',
				description: 'Kitchen faucet is dripping constantly',
				status: 'pending',
				priority: 'high',
				tags: ['plumbing', 'kitchen'],
				assignee: null,
				creator: users[2],
				dates: {
					created: now - 24 * 60 * 60 * 1000,
					updated: now - 20 * 60 * 60 * 1000,
					due: now + 2 * 24 * 60 * 60 * 1000
				},
				metadata: {
					location: 'A-501',
					category: 'plumbing',
					images: ['https://picsum.photos/400/300?random=faucet'],
					estimatedCost: 5000
				}
			},
			{
				id: 'maint_002',
				type: 'maintenance',
				title: 'AC Not Working',
				description: 'Air conditioner not cooling properly',
				status: 'in_progress',
				priority: 'urgent',
				tags: ['hvac', 'urgent'],
				assignee: { id: 'tech_001', name: 'Sato Takeshi', avatar: 'https://i.pravatar.cc/150?u=tech' },
				creator: users[3],
				dates: {
					created: now - 3 * 24 * 60 * 60 * 1000,
					updated: now - 6 * 60 * 60 * 1000,
					due: now + 24 * 60 * 60 * 1000
				},
				metadata: {
					location: 'B-302',
					category: 'hvac',
					notes: 'Technician scheduled for tomorrow',
					estimatedCost: 15000
				}
			}
		]

		// Bills
		const bills = [
			{
				id: 'bill_001',
				type: 'bill',
				title: 'Monthly Rent - December 2024',
				description: 'Monthly rent and utilities',
				status: 'pending',
				priority: 'high',
				tags: ['rent', 'monthly'],
				assignee: users[2],
				creator: users[1],
				dates: {
					created: now - 5 * 24 * 60 * 60 * 1000,
					updated: now - 5 * 24 * 60 * 60 * 1000,
					due: now + 10 * 24 * 60 * 60 * 1000
				},
				metadata: {
					amount: 120000,
					currency: 'JPY',
					breakdown: {
						rent: 100000,
						utilities: 15000,
						internet: 5000
					},
					paymentMethods: ['bank_transfer', 'credit_card']
				}
			},
			{
				id: 'bill_002',
				type: 'bill',
				title: 'Parking Fee - December 2024',
				description: 'Monthly parking space rental',
				status: 'paid',
				priority: 'medium',
				tags: ['parking', 'monthly'],
				assignee: users[3],
				creator: users[1],
				dates: {
					created: now - 10 * 24 * 60 * 60 * 1000,
					updated: now - 2 * 24 * 60 * 60 * 1000,
					due: now - 2 * 24 * 60 * 60 * 1000,
					completed: now - 2 * 24 * 60 * 60 * 1000
				},
				metadata: {
					amount: 15000,
					currency: 'JPY',
					parkingSpot: 'B-12',
					paymentMethod: 'credit_card',
					transactionId: 'TXN123456789'
				}
			}
		]

		// Documents
		const documents = [
			{
				id: 'doc_001',
				type: 'document',
				title: 'House Rules & Regulations',
				description: 'Complete building rules and regulations',
				status: 'active',
				category: 'rules',
				tags: ['important', 'rules'],
				creator: users[1],
				dates: {
					created: now - 180 * 24 * 60 * 60 * 1000,
					updated: now - 30 * 24 * 60 * 60 * 1000
				},
				metadata: {
					fileType: 'pdf',
					fileSize: '2.3 MB',
					pages: 24,
					url: '/documents/house-rules.pdf',
					version: '2.1'
				}
			},
			{
				id: 'doc_002',
				type: 'document',
				title: 'Emergency Procedures',
				description: 'Emergency evacuation and safety procedures',
				status: 'active',
				category: 'safety',
				tags: ['emergency', 'important'],
				creator: users[1],
				dates: {
					created: now - 90 * 24 * 60 * 60 * 1000,
					updated: now - 7 * 24 * 60 * 60 * 1000
				},
				metadata: {
					fileType: 'pdf',
					fileSize: '1.1 MB',
					pages: 8,
					url: '/documents/emergency-procedures.pdf',
					languages: ['en', 'ja']
				}
			}
		]

		// Announcements
		const announcements = [
			{
				id: 'ann_001',
				type: 'announcement',
				title: 'Elevator Maintenance Notice',
				description: 'The main elevator will be under maintenance on December 15th from 9:00 to 17:00',
				status: 'active',
				priority: 'high',
				tags: ['maintenance', 'elevator'],
				creator: users[1],
				dates: {
					created: now - 2 * 24 * 60 * 60 * 1000,
					updated: now - 2 * 24 * 60 * 60 * 1000,
					expires: now + 5 * 24 * 60 * 60 * 1000
				},
				metadata: {
					affectedFloors: ['all'],
					alternativeRoute: 'Please use the emergency stairs or secondary elevator'
				}
			}
		]

		// Store all data
		this.setStoredData( 'users', users )
		this.setStoredData( 'facilities', facilities )
		this.setStoredData( 'bookings', bookings )
		this.setStoredData( 'maintenance', maintenance )
		this.setStoredData( 'bills', bills )
		this.setStoredData( 'documents', documents )
		this.setStoredData( 'announcements', announcements )
		this.setStoredData( 'currentUser', null )
		this.setStoredData( 'token', null )
	}

	// Storage helpers
	getStoredData( key ) {
		if ( this.config.persist ) {
			const data = localStorage.getItem( `kagi_mock_${key}` )
			return data ? JSON.parse( data ) : null
		}
		return this.storage.get( key )
	}

	setStoredData( key, value ) {
		if ( this.config.persist ) {
			localStorage.setItem( `kagi_mock_${key}`, JSON.stringify( value ) )
		} else {
			this.storage.set( key, value )
		}
	}

	// Simulate network delay
	async delay() {
		const ms = this.config.delay + Math.random() * 100
		return new Promise( resolve => setTimeout( resolve, ms ) )
	}

	// Simulate random errors
	shouldError() {
		return Math.random() < this.config.errorRate
	}

	// Generate response
	createResponse( data, meta = {} ) {
		return {
			success: true,
			data,
			meta: {
				timestamp: Date.now(),
				...meta
			},
			error: null
		}
	}

	// Generate error response
	createError( message, code = 400 ) {
		return {
			success: false,
			data: null,
			meta: { timestamp: Date.now() },
			error: { message, code }
		}
	}

	// Authentication methods
	async auth() {
		return {
			login: async ( email, password ) => {
				await this.delay()

				if ( this.shouldError() ) {
					throw this.createError( 'Network error', 500 )
				}

				const users = this.getStoredData( 'users' ) || []
				let user = users.find( u => u.email === email )

				// In mock mode, create user if doesn't exist
				if ( !user ) {
					// Determine role based on email
					let role = 'mansion_admin'  // Default to mansion_admin for most users
					
					// Special cases for role assignment
					if ( email === 'admin' || email === 'admin@kagi.com' ) {
						role = 'admin'  // Only exact "admin" gets admin role
					} else if ( email === 'makio' || email.includes( 'makio' ) ) {
						role = 'admin'  // Makio also gets admin role (for resident login)
					} else if ( email.includes( 'resident' ) ) {
						role = 'resident'  // Emails with "resident" get resident role
					} else if ( email.includes( 'manager' ) ) {
						role = 'manager'  // Emails with "manager" get manager role
					}
					// All other emails get mansion_admin role by default

					// Create new user
					user = {
						id: `usr_${Date.now()}`,
						email: email,
						profile: {
							name: email.split( '@' )[0].replace( /[._-]/g, ' ' ),
							avatar: `https://i.pravatar.cc/150?u=${email}`,
							phone: '+81-90-0000-0000',
							unit: role === 'resident' ? `${String.fromCharCode( 65 + Math.floor( Math.random() * 5 ) )}-${Math.floor( Math.random() * 900 ) + 100}` : 'Office'
						},
						role: role,
						permissions: role === 'admin' ? ['*'] :
							role === 'manager' ? ['manage_residents', 'manage_facilities', 'view_analytics'] :
								['view_bills', 'book_facilities', 'submit_maintenance'],
						settings: { theme: 'light', language: 'en', notifications: true },
						metadata: { lastLogin: Date.now(), created: Date.now() }
					}

					// Add to users list
					users.push( user )
					this.setStoredData( 'users', users )
				}

				// Generate token
				const token = btoa( JSON.stringify( {
					userId: user.id,
					email: user.email,
					role: user.role,
					exp: Date.now() + 24 * 60 * 60 * 1000
				} ) )

				this.setStoredData( 'currentUser', user )
				this.setStoredData( 'token', token )

				// Update last login
				user.metadata.lastLogin = Date.now()
				this.setStoredData( 'users', users )

				return this.createResponse( {
					user,
					token,
					expiresIn: 86400
				} )
			},

			logout: async () => {
				await this.delay()
				this.setStoredData( 'currentUser', null )
				this.setStoredData( 'token', null )
				return this.createResponse( { message: 'Logged out successfully' } )
			},

			session: async () => {
				await this.delay()
				const user = this.getStoredData( 'currentUser' )
				const token = this.getStoredData( 'token' )

				if ( !user || !token ) {
					throw this.createError( 'Not authenticated', 401 )
				}

				return this.createResponse( { user, token } )
			},

			refresh: async () => {
				await this.delay()
				const user = this.getStoredData( 'currentUser' )

				if ( !user ) {
					throw this.createError( 'Not authenticated', 401 )
				}

				const token = btoa( JSON.stringify( {
					userId: user.id,
					email: user.email,
					role: user.role,
					exp: Date.now() + 24 * 60 * 60 * 1000
				} ) )

				this.setStoredData( 'token', token )
				return this.createResponse( { token, expiresIn: 86400 } )
			},

			getCurrentUser: async () => {
				await this.delay()
				const user = this.getStoredData( 'currentUser' )

				if ( !user ) {
					return this.createResponse( null )
				}

				return this.createResponse( user )
			},

			verifyMagicLink: async ( token ) => {
				await this.delay()

				// In mock mode, decode the token and return user data
				try {
					const tokenData = JSON.parse( atob( token ) )
					const users = this.getStoredData( 'users' ) || []
					const user = users.find( u => u.id === tokenData.userId )

					if ( user ) {
						this.setStoredData( 'currentUser', user )
						this.setStoredData( 'token', token )

						return this.createResponse( {
							user,
							token,
							expiresIn: 86400
						} )
					}
				} catch ( e ) {
					// Invalid token format
				}

				throw this.createError( 'Invalid or expired token', 401 )
			}
		}
	}

	// Generic query method
	async query( resource, options = {} ) {
		await this.delay()

		if ( this.shouldError() ) {
			throw this.createError( 'Network error', 500 )
		}

		const data = this.getStoredData( resource ) || []
		let filtered = [...data]

		// Apply filters
		if ( options.filter ) {
			filtered = filtered.filter( item => {
				return Object.entries( options.filter ).every( ( [key, value] ) => {
					if ( Array.isArray( value ) ) {
						return value.includes( item[key] )
					}
					if ( typeof value === 'object' && value.min !== undefined ) {
						return item[key] >= value.min && item[key] <= value.max
					}
					return item[key] === value
				} )
			} )
		}

		// Apply search
		if ( options.search ) {
			const searchLower = options.search.toLowerCase()
			filtered = filtered.filter( item => {
				return ['title', 'description', 'name'].some( field => {
					const value = item[field] || item.profile?.[field]
					return value && value.toLowerCase().includes( searchLower )
				} )
			} )
		}

		// Apply sorting
		if ( options.sort ) {
			const sortField = options.sort.replace( '-', '' )
			const sortDesc = options.sort.startsWith( '-' )

			filtered.sort( ( a, b ) => {
				const aVal = this.getNestedValue( a, sortField )
				const bVal = this.getNestedValue( b, sortField )

				if ( aVal < bVal ) return sortDesc ? 1 : -1
				if ( aVal > bVal ) return sortDesc ? -1 : 1
				return 0
			} )
		}

		// Apply pagination
		const page = options.page || 1
		const limit = options.limit || 20
		const start = ( page - 1 ) * limit
		const paginated = filtered.slice( start, start + limit )

		// Apply includes
		if ( options.include ) {
			// In a real scenario, this would join related data
			// For now, we'll just return the references as-is
		}

		return this.createResponse( paginated, {
			page,
			limit,
			total: filtered.length,
			totalPages: Math.ceil( filtered.length / limit )
		} )
	}

	// Get nested value from object
	getNestedValue( obj, path ) {
		return path.split( '.' ).reduce( ( curr, prop ) => curr?.[prop], obj )
	}

	// CRUD operations
	async get( resource, id ) {
		await this.delay()

		if ( this.shouldError() ) {
			throw this.createError( 'Network error', 500 )
		}

		const data = this.getStoredData( resource ) || []
		const item = data.find( d => d.id === id )

		if ( !item ) {
			throw this.createError( `${resource} not found`, 404 )
		}

		return this.createResponse( item )
	}

	async create( resource, payload ) {
		await this.delay()

		if ( this.shouldError() ) {
			throw this.createError( 'Network error', 500 )
		}

		const data = this.getStoredData( resource ) || []
		const currentUser = this.getStoredData( 'currentUser' )

		const newItem = {
			id: `${resource.slice( 0, 3 )}_${Date.now()}`,
			...payload,
			creator: currentUser,
			dates: {
				created: Date.now(),
				updated: Date.now(),
				...payload.dates
			}
		}

		data.push( newItem )
		this.setStoredData( resource, data )

		// Emit event
		this.emit( `${resource}.created`, newItem )

		return this.createResponse( newItem )
	}

	async update( resource, id, payload ) {
		await this.delay()

		if ( this.shouldError() ) {
			throw this.createError( 'Network error', 500 )
		}

		const data = this.getStoredData( resource ) || []
		const index = data.findIndex( d => d.id === id )

		if ( index === -1 ) {
			throw this.createError( `${resource} not found`, 404 )
		}

		const updated = {
			...data[index],
			...payload,
			dates: {
				...data[index].dates,
				updated: Date.now()
			}
		}

		data[index] = updated
		this.setStoredData( resource, data )

		// Emit event
		this.emit( `${resource}.updated`, updated )

		return this.createResponse( updated )
	}

	async delete( resource, id ) {
		await this.delay()

		if ( this.shouldError() ) {
			throw this.createError( 'Network error', 500 )
		}

		const data = this.getStoredData( resource ) || []
		const index = data.findIndex( d => d.id === id )

		if ( index === -1 ) {
			throw this.createError( `${resource} not found`, 404 )
		}

		const deleted = data[index]
		data.splice( index, 1 )
		this.setStoredData( resource, data )

		// Emit event
		this.emit( `${resource}.deleted`, { id } )

		return this.createResponse( { message: 'Deleted successfully', id } )
	}

	// Event system
	subscribe( event, callback ) {
		if ( !this.subscribers.has( event ) ) {
			this.subscribers.set( event, [] )
		}
		this.subscribers.get( event ).push( callback )

		// Return unsubscribe function
		return () => {
			const callbacks = this.subscribers.get( event )
			const index = callbacks.indexOf( callback )
			if ( index > -1 ) {
				callbacks.splice( index, 1 )
			}
		}
	}

	emit( event, data ) {
		if ( this.config.debug ) {
			console.log( `[Backend] Event: ${event}`, data )
		}

		const callbacks = this.subscribers.get( event )
		if ( callbacks ) {
			callbacks.forEach( cb => cb( data ) )
		}

		// Also emit wildcard event
		const wildcardCallbacks = this.subscribers.get( '*' )
		if ( wildcardCallbacks ) {
			wildcardCallbacks.forEach( cb => cb( { event, data } ) )
		}
	}

	// Specialized endpoints
	async getDashboard() {
		await this.delay()

		const currentUser = this.getStoredData( 'currentUser' )
		if ( !currentUser ) {
			throw this.createError( 'Not authenticated', 401 )
		}

		const bookings = this.getStoredData( 'bookings' ) || []
		const maintenance = this.getStoredData( 'maintenance' ) || []
		const bills = this.getStoredData( 'bills' ) || []
		const announcements = this.getStoredData( 'announcements' ) || []

		// Filter by user if not admin/manager
		const isAdmin = ['admin', 'manager'].includes( currentUser.role )

		const userBookings = isAdmin ? bookings :
			bookings.filter( b => b.creator.id === currentUser.id )
		const userMaintenance = isAdmin ? maintenance :
			maintenance.filter( m => m.creator.id === currentUser.id )
		const userBills = isAdmin ? bills :
			bills.filter( b => b.assignee?.id === currentUser.id )

		return this.createResponse( {
			stats: {
				bookings: {
					total: userBookings.length,
					upcoming: userBookings.filter( b => b.dates.start > Date.now() ).length,
					active: userBookings.filter( b => b.status === 'confirmed' ).length
				},
				maintenance: {
					total: userMaintenance.length,
					pending: userMaintenance.filter( m => m.status === 'pending' ).length,
					inProgress: userMaintenance.filter( m => m.status === 'in_progress' ).length
				},
				bills: {
					total: userBills.length,
					unpaid: userBills.filter( b => b.status === 'pending' ).length,
					totalAmount: userBills
						.filter( b => b.status === 'pending' )
						.reduce( ( sum, b ) => sum + ( b.metadata?.amount || 0 ), 0 )
				}
			},
			recentActivity: [
				...userBookings.slice( 0, 3 ).map( b => ( { ...b, activityType: 'booking' } ) ),
				...userMaintenance.slice( 0, 3 ).map( m => ( { ...m, activityType: 'maintenance' } ) ),
				...userBills.slice( 0, 3 ).map( b => ( { ...b, activityType: 'bill' } ) )
			]
				.sort( ( a, b ) => b.dates.created - a.dates.created )
				.slice( 0, 5 ),
			announcements: announcements.filter( a =>
				a.status === 'active' &&
				( !a.dates.expires || a.dates.expires > Date.now() )
			)
		} )
	}

	// Analytics endpoint
	async getAnalytics( metric ) {
		await this.delay()

		const currentUser = this.getStoredData( 'currentUser' )
		if ( !currentUser || !['admin', 'manager'].includes( currentUser.role ) ) {
			throw this.createError( 'Unauthorized', 403 )
		}

		// Generate some fake analytics data
		const generateTimeSeries = ( days = 30 ) => {
			const data = []
			const now = Date.now()
			for ( let i = days; i >= 0; i-- ) {
				data.push( {
					date: new Date( now - i * 24 * 60 * 60 * 1000 ).toISOString().split( 'T' )[0],
					value: Math.floor( Math.random() * 100 ) + 50
				} )
			}
			return data
		}

		const metrics = {
			occupancy: {
				current: 85,
				trend: generateTimeSeries( 30 ),
				breakdown: {
					'A-Tower': 90,
					'B-Tower': 80
				}
			},
			revenue: {
				current: 15000000,
				trend: generateTimeSeries( 30 ),
				breakdown: {
					rent: 12000000,
					facilities: 2000000,
					parking: 1000000
				}
			},
			maintenance: {
				avgResponseTime: 24, // hours
				completionRate: 92, // percentage
				trend: generateTimeSeries( 30 ),
				byCategory: {
					plumbing: 15,
					electrical: 8,
					hvac: 12,
					other: 10
				}
			},
			satisfaction: {
				overall: 4.2,
				trend: generateTimeSeries( 30 ),
				categories: {
					facilities: 4.5,
					maintenance: 4.0,
					management: 4.1,
					value: 3.9
				}
			}
		}

		return this.createResponse( metrics[metric] || metrics )
	}

	// Batch operations
	async batch( operations ) {
		const results = []

		for ( const op of operations ) {
			try {
				let result
				const [resource, id] = op.url.replace( '/api/v1/', '' ).split( '/' )

				switch ( op.method ) {
					case 'GET':
						result = id ? await this.get( resource, id ) : await this.query( resource, op.params )
						break
					case 'POST':
						result = await this.create( resource, op.data )
						break
					case 'PATCH':
						result = await this.update( resource, id, op.data )
						break
					case 'DELETE':
						result = await this.delete( resource, id )
						break
					default:
						throw this.createError( `Method ${op.method} not supported` )
				}

				results.push( { success: true, ...result } )
			} catch ( error ) {
				results.push( { success: false, error } )
			}
		}

		return this.createResponse( results )
	}

	// Resource-specific helpers
	facilities() {
		return this.createResourceHelper( 'facilities' )
	}

	bookings() {
		return this.createResourceHelper( 'bookings' )
	}

	maintenance() {
		return this.createResourceHelper( 'maintenance' )
	}

	bills() {
		return this.createResourceHelper( 'bills' )
	}

	users() {
		return this.createResourceHelper( 'users' )
	}

	documents() {
		return this.createResourceHelper( 'documents' )
	}

	announcements() {
		return this.createResourceHelper( 'announcements' )
	}

	// Create chainable resource helper
	createResourceHelper( resource ) {
		const helper = {
			_resource: resource,
			_filters: {},
			_sort: null,
			_page: 1,
			_limit: 20,
			_includes: [],
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

			include( ...relations ) {
				helper._includes = relations
				return helper
			},

			paginate( page, limit ) {
				helper._page = page
				helper._limit = limit
				return helper
			},

			async get( id ) {
				if ( id ) {
					return await this.get( resource, id )
				}
				return await this.query( resource, {
					filter: helper._filters,
					sort: helper._sort,
					page: helper._page,
					limit: helper._limit,
					include: helper._includes,
					search: helper._search
				} )
			},

			async create( data ) {
				return await this.create( resource, data )
			},

			async update( id, data ) {
				return await this.update( resource, id, data )
			},

			async delete( id ) {
				return await this.delete( resource, id )
			}
		}

		return helper
	}

	// Check availability for bookings
	async checkAvailability( facilityId, startDate, endDate ) {
		await this.delay()

		const bookings = this.getStoredData( 'bookings' ) || []
		const conflicts = bookings.filter( b => {
			if ( b.facility.id !== facilityId ) return false
			if ( b.status === 'cancelled' ) return false

			const bookingStart = b.dates.start
			const bookingEnd = b.dates.end

			return (
				( startDate >= bookingStart && startDate < bookingEnd ) ||
				( endDate > bookingStart && endDate <= bookingEnd ) ||
				( startDate <= bookingStart && endDate >= bookingEnd )
			)
		} )

		return this.createResponse( {
			available: conflicts.length === 0,
			conflicts: conflicts.map( c => ( {
				id: c.id,
				start: c.dates.start,
				end: c.dates.end,
				user: c.creator.profile.name
			} ) )
		} )
	}

	// Notification system
	async getNotifications() {
		await this.delay()

		const currentUser = this.getStoredData( 'currentUser' )
		if ( !currentUser ) {
			throw this.createError( 'Not authenticated', 401 )
		}

		// Generate some notifications
		const notifications = [
			{
				id: 'notif_001',
				type: 'maintenance',
				title: 'Maintenance Request Updated',
				message: 'Your AC repair request has been assigned to a technician',
				read: false,
				createdAt: Date.now() - 2 * 60 * 60 * 1000,
				data: { maintenanceId: 'maint_002' }
			},
			{
				id: 'notif_002',
				type: 'billing',
				title: 'New Bill Available',
				message: 'Your December rent bill is now available',
				read: false,
				createdAt: Date.now() - 24 * 60 * 60 * 1000,
				data: { billId: 'bill_001' }
			},
			{
				id: 'notif_003',
				type: 'booking',
				title: 'Booking Reminder',
				message: 'Your gym booking is tomorrow at 8:00 AM',
				read: true,
				createdAt: Date.now() - 48 * 60 * 60 * 1000,
				data: { bookingId: 'book_001' }
			}
		]

		return this.createResponse( notifications )
	}

	// Mark notification as read
	async markNotificationRead( notificationId ) {
		await this.delay()
		// In a real implementation, this would update the notification
		return this.createResponse( { success: true } )
	}

	// File upload simulation
	async uploadFile( file, category = 'general' ) {
		await this.delay()

		if ( this.shouldError() ) {
			throw this.createError( 'Upload failed', 500 )
		}

		// Simulate file upload
		const fileData = {
			id: `file_${Date.now()}`,
			name: file.name,
			size: file.size,
			type: file.type,
			category,
			url: `https://storage.kagi.com/${category}/${file.name}`,
			uploadedAt: Date.now()
		}

		return this.createResponse( fileData )
	}

	// Export data
	async exportData( resource, format = 'json' ) {
		await this.delay()

		const data = this.getStoredData( resource ) || []

		if ( format === 'csv' ) {
			// Convert to CSV (simplified)
			const headers = Object.keys( data[0] || {} ).join( ',' )
			const rows = data.map( item =>
				Object.values( item ).map( v =>
					typeof v === 'object' ? JSON.stringify( v ) : v
				).join( ',' )
			)

			return this.createResponse( {
				format: 'csv',
				data: [headers, ...rows].join( '\n' ),
				filename: `${resource}_export_${Date.now()}.csv`
			} )
		}

		return this.createResponse( {
			format: 'json',
			data,
			filename: `${resource}_export_${Date.now()}.json`
		} )
	}

	// Reset database
	reset() {
		if ( this.config.persist ) {
			// Clear all localStorage items with our prefix
			Object.keys( localStorage )
				.filter( key => key.startsWith( 'kagi_mock_' ) )
				.forEach( key => localStorage.removeItem( key ) )
		} else {
			this.storage.clear()
		}

		this.cache.clear()
		this.seedDatabase()

		return this.createResponse( { message: 'Database reset successfully' } )
	}
}

// Create singleton instance
const backend = new Backend( {
	delay: 200,
	errorRate: 0,
	persist: true,
	debug: import.meta.env.DEV
} )

// Export both the class and instance
export { Backend, backend as default }
