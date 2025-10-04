<!-- Modern Button Style by @makio64 -->
<template>
	<div class="GradientButton" :class="{ isFull, red: color == 'red', blue: color == 'blue', yellow: color == 'yellow' }">
		<div class="gradient-border">
			<a v-if="href != ''" :href="href" target="_blank" rel="noopener noreferrer">
				<slot />
			</a>
			<span v-else>
				<slot />
			</span>
		</div>
	</div>
</template>
<script>
export default {
	name: 'GradientButton',
	props: {
		color: { type: String, default: 'blue' },
		href: { type: String, default: '' },
		isFull: { type: Boolean, default: false },
	},
}
</script>
<style lang="stylus" scoped>
.GradientButton
	text-align center
	cursor pointer
	display inline-block
	user-select none

	.gradient-border
		position relative
		padding 2px
		border-radius 40px
		background linear-gradient(100.57deg, rgba(0, 151, 254, 0.6) 0%, rgba(0, 151, 254, 1) 100%)
		display inline-block

	a,span
		text-decoration none
		display inline-block
		color #0097FE
		font-family 'Neue Montreal'
		font-size 15px
		font-style normal
		font-weight 400
		line-height 18px
		letter-spacing 0em
		border-radius 38px
		padding 9px 20px 11px 20px
		background #fff
		user-select none
	&.red
		.gradient-border
			background linear-gradient(100.57deg, rgba(255, 83, 121, 0.5) 0%, rgba(255, 83, 121, 1) 100%)
		a,span
			color #2E2E2E
	&.yellow
		.gradient-border
			background linear-gradient(100.57deg, #FFEB3B 0%, #FFA000 100%)
		a,span
			color #2E2E2E
	&.isFull
		.gradient-border
			padding 0
			background transparent
		a,span
			color #fff
			background linear-gradient(180deg, rgba(0, 151, 254, 0.7) 0%, #0097FE 100%)
			border-radius 40px
		&.red
			a,span
				background linear-gradient(180deg, rgba(255, 83, 121, 0.7) 0%, #FF5379 100%)
				color #fff
		&.yellow
			a,span
				background linear-gradient(135deg, #FFEB3B 0%, #FFA000 100%)
				color #fff
</style>
