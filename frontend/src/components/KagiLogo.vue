<template>
	<svg
		:width="size"
		:height="size"
		viewBox="0 0 100 100"
		xmlns="http://www.w3.org/2000/svg"
		class="kagi-logo"
	>
		<!-- Key handle (circular part) -->
		<circle cx="35" cy="35" r="18" fill="none" :stroke="color" stroke-width="6" />

		<!-- Key shaft -->
		<rect x="55" y="32" :width="45" height="6" :fill="color" />

		<!-- Key teeth -->
		<rect x="83" y="36" width="4" height="10" :fill="color" />
		<rect x="88" y="36" width="4" height="8" :fill="color" />
		<rect x="93" y="36" width="4" height="10" :fill="color" />
	</svg>
</template>

<script setup>
defineProps( {
	size: {
		type: [Number, String],
		default: 80
	},
	color: {
		type: String,
		default: '#FFC107'
	}
} )
</script>

<style lang="stylus" scoped>
.kagi-logo
	display inline-block
</style>
