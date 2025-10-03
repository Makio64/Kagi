<template>
	<div class="home-section">
		<div class="home-welcome">
			<h2>{{ $t('dashboard.welcome') }}</h2>
			<p>{{ $t('dashboard.welcomeSubtitle') }}</p>
		</div>
		<div class="services-grid">
			<button
				v-for="item in menuItems"
				v-show="item.id !== 'home'"
				:key="item.id"
				class="service-card"
				@click="$emit('navigate', item.id)"
			>
				<div class="service-icon">{{ item.icon }}</div>
				<h3>{{ item.label }}</h3>
				<p class="service-description">{{ item.description }}</p>
			</button>
		</div>
	</div>
</template>
<script>
export default {
	name: 'HomeSection',
	props: {
		menuItems: { type: Array, required: true }
	},
	emits: ['navigate']
}
</script>
<style lang="stylus" scoped>
.home-welcome
	margin-bottom 2rem
	h2
		font-size 2rem
		margin-bottom 0.5rem
	p
		color #666
.services-grid
	display grid
	grid-template-columns repeat(auto-fill, minmax(250px, 1fr))
	gap 1.5rem

.service-card
	background white
	padding 2rem
	border-radius 12px
	border none
	cursor pointer
	text-align center
	transition all 0.2s
	box-shadow 0 2px 8px rgba(0,0,0,0.08)
	&:hover
		transform translateY(-2px)
		box-shadow 0 4px 16px rgba(0,0,0,0.15)

.service-icon
	font-size 3rem
	margin-bottom 1rem

h3
	margin-bottom 0.5rem

.service-description
	color #666
	font-size 0.85rem
	margin 0
	line-height 1.4

@media (max-width: 768px)
	.home-section
		padding 0.5rem

	.home-welcome
		margin-bottom 1.5rem

	.services-grid
		grid-template-columns repeat(auto-fill, minmax(150px, 1fr))
		gap 1rem

	.service-card
		padding 1.25rem

	.service-icon
		font-size 2.5rem
		margin-bottom 0.5rem

	h3
		font-size 0.9rem
		margin-bottom 0.25rem

	.service-description
		font-size 0.75rem
</style>
