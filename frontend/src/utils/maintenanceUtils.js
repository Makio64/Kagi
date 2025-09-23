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
		title: 'Plumbing',
		description: 'Leaks, clogs, water pressure issues'
	},
	{
		id: 'electrical',
		icon: '⚡',
		title: 'Electrical',
		description: 'Power outlets, lighting, circuit issues'
	},
	{
		id: 'aircon',
		icon: '❄️',
		title: 'Air Conditioning',
		description: 'Heating, cooling, ventilation problems'
	},
	{
		id: 'pest',
		icon: '🐛',
		title: 'Pest Control',
		description: 'Insects, rodents, or other pest issues'
	},
	{
		id: 'other',
		icon: '🔧',
		title: 'Other',
		description: 'General repairs and maintenance'
	}
]