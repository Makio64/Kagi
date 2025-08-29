<template>
	<div class="facility-booking">
		<div class="booking-header">
			<button class="back-btn" @click="$emit('close')">
				← {{ $t('common.back') || 'Back' }}
			</button>
			<h2>📅 {{ facility.name }}</h2>
		</div>

		<div class="booking-content">
			<!-- Success Message (shown first when booking is confirmed) -->
			<div v-if="bookingSuccess" class="booking-success prominent">
				<div class="success-icon">✅</div>
				<h3>{{ $t('booking.successTitle') || 'Booking Confirmed!' }}</h3>
				<p>{{ $t('booking.successMessage') || 'Your facility booking has been confirmed. You will receive a confirmation email shortly.' }}</p>
				<div class="booking-reference">
					<span>{{ $t('booking.reference') || 'Reference' }}:</span>
					<strong>{{ bookingReference }}</strong>
				</div>
				<button class="new-booking-btn" @click="resetBooking">
					{{ $t('booking.newBooking') || 'Make Another Booking' }}
				</button>
			</div>

			<!-- Facility Hero -->
			<div v-if="!bookingSuccess" class="facility-hero">
				<div class="hero-image">
					<span class="facility-emoji">{{ facility.icon }}</span>
				</div>
				<div class="hero-info">
					<h1>{{ facility.name }}</h1>
					<p class="facility-description">{{ facility.description }}</p>
					<div class="facility-tags">
						<span class="tag">{{ facility.capacity }}</span>
						<span class="tag">{{ facility.price }}</span>
						<span v-if="facility.amenities" class="tag">{{ facility.amenities }}</span>
					</div>
				</div>
			</div>

			<!-- Calendar Section -->
			<div v-if="!bookingSuccess" class="calendar-section">
				<h3>📆 {{ $t('booking.selectDate') || 'Select Date & Time' }}</h3>
				
				<div class="month-selector">
					<button @click="changeMonth(-1)">‹</button>
					<span class="current-month">{{ currentMonthYear }}</span>
					<button @click="changeMonth(1)">›</button>
				</div>

				<div class="calendar-grid">
					<div class="calendar-header">
						<div v-for="day in weekDays" :key="day" class="day-label">{{ day }}</div>
					</div>
					<div class="calendar-days">
						<div 
							v-for="date in calendarDays" 
							:key="date.key"
							:class="['calendar-day', {
								'other-month': date.otherMonth,
								'today': date.isToday,
								'selected': date.selected,
								'unavailable': date.unavailable,
								'past': date.past
							}]"
							@click="selectDate(date)"
						>
							<span class="day-number">{{ date.day }}</span>
							<span v-if="date.hasBooking" class="booking-indicator">•</span>
						</div>
					</div>
				</div>

				<!-- Time Slots -->
				<div v-if="selectedDate" class="time-slots">
					<h4>{{ $t('booking.selectTime') || 'Select Time Slot' }}</h4>
					<div class="slots-grid">
						<button 
							v-for="slot in timeSlots" 
							:key="slot.time"
							:class="['time-slot', {
								'selected': selectedTime === slot.time,
								'unavailable': slot.booked
							}]"
							@click="selectTime(slot)"
							:disabled="slot.booked"
						>
							<span class="slot-time">{{ slot.time }}</span>
							<span v-if="slot.booked" class="slot-status">{{ $t('booking.booked') || 'Booked' }}</span>
							<span v-else class="slot-status">{{ $t('booking.available') || 'Available' }}</span>
						</button>
					</div>
				</div>
			</div>

			<!-- Booking Details -->
			<div v-if="selectedDate && selectedTime" class="booking-details">
				<h3>📝 {{ $t('booking.bookingDetails') || 'Booking Details' }}</h3>
				
				<div class="detail-card">
					<div class="detail-row">
						<span class="detail-label">{{ $t('booking.facility') || 'Facility' }}:</span>
						<span class="detail-value">{{ facility.name }}</span>
					</div>
					<div class="detail-row">
						<span class="detail-label">{{ $t('booking.date') || 'Date' }}:</span>
						<span class="detail-value">{{ formatSelectedDate }}</span>
					</div>
					<div class="detail-row">
						<span class="detail-label">{{ $t('booking.time') || 'Time' }}:</span>
						<span class="detail-value">{{ selectedTime }}</span>
					</div>
					<div class="detail-row">
						<span class="detail-label">{{ $t('booking.duration') || 'Duration' }}:</span>
						<span class="detail-value">
							<select v-model="duration">
								<option value="1">1 {{ $t('booking.hour') || 'hour' }}</option>
								<option value="2">2 {{ $t('booking.hours') || 'hours' }}</option>
								<option value="3">3 {{ $t('booking.hours') || 'hours' }}</option>
								<option value="4">4 {{ $t('booking.hours') || 'hours' }}</option>
							</select>
						</span>
					</div>
					<div class="detail-row">
						<span class="detail-label">{{ $t('booking.cost') || 'Total Cost' }}:</span>
						<span class="detail-value cost">{{ calculateCost }}</span>
					</div>
				</div>

				<div class="booking-form">
					<div class="form-group">
						<label>{{ $t('booking.purpose') || 'Purpose of Booking' }}</label>
						<input 
							v-model="bookingPurpose" 
							type="text" 
							:placeholder="$t('booking.purposePlaceholder') || 'e.g., Birthday party, Meeting, etc.'"
						/>
					</div>

					<div v-if="facility.id === 'party'" class="form-group">
						<label>{{ $t('booking.guests') || 'Number of Guests' }}</label>
						<input 
							v-model.number="guestCount" 
							type="number" 
							min="1" 
							:max="facility.maxCapacity"
							:placeholder="`Maximum ${facility.maxCapacity} guests`"
						/>
					</div>

					<div class="form-group">
						<label>{{ $t('booking.notes') || 'Special Requirements' }} ({{ $t('common.optional') || 'optional' }})</label>
						<textarea 
							v-model="specialNotes" 
							rows="3"
							:placeholder="$t('booking.notesPlaceholder') || 'Any special requirements or notes...'"
						/>
					</div>

					<div class="terms-checkbox">
						<input v-model="agreeToTerms" type="checkbox" id="terms" />
						<label for="terms">
							{{ $t('booking.agreeTerms') || 'I agree to the facility usage guidelines and will follow all rules' }}
						</label>
					</div>
				</div>

				<button 
					class="confirm-booking-btn" 
					@click="confirmBooking"
					:disabled="!agreeToTerms || processingBooking"
				>
					{{ processingBooking ? ($t('booking.processing') || 'Processing...') : ($t('booking.confirmBooking') || 'Confirm Booking') }}
				</button>
			</div>

			<!-- Existing Bookings -->
			<div class="existing-bookings">
				<h3>📋 {{ $t('booking.yourBookings') || 'Your Current Bookings' }}</h3>
				<div v-if="userBookings.length > 0" class="bookings-list">
					<div v-for="(booking, index) in userBookings" :key="booking.id" :class="['booking-item', { 'new-booking': index === 0 && bookingSuccess }]">
						<div class="booking-date">
							<span class="month">{{ booking.month }}</span>
							<span class="day">{{ booking.day }}</span>
						</div>
						<div class="booking-info">
							<h4>{{ booking.facility }}</h4>
							<p>{{ booking.time }} ({{ booking.duration }})</p>
							<p class="booking-purpose">{{ booking.purpose }}</p>
						</div>
						<button class="cancel-btn" @click="cancelBooking(booking.id)">
							{{ $t('common.cancel') || 'Cancel' }}
						</button>
					</div>
				</div>
				<p v-else class="no-bookings">
					{{ $t('booking.noBookings') || 'You have no current bookings for this facility.' }}
				</p>
			</div>
		</div>
	</div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
	facility: {
		type: Object,
		default: () => ({
			id: 'party',
			name: 'Party Room',
			icon: '🎉',
			description: 'Perfect for celebrations and gatherings',
			capacity: '20 people',
			maxCapacity: 20,
			price: '¥2,000/hour',
			priceValue: 2000,
			amenities: 'Kitchen, Audio system'
		})
	}
})

