<template>
	<section class="bookings-section">
		<SectionHeader
			:title="$t('mansion.bookings.title') || 'Facility Bookings'"
			icon="📅"
		/>

		<div v-if="loading" class="loading-state">
			<p>{{ $t('common.loading') || 'Loading...' }}</p>
		</div>

		<div v-else-if="bookings.length === 0" class="empty-state">
			<p>{{ $t('mansion.bookings.empty') || 'No booking requests.' }}</p>
		</div>

		<div v-else class="bookings-list">
			<KCard
				v-for="booking in bookings"
				:key="booking.id"
				:title="getFacilityName(booking.facilityId)"
				variant="default"
				outlined
			>
				<template #badge>
					<StatusBadge :status="booking.status" />
				</template>

				<div class="booking-info">
					<div class="info-row">
						<span class="label">{{ $t('mansion.bookings.requestedBy') || 'Requested By' }}:</span>
						<span class="value">{{ booking.creatorName || booking.creatorId || 'Resident' }}</span>
					</div>
					<div class="info-row">
						<span class="label">{{ $t('mansion.bookings.date') || 'Date' }}:</span>
						<span class="value">{{ formatDate(booking.startDate || booking.dates?.start) }}</span>
					</div>
					<div class="info-row">
						<span class="label">{{ $t('mansion.bookings.time') || 'Time' }}:</span>
						<span class="value">
							{{ formatTime(booking.startDate || booking.dates?.start) }} -
							{{ formatTime(booking.endDate || booking.dates?.end) }}
						</span>
					</div>
					<div v-if="booking.notes" class="info-row">
						<span class="label">{{ $t('mansion.bookings.notes') || 'Notes' }}:</span>
						<span class="value">{{ booking.notes }}</span>
					</div>
				</div>

				<template #footer>
					<div v-if="booking.status === 'pending'" class="booking-actions">
						<KButton size="sm" variant="primary" @click="$emit('approve', booking.id)">
							{{ $t('mansion.bookings.approve') || 'Approve' }}
						</KButton>
						<KButton size="sm" variant="danger" @click="$emit('reject', booking.id)">
							{{ $t('mansion.bookings.reject') || 'Reject' }}
						</KButton>
					</div>
					<div v-else class="booking-status-info">
						<span class="status-text" :class="booking.status">
							{{ getStatusText(booking.status) }}
						</span>
					</div>
				</template>
			</KCard>
		</div>
	</section>
</template>

<script>
export default {
	name: 'MansionBookingsSection',
	props: {
		bookings: {
			type: Array,
			default: () => []
		},
		facilities: {
			type: Array,
			default: () => []
		},
		loading: {
			type: Boolean,
			default: false
		}
	},
	emits: ['approve', 'reject'],
	methods: {
		getFacilityName( facilityId ) {
			const facility = this.facilities.find( f => f.id === facilityId )
			return facility?.name || this.$t( 'mansion.bookings.facility' ) || 'Facility'
		},
		formatDate( dateString ) {
			if ( !dateString ) return '-'
			const date = new Date( dateString )
			return date.toLocaleDateString( undefined, {
				weekday: 'short',
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			} )
		},
		formatTime( dateString ) {
			if ( !dateString ) return '-'
			const date = new Date( dateString )
			return date.toLocaleTimeString( undefined, {
				hour: '2-digit',
				minute: '2-digit'
			} )
		},
		getStatusText( status ) {
			const statusMap = {
				pending: this.$t( 'status.pending' ) || 'Pending',
				confirmed: this.$t( 'status.confirmed' ) || 'Confirmed',
				cancelled: this.$t( 'status.cancelled' ) || 'Cancelled',
				completed: this.$t( 'status.completed' ) || 'Completed'
			}
			return statusMap[status] || status
		}
	}
}
</script>

<style lang="stylus" scoped>
.bookings-section
	animation fadeIn 0.3s ease

@keyframes fadeIn
	from
		opacity 0
		transform translateY(10px)
	to
		opacity 1
		transform translateY(0)

.loading-state, .empty-state
	text-align center
	padding 3rem
	color #666

.bookings-list
	display grid
	grid-template-columns repeat(auto-fill, minmax(350px, 1fr))
	gap 1.5rem

.booking-info
	margin-bottom 1rem

.info-row
	display flex
	justify-content space-between
	padding 0.4rem 0
	border-bottom 1px solid #f5f5f5

	&:last-child
		border-bottom none

	.label
		color #666
		font-size 0.9rem

	.value
		font-weight 500
		color #333
		font-size 0.9rem

.booking-actions
	display flex
	gap 0.75rem
	width 100%

.booking-status-info
	width 100%
	text-align center

	.status-text
		padding 0.5rem 1rem
		border-radius 20px
		font-size 0.9rem
		font-weight 500

		&.confirmed
			background #E8F5E9
			color #4CAF50

		&.cancelled
			background #FFEBEE
			color #F44336

		&.completed
			background #E3F2FD
			color #2196F3
</style>
