<template>
	<div class="home-section">
		<div class="home-welcome">
			<h2>{{ $t('dashboard.welcome') }}</h2>
			<p>{{ $t('dashboard.welcomeSubtitle') }}</p>
		</div>
		<div class="services-grid">
			<div
				v-for="item in menuItems"
				v-show="item.id !== 'home'"
				:key="item.id"
				class="card-wrapper"
				@click="$emit('navigate', item.id)"
			>
				<button class="service-card">
					<div class="service-icon-wrapper">
						<div class="service-icon">
							<Icon :name="item.icon" :size="32" />
						</div>
					</div>
					<div class="service-content">
						<h3>{{ item.label }}</h3>
						<p class="service-description">{{ item.description }}</p>
					</div>
					<div class="card-arrow">
						<Icon name="arrow_right" :size="20" />
					</div>
				</button>
			</div>
		</div>
	</div>
</template>
<script>
import Icon from '../../Icon.vue'

export default {
	name: 'HomeSection',
	components: { Icon },
	props: {
		menuItems: { type: Array, required: true }
	},
	emits: ['navigate']
}
</script>
<style lang="stylus" scoped>
@import '../../../styles/tokens-modern.styl'

.home-section
	position relative
	z-index 1

.home-welcome
	margin-bottom var(--space-10)
	text-align center
	h2
		font-size var(--text-3xl)
		margin-bottom var(--space-2)
		color var(--color-gray-900)
		font-weight var(--font-bold)
		letter-spacing -0.02em
	p
		color var(--color-gray-500)
		font-size var(--text-xl)
		font-weight var(--font-medium)

.services-grid
	display grid
	grid-template-columns repeat(auto-fill, minmax(300px, 1fr))
	gap var(--space-6)
	max-width 1200px
	margin 0 auto

.card-wrapper
	height 100%

.service-card
	background rgba(255, 255, 255, 0.8)
	backdrop-filter blur(20px)
	-webkit-backdrop-filter blur(20px)
	padding var(--space-6)
	border-radius var(--radius-2xl)
	border 1px solid rgba(255, 255, 255, 0.6)
	cursor pointer
	text-align left
	transition all var(--transition-base)
	box-shadow 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02)
	display flex
	align-items center
	gap var(--space-5)
	height 100%
	width 100%
	position relative
	overflow hidden

	&::before
		content ''
		position absolute
		inset 0
		background linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.4) 50%, rgba(255,255,255,0) 100%)
		transform translateX(-100%)
		transition transform 0.6s ease

	&:hover
		transform translateY(-4px)
		background rgba(255, 255, 255, 0.95)
		box-shadow 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.02)
		border-color white

		&::before
			transform translateX(100%)

		.service-icon
			transform scale(1.1) rotate(-5deg)
			background var(--color-primary-500)
			color white
			box-shadow var(--shadow-primary)

		.card-arrow
			opacity 1
			transform translateX(0)

		h3
			color var(--color-primary-600)

.service-icon-wrapper
	flex-shrink 0

.service-icon
	width 56px
	height 56px
	background var(--color-gray-50)
	color var(--color-gray-600)
	border-radius var(--radius-xl)
	display flex
	align-items center
	justify-content center
	transition all var(--transition-base)

.service-content
	flex 1
	min-width 0 // For text truncation if needed

h3
	margin-bottom var(--space-1)
	font-size var(--text-lg)
	font-weight var(--font-bold)
	color var(--color-gray-900)
	transition color var(--transition-base)

.service-description
	color var(--color-gray-500)
	font-size var(--text-sm)
	margin 0
	line-height 1.5
	display -webkit-box
	-webkit-line-clamp 2
	-webkit-box-orient vertical
	overflow hidden

.card-arrow
	opacity 0
	transform translateX(-10px)
	color var(--color-primary-500)
	transition all var(--transition-base)
	display flex
	align-items center
	justify-content center

@media (max-width: 768px)
	.home-section
		padding var(--space-2)

	.home-welcome
		margin-bottom var(--space-6)
		text-align left
		h2
			font-size var(--text-2xl)
		p
			font-size var(--text-base)

	.services-grid
		grid-template-columns 1fr
		gap var(--space-3)

	.service-card
		padding var(--space-4)
		border-radius var(--radius-xl)
		background white
		box-shadow var(--shadow-sm)

	.service-icon
		width 48px
		height 48px
		background var(--color-primary-50)
		color var(--color-primary-600)

	.card-arrow
		opacity 1
		transform none
		color var(--color-gray-300)

</style>
