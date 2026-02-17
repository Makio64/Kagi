<template>
	<section class="section">
		<div class="section-header">
			<h2 class="section-title">
				<Icon name="event" :size="30" color="#FFC107" />
				{{ $t('dashboard.menu.events') }}
			</h2>
		</div>

		<div class="events-list">
			<div
				v-for="event in mockEvents"
				:key="event.id"
				:class="['event-item', event.type]"
			>
				<div class="event-icon-col">
					<div class="event-icon">{{ event.icon }}</div>
				</div>
				<div class="event-content">
					<h3>{{ event.title }}</h3>
					<p>{{ event.description }}</p>
					<div class="event-date">{{ event.date }}</div>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
export default {
	name: 'EventsSection',
	computed: {
		monthKeys() {
			return [
				'calendar.january',
				'calendar.february',
				'calendar.march',
				'calendar.april',
				'calendar.may',
				'calendar.june',
				'calendar.july',
				'calendar.august',
				'calendar.september',
				'calendar.october',
				'calendar.november',
				'calendar.december'
			]
		},
		// Mock events data - in the future this will come from API
		mockEvents() {
			return [
				{
					id: 1,
					type: 'christmas',
					icon: '🎄',
					title: this.$t( 'dashboard.events.christmasParty.title' ),
					description: this.$t( 'dashboard.events.christmasParty.description' ),
					date: this.formatDate( 11, 24, 2025, '18:00' )
				},
				{
					id: 2,
					type: 'assembly',
					icon: '👥',
					title: this.$t( 'events.residentsAssembly.title' ),
					description: this.$t( 'events.residentsAssembly.description' ),
					date: this.formatDate( 0, 15, 2026, '14:00' )
				},
				{
					id: 3,
					type: 'maintenance',
					icon: '🔧',
					title: this.$t( 'events.buildingMaintenance.title' ),
					description: this.$t( 'events.buildingMaintenance.description' ),
					date: this.formatDateRange( 10, 10, 12, 2025 )
				},
				{
					id: 4,
					type: 'safety',
					icon: '🚨',
					title: this.$t( 'dashboard.events.fireDrill.title' ),
					description: this.$t( 'dashboard.events.fireDrill.description' ),
					date: this.formatDate( 10, 5, 2025, '10:00' )
				},
				{
					id: 5,
					type: 'cleaning',
					icon: '🧹',
					title: this.$t( 'events.communityCleaningDay.title' ),
					description: this.$t( 'events.communityCleaningDay.description' ),
					date: this.formatDate( 9, 20, 2025, '9:00' )
				},
				{
					id: 6,
					type: 'garden',
					icon: '🌸',
					title: this.$t( 'events.springGardenParty.title' ),
					description: this.$t( 'events.springGardenParty.description' ),
					date: this.formatDate( 2, 30, 2026, '15:00' )
				}
			]
		}
	},
	methods: {
		formatDate( month, day, year, time ) {
			const monthName = this.$t( this.monthKeys[month] )
			return `${monthName} ${day}, ${year} - ${time}`
		},
		formatDateRange( month, startDay, endDay, year ) {
			const monthName = this.$t( this.monthKeys[month] )
			return `${monthName} ${startDay}-${endDay}, ${year}`
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
	justify-content center
	gap 0.5rem

.events-list
	padding 0 2rem 3rem 2rem
	display flex
	flex-direction column
	gap 1.5rem

.event-item
	display grid
	grid-template-columns 100px 1fr
	gap 1.5rem
	background white
	border-radius 16px
	overflow hidden
	box-shadow 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)
	transition all 0.3s ease
	cursor pointer

	&:hover
		transform translateY(-4px)
		box-shadow 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)

.event-icon-col
	display flex
	align-items center
	justify-content center
	padding 1.5rem
	background #FFFDE7

.event-icon
	font-size 3rem

.event-content
	padding 1.5rem 1.5rem 1.5rem 0
	display flex
	flex-direction column
	gap 0.5rem

.event-date
	font-size var(--text-xs)
	color var(--color-gray-400)
	font-weight var(--font-medium)

h3
	margin 0
	font-size var(--text-base)
	color var(--color-gray-900)
	font-weight var(--font-semibold)

p
	margin 0
	color var(--color-gray-500)
	font-size var(--text-sm)
	line-height 1.6

@media (max-width: 768px)
	.section-header
		padding 1rem 1rem 1rem 1rem
		margin-bottom 1rem

	.events-list
		padding 0 1rem 2rem 1rem
		gap 1rem

	.event-item
		grid-template-columns 80px 1fr

	.event-icon-col
		padding 1rem

	.event-icon
		font-size 2.5rem

	.event-content
		padding 1rem 1rem 1rem 0

	h3
		font-size var(--text-sm)

	p
		font-size var(--text-xs)
</style>
