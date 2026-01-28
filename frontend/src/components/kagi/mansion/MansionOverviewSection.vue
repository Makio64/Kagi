<template>
	<section class="mansion-overview-section">
		<SectionHeader
			:title="$t('mansion.overview.title') || 'Dashboard Overview'"
			icon="📊"
		/>

		<div v-if="loading" class="loading-state">
			<p>{{ $t('common.loading') || 'Loading...' }}</p>
		</div>

		<template v-else>
			<!-- Statistics Cards -->
			<div class="stats-grid">
				<StatCard
					icon="👥"
					:label="$t('mansion.stats.residents') || 'Residents'"
					:value="stats.residents"
					variant="primary"
				/>
				<StatCard
					icon="🔧"
					:label="$t('mansion.stats.maintenance') || 'Pending Maintenance'"
					:value="stats.maintenance"
					variant="warning"
				/>
				<StatCard
					icon="📅"
					:label="$t('mansion.stats.bookings') || 'Pending Bookings'"
					:value="stats.bookings"
					variant="info"
				/>
				<StatCard
					icon="🏢"
					:label="$t('mansion.stats.facilities') || 'Facilities'"
					:value="stats.facilities"
					variant="secondary"
				/>
			</div>

			<!-- Recent Activities -->
			<KCard
				:title="$t('mansion.overview.recentActivity') || 'Recent Activity'"
				icon="🔔"
				variant="default"
				elevated
			>
				<div v-if="recentActivities.length === 0" class="no-activity">
					<p>{{ $t('mansion.overview.noActivity') || 'No recent activity' }}</p>
				</div>
				<div v-else class="activity-list">
					<div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
						<span class="activity-icon">{{ activity.icon }}</span>
						<div class="activity-content">
							<p>{{ activity.text }}</p>
							<span class="activity-time">{{ activity.time }}</span>
						</div>
					</div>
				</div>
			</KCard>
		</template>
	</section>
</template>

<script>
export default {
	name: 'MansionOverviewSection',
	props: {
		stats: {
			type: Object,
			default: () => ( {
				residents: 0,
				maintenance: 0,
				bookings: 0,
				facilities: 0
			} )
		},
		recentActivities: {
			type: Array,
			default: () => []
		},
		loading: {
			type: Boolean,
			default: false
		}
	}
}
</script>

<style lang="stylus" scoped>
.mansion-overview-section
	animation fadeIn 0.3s ease

@keyframes fadeIn
	from
		opacity 0
		transform translateY(10px)
	to
		opacity 1
		transform translateY(0)

.loading-state
	text-align center
	padding 3rem
	color #666

.stats-grid
	display grid
	grid-template-columns repeat(auto-fit, minmax(220px, 1fr))
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

.no-activity
	text-align center
	padding 2rem
	color #999
</style>
