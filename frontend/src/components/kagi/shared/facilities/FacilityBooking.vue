<template>
	<div class="facility-booking">
		<!-- Header -->
		<div class="booking-header">
			<button class="back-btn" @click="$emit('close')">
				← {{ $t('common.back') }}
			</button>
			<h2>{{ $t(`booking.booking${facility.id.charAt(0).toUpperCase() + facility.id.slice(1)}`) }}</h2>
		</div>
		<!-- Success Message -->
		<transition name="slide-down">
			<div v-if="bookingSuccess" class="booking-success">
				<div class="success-icon">
					<svg width="80" height="80" viewBox="0 0 80 80" fill="none">
						<circle cx="40" cy="40" r="38" stroke="currentColor" stroke-width="4" />
						<path d="M25 40L35 50L55 30" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
					</svg>
				</div>
				<h3>{{ $t('booking.successTitle') }}</h3>
				<p>{{ $t('booking.successMessage') }}</p>
				<div class="booking-details-summary">
					<div class="detail-item">
						<span class="label">{{ $t('booking.reference') }}:</span>
						<span class="value">{{ bookingReference }}</span>
					</div>
					<div class="detail-item">
						<span class="label">{{ $t('booking.facility') }}:</span>
						<span class="value">{{ facility.name }}</span>
					</div>
					<div class="detail-item">
						<span class="label">{{ $t('booking.date') }}:</span>
						<span class="value">{{ getBookingDateDisplay() }}</span>
					</div>
					<div v-if="selectedTime" class="detail-item">
						<span class="label">{{ $t('booking.time') }}:</span>
						<span class="value">{{ getBookingTimeDisplay() }}</span>
					</div>
				</div>
				<div class="success-actions">
					<button class="calendar-btn" @click="addToCalendar">
						<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
							<rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" stroke-width="2" />
							<path d="M13 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
							<path d="M7 2V6" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
							<path d="M3 9H17" stroke="currentColor" stroke-width="2" />
						</svg>
						{{ $t('booking.addToCalendar') }}
					</button>
					<button class="new-booking-btn" @click="resetBooking">
						{{ $t('booking.newBooking') }}
					</button>
				</div>
			</div>
		</transition>
		<!-- Main Booking Content -->
		<div v-if="!bookingSuccess" class="booking-main">
			<!-- Left: Booking Form -->
			<div class="booking-form">
				<h3>{{ $t('booking.details') }}</h3>
				<!-- Date Selection -->
				<div v-if="facility.bookingType === 'full-day'" class="form-group">
					<label>{{ $t('booking.checkInDate') }}</label>
					<button
						class="picker-button"
						:class="{ 'has-value': startDate }"
						@click="toggleDatePicker('checkin')"
					>
						<svg width="18" height="18" viewBox="0 0 20 20" fill="none">
							<rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5" />
							<path d="M13 2V6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
							<path d="M7 2V6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
							<path d="M3 9H17" stroke="currentColor" stroke-width="1.5" />
						</svg>
						<span>{{ startDate ? formatDate(startDate) : $t('booking.selectCheckIn') }}</span>
					</button>
					<!-- Check-in Date Picker Dropdown -->
					<transition name="dropdown">
						<div v-if="showCheckinPicker" class="picker-dropdown">
							<div class="month-navigation">
								<button class="nav-btn" :disabled="isCurrentMonth" @click="changeMonth(-1)">
									<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
										<path d="M12 5L7 10L12 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
									</svg>
								</button>
								<span class="current-month">{{ currentMonthYear }}</span>
								<button class="nav-btn" @click="changeMonth(1)">
									<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
										<path d="M8 5L13 10L8 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
									</svg>
								</button>
							</div>
							<div class="calendar-container">
								<div class="calendar-header">
									<div v-for="day in weekDays" :key="day" class="day-label">{{ day }}</div>
								</div>
								<div class="calendar-grid">
									<button
										v-for="date in calendarDays"
										:key="date.key"
										:class="['calendar-date', {
											'other-month': date.otherMonth,
											'today': date.isToday,
											'selected': isDateSelected(date, 'checkin'),
											'unavailable': date.unavailable,
											'past': date.past
										}]"
										:disabled="date.otherMonth || date.unavailable || date.past"
										@click="selectCheckinDate(date)"
									>
										{{ date.day }}
									</button>
								</div>
							</div>
						</div>
					</transition>
				</div>
				<div v-if="facility.bookingType === 'full-day'" class="form-group">
					<label>{{ $t('booking.checkOutDate') }}</label>
					<button
						class="picker-button"
						:class="{ 'has-value': endDate, 'disabled': !startDate }"
						:disabled="!startDate"
						@click="toggleDatePicker('checkout')"
					>
						<svg width="18" height="18" viewBox="0 0 20 20" fill="none">
							<rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5" />
							<path d="M13 2V6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
							<path d="M7 2V6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
							<path d="M3 9H17" stroke="currentColor" stroke-width="1.5" />
						</svg>
						<span>{{ endDate ? formatDate(endDate) : $t('booking.selectCheckOut') }}</span>
					</button>
					<!-- Check-out Date Picker Dropdown -->
					<transition name="dropdown">
						<div v-if="showCheckoutPicker" class="picker-dropdown">
							<div class="month-navigation">
								<button class="nav-btn" :disabled="isCurrentMonth" @click="changeMonth(-1)">
									<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
										<path d="M12 5L7 10L12 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
									</svg>
								</button>
								<span class="current-month">{{ currentMonthYear }}</span>
								<button class="nav-btn" @click="changeMonth(1)">
									<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
										<path d="M8 5L13 10L8 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
									</svg>
								</button>
							</div>
							<div class="calendar-container">
								<div class="calendar-header">
									<div v-for="day in weekDays" :key="day" class="day-label">{{ day }}</div>
								</div>
								<div class="calendar-grid">
									<button
										v-for="date in calendarDays"
										:key="date.key"
										:class="['calendar-date', {
											'other-month': date.otherMonth,
											'today': date.isToday,
											'selected': isDateSelected(date, 'checkout'),
											'unavailable': date.unavailable || (startDate && date.date <= startDate),
											'past': date.past
										}]"
										:disabled="date.otherMonth || date.unavailable || date.past || (startDate && date.date <= startDate)"
										@click="selectCheckoutDate(date)"
									>
										{{ date.day }}
									</button>
								</div>
							</div>
						</div>
					</transition>
				</div>
				<!-- Single Date Selection for Party Room and Gym -->
				<div v-else class="form-group">
					<label>{{ $t('booking.date') }}</label>
					<button
						class="picker-button"
						:class="{ 'has-value': startDate }"
						@click="toggleDatePicker('single')"
					>
						<svg width="18" height="18" viewBox="0 0 20 20" fill="none">
							<rect x="3" y="4" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5" />
							<path d="M13 2V6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
							<path d="M7 2V6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
							<path d="M3 9H17" stroke="currentColor" stroke-width="1.5" />
						</svg>
						<span>{{ startDate ? formatDate(startDate) : $t('booking.selectDate') }}</span>
					</button>
					<!-- Date Picker Dropdown -->
					<transition name="dropdown">
						<div v-if="showDatePicker" class="picker-dropdown">
							<div class="month-navigation">
								<button class="nav-btn" :disabled="isCurrentMonth" @click="changeMonth(-1)">
									<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
										<path d="M12 5L7 10L12 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
									</svg>
								</button>
								<span class="current-month">{{ currentMonthYear }}</span>
								<button class="nav-btn" @click="changeMonth(1)">
									<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
										<path d="M8 5L13 10L8 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
									</svg>
								</button>
							</div>
							<div class="calendar-container">
								<div class="calendar-header">
									<div v-for="day in weekDays" :key="day" class="day-label">{{ day }}</div>
								</div>
								<div class="calendar-grid">
									<button
										v-for="date in calendarDays"
										:key="date.key"
										:class="['calendar-date', {
											'other-month': date.otherMonth,
											'today': date.isToday,
											'selected': isDateSelected(date, 'single'),
											'unavailable': date.unavailable,
											'past': date.past
										}]"
										:disabled="date.otherMonth || date.unavailable || date.past"
										@click="selectSingleDate(date)"
									>
										{{ date.day }}
									</button>
								</div>
							</div>
						</div>
					</transition>
				</div>
				<!-- Time Selection for Party Room and Gym -->
				<div v-if="facility.bookingType !== 'full-day'" class="form-group">
					<label>{{ $t('booking.time') }}</label>
					<button
						class="picker-button"
						:class="{ 'has-value': selectedTime, 'disabled': !startDate }"
						:disabled="!startDate"
						@click.stop="toggleTimePicker"
					>
						<svg width="18" height="18" viewBox="0 0 20 20" fill="none">
							<circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5" />
							<path d="M10 5V10L13 13" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
						</svg>
						<span>{{ getTimeDisplayText() }}</span>
					</button>
					<!-- Time Picker Dropdown -->
					<transition name="dropdown">
						<div v-if="showTimePicker" class="picker-dropdown time-picker">
							<!-- Half-day selection for Party Room -->
							<div v-if="facility.bookingType === 'half-day'" class="half-day-options">
								<button
									:class="['time-option', { 'selected': selectedTime === 'morning' }]"
									@click="selectHalfDay('morning')"
								>
									<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
										<circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5" />
										<path d="M10 3V10L14 6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
									</svg>
									<div>
										<strong>{{ $t('booking.morning') }}</strong>
										<small>9:00 AM - 1:00 PM</small>
									</div>
								</button>
								<button
									:class="['time-option', { 'selected': selectedTime === 'afternoon' }]"
									@click="selectHalfDay('afternoon')"
								>
									<svg width="20" height="20" viewBox="0 0 20 20" fill="none">
										<circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="1.5" />
										<path d="M10 3V10L6 14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
									</svg>
									<div>
										<strong>{{ $t('booking.afternoon') }}</strong>
										<small>2:00 PM - 6:00 PM</small>
									</div>
								</button>
							</div>
							<!-- Hourly slots for Gym -->
							<div v-if="facility.bookingType === 'hourly'" class="hourly-slots">
								<div class="time-grid">
									<button
										v-for="slot in timeSlots"
										:key="slot.time"
										:class="['time-slot', {
											'selected': selectedTime === slot.time,
											'unavailable': slot.booked
										}]"
										:disabled="slot.booked"
										@click="selectTimeSlot(slot)"
									>
										{{ slot.time }}
										<span v-if="slot.booked" class="booked-label">{{ $t('booking.booked') }}</span>
									</button>
								</div>
							</div>
						</div>
					</transition>
				</div>
				<!-- Terms Agreement -->
				<div class="terms-agreement">
					<label class="checkbox-label">
						<input
							v-model="agreeToTerms"
							type="checkbox"
						>
						<span>
							{{ $t('booking.agreeToTerms') }}
							<a href="#" class="terms-link" @click.prevent="showTermsModal = true">{{ $t('booking.termsAndConditions') }}</a>
						</span>
					</label>
				</div>
				<!-- Total Cost Display -->
				<div v-if="calculateCost" class="cost-display">
					<span class="cost-label">{{ $t('booking.totalCost') }}:</span>
					<span class="cost-value">{{ calculateCost }}</span>
				</div>
				<!-- Book Button -->
				<GradientButton
					color="yellow"
					:is-full="true"
					:class="['book-button-wrapper', { 'disabled': !canBook }]"
				>
					<button
						class="book-button"
						:disabled="!canBook"
						@click="confirmBooking"
					>
						<span v-if="processingBooking" class="btn-content">
							<div class="spinner" />
							{{ $t('booking.processing') }}
						</span>
						<span v-else class="btn-content">
							{{ $t(`booking.book${facility.id.charAt(0).toUpperCase() + facility.id.slice(1)}`) }}
						</span>
					</button>
				</GradientButton>
			</div>
			<!-- Right: Facility Card -->
			<div class="facility-info-card">
				<div class="facility-image" :style="facility.image ? { backgroundImage: `url(${facility.image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}">
					<div v-if="!facility.image" class="facility-icon-large">{{ facility.icon }}</div>
				</div>
				<div class="facility-details">
					<h3>{{ facility.name }}</h3>
					<p class="description">{{ facility.description }}</p>

					<div class="info-section">
						<div class="detail-item">
							<span class="detail-label">👥 Capacity:</span>
							<span class="detail-value">{{ facility.capacity }}</span>
						</div>
						<div class="detail-item">
							<span class="detail-label">💴 Price:</span>
							<span class="detail-value">{{ facility.price }}</span>
						</div>
						<div v-if="facility.amenities" class="detail-item">
							<span class="detail-label">✨ Amenities:</span>
							<span class="detail-value">{{ facility.amenities }}</span>
						</div>
					</div>

					<div class="rules-section">
						<h4>📋 Rules</h4>
						<div class="rules-list">
							<div class="rule-item">{{ $t('booking.rule1') }}</div>
							<div class="rule-item">{{ $t('booking.rule2') }}</div>
							<div v-if="facility.bookingType === 'full-day'" class="rule-item">{{ $t('booking.rule3') }}</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Terms & Conditions Modal -->
		<transition name="modal-fade">
			<div v-if="showTermsModal" class="modal-overlay" @click="showTermsModal = false">
				<div class="modal-content" @click.stop>
					<DocumentViewer
						title="Terms & Conditions"
						:content="termsMarkdown"
						last-updated="January 2025"
						@close="showTermsModal = false"
					/>
				</div>
			</div>
		</transition>
	</div>
