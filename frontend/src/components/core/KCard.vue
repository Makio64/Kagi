<template>
	<div class="k-card">
		<slot />
	</div>
</template>
<script>
export default {
	name: 'KCard'
}
</script>
<style lang="stylus" scoped>
.k-card
	background white
	border-radius 12px
	padding 1.5rem
	box-shadow 0 2px 8px rgba(0, 0, 0, 0.1)
	transition all 0.2s
</style>
