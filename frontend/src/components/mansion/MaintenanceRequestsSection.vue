<template>
	<div class="maintenance-requests">
		<KDataTable
			:columns="columns"
			:data="requests"
			emptyText="No maintenance requests"
		>
			<template #cell-priority="{ value }">
				<StatusBadge :status="value" :variant="getPriorityVariant(value)" />
			</template>

			<template #cell-status="{ value }">
				<StatusBadge :status="value" />
			</template>

			<template #actions="{ row }">
				<KButton size="small" variant="secondary" @click="$emit('view', row)">
					View
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
			required: true
		}
	},
	emits: ['view', 'update'],
	data() {
		return {
			columns: [
				{ key: 'title', label: 'Issue' },
				{ key: 'unit', label: 'Unit', width: '80px' },
				{ key: 'priority', label: 'Priority', width: '100px' },
				{ key: 'status', label: 'Status', width: '120px' },
				{ key: 'assignedTo', label: 'Assigned To', width: '150px' },
				{ key: 'created', label: 'Created', width: '120px' }
			]
		}
	},
	methods: {
		getPriorityVariant(priority) {
			switch(priority) {
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
</style>