</template>
<script>
import { addToCalendar } from '../../../../utils/calendarUtils'

export default {
	name: 'FacilityBooking',
	emits: ['close', 'booking-confirmed'],
	props: {
		facility: {
			type: Object,
			default: () => ( {
				id: 'party',
				name: 'Party Room',
				icon: '🎉',
				description: 'Perfect for celebrations and gatherings',
				capacity: '20 people',
				maxCapacity: 20,
				price: '¥10,000/half-day',
				priceValue: 10000,
				amenities: 'Kitchen, Audio system, Projector',
				bookingType: 'half-day' // 'hourly', 'half-day', 'full-day'
			} )
		}
	},
	data() {
		const currentDate = new Date()
		return {
			// Calendar state
			selectedMonth: currentDate.getMonth(),
			selectedYear: currentDate.getFullYear(),
			startDate: null,
			endDate: null,
			selectedTime: null,
			// Dropdown visibility
			showDatePicker: false,
			showCheckinPicker: false,
			showCheckoutPicker: false,
			showTimePicker: false,
			showTermsModal: false,
			// Form state
			specialNotes: '',
			agreeToTerms: false,
			processingBooking: false,
			bookingSuccess: false,
			bookingReference: '',
			confirmedBooking: null,
			// Week days
			weekDays: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
			// Terms content in markdown
			termsMarkdown: `# Facility Booking Terms & Conditions

## 1. Booking Policy

All bookings must be made at least 24 hours in advance. Bookings are confirmed only after payment is processed.

## 2. Cancellation Policy

Cancellations made 48 hours before the booking date will receive a full refund. Cancellations within 48 hours are non-refundable.

## 3. Usage Rules

- Facilities must be used respectfully and left in clean condition
- Maximum capacity limits must be strictly followed
- Noise levels must be kept reasonable, especially after 10 PM
- No smoking or vaping inside facilities
- Residents are responsible for their guests' behavior

## 4. Liability

The building management is not liable for any personal injury or property damage during facility use. Users book facilities at their own risk.

## 5. Payment

Payment must be made in full at the time of booking. Accepted payment methods include credit cards and building account credits.

## 6. Damage

Any damage to the facility or equipment will be charged to the booking resident. A damage deposit may be required for certain facilities.

## 7. Contact

For questions or concerns, please contact building management at **info@kagi-building.com** or call the front desk.`
		}
	},
	computed: {
		isCurrentMonth() {
			const now = new Date()
			return this.selectedMonth === now.getMonth() && this.selectedYear === now.getFullYear()
		},
		currentMonthYear() {
			const months = [
				'January',
				'February',
				'March',
				'April',
				'May',
				'June',
				'July',
				'August',
				'September',
				'October',
				'November',
				'December'
			]
			return `${months[this.selectedMonth]} ${this.selectedYear}`
		},
		calendarDays() {
			const days = []
			const firstDay = new Date( this.selectedYear, this.selectedMonth, 1 )
			const lastDay = new Date( this.selectedYear, this.selectedMonth + 1, 0 )
			const prevLastDay = new Date( this.selectedYear, this.selectedMonth, 0 )
			const startPadding = firstDay.getDay()
			const endPadding = 6 - lastDay.getDay()
			// Previous month padding
			for ( let i = startPadding - 1; i >= 0; i-- ) {
				days.push( {
					key: `prev-${i}`,
					day: prevLastDay.getDate() - i,
					otherMonth: true,
					past: true
				} )
			}
			// Current month days
			const today = new Date()
			today.setHours( 0, 0, 0, 0 )
			for ( let day = 1; day <= lastDay.getDate(); day++ ) {
				const date = new Date( this.selectedYear, this.selectedMonth, day )
				const isToday = date.toDateString() === today.toDateString()
				const isPast = date < today
				days.push( {
					key: `current-${day}`,
					day,
					date,
					isToday,
					past: isPast,
					otherMonth: false,
					unavailable: Math.random() > 0.85 // Random unavailable dates for demo
				} )
			}
			// Next month padding
			for ( let i = 1; i <= endPadding; i++ ) {
				days.push( {
					key: `next-${i}`,
					day: i,
					otherMonth: true,
					past: false
				} )
			}
			return days
		},
		timeSlots() {
			const slots = []
			for ( let hour = 7; hour <= 21; hour++ ) {
				slots.push( {
					time: `${hour.toString().padStart( 2, '0' )}:00`,
					booked: Math.random() > 0.7 // Random booking status for demo
				} )
			}
			return slots
		},
		canBook() {
			const hasDate = this.facility.bookingType === 'full-day'
				? this.startDate && this.endDate
				: this.startDate
			const hasTime = this.facility.bookingType === 'full-day' || this.selectedTime
			return hasDate && hasTime && this.agreeToTerms && !this.processingBooking
		},
		calculateCost() {
			if ( !this.startDate ) return null
			let cost = 0
			if ( this.facility.bookingType === 'full-day' && this.endDate ) {
				const days = Math.ceil( ( this.endDate - this.startDate ) / ( 1000 * 60 * 60 * 24 ) ) + 1
				cost = this.facility.priceValue * days
			} else if ( this.facility.bookingType === 'half-day' ) {
				cost = this.facility.priceValue
			} else if ( this.facility.bookingType === 'hourly' ) {
				cost = this.facility.priceValue || 0
			}
			return cost > 0 ? `¥${cost.toLocaleString()}` : 'Free'
		}
	},
	mounted() {
		this._handleClickOutside = this.handleClickOutside
		document.addEventListener( 'click', this._handleClickOutside )
	},
	unmounted() {
		if ( this._handleClickOutside ) {
			document.removeEventListener( 'click', this._handleClickOutside )
		}
	},
	methods: {
		toggleDatePicker( type ) {
			if ( type === 'checkin' ) {
				this.showCheckinPicker = !this.showCheckinPicker
				this.showCheckoutPicker = false
				this.showTimePicker = false
			} else if ( type === 'checkout' ) {
				this.showCheckoutPicker = !this.showCheckoutPicker
				this.showCheckinPicker = false
				this.showTimePicker = false
			} else {
				this.showDatePicker = !this.showDatePicker
				this.showTimePicker = false
			}
		},
		toggleTimePicker() {
			if ( !this.startDate ) return
			this.showTimePicker = !this.showTimePicker
			this.showDatePicker = false
			this.showCheckinPicker = false
			this.showCheckoutPicker = false
		},
		changeMonth( direction ) {
			if ( direction === -1 ) {
				if ( this.selectedMonth === 0 ) {
					this.selectedMonth = 11
					this.selectedYear--
				} else {
					this.selectedMonth--
				}
			} else {
				if ( this.selectedMonth === 11 ) {
					this.selectedMonth = 0
					this.selectedYear++
				} else {
					this.selectedMonth++
				}
			}
		},
		isDateSelected( date, type ) {
			if ( !date.date ) return false
			if ( type === 'checkin' ) {
				return this.startDate && date.date.toDateString() === this.startDate.toDateString()
			} else if ( type === 'checkout' ) {
				return this.endDate && date.date.toDateString() === this.endDate.toDateString()
			} else {
				return this.startDate && date.date.toDateString() === this.startDate.toDateString()
			}
		},
		selectSingleDate( date ) {
			if ( date.otherMonth || date.unavailable || date.past ) return
			this.startDate = date.date
			this.endDate = date.date
			this.showDatePicker = false
		},
		selectCheckinDate( date ) {
			if ( date.otherMonth || date.unavailable || date.past ) return
			this.startDate = date.date
			this.endDate = null
			this.showCheckinPicker = false
		},
		selectCheckoutDate( date ) {
			if ( date.otherMonth || date.unavailable || date.past ) return
			if ( this.startDate && date.date <= this.startDate ) return
			this.endDate = date.date
			this.showCheckoutPicker = false
		},
		selectHalfDay( period ) {
			this.selectedTime = period
			this.showTimePicker = false
		},
		selectTimeSlot( slot ) {
			if ( slot.booked ) return
			this.selectedTime = slot.time
			this.showTimePicker = false
		},
		getTimeDisplayText() {
			if ( !this.startDate ) return 'Select date first'
			if ( this.selectedTime ) {
				if ( this.facility.bookingType === 'half-day' ) {
					return this.selectedTime === 'morning'
						? 'Morning (9:00 AM - 1:00 PM)'
						: 'Afternoon (2:00 PM - 6:00 PM)'
				}
				return this.selectedTime
			}
			return 'Select time'
		},
		getBookingDateDisplay() {
			if ( this.facility.bookingType === 'full-day' && this.startDate && this.endDate ) {
				return `${this.formatDate( this.startDate )} - ${this.formatDate( this.endDate )}`
			}
			return this.startDate ? this.formatDate( this.startDate ) : ''
		},
		getBookingTimeDisplay() {
			if ( this.facility.bookingType === 'half-day' ) {
				return this.selectedTime === 'morning'
					? 'Morning (9:00 AM - 1:00 PM)'
					: 'Afternoon (2:00 PM - 6:00 PM)'
			}
			return this.selectedTime || ''
		},
		formatDate( date ) {
			if ( !date ) return ''
			return date.toLocaleDateString( 'en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric'
			} )
		},
		async confirmBooking() {
			this.processingBooking = true
			await new Promise( resolve => setTimeout( resolve, 2000 ) )
			this.confirmedBooking = {
				facility: this.facility.name,
				startDate: this.startDate,
				endDate: this.endDate,
				time: this.selectedTime
			}
			this.processingBooking = false
			this.bookingSuccess = true
			this.bookingReference = `BK${Date.now().toString().slice( -8 )}`
			// Emit event for parent to handle
			this.$emit( 'booking-confirmed', {
				id: Date.now(),
				facility: this.facility.name,
				startDate: this.startDate,
				endDate: this.endDate,
				time: this.selectedTime,
				specialNotes: this.specialNotes,
				reference: this.bookingReference
			} )
		},
		resetBooking() {
			this.bookingSuccess = false
			this.bookingReference = ''
			this.startDate = null
			this.endDate = null
			this.selectedTime = null
			this.specialNotes = ''
			this.agreeToTerms = false
			this.confirmedBooking = null
		},
		addToCalendar() {
			if ( !this.confirmedBooking ) return

			const eventData = {
				title: `${this.facility.name} Booking`,
				description: `Booking reference: ${this.bookingReference}\n\nFacility: ${this.facility.name}\n${this.facility.description}`,
				location: 'Kagi Building - ' + this.facility.name,
				startDate: this.confirmedBooking.startDate,
				endDate: this.confirmedBooking.endDate,
				time: this.confirmedBooking.time,
				bookingType: this.facility.bookingType,
				reference: this.bookingReference
			}

			addToCalendar( eventData )
		},
		handleClickOutside( event ) {
			const isDateButton = event.target.closest( '.picker-button' )
			const isDropdown = event.target.closest( '.picker-dropdown' )
			if ( !isDateButton && !isDropdown ) {
				this.showDatePicker = false
				this.showCheckinPicker = false
				this.showCheckoutPicker = false
				this.showTimePicker = false
			}
		}
	}
}
</script>
<style lang="stylus" scoped>
.facility-booking
	background white
	border-radius 16px
	height 100%
	max-height 90vh
	display flex
	flex-direction column
	overflow-y auto
