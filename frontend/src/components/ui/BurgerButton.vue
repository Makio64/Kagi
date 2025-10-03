<!-- Simple BurgerButton by @makio64 || David Ronai -->
<template>
	<div class="BurgerButton" :class="{ cross: isMenuOpen }" @click="toggle">
		<span />
		<span />
		<span />
	</div>
</template>
<script>
import { isMenuOpen as storeIsMenuOpen } from '../../store'
export default {
	name: 'BurgerButton',
	computed: {
		isMenuOpen() {
			return storeIsMenuOpen.value
		}
	},
	methods: {
		toggle() {
			storeIsMenuOpen.value = !storeIsMenuOpen.value
		}
	}
}
</script>
<style lang="stylus" scoped>
.BurgerButton
	z-index 1000
	position absolute
	top 20px
	right 20px
	box-sizing: border-box
	width: 30px
	height: 30px
	cursor: pointer
	@media screen and (min-width: 600px)
		display none
	span
		background-color: black
		height: 2px
		position: absolute
		width: 100%
		left: 0
		transition: all 0.3s ease
		&:first-child
			top: 0
		&:nth-child(2)
			top: 6px
		&:last-child
			top: 12px
	&.cross
		span:nth-child(2)
			opacity: 0
		span:first-child,
		span:last-child
			top: 6px
		span:first-child
			transform: rotate(45deg)
		span:last-child
			transform: rotate(-45deg)
</style>
