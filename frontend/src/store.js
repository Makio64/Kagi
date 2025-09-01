import { computed, ref, watch } from 'vue'

import backend from '@/services/Backend'

export const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND !== 'false' // Default to true

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
				// Set the user data immediately for mock mode
				user.value = response.data.user
				token.value = response.data.token
				isAuthenticated.value = true
				
				localStorage.setItem( 'kagi_token', token.value )
				localStorage.setItem( 'kagi_user', JSON.stringify( user.value ) )
				
				return {
					success: true,
					message: 'Magic link sent (check your email)',
					email,
					token: token.value,
					mockLogin: true // Flag to indicate immediate login
				}
			}
			throw new Error( response.error?.message || 'Failed to send magic link' )
		} else {
			// Real backend implementation would go here
			throw new Error( 'Real backend not implemented yet' )
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
		if ( USE_MOCK_BACKEND ) {
			// Using mock backend
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
		} else {
			// Real backend implementation would go here
			throw new Error( 'Real backend not implemented yet' )
		}
	} catch ( error ) {
		console.error( 'Magic link verification failed:', error )
		throw error
	} finally {
		loading.value = false
	}
}

export const adminLogin = async ( email, password ) => {
	loading.value = true
	try {
		if ( USE_MOCK_BACKEND ) {
			// Using mock backend
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
		} else {
			// Real backend implementation would go here
			throw new Error( 'Real backend not implemented yet' )
		}
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

		if ( USE_MOCK_BACKEND ) {
			// Mock backend always validates stored tokens
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
			// Only logout if token is invalid
			logout()
			return false
		} else {
			// Real backend implementation would go here
			// For now, trust the stored token
			return true
		}
	}
	return false
}

export const logout = async () => {
	try {
		if ( USE_MOCK_BACKEND ) {
			const auth = await backend.auth()
			await auth.logout()
		} else {
			// Real backend implementation would go here
		}
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