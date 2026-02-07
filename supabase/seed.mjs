/**
 * Supabase Seed Script
 * Populates the database with test data matching the mock Backend.js
 *
 * Usage:
 *   SUPABASE_URL=https://your-project.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key \
 *   node supabase/seed.js
 */
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if ( !supabaseUrl || !supabaseServiceKey ) {
	console.error( 'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables' )
	process.exit( 1 )
}

const supabase = createClient( supabaseUrl, supabaseServiceKey )

async function seed() {
	console.log( 'Seeding Supabase database...' )

	// 1. Create mansion
	console.log( '  Creating mansion...' )
	const { data: mansion, error: mansionError } = await supabase
		.from( 'mansions' )
		.insert( {
			name: 'Dresser Tower',
			address: '1-2-3 Shibuya, Shibuya-ku, Tokyo',
			total_units: 120,
			subscription_tier: 'professional',
			settings: { timezone: 'Asia/Tokyo' },
			metadata: { floors: 30, yearBuilt: 2018 }
		} )
		.select()
		.single()

	if ( mansionError ) throw mansionError
	console.log( `  Mansion created: ${mansion.name} (${mansion.id})` )

	// 2. Create users
	console.log( '  Creating users...' )
	const users = [
		{
			email: 'admin@kagi.com',
			password: 'admin123',
			meta: { role: 'admin', name: 'Admin User' },
			profile: {
				name: 'Admin User',
				role: 'admin',
				phone: '+81-3-1234-5678',
				unit: null,
				permissions: ['*'],
				avatar: 'https://i.pravatar.cc/150?u=admin'
			}
		},
		{
			email: 'manager@dresser.com',
			password: 'manager123',
			meta: { role: 'mansion_admin', name: 'Tanaka Hiroshi' },
			profile: {
				name: 'Tanaka Hiroshi',
				role: 'mansion_admin',
				phone: '+81-3-2345-6789',
				unit: 'Office',
				permissions: ['manage_residents', 'manage_facilities', 'view_analytics'],
				avatar: 'https://i.pravatar.cc/150?u=manager',
				settings: { theme: 'light', language: 'ja', notifications: true }
			}
		},
		{
			email: 'resident@kagi.com',
			password: 'resident123',
			meta: { role: 'resident', name: 'Makio Kitano' },
			profile: {
				name: 'Makio Kitano',
				role: 'resident',
				phone: '+81-90-6543-6543',
				unit: '2704',
				permissions: ['view_bills', 'book_facilities', 'submit_maintenance'],
				avatar: 'https://i.pravatar.cc/150?u=resident'
			}
		},
		{
			email: 'yuki.tanaka@example.jp',
			password: 'resident123',
			meta: { role: 'resident', name: '田中 由紀' },
			profile: {
				name: '田中 由紀',
				role: 'resident',
				phone: '+81-80-9876-5432',
				unit: 'B-302',
				permissions: ['view_bills', 'book_facilities', 'submit_maintenance'],
				avatar: 'https://i.pravatar.cc/150?u=yuki',
				settings: { theme: 'auto', language: 'ja', notifications: false }
			}
		}
	]

	const createdUsers = []

	for ( const u of users ) {
		const { data: authData, error: authError } = await supabase.auth.admin.createUser( {
			email: u.email,
			password: u.password,
			email_confirm: true,
			user_metadata: u.meta
		} )

		if ( authError ) {
			console.error( `  Failed to create user ${u.email}:`, authError.message )
			continue
		}

		// Create profile (trigger is disabled, so we insert directly)
		const { error: profileError } = await supabase
			.from( 'profiles' )
			.upsert( {
				id: authData.user.id,
				email: u.email,
				...u.profile,
				mansion_id: mansion.id
			} )

		if ( profileError ) {
			console.error( `  Failed to update profile for ${u.email}:`, profileError.message )
		}

		createdUsers.push( { ...authData.user, ...u.profile } )
		console.log( `  User created: ${u.email} (${u.profile.role})` )
	}

	const residentId = createdUsers[2]?.id
	const resident2Id = createdUsers[3]?.id
	const managerId = createdUsers[1]?.id

	// 3. Create facilities
	console.log( '  Creating facilities...' )
	const facilitiesData = [
		{
			mansion_id: mansion.id,
			title: 'Fitness Center',
			description: 'Fully equipped gym with modern equipment',
			status: 'active',
			category: 'amenity',
			capacity: 20,
			rules: ['No loud music', 'Clean equipment after use', 'Wear appropriate attire'],
			hours: { open: '06:00', close: '22:00' },
			pricing: { hourly: 0, deposit: 0 },
			booking_type: 'hourly',
			metadata: { equipment: ['Treadmills', 'Weights', 'Yoga mats'] }
		},
		{
			mansion_id: mansion.id,
			title: 'Swimming Pool',
			description: '25m heated indoor pool',
			status: 'active',
			category: 'amenity',
			capacity: 30,
			rules: ['Shower before entering', 'No diving', 'Children must be supervised'],
			hours: { open: '07:00', close: '21:00' },
			pricing: { hourly: 500, deposit: 0 },
			booking_type: 'hourly',
			metadata: { temperature: 28, depth: { shallow: 1.2, deep: 2.0 } }
		},
		{
			mansion_id: mansion.id,
			title: 'Conference Room A',
			description: 'Meeting room with projector and whiteboard',
			status: 'active',
			category: 'business',
			capacity: 12,
			rules: ['Book in advance', 'Clean after use'],
			hours: { open: '08:00', close: '20:00' },
			pricing: { hourly: 1000, deposit: 0 },
			booking_type: 'hourly',
			metadata: { equipment: ['Projector', 'Whiteboard', 'Conference phone', 'WiFi'] }
		},
		{
			mansion_id: mansion.id,
			title: 'Party Room',
			description: 'Spacious room for events and celebrations',
			status: 'active',
			category: 'event',
			capacity: 50,
			rules: ['No loud music after 22:00', 'Clean up required', 'Deposit required'],
			hours: { open: '10:00', close: '23:00' },
			pricing: { hourly: 3000, deposit: 10000 },
			booking_type: 'half-day',
			metadata: { features: ['Kitchen', 'Sound system', 'Tables', 'Chairs'] }
		}
	]

	const { data: facilities, error: facError } = await supabase
		.from( 'facilities' )
		.insert( facilitiesData )
		.select()

	if ( facError ) throw facError
	console.log( `  Created ${facilities.length} facilities` )

	// 4. Create bookings
	if ( residentId && resident2Id ) {
		console.log( '  Creating bookings...' )
		const now = new Date()
		const bookingsData = [
			{
				facility_id: facilities[0].id,
				creator_id: residentId,
				mansion_id: mansion.id,
				title: 'Gym Session',
				description: 'Morning workout',
				status: 'confirmed',
				priority: 'medium',
				tags: ['fitness', 'recurring'],
				start_date: new Date( now.getTime() + 24 * 60 * 60 * 1000 ).toISOString(),
				end_date: new Date( now.getTime() + 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000 ).toISOString(),
				metadata: { recurring: 'weekly', participants: 1, notes: 'Regular morning session' }
			},
			{
				facility_id: facilities[1].id,
				creator_id: resident2Id,
				mansion_id: mansion.id,
				title: 'Pool Reservation',
				description: 'Swimming lessons',
				status: 'confirmed',
				priority: 'high',
				tags: ['pool', 'lessons'],
				start_date: new Date( now.getTime() + 3 * 24 * 60 * 60 * 1000 ).toISOString(),
				end_date: new Date( now.getTime() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000 ).toISOString(),
				metadata: { instructor: 'Yamada-san', participants: 3, level: 'beginner' }
			}
		]

		const { error: bookError } = await supabase.from( 'bookings' ).insert( bookingsData )
		if ( bookError ) console.error( '  Bookings error:', bookError.message )
		else console.log( '  Created 2 bookings' )
	}

	// 5. Create maintenance requests
	if ( residentId && resident2Id ) {
		console.log( '  Creating maintenance requests...' )
		const maintenanceData = [
			{
				mansion_id: mansion.id,
				creator_id: residentId,
				title: 'Leaking Faucet',
				description: 'Kitchen faucet is dripping constantly',
				status: 'pending',
				priority: 'high',
				tags: ['plumbing', 'kitchen'],
				category: 'plumbing',
				location: '2704',
				estimated_cost: 5000,
				due_date: new Date( Date.now() + 2 * 24 * 60 * 60 * 1000 ).toISOString()
			},
			{
				mansion_id: mansion.id,
				creator_id: resident2Id,
				title: 'AC Not Working',
				description: 'Air conditioner not cooling properly',
				status: 'in_progress',
				priority: 'urgent',
				tags: ['hvac', 'urgent'],
				category: 'hvac',
				location: 'B-302',
				estimated_cost: 15000,
				due_date: new Date( Date.now() + 24 * 60 * 60 * 1000 ).toISOString(),
				metadata: { notes: 'Technician scheduled for tomorrow' }
			}
		]

		const { error: maintError } = await supabase.from( 'maintenance_requests' ).insert( maintenanceData )
		if ( maintError ) console.error( '  Maintenance error:', maintError.message )
		else console.log( '  Created 2 maintenance requests' )
	}

	// 6. Create bills
	if ( residentId && resident2Id && managerId ) {
		console.log( '  Creating bills...' )
		const billsData = [
			{
				mansion_id: mansion.id,
				assignee_id: residentId,
				creator_id: managerId,
				title: 'Monthly Rent - January 2025',
				description: 'Monthly rent and utilities',
				status: 'pending',
				priority: 'high',
				tags: ['rent', 'monthly'],
				amount: 120000,
				currency: 'JPY',
				breakdown: { rent: 100000, utilities: 15000, internet: 5000 },
				payment_methods: ['bank_transfer', 'credit_card'],
				due_date: new Date( Date.now() + 10 * 24 * 60 * 60 * 1000 ).toISOString()
			},
			{
				mansion_id: mansion.id,
				assignee_id: resident2Id,
				creator_id: managerId,
				title: 'Parking Fee - January 2025',
				description: 'Monthly parking space rental',
				status: 'paid',
				priority: 'medium',
				tags: ['parking', 'monthly'],
				amount: 15000,
				currency: 'JPY',
				breakdown: { parking: 15000 },
				payment_methods: ['credit_card'],
				due_date: new Date( Date.now() - 2 * 24 * 60 * 60 * 1000 ).toISOString(),
				paid_at: new Date( Date.now() - 2 * 24 * 60 * 60 * 1000 ).toISOString(),
				metadata: { parkingSpot: 'B-12', transactionId: 'TXN123456789' }
			}
		]

		const { error: billError } = await supabase.from( 'bills' ).insert( billsData )
		if ( billError ) console.error( '  Bills error:', billError.message )
		else console.log( '  Created 2 bills' )
	}

	// 7. Create documents
	if ( managerId ) {
		console.log( '  Creating documents...' )
		const documentsData = [
			{
				mansion_id: mansion.id,
				creator_id: managerId,
				title: 'House Rules & Regulations',
				description: 'Complete building rules and regulations',
				status: 'active',
				category: 'rules',
				tags: ['important', 'rules'],
				file_type: 'pdf',
				file_size: '2.3 MB',
				pages: 24,
				version: '2.1'
			},
			{
				mansion_id: mansion.id,
				creator_id: managerId,
				title: 'Emergency Procedures',
				description: 'Emergency evacuation and safety procedures',
				status: 'active',
				category: 'safety',
				tags: ['emergency', 'important'],
				file_type: 'pdf',
				file_size: '1.1 MB',
				pages: 8,
				metadata: { languages: ['en', 'ja'] }
			}
		]

		const { error: docError } = await supabase.from( 'documents' ).insert( documentsData )
		if ( docError ) console.error( '  Documents error:', docError.message )
		else console.log( '  Created 2 documents' )
	}

	// 8. Create announcements
	if ( managerId ) {
		console.log( '  Creating announcements...' )
		const { error: annError } = await supabase.from( 'announcements' ).insert( {
			mansion_id: mansion.id,
			creator_id: managerId,
			title: 'Elevator Maintenance Notice',
			description: 'The main elevator will be under maintenance on January 30th from 9:00 to 17:00',
			status: 'active',
			priority: 'high',
			tags: ['maintenance', 'elevator'],
			expires_at: new Date( Date.now() + 7 * 24 * 60 * 60 * 1000 ).toISOString(),
			metadata: {
				affectedFloors: ['all'],
				alternativeRoute: 'Please use the emergency stairs or secondary elevator'
			}
		} )

		if ( annError ) console.error( '  Announcements error:', annError.message )
		else console.log( '  Created 1 announcement' )
	}

	// 9. Create notifications for resident
	if ( residentId ) {
		console.log( '  Creating notifications...' )
		const notificationsData = [
			{
				user_id: residentId,
				type: 'maintenance',
				title: 'Maintenance Request Updated',
				message: 'Your faucet repair request has been received',
				read: false,
				data: {}
			},
			{
				user_id: residentId,
				type: 'billing',
				title: 'New Bill Available',
				message: 'Your January rent bill is now available',
				read: false,
				data: {}
			},
			{
				user_id: residentId,
				type: 'booking',
				title: 'Booking Reminder',
				message: 'Your gym booking is tomorrow at 8:00 AM',
				read: true,
				data: {}
			}
		]

		const { error: notifError } = await supabase.from( 'notifications' ).insert( notificationsData )
		if ( notifError ) console.error( '  Notifications error:', notifError.message )
		else console.log( '  Created 3 notifications' )
	}

	console.log( '\nSeed complete!' )
	console.log( '\nTest accounts:' )
	console.log( '  Admin:    admin@kagi.com / admin123' )
	console.log( '  Manager:  manager@dresser.com / manager123' )
	console.log( '  Resident: resident@kagi.com / resident123' )
	console.log( '  Resident: yuki.tanaka@example.jp / resident123' )
}

seed().catch( err => {
	console.error( 'Seed failed:', err )
	process.exit( 1 )
} )