.booking-header
	display flex
	align-items center
	gap 1rem
	padding 1.5rem
	border-bottom 1px solid #f0f0f0
	.back-btn
		padding 0.5rem 1rem
		background transparent
		border 1px solid #e5e7eb
		border-radius 8px
		color #6b7280
		cursor pointer
		transition all 0.2s ease
		font-size 0.9rem
		&:hover
			background #f9fafb
			border-color #d1d5db
			color #1a1a1a
	h2
		margin 0
		font-size 1.5rem
		color #1a1a1a
		font-weight 600
// Success Message
.booking-success
	padding 3rem
	text-align center
	.success-icon
		margin 0 auto 1.5rem
		color #10b981
		animation pulse 2s ease infinite
	h3
		margin 0 0 1rem
		font-size 1.75rem
		color #1a1a1a
	p
		color #6b7280
		margin-bottom 2rem
		font-size 1rem
	.booking-details-summary
		background #f9fafb
		border-radius 12px
		padding 1.5rem
		margin-bottom 2rem
		.detail-item
			display flex
			justify-content space-between
			padding 0.75rem 0
			&:not(:last-child)
				border-bottom 1px solid #e5e7eb
			.label
				color #6b7280
				font-weight 500
			.value
				color #1a1a1a
				font-weight 600
	.success-actions
		display flex
		gap 1rem
		justify-content center
		button
			padding 0.75rem 1.5rem
			border-radius 8px
			font-weight 500
			cursor pointer
			transition all 0.2s ease
		.calendar-btn
			background white
			border 2px solid #3b82f6
			color #3b82f6
			display flex
			align-items center
			gap 0.5rem
			&:hover
				background #eff6ff
		.new-booking-btn
			background #3b82f6
			border none
			color white
			&:hover
				background #2563eb
