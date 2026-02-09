import { computed, ref, watch } from 'vue'

import { isNative } from '@/mobile'
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

// M1: Minimize PII stored in localStorage -- only cache what's needed for quick UI render
const _persistUser = () => {
	if ( !user.value ) return
	localStorage.setItem( 'kagi_user', JSON.stringify( {
		id: user.value.id,
		role: user.value.role,
		mansionId: user.value.mansionId,
		name: user.value.name,
		email: user.value.email
	} ) )
}

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

// Supabase auth state listener for automatic token refresh
// Keeps kagi_token in sync when Supabase internally refreshes the session
let _authSubscription = null

export const setupAuthListener = () => {
	if ( USE_MOCK_BACKEND ) return // Mock backend has no auth state changes

	_authSubscription = backend.onAuthStateChange( async ( event, session ) => {
		console.log( '[Auth] State change:', event )

		if ( event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN' ) {
			if ( session ) {
				// Sync token from Supabase's refreshed session
				token.value = session.access_token
				localStorage.setItem( 'kagi_token', session.access_token )

				// On fresh sign-in, fetch full profile
				if ( !user.value || event === 'SIGNED_IN' ) {
					try {
						const auth = await backend.auth()
						const response = await auth.getCurrentUser()
						if ( response.success && response.data ) {
							user.value = response.data
							_persistUser()
						}
					} catch ( error ) {
						console.error( '[Auth] Failed to fetch user on state change:', error )
					}
				}

				isAuthenticated.value = true
			}
		} else if ( event === 'SIGNED_OUT' ) {
			user.value = null
			token.value = null
			isAuthenticated.value = false
			localStorage.removeItem( 'kagi_token' )
			localStorage.removeItem( 'kagi_user' )
		}
	} )
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
			_persistUser()

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
			_persistUser()

			return true
		}
	} catch ( error ) {
		// Session expired or not found -- try explicit refresh as fallback
		// Supabase refresh tokens are valid for ~180 days by default
		try {
			const auth = await backend.auth()
			const refreshResponse = await auth.refresh()
			if ( refreshResponse.success && refreshResponse.data?.token ) {
				token.value = refreshResponse.data.token
				localStorage.setItem( 'kagi_token', token.value )

				const userResponse = await auth.getCurrentUser()
				if ( userResponse.success && userResponse.data ) {
					user.value = userResponse.data
					_persistUser()
					isAuthenticated.value = true
					return true
				}
			}
		} catch ( refreshError ) {
			// Truly no recoverable session
			console.log( '[Auth] No recoverable session' )
		}
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
			_persistUser()

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
				_persistUser()
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

// Refresh user role from backend (security measure - don't trust localStorage alone)
export const refreshUserRole = async () => {
	if ( !isAuthenticated.value ) return false

	try {
		const auth = await backend.auth()
		const response = await auth.getCurrentUser()

		if ( response.success && response.data ) {
			// Update user with fresh data from backend
			user.value = response.data
			_persistUser()
			return true
		}
	} catch ( error ) {
		console.error( 'Failed to refresh user role:', error )
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

// M6: Session inactivity timeout
// Mobile: disabled (sessions persist like Instagram)
// Web: 30-minute timeout for shared terminal security
const SESSION_TIMEOUT = 30 * 60 * 1000
let _inactivityTimer = null

export const resetInactivityTimer = () => {
	if ( isNative() ) return

	if ( _inactivityTimer ) clearTimeout( _inactivityTimer )
	if ( isAuthenticated.value ) {
		_inactivityTimer = setTimeout( async () => {
			await logout()
			window.location.hash = '#/login'
		}, SESSION_TIMEOUT )
	}
}

export const initInactivityTimer = () => {
	if ( isNative() ) return

	const events = ['click', 'keypress', 'scroll', 'touchstart']
	events.forEach( event => {
		document.addEventListener( event, resetInactivityTimer, { passive: true } )
	} )
	resetInactivityTimer()
}

// Watch for auth changes and close menu on logout
watch( isAuthenticated, ( newValue ) => {
	if ( !newValue ) {
		isMenuOpen.value = false
	}
} )