const emit = defineEmits(['close'])

// Calendar state
const currentDate = new Date()
const selectedMonth = ref(currentDate.getMonth())
const selectedYear = ref(currentDate.getFullYear())
const selectedDate = ref(null)
const selectedTime = ref(null)

// Booking form state
const duration = ref(2)
const bookingPurpose = ref('')
const guestCount = ref(10)
const specialNotes = ref('')
const agreeToTerms = ref(false)
const processingBooking = ref(false)
const bookingSuccess = ref(false)
const bookingReference = ref('')

// Sample existing bookings
const userBookings = ref([
	{
		id: 1,
		facility: 'Party Room',
		month: 'DEC',
		day: '20',
		time: '14:00 - 16:00',
		duration: '2 hours',
		purpose: 'Birthday celebration'
	}
])

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const timeSlots = computed(() => {
	const slots = []
	for (let hour = 9; hour < 21; hour++) {
		slots.push({
			time: `${hour.toString().padStart(2, '0')}:00`,
			booked: Math.random() > 0.7 // Randomly mark some as booked
		})
	}
	return slots
})

const currentMonthYear = computed(() => {
	const months = ['January', 'February', 'March', 'April', 'May', 'June',
		'July', 'August', 'September', 'October', 'November', 'December']
	return `${months[selectedMonth.value]} ${selectedYear.value}`
})

