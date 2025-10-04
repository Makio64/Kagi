import { readFileSync, writeFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath( import.meta.url )
const __dirname = dirname( __filename )

const projectPath = join( __dirname, '..', 'ios', 'App', 'App.xcodeproj', 'project.pbxproj' )

try {
	let content = readFileSync( projectPath, 'utf8' )

	// Find current build number
	const buildMatch = content.match( /CURRENT_PROJECT_VERSION = (\d+);/ )
	if ( !buildMatch ) {
		console.error( '❌ Could not find CURRENT_PROJECT_VERSION in project.pbxproj' )
		process.exit( 1 )
	}

	const currentBuild = parseInt( buildMatch[1], 10 )
	const newBuild = currentBuild + 1

	// Replace all occurrences of CURRENT_PROJECT_VERSION
	content = content.replace(
		/CURRENT_PROJECT_VERSION = \d+;/g,
		`CURRENT_PROJECT_VERSION = ${newBuild};`
	)

	writeFileSync( projectPath, content, 'utf8' )

	console.log( `✅ iOS build number incremented: ${currentBuild} → ${newBuild}` )
} catch ( error ) {
	console.error( '❌ Error incrementing iOS build number:', error.message )
	process.exit( 1 )
}
