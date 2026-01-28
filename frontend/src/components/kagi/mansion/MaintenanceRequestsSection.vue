<template>
	<div class="maintenance-requests">
		<SectionHeader
			:title="$t('mansion.maintenance.title') || 'Maintenance Requests'"
			icon="🔧"
		/>

		<div v-if="loading" class="loading-state">
			<p>{{ $t('common.loading') || 'Loading...' }}</p>
		</div>

		<div v-else-if="requests.length === 0" class="empty-state">
			<p>{{ $t('mansion.maintenance.noRequests') || 'No maintenance requests.' }}</p>
		</div>

		<KDataTable
			v-else
			:columns="columns"
			:data="requests"
			:empty-text="$t('mansion.maintenance.noRequests') || 'No requests'"
		>
			<template #cell-priority="{ value }">
				<StatusBadge :status="value" :variant="getPriorityVariant(value)" />
			</template>
			<template #cell-status="{ value, row }">
				<select
					class="status-select"
					:value="value"
					@change="$emit('update', row.id, $event.target.value)"
				>
					<option value="pending">Pending</option>
					<option value="in_progress">In Progress</option>
					<option value="completed">Completed</option>
					<option value="cancelled">Cancelled</option>
				</select>
			</template>
			<template #actions="{ row }">
				<KButton size="small" variant="secondary" @click="$emit('view', row)">
					{{ $t('common.view') || 'View' }}
				</KButton>
			</template>
		</KDataTable>
	</div>
</template>
<script>
export default {
	name: 'MaintenanceRequestsSection',
	props: {
		requests: {
			type: Array,
			default: () => []
		},
		loading: {
			type: Boolean,
			default: false
		}
	},
	emits: ['view', 'update'],
	computed: {
		columns() {
			return [
				{ key: 'title', label: this.$t( 'mansion.maintenance.issue' ) || 'Issue' },
				{ key: 'unit', label: this.$t( 'mansion.residents.unit' ) || 'Unit', width: '80px' },
				{ key: 'priority', label: this.$t( 'mansion.maintenance.priority' ) || 'Priority', width: '100px' },
				{ key: 'status', label: this.$t( 'common.status' ) || 'Status', width: '140px' },
				{ key: 'assignedTo', label: this.$t( 'mansion.maintenance.assignedTo' ) || 'Assigned To', width: '150px' }
			]
		}
	},
	methods: {
		getPriorityVariant( priority ) {
			switch( priority ) {
				case 'urgent': return 'danger'
				case 'high': return 'primary'
				case 'medium': return 'warning'
				case 'low': return 'info'
				default: return 'secondary'
			}
		}
	}
}
</script>
<style lang="stylus" scoped>
.maintenance-requests
	width 100%
	animation fadeIn 0.3s ease

@keyframes fadeIn
	from
		opacity 0
		transform translateY(10px)
	to
		opacity 1
		transform translateY(0)

.loading-state, .empty-state
	text-align center
	padding 3rem
	color #666

.status-select
	padding 0.4rem 0.6rem
	border 1px solid #ddd
	border-radius 6px
	font-size 0.85rem
	background white
	cursor pointer

	&:focus
		outline none
		border-color #FFC107
</style>