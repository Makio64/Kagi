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
				:trend="{ text: '+2 this month', positive: true }"
			/>
			<StatCard
				icon="👥"
				:label="$t('admin.stats.residents')"
				:value="stats.residents"
				variant="secondary"
				:trend="{ text: '+48 this month', positive: true }"
			/>
			<StatCard
				icon="🔧"
				:label="$t('admin.stats.maintenance')"
				:value="stats.maintenance"
				variant="warning"
				:trend="{ text: '8 urgent', positive: false }"
			/>
			<StatCard
				icon="💰"
				:label="$t('admin.stats.revenue')"
				:value="stats.revenue"
				format="currency"
				variant="success"
				:trend="{ text: '+12%', positive: true }"
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
				buildings: 12,
				residents: 1248,
				maintenance: 23,
				revenue: 12500000
			} )
		},
		recentActivities: {
			type: Array,
			default: () => [
				{ id: 1, icon: '🔧', text: 'New maintenance request from Unit 502', time: '5 minutes ago' },
				{ id: 2, icon: '📅', text: 'Party Room booked for Dec 25', time: '1 hour ago' },
				{ id: 3, icon: '💳', text: '15 residents paid management fees', time: 'Today' }
			]
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
