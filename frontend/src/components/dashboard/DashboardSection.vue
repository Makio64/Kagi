<template>
	<section v-show="active" class="dashboard-section">
		<SectionHeader
			v-if="title"
			:title="title"
			:subtitle="subtitle"
			:icon="icon"
			:showSearch="showSearch"
			@search="$emit('search', $event)"
		/>

		<div class="section-content">
			<slot></slot>
		</div>
	</section>
</template>

<script>
export default {
	name: 'DashboardSection',
	props: {
		active: {
			type: Boolean,
			default: true
		},
		title: {
			type: String,
			default: ''
		},
		subtitle: {
			type: String,
			default: ''
		},
		icon: {
			type: String,
			default: ''
		},
		showSearch: {
			type: Boolean,
			default: false
		}
	},
	emits: ['search']
}
</script>

<style lang="stylus" scoped>
.dashboard-section
	animation fadeIn 0.3s ease

.section-content
	margin-top 1.5rem

@keyframes fadeIn
	from
		opacity 0
		transform translateY(10px)
	to
		opacity 1
		transform translateY(0)
</style>