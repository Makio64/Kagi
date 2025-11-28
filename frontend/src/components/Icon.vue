<template>
	<div class="icon-wrapper" :style="{ width: size + 'px', height: size + 'px', color: color }">
		<svg
			v-if="path"
			viewBox="0 0 24 24"
			fill="currentColor"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path :d="path" />
		</svg>
	</div>
</template>

<script>
// Material Design Icons paths
const icons = {
	communication: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z',
	document: 'M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z',
	calendar: 'M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z',
	maintenance: 'M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z',
	event: 'M21 11.01L3 11v2h18zM3 16h12v-2H3zM21 6H3v2.01L21 8z',
	payment: 'M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z',
	check: 'M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z',
	arrow_right: 'M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z',
	menu: 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z'
}

export default {
	name: 'Icon',
	props: {
		name: {
			type: String,
			required: true
		},
		size: {
			type: [Number, String],
			default: 24
		},
		color: {
			type: String,
			default: 'currentColor'
		}
	},
	computed: {
		path() {
			return icons[this.name] || ''
		}
	}
}
</script>

<style scoped>
.icon-wrapper {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	vertical-align: middle;
}
</style>
