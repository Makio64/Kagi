/**
 * Maintenance utility functions
 */

/**
 * Get icon for maintenance category
 * @param {String} category - The maintenance category
 * @returns {String} The icon emoji
 */
export function getCategoryIcon( category ) {
	const icons = {
		plumbing: '🚰',
		electrical: '⚡',
		aircon: '❄️',
		pest: '🐛',
		other: '🔧'
	}
	return icons[category] || '🔧'
}

/**
 * Get display name for maintenance category
 * @param {String} category - The maintenance category
 * @returns {String} The display name
 */
export function getCategoryName( category ) {
	const names = {
		plumbing: 'Plumbing',
		electrical: 'Electrical',
		aircon: 'Air Conditioning',
		pest: 'Pest Control',
		other: 'Other'
	}
	return names[category] || 'Other'
}

/**
 * Maintenance categories with details
 */
export const maintenanceCategories = [
	{
		id: 'plumbing',
		icon: '🚰',
		descriptionKey: 'dashboard.maintenance.plumbing.description'
	},
	{
		id: 'electrical',
		icon: '⚡',
		descriptionKey: 'dashboard.maintenance.electrical.description'
	},
	{
		id: 'aircon',
		icon: '❄️',
		descriptionKey: 'dashboard.maintenance.aircon.description'
	},
	{
		id: 'pest',
		icon: '🐛',
		descriptionKey: 'dashboard.maintenance.pest.description'
	},
	{
		id: 'other',
		icon: '🔧',
		descriptionKey: 'dashboard.maintenance.other.description'
	}
]