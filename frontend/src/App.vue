<template>
	<div class="app-container">
		<div class="view">
			<TinyRouter v-if="basicLoaded" :routes="routes" :redirects="redirects" />
		</div>
	</div>
</template>

<script>
import { engine } from 'animejs'
import { TinyRouter } from 'vue-tiny-router'
import { loadTranslations } from 'vue-tiny-translation'

import { detectLang } from '@/makio/utils/detect'
import { listenForAppStateChange, listenForDeepLinks } from '@/mobile'
import { checkSession, contentLoaded, hasRole, initAuth, initInactivityTimer, isAuthenticated, setupAuthListener, userRoles } from '@/store'

// Configure engine with default settings
engine.timeUnit = 's'

// Import Kagi views
import AdminDashboard from '@/views/AdminDashboard'
import Dashboard from '@/views/Dashboard'
import Home from '@/views/Home'
import Login from '@/views/Login'
import MansionAdminDashboard from '@/views/MansionAdminDashboard'

export default {
	name: 'App',
	data() {
		return {
			basicLoaded: false,
		}
	},
	computed: {
		routes() {
			return [
				{
					path: '/',
					component: Home,
				},
				{
					path: '/login',
					component: Login,
				},
				{
					path: '/dashboard',
					component: Dashboard,
				},
				{
					path: '/dashboard/:section',
					component: Dashboard,
				},
				{
					path: '/dashboard/:section/:documentId',
					component: Dashboard,
				},
				{
					path: '/auth/verify',
					component: Login,
				},
				{
					path: '/admin-dashboard',
					component: AdminDashboard,
				},
				{
					path: '/mansion-dashboard',
					component: MansionAdminDashboard,
				},
				{
					path: '/mansion-dashboard/:section',
					component: MansionAdminDashboard,
				},
			]
		},
		redirects() {
			return {
				'/three': '/'
			}
		},
		contentLoaded() {
			return contentLoaded.value
		},
	},
	watch: {
		contentLoaded( newVal ) {
			if ( newVal ) {
				this.hideInitialLoader()
			}
		},
		'$route'( route ) {
			window.scrollTo( 0, 0 )
			this.checkRouteAccess( route )
		}
	},
	async mounted() {
		// Initialize auth from localStorage first (instant UI)
		initAuth()

		// Set up Supabase auth state listener for automatic token refresh
		setupAuthListener()

		// M6: Start session inactivity timeout (no-op on native)
		initInactivityTimer()

		// Detect language: saved preference > browser detection > default
		const savedLang = localStorage.getItem( 'kagi_language' )
		const detectedLang = detectLang( ['en', 'fr', 'ja'] )
		const lang = savedLang || detectedLang || 'en'

		// Load translations
		await loadTranslations( `/translations/${lang}.json` )
		this.basicLoaded = true

		// Remove loader after a short delay if it's still there
		setTimeout( () => {
			this.hideInitialLoader()
		}, 500 )

		// Listen for deep links (e.g. magic link login from kagi:// scheme)
		listenForDeepLinks( ( url ) => {
			try {
				// Extract auth code/token from deep link URL
				// e.g. kagi://login?code=<pkce_code> or kagi://login#access_token=...
				const queryStart = url.indexOf( '?' )
				const hashStart = url.indexOf( '#' )

				if ( queryStart !== -1 ) {
					const queryString = url.substring( queryStart + 1 )
					const params = new URLSearchParams( queryString )
					const code = params.get( 'code' ) || params.get( 'token' )
					if ( code ) {
						sessionStorage.setItem( 'kagi_deep_link_code', code )
					}
				} else if ( hashStart !== -1 ) {
					const hashString = url.substring( hashStart + 1 )
					const params = new URLSearchParams( hashString )
					const accessToken = params.get( 'access_token' )
					if ( accessToken ) {
						sessionStorage.setItem( 'kagi_deep_link_code', accessToken )
					}
				}

				window.location.hash = '#/login'
			} catch ( e ) {
				console.error( '[DeepLink] Failed to parse URL:', e )
				window.location.hash = '#/login'
			}
		} )

		// When app returns to foreground, validate/refresh session
		listenForAppStateChange( async () => {
			if ( isAuthenticated.value ) {
				await checkSession()
			}
		} )
	},
	methods: {
		hideInitialLoader() {
			const loader = document.getElementById( 'initial-loader' )
			if ( loader ) {
				// Slide up to reveal content (awwwards-style)
				loader.style.transform = 'translateY(-100%)'
				setTimeout( () => {
					loader.remove()
				}, 800 )
			}
		},
		checkRouteAccess( route ) {
			const path = route?.path || window.location.hash.replace( '#', '' )

			// Admin dashboard requires admin role
			if ( path.startsWith( '/admin-dashboard' ) ) {
				if ( !isAuthenticated.value ) {
					this.$router.push( '/login' )
					return
				}
				if ( !hasRole( 'admin' ) ) {
					// Redirect non-admins to their appropriate dashboard
					if ( userRoles.value.some( r => ['mansion_admin', 'manager'].includes( r ) ) ) {
						this.$router.push( '/mansion-dashboard' )
					} else {
						this.$router.push( '/dashboard' )
					}
					return
				}
			}

			// Mansion dashboard requires mansion_admin, manager, or admin role
			if ( path.startsWith( '/mansion-dashboard' ) ) {
				if ( !isAuthenticated.value ) {
					this.$router.push( '/login' )
					return
				}
				const allowedRoles = ['admin', 'manager', 'mansion_admin']
				if ( !userRoles.value.some( r => allowedRoles.includes( r ) ) ) {
					this.$router.push( '/dashboard' )
					return
				}
			}

			// Regular dashboard requires authentication
			if ( path.startsWith( '/dashboard' ) ) {
				if ( !isAuthenticated.value ) {
					this.$router.push( '/login' )
				}
			}
		}
	},
	components: {
		TinyRouter
	}
}
</script>

<style lang="stylus">

:root {
	// Safe Area Inset sent by Webview Custom Code (Android & iOS)
  --webviewt: var(--android-safe-area-inset-top, var(--ios-safe-area-inset-top))
  --webviewb: var(--android-safe-area-inset-bottom, var(--ios-safe-area-inset-bottom))
  --webviewl: var(--android-safe-area-inset-left, var(--ios-safe-area-inset-left))
  --webviewr: var(--android-safe-area-inset-right, var(--ios-safe-area-inset-right))

  --sait: var(--webviewt, env(safe-area-inset-top))
  --saib: var(--webviewb, env(safe-area-inset-bottom))
  --sail: var(--webviewl, env(safe-area-inset-left))
  --sair: var(--webviewr, env(safe-area-inset-right))
}

body, html, #app
	font-family -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif
	margin 0
	padding 0
	scroll-behavior auto

html
	-webkit-font-smoothing antialiased
	-moz-osx-font-smoothing grayscale
	background #f5f5f5
	overflow-y auto

body
	overflow-y auto

// App container - let each view handle safe areas
.app-container
	min-height 100vh
	box-sizing border-box
	display flex
	flex-direction column
	background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)

.view
	color #333
	flex 1
	width 100%
	display flex
	flex-direction column

	.loader
		user-select none
		pointer-events none
		position absolute
		z-index 10000
		top calc(50% - 37px)
		left calc(50% - 37px)
		transition all 1.5s ease
		&.hide
			transform scale(1.2)
			opacity 0

	.three, .pixi
		position absolute
		inset 0
		z-index -1
	//Three canvas under pixi canvas for animation purpose only
	.three
		z-index -2
	.pixi
		opacity 0 // for first transition
</style>
