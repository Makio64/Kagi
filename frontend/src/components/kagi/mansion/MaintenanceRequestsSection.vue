<template>
	<div class="maintenance-requests">
		<KDataTable
			:columns="columns"
			:data="requests"
			:empty-text="$t('mansion.maintenance.noRequests')"
		>
			<template #cell-priority="{ value }">
				<StatusBadge :status="value" :variant="getPriorityVariant(value)" />
			</template>
			<template #cell-status="{ value }">
				<StatusBadge :status="value" />
			</template>
			<template #actions="{ row }">
				<KButton size="small" variant="secondary" @click="$emit('view', row)">
					{{ $t('mansion.maintenance.view') }}
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
	computed: {
		columns() {
			return [
				{ key: 'title', label: this.$t( 'mansion.maintenance.issue' ) },
				{ key: 'unit', label: this.$t( 'mansion.residents.unit' ), width: '80px' },
				{ key: 'priority', label: this.$t( 'mansion.maintenance.priority' ), width: '100px' },
				{ key: 'status', label: this.$t( 'admin.users.status' ), width: '120px' },
				{ key: 'assignedTo', label: this.$t( 'mansion.maintenance.assignedTo' ), width: '150px' },
				{ key: 'created', label: this.$t( 'mansion.maintenance.created' ), width: '120px' }
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
</style>