<template>
	<button
		:type="type"
		:disabled="disabled"
		:class="['k-button', variant && `k-button--${variant}`]"
		@click="$emit('click', $event)"
	>
		<slot />
	</button>
</template>
<script>
export default {
	name: 'KButton',
	props: {
		type: { type: String, default: 'button' },
		variant: { type: String, default: 'primary' },
		disabled: { type: Boolean, default: false }
	},
	emits: ['click']
}
</script>
<style lang="stylus" scoped>
@import '../../styles/tokens.styl'
.k-button
	padding 0.75rem 1.5rem
	border none
	border-radius 8px
	font-size 1rem
	font-weight 500
	cursor pointer
	transition all 0.2s
	&:disabled
		opacity 0.6
		cursor not-allowed
	&--primary
		background $gradient-primary
		color white
		&:hover:not(:disabled)
			transform translateY(-1px)
			box-shadow $shadow-primary
	&--secondary
		background white
		color #333
		border 1px solid #ddd
		&:hover:not(:disabled)
			background #f5f5f5
	&--danger
		background #F44336
		color white
		&:hover:not(:disabled)
			background darken(#F44336, 10%)
			transform translateY(-1px)
</style>
