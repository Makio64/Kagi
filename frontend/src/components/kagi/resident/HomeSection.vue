<template>
	<div class="home-section">
		<div class="home-welcome">
			<h2>{{ $t('dashboard.welcome') }}</h2>
			<p>{{ $t('dashboard.welcomeSubtitle') }}</p>
		</div>
		<div class="services-grid">
			<ButtonFX
				v-for="item in menuItems"
				v-show="item.id !== 'home'"
				:key="item.id"
				@click="$emit('navigate', item.id)"
			>
				<button class="service-card">
					<div class="service-icon">
						<Icon :name="item.icon" :size="40" />
					</div>
					<h3>{{ item.label }}</h3>
					<p class="service-description">{{ item.description }}</p>
				</button>
			</ButtonFX>
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

.home-welcome
	margin-bottom var(--space-8)
	h2
		font-size var(--text-2xl)
		margin-bottom var(--space-2)
		color var(--color-gray-900)
		font-weight var(--font-bold)
	p
		color var(--color-gray-600)
		font-size var(--text-lg)

.services-grid
	display grid
	grid-template-columns repeat(auto-fill, minmax(280px, 1fr))
	gap var(--space-6)

.service-card
	background white
	padding var(--space-8)
	border-radius var(--radius-xl)
	border 1px solid rgba(0,0,0,0.05)
	cursor pointer
	text-align left
	transition all var(--transition-base)
	box-shadow var(--shadow-sm)
	display flex
	flex-direction column
	align-items flex-start
	height 100%
	width 100%
	
	&:hover
		transform translateY(-4px)
		box-shadow var(--shadow-lg)
		border-color var(--color-primary-200)
		.service-icon
			background var(--color-primary-500)
			color white
			transform scale(1.1) rotate(-5deg)

.service-icon
	margin-bottom var(--space-6)
	color var(--color-primary-600)
	background var(--color-primary-50)
	width 64px
	height 64px
	border-radius var(--radius-lg)
	display flex
	align-items center
	justify-content center
	transition all var(--transition-base)

h3
	margin-bottom var(--space-2)
	font-size var(--text-lg)
	font-weight var(--font-semibold)
	color var(--color-gray-900)

.service-description
	color var(--color-gray-600)
	font-size var(--text-sm)
	margin 0
	line-height 1.5

@media (max-width: 768px)
	.home-section
		padding var(--space-2)

	.home-welcome
		margin-bottom var(--space-6)
		h2
			font-size var(--text-xl)

	.services-grid
		grid-template-columns repeat(auto-fill, minmax(160px, 1fr))
		gap var(--space-4)

	.service-card
		padding var(--space-5)
		border-radius var(--radius-lg)

	.service-icon
		width 48px
		height 48px
		margin-bottom var(--space-4)
		:deep(svg)
			width 24px
			height 24px

	h3
		font-size var(--text-base)
		margin-bottom var(--space-1)

	.service-description
		font-size var(--text-xs)
</style>
