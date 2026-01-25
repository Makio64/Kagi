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
import { listenForDeepLinks } from '@/mobile'
import { contentLoaded, initAuth } from '@/store'

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
		'$route'() {
			window.scrollTo( 0, 0 )
		}
	},
	async mounted() {
		// Initialize auth from localStorage first
		initAuth()

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

		// Listen for deep links (e.g. magic link login)
		listenForDeepLinks( ( url ) => {
			// Extract token from URL if present (magic link)
			if ( url.includes( 'token=' ) || url.includes( 'access_token=' ) ) {
				// We can't easily push URL params to TinyRouter if it manages hash/history differently.
				// But Supabase client reads window.location.
				// If we update window.location, the app might reload.
				// Best is to manually trigger navigation to /login with params

				// Basic parsing
				const parts = url.split( '?' )
				// const path = parts[0].replace( /.*:\/\/.*?\//, '/' ) // Remove scheme://host
				// For magic links it might come as query params or hash

				// Simply redirect to login, Login.vue will check session or params (if we could pass them)
				// Since we added checkSession() in Login.vue, if Supabase handles the session from the URL internally
				// (which it usually does from the intent), we just need to be at the page.
				// BUT Supabase JS client inside WebView might not see the intent URL initially.
				// We might need to handle session manually.
				// For now, let's navigate to Login.
				window.location.href = '#/login'
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
