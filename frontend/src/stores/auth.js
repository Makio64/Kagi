import axios from 'axios'
import { defineStore } from 'pinia'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3333'
const TEST_MODE = import.meta.env.VITE_TEST_MODE === 'true' || true // Enable test mode by default for now

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
				if ( TEST_MODE ) {
					// In test mode, generate a fake token and return it
					const fakeToken = btoa( JSON.stringify( { email, role, mansionId, timestamp: Date.now() } ) )
					// Simulate API delay
					await new Promise( resolve => setTimeout( resolve, 500 ) )
					return { 
						success: true, 
						message: 'Magic link generated (TEST MODE)',
						token: fakeToken,
						email
					}
				} else {
					const response = await axios.post( `${API_URL}/api/auth/magic-link`, {
						email,
						role,
						mansionId
					} )
					return response.data
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
				if ( TEST_MODE ) {
					// In test mode, decode the fake token and create a fake user
					const tokenData = JSON.parse( atob( token ) )
					const fakeUser = {
						id: Math.random().toString( 36 ).substr( 2, 9 ),
						email: tokenData.email,
						role: tokenData.role || 'resident',
						mansionId: tokenData.mansionId || 'mansion_001'
					}
					
					this.user = fakeUser
					this.token = token
					this.isAuthenticated = true
					
					localStorage.setItem( 'kagi_token', token )
					localStorage.setItem( 'kagi_user', JSON.stringify( fakeUser ) )
					
					return { user: fakeUser, token }
				} else {
					const response = await axios.post( `${API_URL}/api/auth/verify-magic-link`, {
						token
					} )
					this.user = response.data.user
					this.token = response.data.token
					this.isAuthenticated = true
					
					// Set axios default header
					axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
					
					// Store in localStorage
					localStorage.setItem( 'kagi_token', this.token )
					localStorage.setItem( 'kagi_user', JSON.stringify( this.user ) )
					
					return response.data
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
				if ( TEST_MODE ) {
					// In test mode, accept any password and create a fake admin
					await new Promise( resolve => setTimeout( resolve, 500 ) )
					const fakeAdmin = {
						id: Math.random().toString( 36 ).substr( 2, 9 ),
						email: email,
						role: 'admin',
						mansionId: 'mansion_001'
					}
					const fakeToken = btoa( JSON.stringify( { email, role: 'admin', timestamp: Date.now() } ) )
					
					this.user = fakeAdmin
					this.token = fakeToken
					this.isAuthenticated = true
					
					localStorage.setItem( 'kagi_token', fakeToken )
					localStorage.setItem( 'kagi_user', JSON.stringify( fakeAdmin ) )
					
					return { user: fakeAdmin, token: fakeToken }
				} else {
					const response = await axios.post( `${API_URL}/api/auth/admin-login`, {
						email,
						password
					} )
					this.user = response.data.user
					this.token = response.data.token
					this.isAuthenticated = true
					
					axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
					localStorage.setItem( 'kagi_token', this.token )
					localStorage.setItem( 'kagi_user', JSON.stringify( this.user ) )
					
					return response.data
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
				axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
				
				try {
					const response = await axios.get( `${API_URL}/api/auth/me` )
					this.user = response.data.user
					localStorage.setItem( 'kagi_user', JSON.stringify( this.user ) )
				} catch ( error ) {
					console.error( 'Auth check failed:', error )
					this.logout()
				}
			}
		},

		async logout() {
			try {
				await axios.post( `${API_URL}/api/auth/logout` )
			} catch ( error ) {
				console.error( 'Logout error:', error )
			}
			
			this.user = null
			this.token = null
			this.isAuthenticated = false
			delete axios.defaults.headers.common['Authorization']
			localStorage.removeItem( 'kagi_token' )
			localStorage.removeItem( 'kagi_user' )
		}
	}
} )