<template>
	<section class="section">
		<!-- Booking form (when facility selected) -->
		<FacilityBooking
			v-if="selectedFacility"
			:facility="selectedFacility"
			@close="selectedFacility = null"
		/>

		<!-- Facilities list + bookings (default view) -->
		<div v-else class="booking-main">
			<div class="section-header">
				<h2 class="section-title">
					<Icon name="calendar" :size="30" color="#FFC107" />
					{{ $t('dashboard.booking.title') }}
				</h2>
			</div>

			<div class="booking-two-columns">
				<!-- Left: Facilities -->
				<div class="facilities-column">
					<div class="facilities-list">
						<div class="facility-card" @click="selectFacility('party')">
							<div class="facility-badge party" :style="{ backgroundImage: 'url(/img/facilities/party-room.png)' }" />
							<div class="facility-info">
								<h4>{{ $t('dashboard.booking.partyRoom') }}</h4>
								<p>{{ $t('booking.partyDesc') }}</p>
								<div class="facility-meta">
									<span>👥 {{ $t('dashboard.booking.capacity') }}: 20 {{ $t('dashboard.booking.people') }}</span>
									<span>💴 ¥10,000{{ $t('dashboard.booking.perHour') }}</span>
								</div>
							</div>
							<button class="book-btn">{{ $t('booking.bookNow') }} →</button>
						</div>

						<div class="facility-card" @click="selectFacility('guest')">
							<div class="facility-badge guest" :style="{ backgroundImage: 'url(/img/facilities/guest-room-tatami.png)' }" />
							<div class="facility-info">
								<h4>{{ $t('dashboard.booking.guestRoom') }}</h4>
								<p>{{ $t('booking.guestDesc') }}</p>
								<div class="facility-meta">
									<span>👥 {{ $t('dashboard.booking.capacity') }}: 2 {{ $t('dashboard.booking.people') }}</span>
									<span>💴 ¥5,000{{ $t('dashboard.booking.perNight') }}</span>
								</div>
							</div>
							<button class="book-btn">{{ $t('booking.bookNow') }} →</button>
						</div>

						<div class="facility-card" @click="selectFacility('gym')">
							<div class="facility-badge gym" :style="{ backgroundImage: 'url(/img/facilities/gym.jpg)' }" />
							<div class="facility-info">
								<h4>{{ $t('dashboard.booking.gym') }}</h4>
								<p>{{ $t('booking.gymDesc') }}</p>
								<div class="facility-meta">
									<span>👥 {{ $t('dashboard.booking.capacity') }}: 10 {{ $t('dashboard.booking.people') }}</span>
									<span>✨ {{ $t('dashboard.booking.free') }}</span>
								</div>
							</div>
							<button class="book-btn">{{ $t('booking.bookNow') }} →</button>
						</div>

						<div class="facility-card" @click="selectFacility('parking')">
							<div class="facility-badge parking" :style="{ backgroundImage: 'url(/img/facilities/parking.jpg)' }" />
							<div class="facility-info">
								<h4>{{ $t('dashboard.booking.guestParking') }}</h4>
								<p>{{ $t('dashboard.booking.guestParking') }}</p>
								<div class="facility-meta">
									<span>🚗 1 {{ $t('dashboard.booking.capacity') }}</span>
									<span>💴 ¥1,000{{ $t('dashboard.booking.perNight') }}</span>
								</div>
							</div>
							<button class="book-btn">{{ $t('booking.bookNow') }} →</button>
						</div>
					</div>
				</div>

				<!-- Right: Bookings -->
				<div class="bookings-column">
					<div class="bookings-header">
						<h3>
							{{ $t('booking.yourBookings') }}
							<span v-if="userBookings.length" class="count">({{ userBookings.length }})</span>
						</h3>
						<div v-if="userBookings.length" class="filter-tabs">
							<button
								:class="['tab', { active: activeFilter === 'upcoming' }]"
								@click="activeFilter = 'upcoming'"
							>
								{{ $t('booking.upcoming') }}
							</button>
							<button
								:class="['tab', { active: activeFilter === 'past' }]"
								@click="activeFilter = 'past'"
							>
								{{ $t('booking.past') }}
							</button>
						</div>
					</div>

					<!-- Bookings list -->
					<div v-if="filteredBookings.length" class="bookings-list">
						<div v-for="booking in filteredBookings" :key="booking.id" class="booking-card">
							<div class="booking-header">
								<div class="booking-date">
									<span class="month">{{ booking.month }}</span>
									<span class="day">{{ booking.day }}</span>
								</div>
								<div class="booking-info">
									<h4>{{ booking.facility }}</h4>
									<p class="time">{{ booking.time }}</p>
								</div>
								<span class="icon">{{ booking.icon }}</span>
							</div>
							<div class="booking-footer">
								<span :class="['status', getBookingCountdown(booking.date).class]">
									{{ getBookingCountdown(booking.date).text }}
								</span>
								<button
									v-if="getBookingCountdown(booking.date).class !== 'past'"
									class="action-btn cancel"
									@click="cancelBooking(booking.id)"
								>
									{{ $t('common.cancel') }}
								</button>
								<button v-else class="action-btn rebook" @click="rebookFacility(booking)">
									{{ $t('booking.bookAgain') }}
								</button>
							</div>
						</div>
					</div>

					<!-- Empty state -->
					<div v-else class="empty-bookings">
						<div class="empty-icon">📅</div>
						<h4>{{ emptyTitle }}</h4>
						<p>{{ emptyDescription }}</p>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>