// Main Layout
.booking-main
	display grid
	grid-template-columns 1fr 380px
	gap 2rem
	padding 2rem
	flex 1
	@media (max-width: 900px)
		grid-template-columns 1fr
		gap 1.5rem
		padding 1.5rem
// Booking Form
.booking-form
	h3
		margin 0 0 1.5rem
		font-size 1.25rem
		color #1a1a1a
		font-weight 600
		@media (max-width: 900px)
			display none
.form-group
	margin-bottom 1.5rem
	position relative
	label
		display block
		margin-bottom 0.5rem
		color #374151
		font-weight 500
		font-size 0.9rem
		@media (max-width: 900px)
			display none
		.optional
			color #9ca3af
			font-weight 400
			font-size 0.85rem
// Picker Button
.picker-button
	width 100%
	display flex
	align-items center
	gap 0.75rem
	padding 0.75rem 1rem
	background white
	border 1px solid #d1d5db
	border-radius 8px
	cursor pointer
	transition all 0.2s ease
	font-size 0.95rem
	color #6b7280
	text-align left
	&:hover:not(.disabled)
		border-color #3b82f6
		background #f9fafb
	&.has-value
		color #1a1a1a
		font-weight 500
	&.disabled
		opacity 0.5
		cursor not-allowed
	svg
		flex-shrink 0
		color #6b7280
