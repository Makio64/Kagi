import { createApp } from 'vue'
import { TinyRouterInstall } from 'vue-tiny-router'
import TranslatePlugin, { loadTranslations } from 'vue-tiny-translation'

import App from './App.vue'
import { detectLang } from './makio/utils/detect.js'

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

	app.use( TranslatePlugin )
	app.use( TinyRouterInstall )
	app.mount( '#app' )
}
init()
