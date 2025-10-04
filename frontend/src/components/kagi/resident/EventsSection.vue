<template>
	<section class="section">
		<div class="section-header">
			<h2 class="section-title">📢 {{ $t('dashboard.menu.events') }}</h2>
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
	data() {
		return {
			// Mock events data - in the future this will come from API
			mockEvents: [
				{
					id: 1,
					type: 'christmas',
					icon: '🎄',
					title: 'Christmas Party',
					description: 'Join us for our annual Christmas celebration with food, drinks, and entertainment for all residents.',
					date: 'December 24, 2025 - 6:00 PM',
					location: '1st Floor Lobby'
				},
				{
					id: 2,
					type: 'assembly',
					icon: '👥',
					title: 'Residents Assembly',
					description: 'Annual general meeting to discuss building improvements, budget, and community matters.',
					date: 'January 15, 2026 - 2:00 PM',
					location: 'Meeting Room A'
				},
				{
					id: 3,
					type: 'maintenance',
					icon: '🔧',
					title: 'Building Maintenance',
					description: 'Scheduled maintenance work on the elevator system. Please use stairs during this period.',
					date: 'November 10-12, 2025',
					location: 'All Elevators'
				},
				{
					id: 4,
					type: 'safety',
					icon: '🚨',
					title: 'Fire Safety Drill',
					description: 'Mandatory fire safety drill for all residents. Please follow evacuation procedures.',
					date: 'November 5, 2025 - 10:00 AM',
					location: 'Entire Building'
				},
				{
					id: 5,
					type: 'cleaning',
					icon: '🧹',
					title: 'Community Cleaning Day',
					description: 'Join your neighbors for a community cleanup day. Refreshments will be provided.',
					date: 'October 20, 2025 - 9:00 AM',
					location: 'Common Areas & Garden'
				},
				{
					id: 6,
					type: 'garden',
					icon: '🌸',
					title: 'Spring Garden Party',
					description: 'Celebrate spring with a garden party featuring live music, barbecue, and games for children.',
					date: 'March 30, 2026 - 3:00 PM',
					location: 'Rooftop Garden'
				}
			]
		}
	}
}
</script>

<style lang="stylus" scoped>
.section
	padding 0

.section-header
	padding 2rem 2rem 2rem 2rem

.section-title
	margin 0
	font-size 1.75rem
	font-weight 600
	color #333

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
	box-shadow 0 2px 12px rgba(0,0,0,0.08)
	transition all 0.3s ease
	cursor pointer

	&:hover
		transform translateY(-4px)
		box-shadow 0 8px 24px rgba(0,0,0,0.15)

.event-icon-col
	display flex
	align-items center
	justify-content center
	padding 1.5rem

.event-icon
	font-size 3rem

.event-item
	&.christmas .event-icon-col
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)

	&.assembly .event-icon-col
		background linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)

	&.maintenance .event-icon-col
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)

	&.safety .event-icon-col
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)

	&.cleaning .event-icon-col
		background linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)

	&.garden .event-icon-col
		background linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%)

.event-content
	padding 1.5rem 1.5rem 1.5rem 0
	display flex
	flex-direction column
	gap 0.5rem

.event-date
	font-size 0.85rem
	color #999
	font-weight 500

h3
	margin 0
	font-size 1.15rem
	color #1a1a1a
	font-weight 600

p
	margin 0
	color #666
	font-size 0.9rem
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
		font-size 1rem

	p
		font-size 0.85rem
</style>
