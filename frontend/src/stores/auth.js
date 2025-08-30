import { defineStore } from 'pinia'

import backend from '@/services/Backend'

const USE_MOCK_BACKEND = import.meta.env.VITE_USE_MOCK_BACKEND !== 'false' // Default to true

export const useAuthStore = defineStore( 'auth', {
	state: () => ( {
		user: null,
		token: null,
		isAuthenticated: false,
		loading: false
	} ),

	getters: {
		userRole: ( state ) => state.user?.role || null,
		isAdmin: ( state ) => state.user?.role === 'admin',
		isMansionAdmin: ( state ) => state.user?.role === 'mansion_admin',
		isResident: ( state ) => state.user?.role === 'resident',
		isLandlord: ( state ) => state.user?.role === 'landlord',
		mansionId: ( state ) => state.user?.mansionId || null
	},

	actions: {
		async requestMagicLink( email, role = 'resident', mansionId = null ) {
			this.loading = true
			try {
				if ( USE_MOCK_BACKEND ) {
					// Using mock backend - directly log in the user
					const auth = await backend.auth()
					const response = await auth.login( email, 'mock-password' )

					if ( response.success ) {
						// Set the user data immediately for mock mode
						this.user = response.data.user
						this.token = response.data.token
						this.isAuthenticated = true
						
						localStorage.setItem( 'kagi_token', this.token )
						localStorage.setItem( 'kagi_user', JSON.stringify( this.user ) )
						
						return {
							success: true,
							message: 'Magic link sent (check your email)',
							email,
							token: this.token,
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
				this.loading = false
			}
		},

		async verifyMagicLink( token ) {
			this.loading = true
			try {
				if ( USE_MOCK_BACKEND ) {
					// Using mock backend
					const auth = await backend.auth()
					const response = await auth.verifyMagicLink( token )

					if ( response.success ) {
						this.user = response.data.user
						this.token = response.data.token
						this.isAuthenticated = true

						localStorage.setItem( 'kagi_token', this.token )
						localStorage.setItem( 'kagi_user', JSON.stringify( this.user ) )

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
				this.loading = false
			}
		},

		async adminLogin( email, password ) {
			this.loading = true
			try {
				if ( USE_MOCK_BACKEND ) {
					// Using mock backend
					const auth = await backend.auth()
					const response = await auth.login( email, password )

					if ( response.success ) {
						this.user = response.data.user
						this.token = response.data.token
						this.isAuthenticated = true

						localStorage.setItem( 'kagi_token', this.token )
						localStorage.setItem( 'kagi_user', JSON.stringify( this.user ) )

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
				this.loading = false
			}
		},

		async checkAuth() {
			const token = localStorage.getItem( 'kagi_token' )
			const user = localStorage.getItem( 'kagi_user' )

			if ( token && user ) {
				this.token = token
				this.user = JSON.parse( user )
				this.isAuthenticated = true

				if ( USE_MOCK_BACKEND ) {
					// Mock backend always validates stored tokens
					const auth = await backend.auth()
					const response = await auth.getCurrentUser()

					if ( response.success && response.data ) {
						this.user = response.data
						localStorage.setItem( 'kagi_user', JSON.stringify( this.user ) )
					} else {
						this.logout()
					}
				} else {
					// Real backend implementation would go here
					this.logout()
				}
			}
		},

		async logout() {
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

			this.user = null
			this.token = null
			this.isAuthenticated = false
			localStorage.removeItem( 'kagi_token' )
			localStorage.removeItem( 'kagi_user' )
		}
	}
} )
