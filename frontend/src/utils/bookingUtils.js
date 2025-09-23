/**
 * Booking utility functions
 */

/**
 * Calculate countdown for bookings
 * @param {Date} bookingDate - The booking date
 * @returns {Object} Object with text and class for display
 */
export function getBookingCountdown( bookingDate ) {
	const now = new Date()
	const booking = new Date( bookingDate )

	// Reset time parts for accurate day comparison
	now.setHours( 0, 0, 0, 0 )
	booking.setHours( 0, 0, 0, 0 )

	const diffTime = booking - now
	const diffDays = Math.ceil( diffTime / ( 1000 * 60 * 60 * 24 ) )

	if ( diffDays < 0 ) return { text: 'Past', class: 'past' }
	if ( diffDays === 0 ) return { text: 'Today', class: 'today' }
	if ( diffDays === 1 ) return { text: 'Tomorrow', class: 'tomorrow' }
	if ( diffDays <= 7 ) return { text: `In ${diffDays} days`, class: 'upcoming' }
	return { text: `In ${diffDays} days`, class: 'future' }
}

/**
 * Filter bookings based on time filter
 * @param {Array} bookings - Array of booking objects
 * @param {String} filter - Filter type ('upcoming', 'past', 'all')
 * @returns {Array} Filtered bookings
 */
export function filterBookings( bookings, filter ) {
	const now = new Date()
	now.setHours( 0, 0, 0, 0 )

	return bookings.filter( booking => {
		const bookingDate = new Date( booking.date )
		bookingDate.setHours( 0, 0, 0, 0 )
		const diffTime = bookingDate - now

		if ( filter === 'upcoming' ) {
			return diffTime >= 0
		} else if ( filter === 'past' ) {
			return diffTime < 0
		}
		return true
	} )
}

/**
 * Sample bookings data for demo
 */
export const sampleBookings = [
	{
		id: 1,
		facility: 'Party Room',
		facilityId: 'party',
		icon: '🎉',
		month: 'DEC',
		day: '25',
		date: new Date( 2024, 11, 25, 14, 0 ),
		time: '14:00 - 16:00',
		duration: '2 hours',
		purpose: 'Birthday celebration',
		reference: 'BK20241225'
	},
	{
		id: 2,
		facility: 'Fitness Gym',
		facilityId: 'gym',
		icon: '💪',
		month: 'DEC',
		day: '23',
		date: new Date( 2024, 11, 23, 9, 0 ),
		time: '09:00 - 10:00',
		duration: '1 hour',
		purpose: 'Morning workout',
		reference: 'BK20241223'
	},
	{
		id: 3,
		facility: 'Guest Room',
		facilityId: 'guest',
		icon: '🛏️',
		month: 'DEC',
		day: '24',
		date: new Date( 2024, 11, 24, 15, 0 ),
		endDate: new Date( 2024, 11, 26, 11, 0 ),
		time: 'Check-in 3PM',
		duration: '2 nights',
		purpose: 'Family visit',
		reference: 'BK20241224'
	}
]