<script>
import { filterBookings, getBookingCountdown, sampleBookings } from '../../../utils/bookingUtils'

export default {
	name: 'BookingsSection',
	data() {
		return {
			activeFilter: 'upcoming',
			userBookings: sampleBookings,
			selectedFacility: null
		}
	},
	computed: {
		facilities() {
			return {
				party: {
					id: 'party',
					name: this.$t( 'dashboard.booking.partyRoom' ),
					icon: '🎉',
					image: '/img/facilities/party-room.png',
					description: this.$t( 'booking.partyDesc' ),
					capacity: `${this.$t( 'booking.capacityLabel' )}: 20 ${this.$t( 'dashboard.booking.people' )}`,
					maxCapacity: 20,
					price: `¥10,000${this.$t( 'dashboard.booking.perHour' )}`,
					priceValue: 10000,
					amenities: this.$t( 'booking.amenities' ),
					bookingType: 'half-day'
				},
				guest: {
					id: 'guest',
					name: this.$t( 'dashboard.booking.guestRoom' ),
					icon: '🛏️',
					image: '/img/facilities/guest-room-tatami.png',
					description: this.$t( 'booking.guestDesc' ),
					capacity: `${this.$t( 'booking.capacityLabel' )}: 2 ${this.$t( 'dashboard.booking.people' )}`,
					maxCapacity: 2,
					price: `¥5,000${this.$t( 'dashboard.booking.perNight' )}`,
					priceValue: 5000,
					amenities: this.$t( 'booking.amenities' ),
					bookingType: 'full-day'
				},
				gym: {
					id: 'gym',
					name: this.$t( 'dashboard.booking.gym' ),
					icon: '💪',
					image: '/img/facilities/gym.jpg',
					description: this.$t( 'booking.gymDesc' ),
					capacity: `${this.$t( 'booking.capacityLabel' )}: 10 ${this.$t( 'dashboard.booking.people' )}`,
					maxCapacity: 10,
					price: this.$t( 'dashboard.booking.free' ),
					priceValue: 0,
					amenities: this.$t( 'booking.amenities' ),
					bookingType: 'hourly'
				},
				parking: {
					id: 'parking',
					name: this.$t( 'dashboard.booking.guestParking' ),
					icon: '🅿️',
					image: '/img/facilities/parking.jpg',
					description: this.$t( 'booking.parkingDesc' ),
					capacity: `1 ${this.$t( 'booking.capacityLabel' )}`,
					maxCapacity: 1,
					price: `¥1,000${this.$t( 'dashboard.booking.perNight' )}`,
					priceValue: 1000,
					amenities: this.$t( 'booking.amenities' ),
					bookingType: 'full-day'
				}
			}
		},
		filteredBookings() {
			return filterBookings( this.userBookings, this.activeFilter )
		},
		emptyTitle() {
			return this.activeFilter === 'upcoming'
				? this.$t( 'booking.noUpcomingBookings' )
				: this.$t( 'booking.noPastBookings' )
		},
		emptyDescription() {
			return this.activeFilter === 'upcoming'
				? this.$t( 'booking.noUpcomingBookingsDesc' )
				: this.$t( 'booking.noPastBookingsDesc' )
		}
	},
	watch: {
		selectedFacility( newVal ) {
			if ( newVal ) {
				this.$nextTick( () => {
					document.querySelector( '#app' )?.scrollTo( 0, 0 )
				} )
			}
		}
	},
	methods: {
		getBookingCountdown,
		selectFacility( facilityId ) {
			this.selectedFacility = this.facilities[facilityId]
		},
		cancelBooking( bookingId ) {
			this.userBookings = this.userBookings.filter( b => b.id !== bookingId )
		},
		rebookFacility( booking ) {
			const facilityId = booking.facility.toLowerCase().includes( 'party' ) ? 'party'
				: booking.facility.toLowerCase().includes( 'guest' ) && booking.facility.toLowerCase().includes( 'room' ) ? 'guest'
					: booking.facility.toLowerCase().includes( 'parking' ) ? 'parking'
						: 'gym'
			this.selectFacility( facilityId )
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '../../../styles/tokens-modern.styl'

.section
	padding 0

.section-header
	padding 2rem 2rem 2rem 2rem

.section-title
	margin 0
	font-size var(--text-2xl)
	font-weight var(--font-semibold)
	color var(--color-gray-900)
	display flex
	align-items center
	gap 0.5rem
	justify-content center


.booking-two-columns
	display grid
	grid-template-columns 3fr 2fr
	gap 2rem
	padding 0 2rem 3rem 2rem
	@media (max-width: 968px)
		grid-template-columns 1fr

@media (max-width: 768px)
	.section-header
		padding 1rem 1rem 1rem 1rem

	.booking-two-columns
		padding 0 1rem 2rem 1rem

.facilities-list
	display flex
	flex-direction column
	gap 1.25rem

.facility-card
	display flex
	flex-direction column
	background white
	border 1px solid #e5e7eb
	border-radius 16px
	cursor pointer
	transition all 0.3s ease
	overflow hidden
	&:hover
		transform translateY(-4px)
		box-shadow 0 8px 20px rgba(255, 193, 7, 0.15)
		border-color #FFC107
		.facility-badge
			transform scale(1.05)
		.book-btn
			background linear-gradient(135deg, #FFB300 0%, #FFA000 100%)

.facility-badge
	width 100%
	height 250px
	display flex
	align-items center
	justify-content center
	font-size 4rem
	transition transform 0.3s ease
	background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)

	background-size cover
	background-position center
	background-repeat no-repeat
	position relative

.facility-info
	flex 1
	padding 1.25rem
	text-align center
	h4
		font-size var(--text-base)
		font-weight var(--font-semibold)
		color var(--color-gray-900)
		margin-bottom 0.5rem
	p
		color var(--color-gray-500)
		font-size var(--text-sm)
		margin-bottom 1rem
		line-height 1.4

.facility-meta
	display flex
	flex-direction column
	gap 0.5rem
	margin-top auto
	span
		font-size var(--text-xs)
		color var(--color-gray-600)
		display flex
		align-items center
		justify-content center
		gap 0.25rem

.book-btn
	margin 1rem 1.25rem 1.25rem
	padding 0.75rem
	background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
	color #333
	border none
	border-radius 25px
	font-size 0.95rem
	font-weight 600
	cursor pointer
	transition all 0.25s ease
	box-shadow 0 3px 10px rgba(255, 193, 7, 0.25)
	&:hover
		transform translateY(-2px)
		box-shadow 0 5px 15px rgba(255, 193, 7, 0.35)

.bookings-column
	h3
		font-size var(--text-base)
		font-weight var(--font-semibold)
		color var(--color-gray-900)
		margin-bottom 1rem
		.count
			color var(--color-gray-500)
			font-weight var(--font-normal)
			margin-left 0.25rem
			font-size var(--text-sm)

.bookings-header
	display flex
	justify-content space-between
	align-items center
	margin-bottom 1rem
	flex-wrap wrap
	gap 0.5rem

.filter-tabs
	display flex
	gap 0.5rem
	padding 0.25rem
	background #f8f9fa
	border-radius 12px

.tab
	padding 0.5rem 1.25rem
	background transparent
	border none
	border-radius 8px
	font-size 0.9rem
	font-weight 500
	color #666
	cursor pointer
	transition all 0.2s
	&:hover
		background white
		color #333
		box-shadow 0 1px 3px rgba(0, 0, 0, 0.1)
	&.active
		background white
		color #1a1a1a
		box-shadow 0 1px 3px rgba(0, 0, 0, 0.1)

.bookings-list
	display flex
	flex-direction column
	gap 1rem

.booking-card
	background white
	border-radius 10px
	overflow hidden
	border 1px solid #e5e7eb
	transition all 0.2s
	&:hover
		border-color #d1d5db
		box-shadow 0 2px 8px rgba(0, 0, 0, 0.06)

.booking-header
	display flex
	gap 1rem
	padding 1rem
	border-bottom 1px solid #f3f4f6

.booking-date
	display flex
	flex-direction column
	align-items center
	background linear-gradient(135deg, #FFC107 0%, #FFB300 100%)
	padding 0.75rem
	border-radius 10px
	min-width 60px
	color white
	.month
		font-size 0.75rem
		font-weight 600
		opacity 0.9
	.day
		font-size 1.5rem
		font-weight bold
		line-height 1

.booking-info
	flex 1
	h4
		font-size var(--text-base)
		font-weight var(--font-semibold)
		color var(--color-gray-900)
		margin-bottom 0.25rem
	.time
		font-size var(--text-xs)
		color var(--color-gray-500)

.icon
	font-size 2rem
	opacity 0.6

.booking-footer
	display flex
	justify-content space-between
	align-items center
	padding 1rem

.status
	padding 0.15rem 0.5rem
	border-radius 12px
	font-size 0.75rem
	font-weight 500
	&.today
		background #d1fae5
		color #065f46
	&.tomorrow
		background #dbeafe
		color #1e40af
	&.upcoming
		background #e9d5ff
		color #581c87
	&.past
		background #f3f4f6
		color #6b7280

.action-btn
	padding 0.5rem 0.75rem
	background white
	border 1px solid #e5e7eb
	border-radius 8px
	font-size 0.85rem
	font-weight 500
	cursor pointer
	transition all 0.2s
	&:hover
		background #f9fafb
		border-color #d1d5db
	&.cancel:hover
		background #fee2e2
		color #dc2626
		border-color #dc2626
	&.rebook:hover
		background #f3f4f6
		color #6b46c1
		border-color #6b46c1

.empty-bookings
	text-align center
	padding 3rem 2rem
	background linear-gradient(135deg, #FFFEF7 0%, #FFF9F0 100%)
	border-radius 12px
	border 1px solid rgba(255, 193, 7, 0.1)
	.empty-icon
		font-size 3rem
		margin-bottom 1rem
		opacity 0.9
	h4
		font-size var(--text-base)
		font-weight var(--font-semibold)
		color var(--color-gray-900)
		margin-bottom 0.5rem
	p
		color var(--color-gray-500)
		font-size var(--text-sm)

@keyframes fadeIn
	from
		opacity 0
		transform translateY(10px)
	to
		opacity 1
		transform translateY(0)
</style>
