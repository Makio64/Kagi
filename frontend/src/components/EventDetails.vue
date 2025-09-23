<template>
	<div class="event-details">
		<div class="details-header">
			<button class="back-btn" @click="$emit('close')">
				← {{ $t('common.back') }}
			</button>
			<h2>📢 {{ event.title }}</h2>
		</div>

		<div class="details-content">
			<!-- Event Hero -->
			<div class="event-hero">
				<div class="event-date-badge">
					<div class="date-month">{{ event.month }}</div>
					<div class="date-day">{{ event.day }}</div>
					<div class="date-year">2024</div>
				</div>
				<div class="hero-content">
					<h1>{{ event.title }}</h1>
					<p class="event-subtitle">{{ event.subtitle }}</p>
				</div>
			</div>

			<!-- Event Info -->
			<div class="info-section">
				<h3>📅 {{ $t('events.eventInfo') }}</h3>
				<div class="info-grid">
					<div class="info-item">
						<span class="icon">🕐</span>
						<div>
							<div class="label">{{ $t('events.time') }}</div>
							<div class="value">{{ event.time }}</div>
						</div>
					</div>
					<div class="info-item">
						<span class="icon">📍</span>
						<div>
							<div class="label">{{ $t('events.location') }}</div>
							<div class="value">{{ event.location }}</div>
						</div>
					</div>
					<div class="info-item">
						<span class="icon">👥</span>
						<div>
							<div class="label">{{ $t('events.attendees') }}</div>
							<div class="value">{{ event.attendees }}</div>
						</div>
					</div>
					<div class="info-item">
						<span class="icon">🎟️</span>
						<div>
							<div class="label">{{ $t('events.fee') }}</div>
							<div class="value">{{ event.fee }}</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Event Description -->
			<div class="description-section">
				<h3>📝 {{ $t('events.description') }}</h3>
				<div class="description-content">
					<p>{{ event.description }}</p>
					
					<div v-if="event.agenda" class="agenda">
						<h4>{{ $t('events.agenda') }}</h4>
						<ul>
							<li v-for="item in event.agenda" :key="item">{{ item }}</li>
						</ul>
					</div>

					<div v-if="event.notes" class="notes">
						<h4>{{ $t('events.notes') }}</h4>
						<ul>
							<li v-for="note in event.notes" :key="note">{{ note }}</li>
						</ul>
					</div>
				</div>
			</div>

			<!-- RSVP Section -->
			<div v-if="!event.past" class="rsvp-section">
				<h3>✋ {{ $t('events.rsvp') }}</h3>
				<div v-if="!rsvpSubmitted" class="rsvp-form">
					<div class="rsvp-options">
						<button 
							:class="['rsvp-option', { selected: rsvpStatus === 'attending' }]"
							@click="rsvpStatus = 'attending'"
						>
							<span class="option-icon">✅</span>
							<span>{{ $t('events.attending') }}</span>
						</button>
						<button 
							:class="['rsvp-option', { selected: rsvpStatus === 'maybe' }]"
							@click="rsvpStatus = 'maybe'"
						>
							<span class="option-icon">🤔</span>
							<span>{{ $t('events.maybe') }}</span>
						</button>
						<button 
							:class="['rsvp-option', { selected: rsvpStatus === 'not_attending' }]"
							@click="rsvpStatus = 'not_attending'"
						>
							<span class="option-icon">❌</span>
							<span>{{ $t('events.notAttending') }}</span>
						</button>
					</div>
					
					<div v-if="rsvpStatus === 'attending'" class="guest-count">
						<label>{{ $t('events.numberOfGuests') }}</label>
						<input v-model.number="guestCount" type="number" min="1" max="5">
					</div>

					<textarea 
						v-model="rsvpComment"
						class="rsvp-comment"
						:placeholder="$t('events.commentPlaceholder')"
					/>

					<button class="submit-rsvp-btn" :disabled="!rsvpStatus" @click="submitRSVP">
						{{ $t('events.submitRsvp') }}
					</button>
				</div>
				
				<div v-else class="rsvp-success">
					<div class="success-icon">✅</div>
					<h4>{{ $t('events.rsvpSuccess') }}</h4>
					<p>{{ $t('events.rsvpThanks') }}</p>
				</div>
			</div>

			<!-- Past Event Notice -->
			<div v-if="event.past" class="past-event-notice">
				<span class="notice-icon">📅</span>
				<p>{{ $t('events.pastEvent') }}</p>
			</div>

			<!-- Organizer Info -->
			<div class="organizer-section">
				<h3>👤 {{ $t('events.organizer') }}</h3>
				<div class="organizer-card">
					<div class="organizer-info">
						<div class="organizer-name">{{ event.organizer }}</div>
						<div class="organizer-role">{{ event.organizerRole }}</div>
					</div>
					<button class="contact-organizer-btn">
						💬 {{ $t('events.contactOrganizer') }}
					</button>
				</div>
			</div>

			<!-- Related Events -->
			<div v-if="relatedEvents.length > 0" class="related-section">
				<h3>📅 {{ $t('events.upcoming') }}</h3>
				<div class="related-events">
					<div v-for="related in relatedEvents" :key="related.id" class="related-event">
						<div class="related-date">
							<span class="month">{{ related.month }}</span>
							<span class="day">{{ related.day }}</span>
						</div>
						<div class="related-info">
							<h4>{{ related.title }}</h4>
							<p>{{ related.time }} - {{ related.location }}</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	name: 'EventDetails',
	emits: ['close'],
	props: {
		event: {
			type: Object,
			default: () => ( {
				id: 1,
				title: 'Christmas Party',
				subtitle: 'Annual building celebration',
				month: 'DEC',
				day: '25',
				time: '6:00 PM - 10:00 PM',
				location: '1st Floor Lobby',
				attendees: '50-70 residents',
				fee: 'Free',
				description: 'Join us for our annual Christmas celebration! This is a wonderful opportunity to meet your neighbors and celebrate the holiday season together. We will have food, drinks, music, and fun activities for all ages.',
				agenda: [
					'6:00 PM - Welcome and opening remarks',
					'6:30 PM - Dinner buffet opens',
					'7:30 PM - Christmas carol singing',
					'8:00 PM - Gift exchange (optional)',
					'9:00 PM - Dancing and socializing'
				],
				notes: [
					'Children are welcome and encouraged to attend',
					'Please bring a wrapped gift (¥1000 value) if you wish to participate in the gift exchange',
					'Vegetarian and halal options will be available',
					'Dress code: Smart casual or festive attire'
				],
				organizer: 'Building Management Committee',
				organizerRole: 'Event Coordination Team',
				past: false
			} )
		}
	},
	data() {
		return {
			rsvpStatus: null,
			guestCount: 1,
			rsvpComment: '',
			rsvpSubmitted: false,
			relatedEvents: [
				{
					id: 2,
					month: 'JAN',
					day: '01',
					title: 'New Year Gathering',
					time: '11:00 AM',
					location: 'Rooftop Garden'
				},
				{
					id: 3,
					month: 'JAN',
					day: '10',
					title: 'Fire Drill',
					time: '10:00 AM',
					location: 'All Areas'
				}
			]
		}
	},
	methods: {
		submitRSVP() {
			// Simulate RSVP submission
			setTimeout( () => {
				this.rsvpSubmitted = true
			}, 500 )
		}
	}
}
</script>