const calendarDays = computed(() => {
	const days = []
	const firstDay = new Date(selectedYear.value, selectedMonth.value, 1)
	const lastDay = new Date(selectedYear.value, selectedMonth.value + 1, 0)
	const prevLastDay = new Date(selectedYear.value, selectedMonth.value, 0)
	
	const startPadding = firstDay.getDay()
	const endPadding = 6 - lastDay.getDay()
	
	// Previous month padding
	for (let i = startPadding - 1; i >= 0; i--) {
		days.push({
			key: `prev-${i}`,
			day: prevLastDay.getDate() - i,
			otherMonth: true,
			past: true
		})
	}
	
	// Current month days
	const today = new Date()
	for (let day = 1; day <= lastDay.getDate(); day++) {
		const date = new Date(selectedYear.value, selectedMonth.value, day)
		const isToday = date.toDateString() === today.toDateString()
		const isPast = date < today && !isToday
		days.push({
			key: `current-${day}`,
			day,
			date,
			isToday,
			past: isPast,
			selected: selectedDate.value?.getDate() === day,
			hasBooking: Math.random() > 0.9, // Random bookings
			unavailable: Math.random() > 0.85 // Random unavailable days
		})
	}
	
	// Next month padding
	for (let day = 1; day <= endPadding; day++) {
		days.push({
			key: `next-${day}`,
			day,
			otherMonth: true
		})
	}
	
	return days
})

const formatSelectedDate = computed(() => {
	if (!selectedDate.value) return ''
	return selectedDate.value.toLocaleDateString('en-US', {
		weekday: 'long',
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	})
})

const calculateCost = computed(() => {
	const cost = props.facility.priceValue * duration.value
	return `¥${cost.toLocaleString()}`
})

const changeMonth = (direction) => {
	if (direction === -1) {
		if (selectedMonth.value === 0) {
			selectedMonth.value = 11
			selectedYear.value--
		} else {
			selectedMonth.value--
		}
	} else {
		if (selectedMonth.value === 11) {
			selectedMonth.value = 0
			selectedYear.value++
		} else {
			selectedMonth.value++
		}
	}
}

const selectDate = (date) => {
	if (date.otherMonth || date.unavailable || date.past) return
	selectedDate.value = date.date
	selectedTime.value = null // Reset time when date changes
}

const selectTime = (slot) => {
	if (slot.booked) return
	selectedTime.value = slot.time
}

const confirmBooking = async () => {
	processingBooking.value = true
	// Simulate API call
	await new Promise(resolve => setTimeout(resolve, 2000))
	
	// Add new booking to the list
	const newBooking = {
		id: Date.now(),
		facility: props.facility.name,
		month: selectedDate.value.toLocaleDateString('en-US', { month: 'short' }).toUpperCase(),
		day: selectedDate.value.getDate().toString(),
		time: `${selectedTime.value} - ${calculateEndTime()}`,
		duration: `${duration.value} hour${duration.value > 1 ? 's' : ''}`,
		purpose: bookingPurpose.value || 'Personal use'
	}
	userBookings.value.unshift(newBooking)
	
	processingBooking.value = false
	bookingSuccess.value = true
	bookingReference.value = `BK${Date.now().toString().slice(-8)}`
	
	// Hide form sections after booking
	selectedDate.value = null
	selectedTime.value = null
}

