import './styles/global-modern.styl'

import * as Sentry from '@sentry/vue'
import { createApp } from 'vue'
import { TinyRouterInstall } from 'vue-tiny-router'
import TranslatePlugin, { loadTranslations } from 'vue-tiny-translation'

import App from './App.vue'
import { detectLang } from './makio/utils/detect.js'
import { initMobile } from './mobile.js'

async function init() {
	// Detect user's language
	const detectedLang = detectLang()
	const supportedLangs = ['en', 'fr', 'ja']
	const savedLang = localStorage.getItem( 'kagi_language' )
	const defaultLang = savedLang || ( supportedLangs.includes( detectedLang ) ? detectedLang : 'en' )

	// Update loading text based on language
	const loadingTexts = {
		en: 'Loading...',
		fr: 'Chargement...',
		ja: '読み込み中...'
	}
	const loadingElement = document.getElementById( 'loading-text' )
	if ( loadingElement ) {
		loadingElement.textContent = loadingTexts[defaultLang] || loadingTexts.en
	}

	// Load initial translations
	await loadTranslations( `/translations/${defaultLang}.json` )
	localStorage.setItem( 'kagi_language', defaultLang )

	const app = createApp( App )

	// Initialize Sentry error monitoring
	if ( import.meta.env.VITE_SENTRY_DSN ) {
		Sentry.init( {
			app,
			dsn: import.meta.env.VITE_SENTRY_DSN,
			environment: import.meta.env.MODE,
			enabled: import.meta.env.PROD,

			// Performance monitoring
			integrations: [Sentry.browserTracingIntegration()],
			tracesSampleRate: 0.1
		} )
	}

	app.use( TranslatePlugin )

	// Add interpolation support to $t (vue-tiny-translation doesn't support it natively)
	const originalT = app.config.globalProperties.$t
	app.config.globalProperties.$t = ( key, params = null ) => {
		let translation = originalT( key )
		if ( params && typeof params === 'object' ) {
			Object.keys( params ).forEach( k => {
				translation = translation.replace( new RegExp( `\\{${k}\\}`, 'g' ), params[k] )
			} )
		}
		return translation
	}

	app.use( TinyRouterInstall )
	app.mount( '#app' )

	// Initialize mobile features
	await initMobile()
}
init()
