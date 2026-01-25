import { computed, ref, watch } from 'vue'

import mockBackend from '@/services/Backend'
import supabaseBackend from '@/services/SupabaseBackend'

export const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND !== 'false' // Default to true

const backend = USE_MOCK_BACKEND ? mockBackend : supabaseBackend

// General app state
export const contentLoaded = ref( false )

// Auth state
export const user = ref( null )
export const token = ref( null )
export const isAuthenticated = ref( false )
export const loading = ref( false )

// UI state
export const isMenuOpen = ref( false )

// Computed getters
export const userRole = computed( () => user.value?.role || null )
export const isAdmin = computed( () => user.value?.role === 'admin' )
export const isMansionAdmin = computed( () => user.value?.role === 'mansion_admin' )
export const isResident = computed( () => user.value?.role === 'resident' )
export const isLandlord = computed( () => user.value?.role === 'landlord' )
export const mansionId = computed( () => user.value?.mansionId || null )

// User profile information (flat structure - KISS principle)
export const userProfile = computed( () => ( {
	residenceName: user.value?.mansionName || 'Dresser Tower',
	userName: user.value?.name || 'Makio Kitano',
	roomNumber: user.value?.unit || '2704',
	userPhone: user.value?.phone || '+81-90-6543-6543',
	userEmail: user.value?.email || null
} ) )

// Initialize auth from localStorage on app start
export const initAuth = () => {
	const storedToken = localStorage.getItem( 'kagi_token' )
	const storedUser = localStorage.getItem( 'kagi_user' )

	if ( storedToken && storedUser ) {
		token.value = storedToken
		user.value = JSON.parse( storedUser )
		isAuthenticated.value = true
		return true
	}
	return false
}

// Auth methods
export const requestMagicLink = async ( email, _role = 'resident', _mansionId = null ) => {
	loading.value = true
	try {
		if ( USE_MOCK_BACKEND ) {
			// Using mock backend - directly log in the user
			const auth = await backend.auth()
			const response = await auth.login( email, 'mock-password', 'resident' )

			if ( response.success ) {
				// In mock mode, we don't log in immediately to simulate the magic link flow
				// user.value = response.data.user
				// token.value = response.data.token
				// isAuthenticated.value = true

				// localStorage.setItem( 'kagi_token', token.value )
				// localStorage.setItem( 'kagi_user', JSON.stringify( user.value ) )

				return {
					success: true,
					message: 'Magic link sent (check your email)',
					email,
					token: response.data.token,
					mockLogin: false // Flag to indicate we should show the popup
				}
			}
			throw new Error( response.error?.message || 'Failed to send magic link' )
		} else {
			// Supabase backend - send real magic link email
			const auth = await backend.auth()
			await auth.sendMagicLink( email )
			return {
				success: true,
				message: 'Magic link sent (check your email)',
				email,
				token: null,
				mockLogin: false
			}
		}
	} catch ( error ) {
		console.error( 'Magic link request failed:', error )
		throw error
	} finally {
		loading.value = false
	}
}

export const verifyMagicLink = async ( magicToken ) => {
	loading.value = true
	try {
		// Both mock and Supabase use the same auth interface
		const auth = await backend.auth()
		const response = await auth.verifyMagicLink( magicToken )

		if ( response.success ) {
			user.value = response.data.user
			token.value = response.data.token
			isAuthenticated.value = true

			localStorage.setItem( 'kagi_token', token.value )
			localStorage.setItem( 'kagi_user', JSON.stringify( user.value ) )

			return response.data
		}
		throw new Error( response.error?.message || 'Failed to verify magic link' )
	} catch ( error ) {
		console.error( 'Magic link verification failed:', error )
		throw error
	} finally {
		loading.value = false
	}
}

export const checkSession = async () => {
	loading.value = true
	try {
		const auth = await backend.auth()
		// Try to recover session (Supabase handles URL parsing internally)
		const response = await auth.session()

		if ( response.success && response.data ) {
			user.value = response.data.user
			token.value = response.data.token
			isAuthenticated.value = true

			localStorage.setItem( 'kagi_token', token.value )
			localStorage.setItem( 'kagi_user', JSON.stringify( user.value ) )

			return true
		}
	} catch ( error ) {
		// No session found is normal
	} finally {
		loading.value = false
	}
	return false
}

export const adminLogin = async ( email, password ) => {
	loading.value = true
	try {
		// Both mock and Supabase use the same auth.login interface
		const auth = await backend.auth()
		const response = await auth.login( email, password )

		if ( response.success ) {
			user.value = response.data.user
			token.value = response.data.token
			isAuthenticated.value = true

			localStorage.setItem( 'kagi_token', token.value )
			localStorage.setItem( 'kagi_user', JSON.stringify( user.value ) )

			return response.data
		}
		throw new Error( response.error?.message || 'Login failed' )
	} catch ( error ) {
		console.error( 'Admin login failed:', error )
		throw error
	} finally {
		loading.value = false
	}
}

export const checkAuth = async () => {
	const storedToken = localStorage.getItem( 'kagi_token' )
	const storedUser = localStorage.getItem( 'kagi_user' )

	if ( storedToken && storedUser ) {
		token.value = storedToken
		user.value = JSON.parse( storedUser )
		isAuthenticated.value = true

		try {
			const auth = await backend.auth()
			const response = await auth.getCurrentUser()

			if ( response.success && response.data ) {
				user.value = response.data
				localStorage.setItem( 'kagi_user', JSON.stringify( user.value ) )
				return true
			}
		} catch ( error ) {
			console.error( 'Auth check failed:', error )
		}

		logout()
		return false
	}
	return false
}

export const logout = async () => {
	try {
		const auth = await backend.auth()
		await auth.logout()
	} catch ( error ) {
		console.error( 'Logout error:', error )
	}

	user.value = null
	token.value = null
	isAuthenticated.value = false
	isMenuOpen.value = false
	localStorage.removeItem( 'kagi_token' )
	localStorage.removeItem( 'kagi_user' )
}

// Watch for auth changes and close menu on logout
watch( isAuthenticated, ( newValue ) => {
	if ( !newValue ) {
		isMenuOpen.value = false
	}
} )