<style lang="stylus" scoped>
.event-details
	background white
	border-radius 20px
	height 100%
	max-height 90vh
	display flex
	flex-direction column
	overflow hidden

.details-header
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

.details-content
	flex 1
	overflow-y auto
	padding 2rem

	@media (max-width: 768px)
		padding 1rem

.event-hero
	background linear-gradient(135deg, #FFE0B2 0%, #FFCC80 100%)
	border-radius 15px
	padding 2rem
	margin-bottom 2rem
	display flex
	align-items center
	gap 2rem

	@media (max-width: 768px)
		flex-direction column
		text-align center

.event-date-badge
	background white
	border-radius 15px
	padding 1.5rem
	text-align center
	min-width 100px
	box-shadow 0 4px 12px rgba(0,0,0,0.1)

	.date-month
		color #FF9800
		font-size 0.9rem
		font-weight 600
		letter-spacing 1px

	.date-day
		font-size 2.5rem
		font-weight bold
		color #333
		line-height 1

	.date-year
		color #999
		font-size 0.85rem
		margin-top 0.25rem

.hero-content
	flex 1

	h1
		margin 0 0 0.5rem 0
		color #333
		font-size 2rem

	.event-subtitle
		color #666
		font-size 1.1rem
		margin 0

.info-section, .description-section, .rsvp-section, .organizer-section, .related-section
	background white
	border 2px solid #FFE082
	border-radius 15px
	padding 1.5rem
	margin-bottom 1.5rem

	h3
		margin 0 0 1rem 0
		color #333
		font-size 1.1rem

.info-grid
	display grid
	grid-template-columns repeat(auto-fit, minmax(200px, 1fr))
	gap 1.5rem

.info-item
	display flex
	gap 1rem
	align-items start

	.icon
		font-size 1.5rem

	.label
		color #666
		font-size 0.9rem
		margin-bottom 0.25rem

	.value
		color #333
		font-weight 500

.description-content
	color #333
	line-height 1.6

	p
		margin-bottom 1rem

	h4
		color #FF9800
		margin 1.5rem 0 0.75rem 0

	ul
		margin 0
		padding-left 1.5rem

		li
			margin-bottom 0.5rem
			color #666

.agenda, .notes
	background #f9f9f9
	padding 1rem
	border-radius 10px
	margin-top 1rem

.rsvp-options
	display grid
	grid-template-columns repeat(3, 1fr)
	gap 1rem
	margin-bottom 1.5rem

	@media (max-width: 768px)
		grid-template-columns 1fr

.rsvp-option
	padding 1rem
	background white
	border 2px solid #e0e0e0
	border-radius 10px
	cursor pointer
	transition all 0.2s ease
	display flex
	flex-direction column
	align-items center
	gap 0.5rem

	&:hover
		border-color #FFC107

	&.selected
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
		border-color #FF9800

	.option-icon
		font-size 1.5rem

.guest-count
	margin-bottom 1rem

	label
		display block
		color #666
		margin-bottom 0.5rem
		font-size 0.9rem

	input
		width 100px
		padding 0.5rem
		border 2px solid #e0e0e0
		border-radius 8px
		font-size 1rem

.rsvp-comment
	width 100%
	padding 0.75rem
	border 2px solid #e0e0e0
	border-radius 10px
	resize vertical
	min-height 80px
	margin-bottom 1rem
	font-family inherit

	&:focus
		outline none
		border-color #FFC107

.submit-rsvp-btn
	width 100%
	padding 1rem
	background linear-gradient(135deg, #FF9800 0%, #FFB300 100%)
	color white
	border none
	border-radius 50px
	font-size 1rem
	font-weight 600
	cursor pointer
	transition all 0.2s ease

	&:hover:not(:disabled)
		transform translateY(-2px)
		box-shadow 0 8px 20px rgba(255, 152, 0, 0.3)

	&:disabled
		opacity 0.5
		cursor not-allowed

.rsvp-success
	text-align center
	padding 2rem

	.success-icon
		font-size 3rem
		margin-bottom 1rem

	h4
		color #4CAF50
		margin 0 0 0.5rem 0

	p
		color #666
		margin 0

.past-event-notice
	background linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%)
	border 2px solid #F44336
	border-radius 15px
	padding 1.5rem
	text-align center
	margin-bottom 1.5rem

	.notice-icon
		font-size 2rem
		margin-bottom 0.5rem
		display block

	p
		margin 0
		color #C62828
		font-weight 500

.organizer-card
	display flex
	justify-content space-between
	align-items center
	background #f9f9f9
	padding 1rem
	border-radius 10px

	@media (max-width: 768px)
		flex-direction column
		gap 1rem

	.organizer-name
		font-weight 600
		color #333
		margin-bottom 0.25rem

	.organizer-role
		color #666
		font-size 0.9rem

.contact-organizer-btn
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

.related-events
	display flex
	flex-direction column
	gap 1rem

.related-event
	display flex
	gap 1rem
	padding 1rem
	background #f9f9f9
	border-radius 10px
	cursor pointer
	transition all 0.2s ease

	&:hover
		background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)

	.related-date
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

	.related-info
		flex 1

		h4
			margin 0 0 0.25rem 0
			color #333

		p
			margin 0
			color #666
			font-size 0.9rem
</style>