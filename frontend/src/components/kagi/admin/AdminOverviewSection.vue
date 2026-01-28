<template>
	<section class="overview-section">
		<SectionHeader
			:title="$t('admin.overview.title')"
			icon="📊"
		/>
		<!-- Statistics Cards -->
		<div class="stats-grid">
			<StatCard
				icon="🏢"
				:label="$t('admin.stats.buildings')"
				:value="stats.buildings"
				variant="primary"
				:trend="trends.buildings"
			/>
			<StatCard
				icon="👥"
				:label="$t('admin.stats.residents')"
				:value="stats.residents"
				variant="secondary"
				:trend="trends.residents"
			/>
			<StatCard
				icon="🔧"
				:label="$t('admin.stats.maintenance')"
				:value="stats.maintenance"
				variant="warning"
				:trend="trends.maintenance"
			/>
			<StatCard
				icon="💰"
				:label="$t('admin.stats.revenue')"
				:value="stats.revenue"
				format="currency"
				variant="success"
				:trend="trends.revenue"
			/>
		</div>
		<!-- Recent Activities -->
		<KCard :title="$t('admin.recentActivity')" icon="🔔" variant="default" elevated>
			<div class="activity-list">
				<div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
					<span class="activity-icon">{{ activity.icon }}</span>
					<div class="activity-content">
						<p>{{ activity.text }}</p>
						<span class="activity-time">{{ activity.time }}</span>
					</div>
				</div>
			</div>
		</KCard>
	</section>
</template>
<script>
export default {
	name: 'AdminOverviewSection',
	props: {
		stats: {
			type: Object,
			default: () => ( {
				buildings: 0,
				residents: 0,
				maintenance: 0,
				revenue: 0
			} )
		},
		trends: {
			type: Object,
			default: () => ( {
				buildings: { text: '', positive: true },
				residents: { text: '', positive: true },
				maintenance: { text: '', positive: false },
				revenue: { text: '', positive: true }
			} )
		},
		recentActivities: {
			type: Array,
			default: () => []
		}
	}
}
</script>
<style lang="stylus" scoped>
@import '../../../styles/tokens.styl'
.overview-section
	animation fadeIn 0.3s ease
@keyframes fadeIn
	from
		opacity 0
		transform translateY(10px)
	to
		opacity 1
		transform translateY(0)
.stats-grid
	display grid
	grid-template-columns repeat(auto-fit, minmax(280px, 1fr))
	gap 1.5rem
	margin-bottom 2rem
.activity-list
	display flex
	flex-direction column
	gap 1rem
.activity-item
	display flex
	gap 1rem
	padding 1rem
	background #f9f9f9
	border-radius 10px
	.activity-icon
		font-size 1.5rem
	.activity-content
		flex 1
		p
			margin 0 0 0.25rem 0
			color #333
		.activity-time
			color #999
			font-size 0.85rem
</style>