// Picker Dropdown
.picker-dropdown
	position absolute
	z-index 100
	background white
	border 1px solid #e5e7eb
	border-radius 12px
	box-shadow 0 10px 40px rgba(0, 0, 0, 0.15)
	margin-top 0.5rem
	padding 1rem
	min-width 320px
.month-navigation
	display flex
	align-items center
	justify-content space-between
	margin-bottom 1rem
	padding 0.25rem
	.nav-btn
		width 28px
		height 28px
		display flex
		align-items center
		justify-content center
		background white
		border 1px solid #e5e7eb
		border-radius 6px
		cursor pointer
		transition all 0.2s ease
		color #6b7280
		&:hover:not(:disabled)
			background #f9fafb
			border-color #3b82f6
			color #3b82f6
		&:disabled
			opacity 0.4
			cursor not-allowed
	.current-month
		font-weight 600
		color #1a1a1a
		font-size 0.95rem
.calendar-container
	.calendar-header
		display grid
		grid-template-columns repeat(7, 1fr)
		margin-bottom 0.25rem
		.day-label
			text-align center
			font-weight 600
			color #6b7280
			font-size 0.7rem
			padding 0.25rem
	.calendar-grid
		display grid
		grid-template-columns repeat(7, 1fr)
		gap 2px
.calendar-date
	aspect-ratio 1
	background white
	border 1px solid transparent
	border-radius 6px
	cursor pointer
	transition all 0.15s ease
	display flex
	align-items center
	justify-content center
	font-weight 500
	font-size 0.8rem
	color #374151
	min-height 32px
	&:hover:not(:disabled)
		background #eff6ff
		border-color #3b82f6
	&.other-month
		opacity 0.3
	&.today
		border-color #9ca3af
		font-weight 600
	&.selected
		background #3b82f6
		color white
		font-weight 600
		border-color #3b82f6
	&.unavailable, &.past
		background #f5f5f5
		color #d1d5db
		cursor not-allowed
	&:disabled
		cursor not-allowed
