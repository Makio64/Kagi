<template>
	<section class="section">
		<div class="section-header">
			<h2 class="section-title">🛎️ {{ $t('dashboard.services.title') }}</h2>
		</div>

		<div class="services-grid">
			<div
				v-for="service in mockServices"
				:key="service.id"
				class="service-card"
			>
				<div class="service-icon-badge">{{ service.icon }}</div>
				<div class="service-content">
					<h3>{{ service.title }}</h3>
					<p class="service-description">{{ service.description }}</p>

					<div class="service-details">
						<div class="detail-item">
							<span class="detail-label">💴 Price:</span>
							<span class="detail-value">{{ service.price }}</span>
						</div>
					</div>

					<button class="book-service-btn">
						{{ $t('dashboard.services.book') }}
					</button>
				</div>
			</div>
		</div>
	</section>
</template>

<script>
export default {
	name: 'ServicesSection',
	data() {
		return {
			// Mock services data - in the future this will come from API
			mockServices: [
				{
					id: 1,
					icon: '🧹',
					title: 'Cleaning Service',
					description: 'Professional cleaning service for your apartment. Deep cleaning, regular maintenance, or move-out cleaning available.',
					price: '¥8,000 - ¥15,000',
					availability: 'Mon-Sat, 9:00 AM - 5:00 PM',
					contact: '03-1234-5678'
				},
				{
					id: 2,
					icon: '🚴',
					title: 'Bike Rental',
					description: 'Rent a bicycle for daily transportation. Electric bikes and regular bikes available.',
					price: '¥500/day - ¥3,000/week',
					availability: '24/7 (Self-service)',
					contact: 'Via app or front desk'
				},
				{
					id: 3,
					icon: '🛏️',
					title: 'Futon Rental',
					description: 'Extra bedding sets for guests. Clean, comfortable futons with full bedding included.',
					price: '¥2,000/night',
					availability: 'Book 24h in advance',
					contact: 'Front desk'
				},
				{
					id: 4,
					icon: '🌸',
					title: 'Flower Delivery',
					description: 'Fresh flowers delivered to your door or sent to others. Perfect for celebrations or decorations.',
					price: '¥3,000 - ¥10,000',
					availability: 'Daily delivery',
					contact: '03-1234-5679'
				},
				{
					id: 5,
					icon: '📦',
					title: 'Package Holding',
					description: 'Secure package storage for deliveries when you\'re away. Pick up at your convenience.',
					price: 'Free',
					availability: '24/7 pickup',
					contact: 'Front desk'
				},
				{
					id: 6,
					icon: '🚗',
					title: 'Car Wash Service',
					description: 'Professional car washing and detailing service in the building parking area.',
					price: '¥3,000 - ¥8,000',
					availability: 'Weekdays 10:00 AM - 4:00 PM',
					contact: '03-1234-5680'
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

.services-grid
	display grid
	grid-template-columns repeat(auto-fill, minmax(350px, 1fr))
	gap 1.5rem
	padding 0 2rem 3rem 2rem

@media (max-width: 768px)
	.section-header
		padding 1rem 1rem 1rem 1rem

	.services-grid
		padding 0 1rem 2rem 1rem

.service-card
	background white
	border-radius 12px
	padding 1.5rem
	box-shadow 0 2px 8px rgba(0,0,0,0.08)
	transition all 0.3s ease
	display flex
	flex-direction column

	&:hover
		transform translateY(-4px)
		box-shadow 0 8px 24px rgba(0,0,0,0.15)

.service-icon-badge
	width 70px
	height 70px
	display flex
	align-items center
	justify-content center
	font-size 2.5rem
	background linear-gradient(135deg, #FFF9C4 0%, #FFECB3 100%)
	border-radius 12px
	margin-bottom 1rem

.service-content
	flex 1
	display flex
	flex-direction column

	h3
		margin 0 0 0.75rem 0
		font-size 1.25rem
		color #333
		font-weight 600

.service-description
	margin 0 0 1.25rem 0
	color #666
	font-size 0.95rem
	line-height 1.6
	flex 1

.service-details
	background #f8f9fa
	border-radius 8px
	padding 1rem
	margin-bottom 1rem

.detail-item
	display flex
	justify-content space-between
	align-items center
	padding 0.5rem 0

	&:not(:last-child)
		border-bottom 1px solid #e9ecef

.detail-label
	color #666
	font-size 0.9rem
	font-weight 500

.detail-value
	color #333
	font-size 0.9rem
	font-weight 500
	text-align right

.book-service-btn
	width 100%
	padding 0.75rem
	background #1976D2
	color white
	border none
	border-radius 8px
	font-size 0.95rem
	font-weight 500
	cursor pointer
	transition all 0.2s ease

	&:hover
		background #1565C0
		transform translateY(-1px)

@media (max-width: 768px)
	.services-grid
		grid-template-columns 1fr
</style>
