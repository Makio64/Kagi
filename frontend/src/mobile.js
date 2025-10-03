// Mobile-specific initialization
import { Capacitor } from '@capacitor/core'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { Keyboard, KeyboardStyle } from '@capacitor/keyboard'

export async function initMobile() {
	// Only run on native platforms
	if ( !Capacitor.isNativePlatform() ) {
		return
	}

	try {
		// Configure Status Bar
		await StatusBar.setStyle( { style: Style.Light } )
		await StatusBar.setBackgroundColor( { color: '#FFC107' } ) // Your yellow theme

		// Configure Keyboard
		await Keyboard.setStyle( { style: KeyboardStyle.Light } )
		await Keyboard.setResizeMode( { mode: 'native' } )

		// Hide splash screen when app is ready
		await SplashScreen.hide()

		console.log( '📱 Mobile initialization complete' )
	} catch ( error ) {
		console.error( 'Mobile initialization error:', error )
	}
}

// Check if running in native app
export function isNative() {
	return Capacitor.isNativePlatform()
}

// Get platform info
export function getPlatform() {
	return Capacitor.getPlatform() // 'ios', 'android', or 'web'
}
