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

					<div class="service-meta">
						<span>💴 {{ service.price }}</span>
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
	computed: {
		// Mock services data - in the future this will come from API
		mockServices() {
			return [
				{
					id: 1,
					icon: '🧹',
					title: this.$t( 'dashboard.services.cleaning' ),
					description: this.$t( 'dashboard.services.cleaning.description' ),
					price: '¥8,000 - ¥15,000'
				},
				{
					id: 2,
					icon: '🚴',
					title: this.$t( 'dashboard.services.bikeRental' ),
					description: this.$t( 'dashboard.services.bikeRental.description' ),
					price: `¥500${this.$t( 'dashboard.booking.perDay' )} - ¥3,000${this.$t( 'dashboard.booking.perWeek' )}`
				},
				{
					id: 3,
					icon: '🛏️',
					title: this.$t( 'dashboard.services.futonRental' ),
					description: this.$t( 'dashboard.services.futonRental.description' ),
					price: `¥2,000${this.$t( 'dashboard.booking.perNight' )}`
				},
				{
					id: 4,
					icon: '🌸',
					title: this.$t( 'dashboard.services.flowerDelivery' ),
					description: this.$t( 'dashboard.services.flowerDelivery.description' ),
					price: '¥3,000 - ¥10,000'
				},
				{
					id: 5,
					icon: '📦',
					title: this.$t( 'dashboard.services.packageHolding' ),
					description: this.$t( 'dashboard.services.packageHolding.description' ),
					price: this.$t( 'dashboard.booking.free' )
				},
				{
					id: 6,
					icon: '🚗',
					title: this.$t( 'dashboard.services.carWash' ),
					description: this.$t( 'dashboard.services.carWash.description' ),
					price: '¥3,000 - ¥8,000'
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

.service-meta
	display flex
	flex-direction column
	gap 0.5rem
	margin-bottom 1rem
	span
		font-size 0.85rem
		color #4b5563
		display flex
		align-items center
		justify-content center
		gap 0.25rem

.book-service-btn
	width 100%
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
		background linear-gradient(135deg, #FFB300 0%, #FFA000 100%)
		transform translateY(-2px)
		box-shadow 0 5px 15px rgba(255, 193, 7, 0.35)

@media (max-width: 768px)
	.services-grid
		grid-template-columns 1fr
</style>