// Time Picker Styles
.time-picker
	.half-day-options
		display flex
		gap 0.75rem
		.time-option
			flex 1
			display flex
			align-items center
			gap 0.75rem
			padding 1rem
			background white
			border 2px solid #e5e7eb
			border-radius 8px
			cursor pointer
			transition all 0.2s ease
			&:hover
				border-color #3b82f6
				background #eff6ff
			&.selected
				border-color #3b82f6
				background #3b82f6
				color white
				svg
					color white
			svg
				flex-shrink 0
				color #6b7280
			div
				text-align left
				strong
					display block
					margin-bottom 0.25rem
				small
					opacity 0.8
					font-size 0.85rem
	.hourly-slots
		.time-grid
			display grid
			grid-template-columns repeat(4, 1fr)
			gap 0.5rem
			max-height 300px
			overflow-y auto
		.time-slot
			padding 0.5rem
			background white
			border 1px solid #e5e7eb
			border-radius 6px
			cursor pointer
			transition all 0.2s ease
			font-size 0.9rem
			text-align center
			position relative
			&:hover:not(.unavailable)
				border-color #3b82f6
				background #eff6ff
			&.selected
				background #3b82f6
				color white
				border-color #3b82f6
			&.unavailable
				background #f5f5f5
				color #9ca3af
				cursor not-allowed
				.booked-label
					display block
					font-size 0.7rem
					margin-top 0.25rem
					color #ef4444
