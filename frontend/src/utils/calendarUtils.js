/**
 * Calendar utility functions for adding events to calendar
 * Supports Google Calendar, Apple Calendar, Outlook, and ICS file download
 */

/**
 * Format date to YYYYMMDD format for calendar
 */
function formatDateForCalendar( date ) {
	const year = date.getFullYear()
	const month = String( date.getMonth() + 1 ).padStart( 2, '0' )
	const day = String( date.getDate() ).padStart( 2, '0' )
	return `${year}${month}${day}`
}

/**
 * Format date to YYYYMMDDTHHMMSS format for calendar with time
 */
function formatDateTimeForCalendar( date ) {
	const year = date.getFullYear()
	const month = String( date.getMonth() + 1 ).padStart( 2, '0' )
	const day = String( date.getDate() ).padStart( 2, '0' )
	const hours = String( date.getHours() ).padStart( 2, '0' )
	const minutes = String( date.getMinutes() ).padStart( 2, '0' )
	const seconds = String( date.getSeconds() ).padStart( 2, '0' )
	return `${year}${month}${day}T${hours}${minutes}${seconds}`
}

/**
 * Parse time string (e.g., "09:00", "14:30") to hours and minutes
 */
function parseTime( timeString ) {
	if ( !timeString ) return { hours: 9, minutes: 0 }
	const [hours, minutes] = timeString.split( ':' ).map( Number )
	return { hours, minutes }
}

/**
 * Parse half-day time (morning/afternoon) to start and end times
 */
function parseHalfDayTime( period ) {
	if ( period === 'morning' ) {
		return {
			startHours: 9,
			startMinutes: 0,
			endHours: 13,
			endMinutes: 0
		}
	} else {
		return {
			startHours: 14,
			startMinutes: 0,
			endHours: 18,
			endMinutes: 0
		}
	}
}

/**
 * Create start and end datetime objects for calendar events
 */
function createEventDates( startDate, endDate, time, bookingType ) {
	let eventStart, eventEnd

	if ( bookingType === 'full-day' ) {
		// Full-day event (no specific time)
		eventStart = new Date( startDate )
		eventEnd = new Date( endDate || startDate )
		eventEnd.setDate( eventEnd.getDate() + 1 ) // End date is exclusive for all-day events
	} else if ( bookingType === 'half-day' ) {
		// Half-day event (morning or afternoon)
		const times = parseHalfDayTime( time )
		eventStart = new Date( startDate )
		eventStart.setHours( times.startHours, times.startMinutes, 0, 0 )
		eventEnd = new Date( startDate )
		eventEnd.setHours( times.endHours, times.endMinutes, 0, 0 )
	} else if ( bookingType === 'hourly' ) {
		// Hourly event (specific time slot)
		const { hours, minutes } = parseTime( time )
		eventStart = new Date( startDate )
		eventStart.setHours( hours, minutes, 0, 0 )
		eventEnd = new Date( startDate )
		eventEnd.setHours( hours + 1, minutes, 0, 0 ) // 1 hour duration
	}

	return { eventStart, eventEnd }
}

/**
 * Generate Google Calendar URL
 */
export function generateGoogleCalendarUrl( { title, description, location, startDate, endDate, time, bookingType } ) {
	const { eventStart, eventEnd } = createEventDates( startDate, endDate, time, bookingType )

	const dates = bookingType === 'full-day'
		? `${formatDateForCalendar( eventStart )}/${formatDateForCalendar( eventEnd )}`
		: `${formatDateTimeForCalendar( eventStart )}/${formatDateTimeForCalendar( eventEnd )}`

	const params = new URLSearchParams( {
		action: 'TEMPLATE',
		text: title,
		details: description || '',
		location: location || '',
		dates
	} )

	return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Generate ICS file content (for Apple Calendar, Outlook, etc.)
 */
export function generateICSFile( { title, description, location, startDate, endDate, time, bookingType } ) {
	const { eventStart, eventEnd } = createEventDates( startDate, endDate, time, bookingType )

	const now = new Date()
	const timestamp = formatDateTimeForCalendar( now )
	const uid = `${timestamp}-${Math.random().toString( 36 ).substr( 2, 9 )}@kagi.app`

	const formatForICS = bookingType === 'full-day'
		? ( date ) => `;VALUE=DATE:${formatDateForCalendar( date )}`
		: ( date ) => `:${formatDateTimeForCalendar( date )}`

	const icsContent = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Kagi//Facility Booking//EN',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH',
		'BEGIN:VEVENT',
		`UID:${uid}`,
		`DTSTAMP:${timestamp}`,
		`DTSTART${formatForICS( eventStart )}`,
		`DTEND${formatForICS( eventEnd )}`,
		`SUMMARY:${title}`,
		description ? `DESCRIPTION:${description.replace( /\n/g, '\\n' )}` : '',
		location ? `LOCATION:${location}` : '',
		'STATUS:CONFIRMED',
		'SEQUENCE:0',
		'END:VEVENT',
		'END:VCALENDAR'
	].filter( Boolean ).join( '\r\n' )

	return icsContent
}

/**
 * Download ICS file
 */
export function downloadICSFile( icsContent, filename = 'event.ics' ) {
	const blob = new Blob( [icsContent], { type: 'text/calendar;charset=utf-8' } )
	const link = document.createElement( 'a' )
	link.href = URL.createObjectURL( blob )
	link.download = filename
	document.body.appendChild( link )
	link.click()
	document.body.removeChild( link )
	URL.revokeObjectURL( link.href )
}

/**
 * Generate Outlook Web URL
 */
export function generateOutlookUrl( { title, description, location, startDate, endDate, time, bookingType } ) {
	const { eventStart, eventEnd } = createEventDates( startDate, endDate, time, bookingType )

	const params = new URLSearchParams( {
		path: '/calendar/action/compose',
		rru: 'addevent',
		subject: title,
		body: description || '',
		location: location || '',
		startdt: eventStart.toISOString(),
		enddt: eventEnd.toISOString(),
		allday: bookingType === 'full-day' ? 'true' : 'false'
	} )

	return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`
}

/**
 * Main function to add event to calendar
 * Opens a menu with calendar options
 */
export function addToCalendar( eventData ) {
	const { title, description, location, startDate, endDate, time, bookingType, reference } = eventData

	// For mobile devices, try to detect platform and open appropriate calendar
	const userAgent = navigator.userAgent.toLowerCase()
	const isIOS = /iphone|ipad|ipod/.test( userAgent )
	const isAndroid = /android/.test( userAgent )

	if ( isIOS || isAndroid ) {
		// For mobile, download ICS file which will open in default calendar app
		const icsContent = generateICSFile( { title, description, location, startDate, endDate, time, bookingType } )
		const filename = reference ? `${reference}.ics` : 'booking.ics'
		downloadICSFile( icsContent, filename )
	} else {
		// For desktop, open Google Calendar by default (most popular)
		const googleUrl = generateGoogleCalendarUrl( { title, description, location, startDate, endDate, time, bookingType } )
		window.open( googleUrl, '_blank' )
	}
}

/**
 * Get all calendar options (for showing a choice menu)
 */
export function getCalendarOptions( eventData ) {
	return {
		google: generateGoogleCalendarUrl( eventData ),
		outlook: generateOutlookUrl( eventData ),
		ics: () => {
			const icsContent = generateICSFile( eventData )
			const filename = eventData.reference ? `${eventData.reference}.ics` : 'booking.ics'
			downloadICSFile( icsContent, filename )
		}
	}
}
