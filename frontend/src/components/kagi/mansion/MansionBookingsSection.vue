<template>
	<section class="mansion-bookings-section">
		<SectionHeader
			:title="$t('mansion.bookings.title')"
			icon="📅"
		>
			<template #actions>
				<KButton variant="primary" @click="$emit('block-slot')">
					{{ $t('mansion.bookings.block') }}
				</KButton>
			</template>
		</SectionHeader>

		<!-- Tab Navigation -->
		<div class="bookings-tabs">
			<button
				:class="['tab-btn', { active: activeTab === 'overview' }]"
				@click="activeTab = 'overview'"
			>
				{{ $t('mansion.bookings.tabOverview') }}
			</button>
			<button
				:class="['tab-btn', { active: activeTab === 'planning' }]"
				@click="activeTab = 'planning'"
			>
				{{ $t('mansion.bookings.tabPlanning') }}
			</button>
			<button
				:class="['tab-btn', { active: activeTab === 'facilities' }]"
				@click="activeTab = 'facilities'"
			>
				{{ $t('mansion.bookings.tabFacilities') }}
			</button>
		</div>

		<!-- ==================== OVERVIEW TAB ==================== -->
		<div v-if="activeTab === 'overview'" class="tab-content">
			<!-- Stats Grid -->
			<div class="stats-grid">
				<StatCard
					:title="$t('mansion.bookings.stats.total')"
					:value="stats.total"
					icon="📅"
					variant="primary"
				/>
				<StatCard
					:title="$t('mansion.bookings.stats.upcoming')"
					:value="stats.upcoming"
					icon="📆"
					variant="info"
				/>
				<StatCard
					:title="$t('mansion.bookings.stats.pending')"
					:value="stats.pending"
					icon="⏳"
					variant="warning"
				/>
				<StatCard
					:title="$t('mansion.bookings.stats.confirmed')"
					:value="stats.confirmed"
					icon="✅"
					variant="success"
				/>
			</div>

			<!-- Filter Bar -->
			<div class="bookings-filter-bar">
				<div class="filter-search">
					<input
						type="search"
						class="search-input"
						:value="search"
						:placeholder="$t('mansion.bookings.searchPlaceholder')"
						@input="$emit('search', $event.target.value)"
					>
				</div>
				<div class="filter-status">
					<select
						class="status-select"
						:value="statusFilter || ''"
						@change="$emit('filter-status', $event.target.value || null)"
					>
						<option value="">{{ $t('mansion.bookings.allStatuses') }}</option>
						<option value="pending">{{ $t('status.pending') }}</option>
						<option value="confirmed">{{ $t('status.confirmed') }}</option>
						<option value="cancelled">{{ $t('status.cancelled') }}</option>
						<option value="completed">{{ $t('status.completed') }}</option>
					</select>
				</div>
			</div>

			<!-- Results Count -->
			<div v-if="pagination.total > 0" class="bookings-results-info">
				<span class="results-count">
					{{ $t('mansion.bookings.showingResults', { start: resultsStart, end: resultsEnd, total: pagination.total }) }}
				</span>
			</div>

			<!-- Loading State -->
			<div v-if="loading" class="loading-state">
				<p>{{ $t('common.loading') }}</p>
			</div>

			<!-- Empty State -->
			<div v-else-if="bookings.length === 0" class="empty-state">
				<p v-if="search || statusFilter">{{ $t('mansion.bookings.noResults') }}</p>
				<p v-else>{{ $t('mansion.bookings.empty') }}</p>
			</div>

			<!-- Bookings Table -->
			<div v-else class="bookings-table-card">
				<div class="bookings-table">
					<table>
						<thead>
							<tr>
								<th class="sortable-header" @click="$emit('sort', 'title')">
									{{ $t('mansion.bookings.facility') }}
									<span v-if="sort === 'title' || sort === '-title'" class="sort-indicator">
										{{ sort === 'title' ? '▲' : '▼' }}
									</span>
								</th>
								<th>{{ $t('mansion.bookings.requestedBy') }}</th>
								<th class="sortable-header" @click="$emit('sort', 'startDate')">
									{{ $t('mansion.bookings.date') }}
									<span v-if="sort === 'startDate' || sort === '-startDate'" class="sort-indicator">
										{{ sort === 'startDate' ? '▲' : '▼' }}
									</span>
								</th>
								<th>{{ $t('mansion.bookings.time') }}</th>
								<th class="sortable-header" @click="$emit('sort', 'status')">
									{{ $t('mansion.bookings.status') }}
									<span v-if="sort === 'status' || sort === '-status'" class="sort-indicator">
										{{ sort === 'status' ? '▲' : '▼' }}
									</span>
								</th>
								<th>{{ $t('admin.users.actions') }}</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="booking in bookings" :key="booking.id">
								<td>{{ getFacilityName(booking.facilityId) }}</td>
								<td>{{ booking.creatorName || booking.creatorId || '-' }}</td>
								<td>{{ formatDate(booking.startDate || booking.dates?.start) }}</td>
								<td>
									{{ formatTime(booking.startDate || booking.dates?.start) }} –
									{{ formatTime(booking.endDate || booking.dates?.end) }}
								</td>
								<td>
									<StatusBadge :status="booking.status" />
								</td>
								<td class="actions-cell">
									<button
										v-if="booking.status === 'pending'"
										class="action-btn action-btn--success"
										@click="$emit('approve', booking.id)"
									>
										✓ {{ $t('mansion.bookings.approve') }}
									</button>
									<button
										v-if="booking.status === 'pending'"
										class="action-btn action-btn--danger"
										@click="$emit('reject', booking.id)"
									>
										✕ {{ $t('mansion.bookings.reject') }}
									</button>
									<button
										class="action-btn"
										@click="$emit('edit-booking', booking)"
									>
										✏️ {{ $t('common.edit') }}
									</button>
									<button
										class="action-btn action-btn--danger"
										@click="$emit('delete-booking', booking)"
									>
										🗑️ {{ $t('common.delete') }}
									</button>
								</td>
							</tr>
						</tbody>
					</table>
				</div>

				<!-- Pagination -->
				<div v-if="pagination.totalPages > 1" class="pagination">
					<KButton
						size="sm"
						variant="secondary"
						:disabled="pagination.page === 1"
						@click="$emit('page-change', pagination.page - 1)"
					>
						{{ $t('common.previous') }}
					</KButton>

					<span class="pagination-info">
						{{ $t('common.pageOf', { current: pagination.page, total: pagination.totalPages }) }}
					</span>

					<KButton
						size="sm"
						variant="secondary"
						:disabled="pagination.page >= pagination.totalPages"
						@click="$emit('page-change', pagination.page + 1)"
					>
						{{ $t('common.next') }}
					</KButton>
				</div>
			</div>
		</div>

		<!-- ==================== PLANNING TAB ==================== -->
		<div v-if="activeTab === 'planning'" class="tab-content">
			<!-- Week Navigation -->
			<div class="week-navigation">
				<KButton size="sm" variant="secondary" @click="planningWeekOffset--">
					{{ $t('mansion.bookings.previousWeek') }}
				</KButton>
				<span class="week-label">{{ weekLabel }}</span>
				<KButton size="sm" variant="secondary" @click="planningWeekOffset++">
					{{ $t('mansion.bookings.nextWeek') }}
				</KButton>
				<KButton
					v-if="planningWeekOffset !== 0"
					size="sm"
					variant="primary"
					@click="planningWeekOffset = 0"
				>
					{{ $t('mansion.bookings.thisWeek') }}
				</KButton>
			</div>

			<!-- Loading State -->
			<div v-if="loading" class="loading-state">
				<p>{{ $t('common.loading') }}</p>
			</div>

			<!-- Weekly Grid -->
			<div v-else class="planning-grid-wrapper">
				<div v-if="facilities.length === 0" class="empty-state">
					<p>{{ $t('mansion.bookings.noFacilities') }}</p>
				</div>
				<div v-else class="planning-grid">
					<!-- Header Row -->
					<div class="grid-header">
						<div class="grid-cell grid-facility-label">{{ $t('mansion.bookings.facility') }}</div>
						<div
							v-for="(day, idx) in weekDays"
							:key="idx"
							:class="['grid-cell', 'grid-day-header', { 'is-today': isToday(day) }]"
						>
							<span class="day-name">{{ formatDayName(day) }}</span>
							<span class="day-date">{{ formatDayDate(day) }}</span>
						</div>
					</div>

					<!-- Facility Rows -->
					<div
						v-for="facility in facilities"
						:key="facility.id"
						class="grid-row"
					>
						<div class="grid-cell grid-facility-label">
							{{ facility.title || facility.name }}
						</div>
						<div
							v-for="(day, idx) in weekDays"
							:key="idx"
							:class="['grid-cell', 'grid-day-cell', { 'is-today': isToday(day) }]"
							@click="$emit('block-slot', { facilityId: facility.id, date: day })"
						>
							<div
								v-for="b in getBookingsForCell(facility.id, day)"
								:key="b.id"
								:class="['booking-block', `status-${b.status}`]"
								@click.stop="$emit('edit-booking', b)"
							>
								<span class="booking-time">{{ formatTime(b.startDate || b.dates?.start) }}</span>
								<span class="booking-name">{{ b.creatorName || b.title || '' }}</span>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- ==================== FACILITIES TAB ==================== -->
		<div v-if="activeTab === 'facilities'" class="tab-content">
			<!-- Loading State -->
			<div v-if="loading" class="loading-state">
				<p>{{ $t('common.loading') }}</p>
			</div>

			<div v-else-if="facilities.length === 0" class="empty-state">
				<p>{{ $t('mansion.bookings.noFacilities') }}</p>
			</div>

			<div v-else class="facilities-grid">
				<KCard
					v-for="facility in facilities"
					:key="facility.id"
					:title="facility.title || facility.name"
					variant="default"
					outlined
				>
					<template #badge>
						<StatusBadge :status="facility.status || 'active'" />
					</template>

					<div class="facility-info">
						<div v-if="facility.description" class="info-row">
							<span class="label">{{ $t('mansion.facilities.description') }}</span>
							<span class="value">{{ facility.description }}</span>
						</div>
						<div v-if="facility.category" class="info-row">
							<span class="label">{{ $t('mansion.facilities.category') }}</span>
							<span class="value">{{ facility.category }}</span>
						</div>
						<div v-if="facility.capacity" class="info-row">
							<span class="label">{{ $t('mansion.facilities.capacity') }}</span>
							<span class="value">{{ facility.capacity }}</span>
						</div>
						<div v-if="facility.hours" class="info-row">
							<span class="label">{{ $t('mansion.facilities.hours') }}</span>
							<span class="value">{{ facility.hours.open || facility.hours?.open }} – {{ facility.hours.close || facility.hours?.close }}</span>
						</div>
						<div v-if="facility.pricing" class="info-row">
							<span class="label">{{ $t('mansion.facilities.pricing') }}</span>
							<span class="value">
								¥{{ facility.pricing.hourly || 0 }}/{{ $t('mansion.facilities.hourly') }}
								<template v-if="facility.pricing.deposit">
									+ ¥{{ facility.pricing.deposit }} {{ $t('mansion.facilities.deposit') }}
								</template>
							</span>
						</div>
						<div v-if="facility.bookingType" class="info-row">
							<span class="label">{{ $t('mansion.facilities.bookingType') }}</span>
							<span class="value">{{ getBookingTypeLabel(facility.bookingType) }}</span>
						</div>
					</div>

					<template #footer>
						<div class="facility-actions">
							<KButton size="sm" variant="primary" @click="$emit('edit-facility', facility)">
								✏️ {{ $t('common.edit') }}
							</KButton>
							<KButton
								size="sm"
								:variant="facility.status === 'active' ? 'secondary' : 'primary'"
								@click="$emit('toggle-facility-status', facility)"
							>
								{{ facility.status === 'active' ? $t('mansion.facilities.statusInactive') : $t('mansion.facilities.statusActive') }}
							</KButton>
						</div>
					</template>
				</KCard>
			</div>
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
		},
		stats: {
			type: Object,
			default: () => ( { total: 0, upcoming: 0, pending: 0, confirmed: 0 } )
		},
		pagination: {
			type: Object,
			default: () => ( { page: 1, limit: 25, total: 0, totalPages: 0 } )
		},
		sort: {
			type: String,
			default: '-startDate'
		},
		search: {
			type: String,
			default: ''
		},
		statusFilter: {
			type: String,
			default: null
		}
	},
	emits: [
		'search',
		'sort',
		'page-change',
		'filter-status',
		'approve',
		'reject',
		'edit-booking',
		'delete-booking',
		'block-slot',
		'edit-facility',
		'toggle-facility-status'
	],
	data() {
		return {
			activeTab: 'overview',
			planningWeekOffset: 0
		}
	},
	computed: {
		resultsStart() {
			return ( ( this.pagination.page - 1 ) * ( this.pagination.limit || 25 ) ) + 1
		},
		resultsEnd() {
			return Math.min( this.pagination.page * ( this.pagination.limit || 25 ), this.pagination.total )
		},
		weekDays() {
			const today = new Date()
			const monday = new Date( today )
			monday.setDate( today.getDate() - ( ( today.getDay() + 6 ) % 7 ) + ( this.planningWeekOffset * 7 ) )
			monday.setHours( 0, 0, 0, 0 )
			return Array.from( { length: 7 }, ( _, i ) => {
				const d = new Date( monday )
				d.setDate( d.getDate() + i )
				return d
			} )
		},
		weekLabel() {
			if ( this.weekDays.length < 7 ) return ''
			const start = this.weekDays[0]
			const end = this.weekDays[6]
			const opts = { month: 'short', day: 'numeric' }
			const startStr = start.toLocaleDateString( undefined, opts )
			const endStr = end.toLocaleDateString( undefined, { ...opts, year: 'numeric' } )
			return `${startStr} – ${endStr}`
		},
		bookingsByFacilityAndDay() {
			const map = {}
			if ( this.weekDays.length < 7 ) return map

			const weekStart = this.weekDays[0]
			const weekEnd = new Date( this.weekDays[6] )
			weekEnd.setHours( 23, 59, 59, 999 )

			this.facilities.forEach( f => {
				map[f.id] = {}
			} )

			this.bookings.forEach( b => {
				const start = new Date( b.startDate || b.dates?.start )
				const end = new Date( b.endDate || b.dates?.end )
				if ( start > weekEnd || end < weekStart ) return
				if ( !map[b.facilityId] ) map[b.facilityId] = {}

				this.weekDays.forEach( ( day, idx ) => {
					const dayStart = new Date( day )
					const dayEnd = new Date( day )
					dayEnd.setHours( 23, 59, 59, 999 )
					if ( start <= dayEnd && end >= dayStart ) {
						if ( !map[b.facilityId][idx] ) map[b.facilityId][idx] = []
						map[b.facilityId][idx].push( b )
					}
				} )
			} )
			return map
		}
	},
	methods: {
		getFacilityName( facilityId ) {
			const facility = this.facilities.find( f => f.id === facilityId )
			return facility?.title || facility?.name || this.$t( 'mansion.bookings.facility' )
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
		formatDayName( date ) {
			return date.toLocaleDateString( undefined, { weekday: 'short' } )
		},
		formatDayDate( date ) {
			return date.toLocaleDateString( undefined, { month: 'short', day: 'numeric' } )
		},
		isToday( date ) {
			const today = new Date()
			return date.toDateString() === today.toDateString()
		},
		getBookingsForCell( facilityId, day ) {
			const dayIdx = this.weekDays.indexOf( day )
			return this.bookingsByFacilityAndDay[facilityId]?.[dayIdx] || []
		},
		getStatusText( status ) {
			const statusMap = {
				pending: this.$t( 'status.pending' ),
				confirmed: this.$t( 'status.confirmed' ),
				cancelled: this.$t( 'status.cancelled' ),
				completed: this.$t( 'status.completed' )
			}
			return statusMap[status] || status
		},
		getBookingTypeLabel( type ) {
			const types = {
				hourly: this.$t( 'mansion.facilities.hourly' ),
				'half-day': this.$t( 'mansion.facilities.halfDay' ),
				'full-day': this.$t( 'mansion.facilities.fullDay' )
			}
			return types[type] || type
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '../../../styles/tokens.styl'

.mansion-bookings-section
	animation fadeIn 0.3s ease

@keyframes fadeIn
	from
		opacity 0
		transform translateY(10px)
	to
		opacity 1
		transform translateY(0)

// Tabs
.bookings-tabs
	display flex
	gap 0
	margin-bottom 1.5rem
	border-bottom 2px solid #eee

	.tab-btn
		padding 0.75rem 1.5rem
		border none
		background none
		color #666
		font-size 0.95rem
		font-weight 500
		cursor pointer
		border-bottom 2px solid transparent
		margin-bottom -2px
		transition color 0.2s, border-color 0.2s

		&:hover
			color #333

		&.active
			color $color-primary
			border-bottom-color $color-primary

// Stats
.stats-grid
	display grid
	grid-template-columns repeat(auto-fit, minmax(200px, 1fr))
	gap 1rem
	margin-bottom 1.5rem

// Filter bar
.bookings-filter-bar
	display flex
	align-items center
	gap 1rem
	margin-bottom 1rem

	.filter-search
		flex 1

	.search-input
		width 100%
		padding 0.75rem 1rem
		border 1px solid #ddd
		border-radius 8px
		font-size 0.95rem
		box-sizing border-box
		&:focus
			outline none
			border-color $color-primary
			box-shadow 0 0 0 3px rgba(255, 193, 7, 0.1)

	.status-select
		padding 0.75rem 1rem
		border 1px solid #ddd
		border-radius 8px
		font-size 0.95rem
		background white
		cursor pointer
		min-width 160px
		&:focus
			outline none
			border-color $color-primary

// Results info
.bookings-results-info
	margin-bottom 1rem
	color #666
	font-size 0.9rem

// Loading / Empty
.loading-state, .empty-state
	text-align center
	padding 3rem
	color #666
	p
		margin-bottom 1rem

// Table
.bookings-table-card
	background white
	border-radius 12px
	box-shadow 0 1px 3px rgba(0, 0, 0, 0.08)
	overflow hidden

.bookings-table
	overflow-x auto

	table
		width 100%
		border-collapse collapse

	thead
		background #f9f9f9

		th
			padding 0.75rem 1rem
			text-align left
			font-size 0.85rem
			font-weight 600
			color #555
			border-bottom 1px solid #eee
			white-space nowrap

	tbody
		tr
			border-bottom 1px solid #f5f5f5
			transition background 0.15s

			&:hover
				background #fafafa

		td
			padding 0.75rem 1rem
			font-size 0.9rem
			color #333

.sortable-header
	cursor pointer
	user-select none
	&:hover
		color $color-primary

.sort-indicator
	margin-left 0.25rem
	font-size 0.75rem

.actions-cell
	display flex
	gap 0.5rem
	flex-wrap wrap

.action-btn
	padding 0.35rem 0.65rem
	border 1px solid #ddd
	border-radius 6px
	background white
	font-size 0.8rem
	cursor pointer
	white-space nowrap
	transition background 0.15s, border-color 0.15s

	&:hover
		background #f5f5f5
		border-color #ccc

	&--danger
		color #F44336
		border-color #FFCDD2
		&:hover
			background #FFEBEE

	&--success
		color #4CAF50
		border-color #C8E6C9
		&:hover
			background #E8F5E9

// Pagination
.pagination
	display flex
	align-items center
	justify-content center
	gap 1rem
	padding 1rem
	border-top 1px solid #eee

.pagination-info
	color #666
	font-size 0.9rem

// ==================== PLANNING TAB ====================

.week-navigation
	display flex
	align-items center
	gap 1rem
	margin-bottom 1.5rem

	.week-label
		font-weight 600
		font-size 1.05rem
		color #333
		min-width 200px
		text-align center

.planning-grid-wrapper
	overflow-x auto

.planning-grid
	min-width 800px

.grid-header
	display grid
	grid-template-columns 160px repeat(7, 1fr)
	border-bottom 2px solid #eee

	.grid-cell
		padding 0.75rem 0.5rem
		text-align center
		font-size 0.85rem

.grid-facility-label
	text-align left
	font-weight 600
	color #333
	padding-left 0.75rem

.grid-day-header
	display flex
	flex-direction column
	align-items center
	gap 0.15rem

	.day-name
		font-weight 600
		color #555

	.day-date
		font-size 0.8rem
		color #888

	&.is-today
		background rgba(255, 193, 7, 0.08)
		.day-name
			color $color-primary

.grid-row
	display grid
	grid-template-columns 160px repeat(7, 1fr)
	border-bottom 1px solid #f5f5f5
	min-height 60px

	&:hover
		background #fafafa

.grid-day-cell
	padding 0.35rem
	border-left 1px solid #f5f5f5
	cursor pointer
	min-height 60px
	transition background 0.15s

	&:hover
		background #f0f0f0

	&.is-today
		background rgba(255, 193, 7, 0.04)

.booking-block
	padding 0.25rem 0.4rem
	border-radius 4px
	font-size 0.75rem
	margin-bottom 0.2rem
	cursor pointer
	display flex
	flex-direction column
	gap 0.1rem
	transition transform 0.1s

	&:hover
		transform scale(1.02)

	.booking-time
		font-weight 600

	.booking-name
		opacity 0.8
		overflow hidden
		text-overflow ellipsis
		white-space nowrap

	&.status-pending
		background #FFF3E0
		color #E65100
		border-left 3px solid #FF9800

	&.status-confirmed
		background #E8F5E9
		color #2E7D32
		border-left 3px solid #4CAF50

	&.status-cancelled
		background #FFEBEE
		color #C62828
		border-left 3px solid #F44336

	&.status-completed
		background #E3F2FD
		color #1565C0
		border-left 3px solid #2196F3

// ==================== FACILITIES TAB ====================

.facilities-grid
	display grid
	grid-template-columns repeat(auto-fill, minmax(350px, 1fr))
	gap 1.5rem

.facility-info
	margin-bottom 0.5rem

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
		text-align right
		max-width 60%

.facility-actions
	display flex
	gap 0.75rem
	width 100%
</style>