// Form Elements
textarea
	width 100%
	max-width 100%
	box-sizing border-box
	padding 0.75rem
	border 1px solid #d1d5db
	border-radius 8px
	font-family inherit
	font-size 0.9rem
	resize vertical
	transition border-color 0.2s ease
	&:focus
		outline none
		border-color #3b82f6
.terms-agreement
	margin 1.5rem 0
	.checkbox-label
		display flex
		align-items flex-start
		gap 0.5rem
		cursor pointer
		font-size 0.9rem
		color #4b5563
		line-height 1.5
		input[type="checkbox"]
			margin-top 0.125rem
			cursor pointer
			flex-shrink 0
			accent-color #FFA000
		.terms-link
			color #FFA000
			text-decoration underline
			cursor pointer
			font-weight 600
			&:hover
				color #FF8F00
.cost-display
	display flex
	justify-content space-between
	align-items center
	padding 1rem
	background #f9fafb
	border-radius 8px
	margin-bottom 1.5rem
	.cost-label
		color #6b7280
		font-weight 500
	.cost-value
		font-size 1.25rem
		font-weight 700
		color #1a1a1a
.book-button-wrapper
	width 100%
	transition opacity 0.2s ease
	&.disabled
		opacity 0.5
		cursor not-allowed

.book-button
	width 100%
	padding 0.5rem
	background transparent
	color inherit
	border none
	font-size 1rem
	font-weight 600
	cursor pointer
	transition all 0.2s ease
	&:disabled
		opacity 0.5
		cursor not-allowed
	.btn-content
		display flex
		align-items center
		justify-content center
		gap 0.5rem
	.spinner
		width 20px
		height 20px
		border 2px solid rgba(255, 255, 255, 0.3)
		border-top-color white
		border-radius 50%
		animation spin 0.6s linear infinite