const calculateEndTime = () => {
	const [hours, minutes] = selectedTime.value.split(':').map(Number)
	const endHour = hours + duration.value
	return `${endHour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
}

const cancelBooking = (bookingId) => {
	if (confirm('Are you sure you want to cancel this booking?')) {
		userBookings.value = userBookings.value.filter(b => b.id !== bookingId)
	}
}

const resetBooking = () => {
	bookingSuccess.value = false
	bookingReference.value = ''
	bookingPurpose.value = ''
	guestCount.value = 10
	specialNotes.value = ''
	agreeToTerms.value = false
	duration.value = 2
}
</script>

<style lang="stylus" scoped>
.facility-booking
	background white
	border-radius 20px
	height 100%
	max-height 90vh
	display flex
	flex-direction column
	overflow hidden

.booking-header
	display flex
	align-items center
	gap 1rem
	padding 1.5rem 2rem
	background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
	border-bottom 2px solid #FFC107
	flex-shrink 0

	h2
		flex 1
		margin 0
		color #333
		font-size 1.5rem
		text-align center

.back-btn
	padding 0.6rem 1.25rem
	background white
	color #333
	border 2px solid #FFC107
	border-radius 50px
	cursor pointer
	font-size 0.9rem
	font-weight 500
	transition all 0.2s ease

	&:hover
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
		transform translateY(-1px)

.booking-content
	flex 1
	overflow-y auto
	padding 2rem

	@media (max-width: 768px)
		padding 1rem

.facility-hero
	display flex
	gap 2rem
	background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
	border-radius 15px
	padding 2rem
	margin-bottom 2rem

	@media (max-width: 768px)
		flex-direction column
		text-align center

.hero-image
	display flex
	align-items center
	justify-content center
	width 120px
	height 120px
	background white
	border-radius 15px
	flex-shrink 0

	.facility-emoji
		font-size 4rem

.hero-info
	flex 1

	h1
		margin 0 0 0.5rem 0
		color #333

	.facility-description
		color #666
		margin-bottom 1rem

.facility-tags
	display flex
	gap 0.5rem
	flex-wrap wrap

	.tag
		padding 0.25rem 0.75rem
		background white
		border-radius 20px
		font-size 0.85rem
		color #666

.calendar-section, .booking-details, .existing-bookings
	background white
	border 2px solid #FFE082
	border-radius 15px
	padding 1.5rem
	margin-bottom 1.5rem

	h3
		margin 0 0 1rem 0
		color #333

.month-selector
	display flex
	justify-content space-between
	align-items center
	margin-bottom 1.5rem
	padding 0.5rem
	background #f9f9f9
	border-radius 10px

	button
		padding 0.5rem 1rem
		background white
		border 1px solid #e0e0e0
		border-radius 8px
		cursor pointer
		font-size 1.2rem

		&:hover
			background #FFF9C4

	.current-month
		font-weight 600
		color #333

.calendar-grid
	margin-bottom 1.5rem

.calendar-header
	display grid
	grid-template-columns repeat(7, 1fr)
	margin-bottom 0.5rem

	.day-label
		text-align center
		font-weight 600
		color #666
		font-size 0.9rem
		padding 0.5rem

.calendar-days
	display grid
	grid-template-columns repeat(7, 1fr)
	gap 2px

.calendar-day
	aspect-ratio 1
	display flex
	flex-direction column
	align-items center
	justify-content center
	background white
	border 1px solid #f0f0f0
	cursor pointer
	transition all 0.2s ease
	position relative

	&:hover:not(.unavailable):not(.past)
		background #FFF9C4
		border-color #FFC107

	&.other-month
		opacity 0.3

	&.today
		background linear-gradient(135deg, #FFE082 0%, #FFCA28 100%)
		font-weight bold

	&.selected
		background linear-gradient(135deg, #FF9800 0%, #FFB300 100%)
		color white

	&.unavailable, &.past
		background #f5f5f5
		color #ccc
		cursor not-allowed

	.day-number
		font-size 0.9rem

	.booking-indicator
		position absolute
		bottom 2px
		color #FF9800
		font-size 0.8rem

.time-slots
	h4
		color #666
		margin-bottom 1rem

.slots-grid
	display grid
	grid-template-columns repeat(auto-fill, minmax(120px, 1fr))
	gap 0.75rem

.time-slot
	padding 0.75rem
	background white
	border 2px solid #e0e0e0
	border-radius 10px
	cursor pointer
	transition all 0.2s ease
	text-align center

	&:hover:not(.unavailable)
		border-color #FFC107

	&.selected
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
		border-color #FF9800

	&.unavailable
		background #f5f5f5
		cursor not-allowed
		opacity 0.6

	.slot-time
		display block
		font-weight 600
		color #333

	.slot-status
		display block
		font-size 0.75rem
		color #666
		margin-top 0.25rem

.detail-card
	background #f9f9f9
	padding 1rem
	border-radius 10px
	margin-bottom 1.5rem

.detail-row
	display flex
	justify-content space-between
	padding 0.5rem 0
	border-bottom 1px solid #e0e0e0

	&:last-child
		border-bottom none

	.detail-label
		color #666

	.detail-value
		font-weight 500
		color #333

		&.cost
			color #FF9800
			font-size 1.1rem

		select
			padding 0.25rem 0.5rem
			border 1px solid #e0e0e0
			border-radius 6px

.booking-form
	.form-group
		margin-bottom 1rem

		label
			display block
			color #666
			margin-bottom 0.5rem
			font-size 0.9rem

		input, textarea
			width 100%
			padding 0.75rem
			border 2px solid #e0e0e0
			border-radius 10px
			font-size 1rem

			&:focus
				outline none
				border-color #FFC107

.terms-checkbox
	display flex
	align-items start
	gap 0.5rem
	margin 1.5rem 0

	input[type="checkbox"]
		margin-top 0.25rem

	label
		color #666
		font-size 0.9rem
		line-height 1.4

.confirm-booking-btn, .done-btn
	width 100%
	padding 1rem
	background linear-gradient(135deg, #FF9800 0%, #FFB300 100%)
	color white
	border none
	border-radius 50px
	font-size 1.1rem
	font-weight 600
	cursor pointer
	transition all 0.2s ease

	&:hover:not(:disabled)
		transform translateY(-2px)
		box-shadow 0 8px 20px rgba(255, 152, 0, 0.3)

	&:disabled
		opacity 0.5
		cursor not-allowed

.booking-success
	background linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)
	border-radius 15px
	padding 2rem
	text-align center
	margin-bottom 1.5rem

	&.prominent
		padding 3rem
		margin-bottom 2rem
		box-shadow 0 8px 24px rgba(76, 175, 80, 0.15)

	.success-icon
		font-size 3rem
		margin-bottom 1rem

	h3
		color #4CAF50
		margin 0 0 0.5rem 0
		font-size 1.5rem

	p
		color #666
		margin-bottom 1rem

	.booking-reference
		background white
		padding 1rem
		border-radius 10px
		margin-bottom 1.5rem

		span
			color #666
			margin-right 0.5rem

		strong
			color #333
			font-family monospace
			font-size 1.1rem

.new-booking-btn
	padding 0.75rem 2rem
	background white
	color #4CAF50
	border 2px solid #4CAF50
	border-radius 50px
	cursor pointer
	font-weight 600
	transition all 0.2s ease

	&:hover
		background #4CAF50
		color white
		transform translateY(-1px)

.bookings-list
	display flex
	flex-direction column
	gap 1rem

.booking-item
	display flex
	gap 1rem
	padding 1rem
	background #f9f9f9
	border-radius 10px
	align-items center
	transition all 0.3s ease

	&.new-booking
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
		border 2px solid #FFC107
		animation highlight 2s ease-in-out

@keyframes highlight
	0%, 100%
		transform scale(1)
	50%
		transform scale(1.02)

	.booking-date
		background white
		border-radius 8px
		padding 0.75rem
		text-align center
		min-width 60px

		.month
			display block
			color #FF9800
			font-size 0.75rem
			font-weight 600

		.day
			display block
			font-size 1.25rem
			font-weight bold
			color #333

	.booking-info
		flex 1

		h4
			margin 0 0 0.25rem 0
			color #333

		p
			margin 0
			color #666
			font-size 0.9rem

		.booking-purpose
			font-style italic

	.cancel-btn
		padding 0.5rem 1rem
		background white
		color #F44336
		border 2px solid #F44336
		border-radius 50px
		cursor pointer
		font-size 0.85rem
		font-weight 500
		transition all 0.2s ease

		&:hover
			background #FFEBEE

.no-bookings
	text-align center
	color #999
	padding 2rem
	font-style italic
</style>