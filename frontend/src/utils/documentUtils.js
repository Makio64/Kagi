/**
 * Document utility functions
 */

/**
 * Load markdown document
 * @param {String} docType - Document type (management, facility, parking)
 * @returns {Promise<String>} Document content
 */
export async function loadDocument( docType ) {
	const docMap = {
		management: '/documents/management-rules.md',
		facility: '/documents/facility-rules.md',
		parking: '/documents/parking-rules.md'
	}

	const path = docMap[docType]
	if ( !path ) {
		throw new Error( `Unknown document type: ${docType}` )
	}

	try {
		const response = await fetch( path )
		if ( !response.ok ) {
			throw new Error( `Failed to load document: ${response.status}` )
		}
		return await response.text()
	} catch ( error ) {
		console.error( 'Error loading document:', error )
		// Return fallback content
		return getFallbackContent( docType )
	}
}

/**
 * Get fallback content if document fails to load
 * @param {String} docType - Document type
 * @returns {String} Fallback content
 */
function getFallbackContent( docType ) {
	const fallbacks = {
		management: '# Management Rules\n\nDocument is temporarily unavailable. Please contact the management office.',
		facility: '# Facility Rules\n\nDocument is temporarily unavailable. Please contact the management office.',
		parking: '# Parking Rules\n\nDocument is temporarily unavailable. Please contact the management office.'
	}
	return fallbacks[docType] || '# Document Unavailable\n\nPlease try again later.'
}

/**
 * Get document metadata
 * @param {String} docType - Document type
 * @returns {Object} Document metadata
 */
export function getDocumentMetadata( docType ) {
	const metadata = {
		management: {
			title: 'Management Rules',
			icon: '📋',
			lastUpdated: 'January 2024',
			description: 'Building management rules and guidelines for all residents'
		},
		facility: {
			title: 'Facility Rules',
			icon: '🏢',
			lastUpdated: 'December 2024',
			description: 'Guidelines for using building facilities'
		},
		parking: {
			title: 'Parking Rules',
			icon: '🚗',
			lastUpdated: 'January 2024',
			description: 'Parking regulations and guidelines'
		}
	}
	return metadata[docType] || { title: 'Unknown Document', icon: '📄' }
}

/**
 * Document type mapping
 */
export const documentTypes = {
	'Management-Rules': 'management',
	'Facility-Rules': 'facility',
	'Parking-Rules': 'parking'
}