// Facility Info Card
.facility-info-card
	background #f9fafb
	border-radius 12px
	padding 1.5rem
	height fit-content
	position sticky
	top 0
	@media (max-width: 900px)
		position static
		margin-bottom "calc(%s + %s)" % (80px var(--saib, 0px))
	.facility-image
		width 100%
		height 180px
		background linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)
		background-size cover
		background-position center
		background-repeat no-repeat
		border-radius 8px
		display flex
		align-items center
		justify-content center
		margin-bottom 1rem
		.facility-icon-large
			font-size 4rem
	.facility-details
		h3
			margin 0 0 0.5rem
			font-size 1.25rem
			color #1a1a1a
			font-weight 600
		.description
			color #6b7280
			font-size 0.9rem
			margin-bottom 1rem
			line-height 1.5
		.info-section
			margin-bottom 1.5rem
			.detail-item
				display flex
				justify-content space-between
				align-items center
				padding 0.75rem 0
				border-bottom 1px solid #f0f0f0
				&:last-child
					border-bottom none
				.detail-label
					font-size 0.9rem
					color #666
					font-weight 500
				.detail-value
					font-size 0.9rem
					color #333
					text-align right
				svg
					flex-shrink 0
		.rules-section
			margin-top 1.5rem
			padding-top 1.5rem
			border-top 1px solid #f0f0f0
			h4
				margin 0 0 0.75rem 0
				font-size 0.95rem
				color #1a1a1a
				font-weight 600
			.rules-list
				.rule-item
					padding 0.75rem 0
					color #4b5563
					font-size 0.85rem
					line-height 1.5
					border-bottom 1px solid #f0f0f0
					&:last-child
						border-bottom none
		.amenities
			margin-top 1.5rem
			h4
				margin 0 0 0.5rem
				font-size 0.95rem
				color #1a1a1a
				font-weight 600
			.amenities-list
				color #6b7280
				font-size 0.85rem
				line-height 1.5
// Animations
.dropdown-enter-active, .dropdown-leave-active
	transition all 0.2s ease
.dropdown-enter-from, .dropdown-leave-to
	opacity 0
	transform translateY(-10px)
.slide-down-enter-active, .slide-down-leave-active
	transition all 0.3s ease
.slide-down-enter-from, .slide-down-leave-to
	opacity 0
	transform translateY(-20px)
@keyframes pulse
	0%, 100%
		transform scale(1)
	50%
		transform scale(1.05)
@keyframes spin
	to
		transform rotate(360deg)

// Modal Styles
.modal-overlay
	position fixed
	top 0
	left 0
	right 0
	bottom 0
	background linear-gradient(135deg, rgba(255, 213, 79, 0.92) 0%, rgba(255, 171, 64, 0.92) 50%, rgba(251, 192, 45, 0.92) 100%)
	backdrop-filter blur(8px)
	display flex
	align-items center
	justify-content center
	z-index 10000
	padding 1rem

.modal-content
	background white
	border-radius 20px
	max-width 900px
	width 100%
	max-height 90vh
	height 90vh
	display flex
	flex-direction column
	overflow hidden
	box-shadow 0 20px 60px rgba(255, 193, 7, 0.3)
	@media (max-width: 768px)
		max-height 95vh
		height 95vh
		border-radius 20px

.modal-fade-enter-active, .modal-fade-leave-active
	transition all 0.3s ease

.modal-fade-enter-from, .modal-fade-leave-to
	opacity 0

.modal-fade-enter-from .modal-content,
.modal-fade-leave-to .modal-content
	transform scale(0.9)
</style>
