/**
 * Test Data Cleanup Utilities
 * Provides helpers for creating and cleaning up test data in Supabase
 */
import { adminClient } from './supabaseTestClient'

// Tables to clean in order (respects foreign key constraints)
const TABLES_TO_CLEAN = [
	'notifications',
	'bookings',
	'maintenance_requests',
	'bills',
	'announcements',
	'documents',
	'facilities',
	'profiles',
	'mansions'
]

/**
 * Clean all test data from the database
 * Uses service role to bypass RLS
 */
export async function cleanupTestData() {
	if ( !adminClient ) {
		console.warn( 'Admin client not available - skipping cleanup' )
		return
	}

	for ( const table of TABLES_TO_CLEAN ) {
		try {
			// Delete all records except placeholder IDs
			await adminClient
				.from( table )
				.delete()
				.neq( 'id', '00000000-0000-0000-0000-000000000000' )
		} catch ( error ) {
			// Table might not exist or be empty - continue
			console.warn( `Cleanup warning for ${table}:`, error.message )
		}
	}
}

/**
 * Create a test user with specified role
 * @param {string} email - User email
 * @param {string} role - User role (resident, mansion_admin, admin)
 * @param {string} mansionId - Optional mansion ID to assign
 * @returns {Object} Created user data
 */
export async function createTestUser( email, role = 'resident', mansionId = null ) {
	if ( !adminClient ) {
		throw new Error( 'Admin client required to create test users' )
	}

	// Create auth user
	const { data: authData, error: authError } = await adminClient.auth.admin.createUser( {
		email,
		password: 'test-password-123',
		email_confirm: true
	} )

	if ( authError ) {
		throw new Error( `Failed to create auth user: ${authError.message}` )
	}

	// Create profile
	const { data: profile, error: profileError } = await adminClient
		.from( 'profiles' )
		.insert( {
			id: authData.user.id,
			email,
			name: `Test ${role.charAt( 0 ).toUpperCase() + role.slice( 1 )}`,
			role,
			mansion_id: mansionId
		} )
		.select()
		.single()

	if ( profileError ) {
		// Cleanup auth user on failure
		await adminClient.auth.admin.deleteUser( authData.user.id )
		throw new Error( `Failed to create profile: ${profileError.message}` )
	}

	return {
		...authData.user,
		profile
	}
}

/**
 * Create a test mansion
 * @param {Object} data - Mansion data
 * @returns {Object} Created mansion
 */
export async function createTestMansion( data = {} ) {
	if ( !adminClient ) {
		throw new Error( 'Admin client required to create test mansions' )
	}

	const { data: mansion, error } = await adminClient
		.from( 'mansions' )
		.insert( {
			name: data.name || 'Test Mansion',
			address: data.address || '123 Test Street, Tokyo',
			total_units: data.totalUnits || 50,
			settings: data.settings || {},
			metadata: data.metadata || {}
		} )
		.select()
		.single()

	if ( error ) {
		throw new Error( `Failed to create mansion: ${error.message}` )
	}

	return mansion
}

/**
 * Create a test facility
 * @param {string} mansionId - Mansion ID
 * @param {Object} data - Facility data
 * @returns {Object} Created facility
 */
export async function createTestFacility( mansionId, data = {} ) {
	if ( !adminClient ) {
		throw new Error( 'Admin client required to create test facilities' )
	}

	const { data: facility, error } = await adminClient
		.from( 'facilities' )
		.insert( {
			mansion_id: mansionId,
			name: data.name || 'Test Facility',
			type: data.type || 'meeting_room',
			capacity: data.capacity || 10,
			available: data.available !== false,
			rules: data.rules || {}
		} )
		.select()
		.single()

	if ( error ) {
		throw new Error( `Failed to create facility: ${error.message}` )
	}

	return facility
}

/**
 * Delete a test user and their auth record
 * @param {string} userId - User ID to delete
 */
export async function deleteTestUser( userId ) {
	if ( !adminClient ) {
		throw new Error( 'Admin client required to delete test users' )
	}

	// Delete profile first
	await adminClient.from( 'profiles' ).delete().eq( 'id', userId )

	// Delete auth user
	await adminClient.auth.admin.deleteUser( userId )
}

/**
 * Seed test data for a complete test scenario
 * Creates mansion, facility, and user
 * @returns {Object} Created test data
 */
export async function seedTestScenario() {
	const mansion = await createTestMansion()
	const facility = await createTestFacility( mansion.id )
	const resident = await createTestUser( 'resident@test.com', 'resident', mansion.id )
	const admin = await createTestUser( 'admin@test.com', 'mansion_admin', mansion.id )

	return {
		mansion,
		facility,
		resident,
		admin
	}
}
